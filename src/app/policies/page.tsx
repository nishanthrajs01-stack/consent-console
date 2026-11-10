'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import TrustStrip from '@/components/TrustStrip';
import {
  Shield,
  ShieldCheck,
  Tag,
  DollarSign,
  Lock,
  Cpu,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { PolicyConfig } from '@/types/consent';

export default function PoliciesPage() {
  const [policy, setPolicy] = useState<PolicyConfig>({
    dailySpendCap: 5000.0,
    allowedCategory: 'Electronics, Software',
    killSwitchActive: false,
    alertSensitivity: 'standard',
    currentDaySpend: 1999.0,
  });
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetch('/api/policy/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setPolicy(data.config);
      })
      .catch((err) => console.error('Failed to load policies:', err));
  }, []);

  const categories = policy.allowedCategory
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  const addCategory = () => {
    if (!newCategoryInput.trim()) return;
    if (categories.includes(newCategoryInput.trim())) return;
    const updated = [...categories, newCategoryInput.trim()].join(', ');
    setPolicy({ ...policy, allowedCategory: updated });
    setNewCategoryInput('');
  };

  const removeCategory = (catToRemove: string) => {
    const updated = categories.filter((c) => c !== catToRemove).join(', ');
    setPolicy({ ...policy, allowedCategory: updated });
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/policy/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      const data = await res.json();
      if (data.config) {
        setPolicy(data.config);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save policies:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1F] text-[#F5F7FA] font-sans flex antialiased selection:bg-[#2E7CF6] selection:text-white">
      <Sidebar />

      <div className="flex-1 min-w-0 canvas-glow flex flex-col overflow-y-auto">
        <TopBar />

        <main className="px-8 py-6 max-w-5xl space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#2E7CF6] uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Guardrails & Authorization</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Policy Engine</h1>
            <p className="text-sm text-[#94A3B8]">
              Deterministic non-LLM checks evaluated server-side before any PayPal tool execution.
            </p>
          </div>

          {/* ACTIVE RULE CARDS */}
          <div className="space-y-4">
            {/* Rule 1: Category Allowlist */}
            <div className="surface-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#2E7CF6]/15 text-[#2E7CF6] flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-white">Rule 1: Category Lock (Allowlist)</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E]">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Restricts AI purchases strictly to verified merchandise classifications. Rejects out-of-policy categories.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-400">OWASP ASI03</span>
              </div>

              {/* Category Pills & Manager */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className="inline-flex items-center space-x-1.5 bg-[#2E7CF6]/15 border border-[#2E7CF6]/30 px-3 py-1 rounded-xl text-xs font-semibold text-white"
                    >
                      <span>{cat}</span>
                      <button
                        onClick={() => removeCategory(cat)}
                        className="text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Category Field */}
                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    placeholder="Add permitted category..."
                    className="flex-1 px-3 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-[#2E7CF6]"
                  />
                  <button
                    onClick={addCategory}
                    className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] text-white rounded-xl text-xs font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Rule 2: Daily Spend Cap */}
            <div className="surface-card p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-white">Rule 2: Spend Ceiling</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E]">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Hard limit on single and daily cumulative expenditures. Evaluated independently of the LLM.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-400">OWASP LLM06</span>
              </div>

              <div className="flex items-center space-x-3 text-xs pt-1">
                <span className="text-slate-400">Current Threshold:</span>
                <span className="text-white font-mono font-bold bg-white/[0.04] border border-white/[0.1] px-2.5 py-1 rounded-lg">
                  ₹{policy.dailySpendCap.toLocaleString('en-IN')} / Day
                </span>
                <span className="text-[#5B6B87]">•</span>
                <span className="text-[#22C55E]">Resets every 24 hours</span>
              </div>
            </div>

            {/* Rule 3: Indirect Prompt Injection Scanner */}
            <div className="surface-card p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-white">Rule 3: Prompt Injection & Goal Hijack Filter</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E]">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Scans external product listings, merchant invoices, and tool payloads for hidden override directives.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-400">OWASP LLM01 & ASI01</span>
              </div>

              <div className="text-xs text-[#94A3B8] bg-black/30 border border-white/[0.08] p-3 rounded-xl font-mono leading-relaxed">
                <span className="text-slate-400 font-bold block mb-1">Protected Pattern Classes:</span>
                <code>/ignore (all|prior|previous) (instructions|restrictions|rules)/i</code>,{' '}
                <code>/system (directive|note|instruction|override)/i</code>,{' '}
                <code>/share your account credentials/i</code>
              </div>
            </div>

            {/* Rule 4: Least Agency Tool Scope */}
            <div className="surface-card p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-white">Rule 4: Least Agency Tool Scoping</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E]">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Limits AI tool exposure strictly to necessary actions. Invoices, disputes, and transfers are permanently stripped.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-400">OWASP LLM03 (#3 in 2026)</span>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                  orders.create (Exposed)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                  orders.capture (Exposed)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  disputes (Disabled)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  transfers (Disabled)
                </span>
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#94A3B8]">
              {isSaved ? <span className="text-[#22C55E] font-semibold">Policies saved successfully!</span> : 'Changes take effect immediately on next tool execution.'}
            </span>

            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#2E7CF6] hover:bg-[#1D63D8] text-white text-xs font-semibold shadow-lg shadow-[#2E7CF6]/25 transition-all flex items-center space-x-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Policies</span>
            </button>
          </div>

          <div className="pt-6">
            <TrustStrip />
          </div>
        </main>
      </div>
    </div>
  );
}
