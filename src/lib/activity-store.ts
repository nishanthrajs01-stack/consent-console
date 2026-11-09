import { PolicyConfig, ConsentEvent } from '@/types/consent';

// Thread-safe in-memory singleton for hackathon demonstration
declare global {
  // eslint-disable-next-line no-var
  var __consent_policy: PolicyConfig | undefined;
  // eslint-disable-next-line no-var
  var __consent_events: ConsentEvent[] | undefined;
  // eslint-disable-next-line no-var
  var __consent_subscribers: Set<(event: ConsentEvent) => void> | undefined;
}

const DEFAULT_POLICY: PolicyConfig = {
  dailySpendCap: 50.0,
  allowedCategory: 'Office Supplies',
  killSwitchActive: false,
  alertSensitivity: 'standard',
  currentDaySpend: 0.0,
};

function getPolicyState(): PolicyConfig {
  if (!global.__consent_policy) {
    global.__consent_policy = { ...DEFAULT_POLICY };
  }
  return global.__consent_policy;
}

function getEventsState(): ConsentEvent[] {
  if (!global.__consent_events) {
    global.__consent_events = [];
  }
  return global.__consent_events;
}

function getSubscribers(): Set<(event: ConsentEvent) => void> {
  if (!global.__consent_subscribers) {
    global.__consent_subscribers = new Set();
  }
  return global.__consent_subscribers;
}

export function getPolicyConfig(): PolicyConfig {
  return { ...getPolicyState() };
}

export function updatePolicyConfig(updates: Partial<PolicyConfig>): PolicyConfig {
  const policy = getPolicyState();
  Object.assign(policy, updates);

  // If kill switch toggled, log system event
  if (updates.killSwitchActive !== undefined) {
    addConsentEvent({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      status: updates.killSwitchActive ? 'BLOCKED' : 'INFO',
      action: 'policy.kill_switch',
      amount: 0,
      currency: 'USD',
      summary: updates.killSwitchActive
        ? 'Emergency Kill Switch ENGAGED. Autonomous agent purchasing is immediately suspended.'
        : 'Kill Switch DISENGAGED. Autonomous agent purchasing resumed under policy controls.',
      ruleTriggered: 'KillSwitchStateChange',
    });
  }

  return { ...policy };
}

export function getEvents(): ConsentEvent[] {
  return [...getEventsState()];
}

export function addConsentEvent(event: ConsentEvent): ConsentEvent {
  const events = getEventsState();
  events.unshift(event); // Newest first

  // Keep last 100 events
  if (events.length > 100) {
    events.pop();
  }

  // Update daily spend if approved
  if (event.status === 'APPROVED' && event.amount > 0) {
    const policy = getPolicyState();
    policy.currentDaySpend = Math.round((policy.currentDaySpend + event.amount) * 100) / 100;
  }

  // Notify SSE listeners
  const subscribers = getSubscribers();
  subscribers.forEach((callback) => {
    try {
      callback(event);
    } catch (err) {
      console.error('Failed to notify subscriber:', err);
    }
  });

  return event;
}

export function subscribeToEvents(callback: (event: ConsentEvent) => void): () => void {
  const subscribers = getSubscribers();
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function resetStore(): void {
  global.__consent_policy = { ...DEFAULT_POLICY };
  global.__consent_events = [];
}
