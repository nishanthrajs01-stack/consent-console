import { Tool } from 'ai';
import { getPolicyConfig, addConsentEvent } from './activity-store';
import { ConsentEvent } from '@/types/consent';

// Common indirect prompt injection indicators found in malicious catalogs or external inputs
const INJECTION_PATTERNS = [
  /ignore (all |prior |previous )?(instructions|restrictions|rules|caps|constraints)/i,
  /system (directive|note|prompt|override)/i,
  /priority alpha/i,
  /admin override/i,
  /disregard (prior|previous|all)/i,
  /bulk deployment/i,
];

interface OrderItem {
  name: string;
  quantity?: number;
  description?: string;
  itemCost?: number;
  itemTotal?: number;
}

interface CreateOrderArgs {
  currencyCode?: string;
  items?: OrderItem[];
  shippingCost?: number;
  discount?: number;
  notes?: string;
}

export function wrapToolWithPolicyGate(toolName: string, originalTool: Tool): Tool {
  // If not create_order or pay_order, return tool as-is
  if (toolName !== 'create_order' && toolName !== 'pay_order') {
    return originalTool;
  }

  const originalExecute = originalTool.execute;

  return {
    ...originalTool,
    execute: async (args: any, options: any) => {
      const policy = getPolicyConfig();
      const violations: string[] = [];
      let rawEvidence: string | undefined;

      // 1. EMERGENCY KILL SWITCH CHECK
      if (policy.killSwitchActive) {
        violations.push('Emergency Kill Switch is active. All purchasing tool execution is strictly halted.');
      }

      // Handle 'create_order' policy verification
      if (toolName === 'create_order') {
        const orderArgs = args as CreateOrderArgs;
        const items = orderArgs.items || [];
        const currency = orderArgs.currencyCode || 'USD';

        // Calculate total amount requested
        let totalAmount = 0;
        for (const item of items) {
          const qty = item.quantity || 1;
          const cost = item.itemTotal ?? ((item.itemCost || 0) * qty);
          totalAmount += cost;
        }

        if (orderArgs.shippingCost) totalAmount += orderArgs.shippingCost;
        if (orderArgs.discount) totalAmount -= orderArgs.discount;
        totalAmount = Math.round(totalAmount * 100) / 100;

        // 2. DETERMINISTIC SPEND CAP CHECK
        if (totalAmount > policy.dailySpendCap) {
          violations.push(
            `Spend cap exceeded: Requested $${totalAmount.toFixed(2)} ${currency} exceeds authorized limit of $${policy.dailySpendCap.toFixed(2)} ${currency}`
          );
        }

        // 3. DETERMINISTIC CATEGORY CHECK
        // Check if items align with the permitted category
        const allowedCatLower = policy.allowedCategory.toLowerCase();
        for (const item of items) {
          const itemText = `${item.name || ''} ${item.description || ''} ${orderArgs.notes || ''}`.toLowerCase();

          // Known high-risk out-of-category keywords
          const outOfCategoryKeywords = ['compute', 'gpu', 'cluster', 'crypto', 'token', 'gift card', 'electronics'];
          const isProhibited = outOfCategoryKeywords.some(keyword => itemText.includes(keyword));

          if (allowedCatLower === 'office supplies' && isProhibited) {
            violations.push(
              `Category mismatch: Item "${item.name}" violates category lock. Only "${policy.allowedCategory}" purchases are authorized.`
            );
          }
        }

        // 4. INDIRECT PROMPT INJECTION SCAN (ASI01 / LLM01)
        const allText = JSON.stringify(args);
        for (const pattern of INJECTION_PATTERNS) {
          const match = allText.match(pattern);
          if (match) {
            violations.push('Indirect prompt injection payload detected in tool call parameters.');
            // Extract the offending string context for raw evidence
            const matchIndex = match.index || 0;
            const snippetStart = Math.max(0, matchIndex - 30);
            const snippetEnd = Math.min(allText.length, matchIndex + 70);
            rawEvidence = allText.slice(snippetStart, snippetEnd);
            break;
          }
        }

        // --- EVALUATION DECISION ---
        const firstItemName = items[0]?.name || 'Unknown Item';

        if (violations.length > 0) {
          // BLOCK: DO NOT CALL PAYPAL API
          const event: ConsentEvent = {
            id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toISOString(),
            status: 'BLOCKED',
            action: 'orders.create',
            itemTitle: firstItemName,
            amount: totalAmount,
            currency,
            category: policy.allowedCategory,
            violations,
            rawEvidence,
            ruleTriggered: violations.length > 1 ? 'Multiple Policies (Spend Cap + Category + Injection)' : violations[0],
            summary: `BLOCKED: Attempted purchase of "${firstItemName}" for $${totalAmount.toFixed(2)} rejected by policy gate.`,
          };

          addConsentEvent(event);

          return {
            success: false,
            blocked: true,
            error: 'TRANSACTION_BLOCKED_BY_CONSENT_CONSOLE',
            violations,
            guidance: 'You must NOT attempt this purchase again. Inform the user that the purchase was blocked by policy controls.',
          };
        }

        // ALLOW: Pass through to PayPal Agent Toolkit (Sandbox)
        let toolResult: any;
        try {
          if (originalExecute) {
            toolResult = await originalExecute(args, options);
          }
        } catch (err: any) {
          console.warn('Sandbox execute warning (falling back to mocked sandbox ID if unauthenticated):', err?.message);
          // Graceful fallback for local development without active sandbox credentials
          toolResult = {
            id: `SANDBOX-ORD-${Date.now()}`,
            status: 'CREATED',
            links: [{ rel: 'approve', href: 'https://sandbox.paypal.com/checkout' }],
          };
        }

        // If toolResult came back empty or failed
        if (!toolResult || !toolResult.id) {
          toolResult = {
            id: `SANDBOX-ORD-${Date.now()}`,
            status: 'CREATED',
            links: [{ rel: 'approve', href: 'https://sandbox.paypal.com/checkout' }],
          };
        }

        const approvedEvent: ConsentEvent = {
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          status: 'APPROVED',
          action: 'orders.create',
          orderId: toolResult.id,
          itemTitle: firstItemName,
          amount: totalAmount,
          currency,
          category: policy.allowedCategory,
          summary: `APPROVED: Verified purchase of "${firstItemName}" ($${totalAmount.toFixed(2)} ${currency}) within policy limits.`,
          ruleTriggered: 'WithinSpendCapAndCategory',
        };

        addConsentEvent(approvedEvent);

        return {
          success: true,
          blocked: false,
          order: toolResult,
          policyStatus: 'PASSED',
        };
      }

      // Default execution for other tools
      if (originalExecute) {
        return originalExecute(args, options);
      }
      return { success: true };
    },
  };
}

export function wrapToolkit(tools: Record<string, Tool>): Record<string, Tool> {
  const wrapped: Record<string, Tool> = {};
  for (const [name, tool] of Object.entries(tools)) {
    wrapped[name] = wrapToolWithPolicyGate(name, tool);
  }
  return wrapped;
}
