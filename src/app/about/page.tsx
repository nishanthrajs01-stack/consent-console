'use client';

import React from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import TrustStrip from '@/components/TrustStrip';
import {
  Info,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Lock,
  ExternalLink,
  Code2,
  Terminal,
  Zap,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080D1F] text-[#F5F7FA] font-sans flex flex-col lg:flex-row antialiased selection:bg-[#2E7CF6] selection:text-white overflow-x-hidden">
      <Sidebar />

      <div className="flex-1 min-w-0 canvas-glow flex flex-col overflow-y-auto">
        <TopBar />

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl space-y-6 w-full">
          {/* LINEAR WORKFLOW PROGRESS BAR */}
          <div className="bg-[#111A38] border border-white/[0.08] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-[#2E7CF6] text-white font-mono text-[10px] font-bold">
                STEP 05 OF 05
              </span>
              <span className="text-white font-semibold">Mission Architecture &amp; Security Mapping</span>
            </div>
            <div className="text-[#94A3B8] hidden sm:flex items-center space-x-1.5 text-[11px]">
              <span>Workflow:</span>
              <span className="text-emerald-400 font-medium">Complete Cycle ✓</span>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#2E7CF6] uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>Project Mission & Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">About Consent Console</h1>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              The human trust and deterministic policy layer built for the PayPal AI Hackathon 2026.
            </p>
          </div>

          {/* SECTION 1: THE CORE PROBLEM */}
          <div className="surface-card p-4 sm:p-6 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span className="text-[#2E7CF6]">01.</span>
              <span>The Gap in PayPal&apos;s Agent Toolkit</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              PayPal&apos;s Agent Toolkit and hosted MCP server allow autonomous LLMs to create orders, initiate checkouts, and capture payments.
              However, the toolkit ships with <strong className="text-white">no automatic human-confirmation gate before tool calls</strong> — approval logic is left entirely to the integrator.
            </p>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              When an autonomous purchasing agent encounters an untrusted product description or supplier listing containing an <strong className="text-white">indirect prompt injection</strong>, it can be manipulated into placing unapproved bulk orders or buying prohibited items.
            </p>
          </div>

          {/* SECTION 2: THE ARCHITECTURAL PRINCIPLE */}
          <div className="surface-card p-4 sm:p-6 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span className="text-[#2E7CF6]">02.</span>
              <span>Core Design Principle: Code &gt; LLM</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              The policy gate is <strong className="text-white">deterministic TypeScript code, not another LLM call</strong>. Never ask an AI &quot;was that purchase okay?&quot; — that trusts the very entity you are policing. Spend caps, category allowlists, and prompt injection signatures are plain <code className="text-[#2E7CF6] font-mono">if</code> statements evaluated independently of the agent&apos;s reasoning.
            </p>

            <div className="bg-black/40 border border-white/[0.08] p-4 rounded-xl font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre sm:whitespace-normal">
              <div>Agent (LLM) decides WHAT to buy</div>
              <div className="text-[#2E7CF6]">  └──&gt; Calls wrapped orders.create</div>
              <div className="text-[#F5A623]">        └──&gt; Consent Console Policy Gate (Deterministic Checks)</div>
              <div className="text-[#22C55E]">              ├── If Valid: Pass to PayPal Sandbox (orders.create)</div>
              <div className="text-[#EF4444]">              └── If Violated: Intercept &amp; Block (0 bytes sent to PayPal)</div>
            </div>
          </div>

          {/* SECTION 3: OWASP FRAMEWORK ALIGNMENT */}
          <div className="surface-card p-4 sm:p-6 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span className="text-[#2E7CF6]">03.</span>
              <span>OWASP Top 10 (2026) Security Mapping</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-black/30 border border-white/[0.08] p-4 rounded-xl space-y-1.5">
                <div className="font-bold text-white text-sm">LLM03: Excessive Agency (#3 in 2026)</div>
                <p className="text-[#94A3B8] leading-relaxed">
                  <em>&ldquo;Excessive agency is the control deciding whether an injection is an inconvenience or an incident.&rdquo;</em>
                </p>
                <p className="text-slate-300 pt-1">
                  Enforces least privilege: only necessary checkout tools are exposed, each guarded by hard non-LLM checks.
                </p>
              </div>

              <div className="bg-black/30 border border-white/[0.08] p-4 rounded-xl space-y-1.5">
                <div className="font-bold text-white text-sm">LLM01 &amp; ASI01: Prompt Injection &amp; Goal Hijack</div>
                <p className="text-[#94A3B8] leading-relaxed">
                  External catalog metadata is treated as untrusted input and scanned for override directive patterns before execution.
                </p>
                <p className="text-slate-300 pt-1">
                  Prevents poisoned storefront listings from hijacking the agent&apos;s purchasing goals.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: HACKATHON COMPLIANCE BADGES */}
          <div className="surface-card p-4 sm:p-6 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span className="text-[#2E7CF6]">04.</span>
              <span>Hackathon Compliance Checklist</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="flex items-center space-x-2 text-[#22C55E]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>PayPal Sandbox Mode Enforced Globally</span>
              </div>
              <div className="flex items-center space-x-2 text-[#22C55E]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>PayPal Agent Toolkit Integration Central</span>
              </div>
              <div className="flex items-center space-x-2 text-[#22C55E]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Working Functional Prototype (No Mockups)</span>
              </div>
              <div className="flex items-center space-x-2 text-[#22C55E]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Open Source under MIT License</span>
              </div>
            </div>
          </div>

          {/* LINEAR WORKFLOW RESTART CALLOUT */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0E1630] to-blue-950/20 border border-[#2E7CF6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                  JOURNEY COMPLETE
                </span>
                <span>Ready to Execute More Procurement Tests?</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Cycle back to Step 01 to update policy limits or launch a new live simulation in Step 02.
              </p>
            </div>
            <div className="flex items-center space-x-2.5">
              <Link
                href="/policies"
                className="px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                <span>Step 01: Policies</span>
              </Link>
              <Link
                href="/"
                className="px-5 py-2 rounded-xl bg-[#2E7CF6] hover:bg-[#1D63D8] text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-lg shadow-[#2E7CF6]/25"
              >
                <span>Step 02: Live Console</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="pt-6">
            <TrustStrip />
          </div>
        </main>
      </div>
    </div>
  );
}
