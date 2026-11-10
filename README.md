# Consent Console

> **The Human Trust and Deterministic Policy Layer for PayPal AI Agent Workflows.**  
> Built for the **PayPal AI Hackathon 2026** (*"Build What's Next with PayPal and AI"*).

---

## 1. Problem & Opportunity

PayPal's Agent Toolkit and hosted MCP server allow autonomous AI agents to initiate checkouts, create orders, and capture payments. However, the toolkit ships with **no automatic human-confirmation gate before tool calls** — approval logic and authorization boundaries are left entirely to the integrator.

If an AI purchasing agent falls victim to an **Indirect Prompt Injection** (e.g. from an untrusted product description or supplier invoice), it can experience **Excessive Agency** and execute unapproved transactions, drain funds, or order unauthorized items.

**Consent Console** fills this gap: it sits between the LLM and PayPal's Sandbox API as an independent, deterministic policy gate.

---

## 2. Architecture & Core Design Principle

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App (Single Deployable)                            │
│                                                             │
│  ┌──────────────┐      ┌────────────────────┐               │
│  │ Purchasing    │      │  Consent Console   │               │
│  │ Agent (LLM)   │─────▶│  Policy Gate       │               │
│  │ decides WHAT  │      │  (Deterministic    │               │
│  │ to buy        │      │   TypeScript Code) │               │
│  └──────────────┘      └────────┬───────────┘               │
│                                  │  Allow / Block            │
│                       ┌──────────┴──────────┐                │
│                       ▼                     ▼                │
│              PayPal Agent Toolkit    Live Audit Feed         │
│              (orders.create/capture) (SSE stream to UI)      │
│              [context: sandbox:true]                         │
└─────────────────────────────────────────────────────────────┘
```

> **The Core Security Principle**: The policy gate is **deterministic code, not another LLM call**. Never ask an AI "was this purchase okay?" — that trusts the very entity you are policing. Spend caps, category locks, and prompt injection filters are plain code `if` statements evaluated independently of the agent's reasoning.

---

## 3. Dedicated Navigation Pages

The application is structured into 5 dedicated pages adhering to the reference design system:

- **[Dashboard (`/`)](http://localhost:3000/)**: Executive spend meters, active category locks, live 4-entry activity feed, and the centerpiece glowing **Attack Detected & Blocked!** incident card.
- **[Settings (`/settings`)](http://localhost:3000/settings)**: Spend limit threshold controls, quick presets (₹5,000, ₹25,000, ₹100,000), PayPal Sandbox handshake status, audit sensitivity switcher, and demo data reset.
- **[Policies (`/policies`)](http://localhost:3000/policies)**: Interactive category allowlist editor with add/remove tags, ceiling rule details, and OWASP Least Agency tool scoping indicators.
- **[Activity Logs (`/activity`)](http://localhost:3000/activity)**: Comprehensive searchable and filterable chronological audit trail with raw extracted injection snippets and 1-click JSON export.
- **[About (`/about`)](http://localhost:3000/about)**: Hackathon problem statement, architectural principles (`Code > LLM`), and OWASP Top 10 2026 security mappings.

---

## 4. Security Framework Alignment (OWASP 2026)

### OWASP Top 10 for LLM Applications (2026)
- **LLM03 Excessive Agency (#3 in 2026, up from #6)**: *"Excessive agency is the control deciding whether an injection is an inconvenience or an incident."* Consent Console enforces least privilege: only `orders: { create, get, capture }` are exposed, and each call must pass independent server-side verification before touching PayPal.
- **LLM01 Prompt Injection (#1)**: External product metadata is treated as inert data and scanned for injection payloads before tool execution.
- **LLM06 Unbounded Consumption (#6)**: Strict spend caps and rate limits prevent runaway purchasing loops.

### OWASP Top 10 for Agentic Applications (2025/2026)
- **ASI01 Agent Goal Hijack**: The policy gate re-evaluates the actual tool call arguments against hard rules rather than trusting the agent's stated intent.
- **ASI02 Tool Misuse & Exploitation**: Scoped allowlist — the agent cannot call any tool that isn't explicitly exposed.
- **ASI09 Human-Agent Trust Exploitation**: The UI displays raw extracted attack payloads rather than vague "everything looks good" summaries.

---

## 5. Security & Functionality Audit Results

Run the automated audit script:
```bash
node scripts/audit.mjs
```

```
======================================================
       CONSENT CONSOLE — SYSTEM AUDIT REPORT          
======================================================

[1/4] AUDITING APPLICATION ROUTES...
  ✓ Route / -> 200 OK
  ✓ Route /settings -> 200 OK
  ✓ Route /policies -> 200 OK
  ✓ Route /activity -> 200 OK
  ✓ Route /about -> 200 OK

[2/4] AUDITING API ENDPOINTS...
  ✓ API /api/catalog -> 4 items loaded
  ✓ API /api/policy/config GET -> Spend Cap: ₹5,000
  ✓ API /api/events GET -> 4 events retrieved

[3/4] AUDITING SECURITY CONTROLS (OWASP TOP 10 2026)...
  ✓ Authorized Purchase: Approved -> Status: PASSED
  ✓ Attack Interception: Blocked -> Caught 2 violations:
      - Exceeds daily limit (₹2,49,990 > ₹5,000)
      - Suspicious prompt injection
  ✓ Master Safety Pause: Successfully prevented purchase when engaged

[4/4] AUDIT SUMMARY
  Total Checks: 11
  Passed: 11
  Failed: 0
  Overall Compliance Score: 100%

✓ ALL SECURITY & FUNCTIONALITY CRITERIA VERIFIED
```

---

## 6. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24 LTS)
- npm or pnpm

### Installation

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/<your-username>/consent-console.git
   cd consent-console
   npm install
   ```

2. Run development or production server:
   ```bash
   # Development
   npm run dev

   # Or Production (Pre-compiled)
   npm run build
   npm run start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. License

Open-source under the [MIT License](LICENSE).
