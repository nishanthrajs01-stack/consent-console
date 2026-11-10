'use client';

import React from 'react';
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
    <div className="min-h-screen bg-[#080D1F] text-[#F5F7FA] font-sans flex antialiased selection:bg-[#2E7CF6] selection:text-white">
      <Sidebar />

      <div className="flex-1 min-w-0 canvas-glow flex flex-col overflow-y-auto">
        <TopBar />

        <main className="px-8 py-6 max-w-5xl space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#2E7CF6] uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>Project Mission & Architecture</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">About Consent Console</h1>
            <p className="text-sm text-[#94A3B8]">
              The human trust and deterministic policy layer built for the PayPal AI Hackathon 2026.
            </p>
          </div>

          {/* SECTION 1: THE CORE PROBLEM */}
          <div className="surface-card p-6 space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span className="text-[#2E7CF6]">01.</span>
              <span>The Gap in PayPal&apos;s Agent Toolkit</span>
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              PayPal&apos;s Agent Toolkit and hosted MCP server allow autonomous LLMs to create orders, initiate checkouts, and capture payments.
              However, the toolkit ships with <strong className="text-white">no automatic human-confirmation gate before tool calls</strong> — approval logic is left entirely to the integrator.
            </p>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              When an autonomous purchasing agent encounters an untrusted product description or supplier listing containing an <strong className="text-white">indirect prompt injection</strong>, it can be manipulated into placing unapproved bulk orders or buying prohibited items.
            </p>
          </div>

          {/* SECTION 2: THE ARCHITECTURAL PRINCIPLE */}
          <div className="surface-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span className="text-[#2E7CF6]">02.</span>
              <span>Core Design Principle: Code &gt; LLM</span>
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              The policy gate is <strong className="text-white">deterministic TypeScript code, not another LLM call</strong>. Never ask an AI &quot;was that purchase okay?&quot; — that trusts the very entity you are policing. Spend caps, category allowlists, and prompt injection signatures are plain <code className="text-[#2E7CF6] font-mono">if</code> statements evaluated independently of the agent&apos;s reasoning.
            </p>

            <div className="bg-black/40 border border-white/[0.08] p-4 rounded-xl font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
              <div>Agent (LLM) decides WHAT to buy</div>
              <div className="text-[#2E7CF6]">  └──&gt; Calls wrapped orders.create</div>
              <div className="text-[#F5A623]">        └──&gt; Consent Console Policy Gate (Deterministic Checks)</div>
              <div className="text-[#22C55E]">              ├── If Valid: Pass to PayPal Sandbox (orders.create)</div>
              <div className="text-[#EF4444]">              └── If Violated: Intercept &amp; Block (0 bytes sent to PayPal)</div>
            </div>
          </div>

          {/* SECTION 3: OWASP FRAMEWORK ALIGNMENT */}
          <div className="surface-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
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
          <div className="surface-card p-6 space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
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

          <div className="pt-6">
            <TrustStrip />
          </div>
        </main>
      </div>
    </div>
  );
}
