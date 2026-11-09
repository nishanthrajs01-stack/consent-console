export type AlertSensitivity = 'standard' | 'strict';

export interface PolicyConfig {
  dailySpendCap: number; // e.g., 50.00 USD
  allowedCategory: string; // e.g., "Office Supplies"
  killSwitchActive: boolean; // Immediate pause
  alertSensitivity: AlertSensitivity;
  currentDaySpend: number; // Tracks cumulative spent today
}

export type EventStatus = 'APPROVED' | 'BLOCKED' | 'SYSTEM' | 'INFO';

export interface ConsentEvent {
  id: string;
  timestamp: string;
  status: EventStatus;
  action: string; // e.g. "orders.create", "orders.capture"
  orderId?: string;
  itemTitle?: string;
  amount: number;
  currency: string;
  category?: string;
  summary: string; // Human-readable plain English explanation
  violations?: string[]; // Hard rules triggered (e.g., "Spend cap exceeded ($1,200.00 > $50.00)")
  rawEvidence?: string; // Verbatim injected or offending payload for auditing
  ruleTriggered?: string;
  agentThought?: string;
}

export interface CatalogProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  description: string;
  isMalicious?: boolean;
  injectionPayload?: string;
}
