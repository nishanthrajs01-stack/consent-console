'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import TrustStrip from '@/components/TrustStrip';
import {
  Settings,
  DollarSign,
  Shield,
  Bell,
  Power,
  RotateCcw,
  CheckCircle2,
  Lock,
  ExternalLink,
  Cpu,
  Key,
  Save,
} from 'lucide-react';
import { PolicyConfig } from '@/types/consent';

export default function SettingsPage() {
  const [policy, setPolicy] = useState<PolicyConfig>({
    dailySpendCap: 5000.0,
    allowedCategory: 'Electronics, Software',
    killSwitchActive: false,
    alertSensitivity: 'standard',
    currentDaySpend: 1999.0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/policy/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setPolicy(data.config);
      })
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/policy/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      const data = await res.json();
      if (data.config) {
        setPolicy(data.config);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    if (confirm('Reset activity log and restore default hackathon demonstration state?')) {
      await fetch('/api/events', { method: 'DELETE' });
      window.location.reload();
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
              <Settings className="w-4 h-4" />
              <span>System Configuration</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Console Settings</h1>
            <p className="text-sm text-[#94A3B8]">
              Manage autonomous agent procurement parameters, spend safeguards, and integration credentials.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* SECTION 1: MASTER SAFETY CONTROLS */}
            <div className="surface-card p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Power className="w-4 h-4 text-rose-400" />
                    <span>Emergency Safety Pause (Kill Switch)</span>
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Instantly freeze all autonomous purchasing tool calls across all active sessions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPolicy({ ...policy, killSwitchActive: !policy.killSwitchActive })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 ${
                    policy.killSwitchActive
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.1]'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{policy.killSwitchActive ? 'PAUSED (Tool Calling Frozen)' : 'ACTIVE (Normal Operation)'}</span>
                </button>
              </div>

              {/* Spend Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    Daily Spend Allowance (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="500"
                      min="500"
                      value={policy.dailySpendCap}
                      onChange={(e) => setPolicy({ ...policy, dailySpendCap: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-4 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#2E7CF6]"
                    />
                  </div>
                  <p className="text-[11px] text-[#5B6B87]">
                    Orders exceeding this limit will trigger an immediate deterministic block.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    Quick Cap Presets
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5000, 25000, 100000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPolicy({ ...policy, dailySpendCap: preset })}
                        className={`py-2 rounded-xl text-xs font-mono font-medium transition-all border ${
                          policy.dailySpendCap === preset
                            ? 'bg-[#2E7CF6] text-white border-[#2E7CF6]'
                            : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                      >
                        ₹{preset.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#5B6B87]">Set standard spending limits instantly.</p>
                </div>
              </div>
            </div>

            {/* SECTION 2: PAYPAL SANDBOX ENVIRONMENT */}
            <div className="surface-card p-6 space-y-4">
              <div className="pb-3 border-b border-white/[0.08] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-[#2E7CF6]" />
                    <span>PayPal Sandbox Handshake</span>
                  </h2>
                  <p className="text-xs text-[#94A3B8]">Credential isolation verified per hackathon rules.</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20">
                  Sandbox Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-black/30 border border-white/[0.08] rounded-xl p-3.5 space-y-1">
                  <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">Target API Host</span>
                  <span className="text-white">api-m.sandbox.paypal.com</span>
                </div>

                <div className="bg-black/30 border border-white/[0.08] rounded-xl p-3.5 space-y-1">
                  <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">Context Flag</span>
                  <span className="text-[#22C55E]">sandbox: true (Enforced Globally)</span>
                </div>
              </div>
            </div>

            {/* SECTION 3: AUDIT STREAM SENSITIVITY */}
            <div className="surface-card p-6 space-y-4">
              <div className="pb-3 border-b border-white/[0.08]">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-[#F5A623]" />
                  <span>Audit Stream Sensitivity</span>
                </h2>
                <p className="text-xs text-[#94A3B8]">Choose how granularly events stream into the live activity log.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPolicy({ ...policy, alertSensitivity: 'standard' })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    policy.alertSensitivity === 'standard'
                      ? 'bg-[#2E7CF6]/15 border-[#2E7CF6] text-white shadow'
                      : 'bg-white/[0.03] border-white/[0.08] text-[#94A3B8] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="text-xs font-bold text-white">Standard Mode (Recommended)</div>
                  <div className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                    Clean timeline. Displays approved transactions and highlights real blocked security interventions.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPolicy({ ...policy, alertSensitivity: 'strict' })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    policy.alertSensitivity === 'strict'
                      ? 'bg-[#2E7CF6]/15 border-[#2E7CF6] text-white shadow'
                      : 'bg-white/[0.03] border-white/[0.08] text-[#94A3B8] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="text-xs font-bold text-white">Strict Compliance Audit</div>
                  <div className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                    Logs every intermediate parameter evaluation, token check, and sub-second tool handshake.
                  </div>
                </button>
              </div>
            </div>

            {/* ACTIONS FOOTER */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] flex items-center space-x-2 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>

              <div className="flex items-center space-x-3">
                {savedSuccess && (
                  <span className="text-xs text-[#22C55E] font-medium flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Settings applied!</span>
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#2E7CF6] hover:bg-[#1D63D8] text-white text-xs font-semibold shadow-lg shadow-[#2E7CF6]/25 transition-all flex items-center space-x-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </div>
          </form>

          <div className="pt-6">
            <TrustStrip />
          </div>
        </main>
      </div>
    </div>
  );
}
