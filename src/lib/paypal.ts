import { PayPalAgentToolkit } from '@paypal/agent-toolkit/ai-sdk';

let toolkitInstance: PayPalAgentToolkit | null = null;

export function getPayPalToolkit(): PayPalAgentToolkit {
  if (toolkitInstance) {
    return toolkitInstance;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID || 'SANDBOX_MOCK_CLIENT_ID';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'SANDBOX_MOCK_CLIENT_SECRET';

  toolkitInstance = new PayPalAgentToolkit({
    clientId,
    clientSecret,
    configuration: {
      actions: {
        orders: { create: true, get: true, capture: true },
      },
      context: {
        sandbox: true, // ALWAYS sandbox as mandated by hackathon rules
      },
    },
  });

  return toolkitInstance;
}
