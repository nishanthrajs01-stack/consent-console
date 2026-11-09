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

## 3. Security Framework Alignment (OWASP 2026)

### OWASP Top 10 for LLM Applications (2026)
- **LLM03 Excessive Agency (#3 in 2026, up from #6)**: *"Excessive agency is the control deciding whether an injection is an inconvenience or an incident."* Consent Console enforces least privilege: only `orders: { create, get, capture }` are exposed, and each call must pass independent server-side verification before touching PayPal.
- **LLM01 Prompt Injection (#1)**: External product metadata is treated as inert data and scanned for injection payloads before tool execution.
- **LLM06 Unbounded Consumption (#6)**: Strict spend caps and rate limits prevent runaway purchasing loops.

### OWASP Top 10 for Agentic Applications (2025/2026)
- **ASI01 Agent Goal Hijack**: The policy gate re-evaluates the actual tool call arguments against hard rules rather than trusting the agent's stated intent.
- **ASI02 Tool Misuse & Exploitation**: Scoped allowlist — the agent cannot call any tool that isn't explicitly exposed.
- **ASI09 Human-Agent Trust Exploitation**: The UI displays raw extracted attack payloads rather than vague "everything looks good" summaries.

---

## 4. The Attack Demo Centerpiece

Consent Console demonstrates a live, reproducible attack scenario:
1. **Authorized Purchase**: The agent orders legitimate *Recycled Gel Ink Pens* ($14.99). The policy gate verifies that the price is under the $50 spend cap and matches the *Office Supplies* category. PayPal Sandbox executes `orders.create`, and a green verified entry appears in the live audit feed.
2. **Indirect Prompt Injection**: A poisoned catalog item (*Executive Desk Pad*) embeds a hidden system override directive instructing the agent to order 25 units of *$2,400 Enterprise GPU Cluster Tokens*.
3. **Deterministic Block**: The policy gate intercepts the tool call on two independent grounds (**Spend cap exceeded** + **Category mismatch** + **Injection signature detected**) before any PayPal API call fires.
4. **Real-time Alert**: A red alert displays immediately in the live feed with the raw extracted attack payload for human audit.
5. **Kill Switch**: A persistent, one-tap emergency kill switch instantly halts all autonomous purchasing.

---

## 5. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24 LTS)
- npm or pnpm
- (Optional) PayPal Developer Sandbox account (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`)
- (Optional) Google Gemini API Key or OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/consent-console.git
   cd consent-console
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (create `.env.local`):
   ```bash
   cp .env.example .env.local
   ```
   Add your credentials:
   ```env
   PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
   *(Note: The application includes instant deterministic simulation mode, allowing the full demo to run immediately even before sandbox keys are added).*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/run/      # Autonomous purchasing agent orchestrator
│   │   │   ├── catalog/        # Simulated catalog with poisoned items
│   │   │   ├── events/         # Server-Sent Events (SSE) real-time feed
│   │   │   └── policy/config/  # Spend cap & kill-switch configuration
│   │   ├── globals.css         # Dark fintech design system
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Screen 1 (Setup) & Screen 2 (Live Console)
│   ├── lib/
│   │   ├── activity-store.ts   # In-memory thread-safe event bus & SSE broker
│   │   ├── agent.ts            # AI purchasing agent (Gemini / OpenAI / Scripted)
│   │   ├── catalog.ts          # Normal & poisoned indirect prompt injection items
│   │   ├── paypal.ts           # PayPalAgentToolkit initialization (Sandbox only)
│   │   └── policy-gate.ts      # Deterministic Policy Gate (The 60 lines that matter)
│   └── types/
│       └── consent.ts          # Policy and event type definitions
├── .env.example
├── LICENSE                     # MIT License
├── package.json
└── README.md
```

---

## 7. Compliance Checklist

- [x] **PayPal Sandbox Only**: `context: { sandbox: true }` set everywhere. No real money can move.
- [x] **PayPal Integration Central**: Direct wrapper and gatekeeper for `@paypal/agent-toolkit/ai-sdk`.
- [x] **AI Meaningfully Incorporated**: Purchasing agent uses LLM tool-calling; transactions explained in plain English.
- [x] **Working Prototype**: Hosted, runnable Next.js application (no static mockups).
- [x] **License**: Open-source under MIT License.
