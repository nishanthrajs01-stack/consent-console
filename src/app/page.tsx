'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Power,
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  Lock,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { PolicyConfig, ConsentEvent, CatalogProduct } from '@/types/consent';

export default function ConsentConsole() {
  // State
  const [activeTab, setActiveTab] = useState<'console' | 'setup'>('console');
  const [policy, setPolicy] = useState<PolicyConfig>({
    dailySpendCap: 50.0,
    allowedCategory: 'Office Supplies',
    killSwitchActive: false,
    alertSensitivity: 'standard',
    currentDaySpend: 0.0,
  });
  const [events, setEvents] = useState<ConsentEvent[]>([]);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [customGoal, setCustomGoal] = useState<string>('');
  const [lastAgentMessage, setLastAgentMessage] = useState<string | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<CatalogProduct | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial policy & catalog
  useEffect(() => {
    fetch('/api/policy/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setPolicy(data.config);
      })
      .catch((err) => console.error('Failed to load policy:', err));

    fetch('/api/catalog')
      .then((res) => res.json())
      .then((data) => {
        if (data.catalog) setCatalog(data.catalog);
      })
      .catch((err) => console.error('Failed to load catalog:', err));
  }, []);

  // Connect Server-Sent Events (SSE)
  useEffect(() => {
    const sse = new EventSource('/api/events');
    eventSourceRef.current = sse;

    sse.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        if (data.type === 'INIT') {
          if (Array.isArray(data.events)) setEvents(data.events);
          if (data.policy) setPolicy(data.policy);
        } else if (data.type === 'EVENT' && data.event) {
          setEvents((prev) => [data.event, ...prev]);
          if (data.policy) setPolicy(data.policy);
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    sse.onerror = () => {
      console.warn('SSE connection disrupted, attempting reconnect...');
    };

    return () => {
      sse.close();
    };
  }, []);

  // Toggle Kill Switch
  const toggleKillSwitch = async () => {
    const newState = !policy.killSwitchActive;
    try {
      const res = await fetch('/api/policy/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ killSwitchActive: newState }),
      });
      const data = await res.json();
      if (data.config) setPolicy(data.config);
    } catch (err) {
      console.error('Failed to toggle kill switch:', err);
    }
  };

  // Update Policy Config (Screen 1 Save)
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/policy/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      const data = await res.json();
      if (data.config) {
        setPolicy(data.config);
        setActiveTab('console');
      }
    } catch (err) {
      console.error('Failed to update policy:', err);
    }
  };

  // Run Agent Scenario
  const runAgent = async (params: { productId?: string; forceAttack?: boolean; customGoal?: string }) => {
    setIsRunning(true);
    setLastAgentMessage(null);
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: params.productId,
          forceAttackScenario: params.forceAttack,
          customGoal: params.customGoal,
        }),
      });
      const data = await res.json();
      if (data.result?.response) {
        setLastAgentMessage(data.result.response);
      }
    } catch (err: any) {
      setLastAgentMessage(`Execution failed: ${err?.message || 'Network error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Reset Activity Log
  const clearFeed = async () => {
    await fetch('/api/events', { method: 'DELETE' });
    setEvents([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080d19] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* TOP NOTIFICATION / COMPLIANCE BANNER */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-emerald-400 font-medium">PAYPAL SANDBOX ACTIVE</span>
          <span className="text-slate-600">|</span>
          <span>Policy Enforcement: Deterministic Non-LLM Gate</span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
          <span>OWASP LLM03: Excessive Agency Defense</span>
          <span>•</span>
          <span>OWASP LLM01: Indirect Injection Filter</span>
        </div>
      </div>

      {/* HEADER / NAVIGATION BAR */}
      <header className="border-b border-slate-800 bg-[#0c1222]/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl">
            C
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight text-white">Consent Console</h1>
              <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded">
                v1.0 MVP
              </span>
            </div>
            <p className="text-xs text-slate-400">Human Trust & Gatekeeper Layer for PayPal Agent Toolkit</p>
          </div>
        </div>

        {/* STATS & QUICK CONTROLS */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
          {/* Daily Spend Cap Pill */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs flex items-center space-x-2">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Spend Cap</span>
              <span className="font-mono font-medium text-slate-200">
                ${policy.currentDaySpend.toFixed(2)} / ${policy.dailySpendCap.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Category Lock Pill */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs flex items-center space-x-2">
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Category Lock</span>
              <span className="font-mono font-medium text-slate-200">{policy.allowedCategory}</span>
            </div>
          </div>

          {/* Screen Switcher */}
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'console'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Console
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center space-x-1 ${
                activeTab === 'setup'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Policies</span>
            </button>
          </div>

          {/* KILL SWITCH BUTTON (Always visible per Guide Section 8) */}
          <button
            onClick={toggleKillSwitch}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shadow-md ${
              policy.killSwitchActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-900/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{policy.killSwitchActive ? 'PAUSED (KILL SWITCH ON)' : 'KILL SWITCH READY'}</span>
          </button>
        </div>
      </header>

      {/* KILL SWITCH WARNING BANNER (When active) */}
      {policy.killSwitchActive && (
        <div className="bg-rose-950/90 border-b border-rose-800 px-4 py-2 text-rose-200 text-xs font-mono flex items-center justify-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span className="font-bold">EMERGENCY KILL SWITCH ENGAGED:</span>
          <span>All autonomous PayPal tool executions are strictly intercepted and rejected.</span>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* SCREEN 1: SETUP MODAL / TAB */}
        {activeTab === 'setup' ? (
          <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Screen 1 — Consent Setup (10-Second Ritual)</h2>
                <p className="text-xs text-slate-400">
                  Establish deterministic spend thresholds and category boundaries.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-5">
              {/* Daily Spend Cap */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Daily Spend Cap (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    $
                  </div>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    max="10000"
                    value={policy.dailySpendCap}
                    onChange={(e) => setPolicy({ ...policy, dailySpendCap: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Single or cumulative transactions exceeding this cap are blocked before PayPal tools execute.
                </p>
              </div>

              {/* Allowed Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Permitted Category Lock
                </label>
                <select
                  value={policy.allowedCategory}
                  onChange={(e) => setPolicy({ ...policy, allowedCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Office Supplies">Office Supplies (Pens, Paper, Deskware)</option>
                  <option value="Software Subscriptions">Software & SaaS Subscriptions</option>
                  <option value="Books & Research">Books & Educational Materials</option>
                  <option value="Hardware">Hardware & Peripherals</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Any item outside this category triggers an immediate non-LLM policy violation.
                </p>
              </div>

              {/* Alert Sensitivity */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Alert Sensitivity
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPolicy({ ...policy, alertSensitivity: 'standard' })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      policy.alertSensitivity === 'standard'
                        ? 'bg-blue-950/60 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Standard (Default)</div>
                    <div className="text-[11px] text-slate-400 mt-1">Calm feed, alerts on real blocks</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPolicy({ ...policy, alertSensitivity: 'strict' })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      policy.alertSensitivity === 'strict'
                        ? 'bg-blue-950/60 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Strict Audit</div>
                    <div className="text-[11px] text-slate-400 mt-1">Logs every sub-step and parameter</div>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('console')}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
                >
                  Apply & Return to Console
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* SCREEN 2: LIVE CONSOLE (2 Columns: Controls & Attack Demo on Left, Activity Feed on Right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: SCENARIO TRIGGER & ATTACK DEMO (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* DEMO ACTIONS CARD (Centerpiece for Demo Video) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span>Demo Scenarios</span>
                  </h2>
                  <span className="text-[11px] font-mono text-slate-500">Autonomous Execution</span>
                </div>

                <div className="space-y-3">
                  {/* BUTTON 1: LEGITIMATE RUN */}
                  <button
                    disabled={isRunning || policy.killSwitchActive}
                    onClick={() => runAgent({ productId: 'prod-001' })}
                    className="w-full text-left p-3.5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-600/60 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                            1. Run Authorized Purchase
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Recycled Gel Ink Pens ($14.99) — Within $50 Cap
                          </div>
                        </div>
                      </div>
                      <Play className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  {/* BUTTON 2: THE ATTACK DEMO (Section 7 Centerpiece) */}
                  <button
                    disabled={isRunning || policy.killSwitchActive}
                    onClick={() => runAgent({ productId: 'prod-003', forceAttack: true })}
                    className="w-full text-left p-3.5 rounded-xl border border-rose-900/50 bg-rose-950/20 hover:bg-rose-950/40 hover:border-rose-600/80 transition-all group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-7 w-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-rose-300 group-hover:text-rose-200 flex items-center space-x-1.5">
                            <span>2. Trigger Indirect Prompt Injection</span>
                            <span className="bg-rose-900/80 text-rose-300 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase">
                              Attack
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Desk Pad with hidden payload triggering $2,400 GPU token order
                          </div>
                        </div>
                      </div>
                      <Play className="w-3.5 h-3.5 text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                </div>

                {/* RUNNING SPINNER OR AGENT FEEDBACK */}
                {isRunning && (
                  <div className="mt-4 p-3 bg-blue-950/40 border border-blue-800/60 rounded-lg flex items-center space-x-3 text-xs text-blue-300 animate-pulse">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>AI Agent reviewing catalog and evaluating PayPal tool calls...</span>
                  </div>
                )}

                {lastAgentMessage && !isRunning && (
                  <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Agent Response:</span>
                    <p className="leading-relaxed">{lastAgentMessage}</p>
                  </div>
                )}
              </div>

              {/* CATALOG PREVIEW (Inspectable Payloads) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Catalog Items ({catalog.length})
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Simulated Merchant Storefront</span>
                </div>

                <div className="space-y-2.5">
                  {catalog.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProductDetails(selectedProductDetails?.id === product.id ? null : product)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        product.isMalicious
                          ? 'bg-rose-950/10 border-rose-900/40 hover:border-rose-700/60'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-semibold text-slate-200">{product.title}</span>
                            {product.isMalicious && (
                              <span className="text-[9px] bg-rose-950 text-rose-400 border border-rose-800 px-1 py-0.2 rounded font-mono">
                                POISONED
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                            <span>{product.category}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-300">${product.price.toFixed(2)} USD</span>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                            selectedProductDetails?.id === product.id ? 'rotate-180' : ''
                          }`}
                        />
                      </div>

                      {/* Expanded View */}
                      {selectedProductDetails?.id === product.id && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
                          <p className="font-sans leading-relaxed">{product.description}</p>
                          {product.injectionPayload && (
                            <div className="p-2 bg-rose-950/40 border border-rose-800/50 rounded font-mono text-[10px] text-rose-300">
                              <span className="font-bold block text-rose-400 mb-0.5">Embedded Injection:</span>
                              {product.injectionPayload}
                            </div>
                          )}
                          <button
                            disabled={isRunning || policy.killSwitchActive}
                            onClick={(e) => {
                              e.stopPropagation();
                              runAgent({ productId: product.id, forceAttack: product.isMalicious });
                            }}
                            className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white font-medium"
                          >
                            Trigger Agent Purchase For This Item
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CUSTOM GOAL PROMPT INPUT */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Custom Agent Instruction
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="e.g. Order 3 boxes of staples and pens"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    disabled={!customGoal.trim() || isRunning || policy.killSwitchActive}
                    onClick={() => {
                      runAgent({ customGoal });
                      setCustomGoal('');
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold"
                  >
                    Run
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE ACTIVITY & ALERT FEED (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col min-h-[640px]">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Live Policy Audit Feed
                  </h2>
                  <span className="text-[11px] font-mono text-slate-500">({events.length} events)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearFeed}
                    className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-md transition-colors flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* FEED SCROLL AREA */}
              <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
                {events.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <ShieldCheck className="w-10 h-10 text-slate-700 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-medium text-slate-400">No transactions recorded yet</p>
                    <p className="text-[11px] text-slate-600 max-w-sm mt-1">
                      Click &quot;1. Run Authorized Purchase&quot; or &quot;2. Trigger Indirect Prompt Injection&quot; on the left to see the Policy Gate in action.
                    </p>
                  </div>
                ) : (
                  events.map((evt) => {
                    const isApproved = evt.status === 'APPROVED';
                    const isBlocked = evt.status === 'BLOCKED';

                    return (
                      <div
                        key={evt.id}
                        className={`rounded-xl border p-4 transition-all ${
                          isBlocked
                            ? 'bg-rose-950/25 border-rose-800/80 shadow-lg shadow-rose-950/30'
                            : isApproved
                            ? 'bg-emerald-950/20 border-emerald-800/60'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {/* Event Header */}
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center space-x-2">
                            {isBlocked ? (
                              <span className="inline-flex items-center space-x-1 font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>BLOCKED</span>
                              </span>
                            ) : isApproved ? (
                              <span className="inline-flex items-center space-x-1 font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>APPROVED</span>
                              </span>
                            ) : (
                              <span className="font-mono text-slate-400 text-[10px] uppercase bg-slate-900 px-1.5 py-0.5 rounded">
                                {evt.status}
                              </span>
                            )}
                            <span className="font-mono text-[11px] text-slate-400">{evt.action}</span>
                          </div>

                          <div className="font-mono text-[10px] text-slate-500">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </div>
                        </div>

                        {/* Plain-English Summary (AI Explanation Layer) */}
                        <div className="text-xs font-medium text-slate-200 mb-2 leading-relaxed">
                          {evt.summary}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                          {evt.amount > 0 && (
                            <span className="flex items-center space-x-1">
                              <span className="text-slate-500">Amount:</span>
                              <span className={isBlocked ? 'text-rose-300 font-bold' : 'text-emerald-300 font-bold'}>
                                ${evt.amount.toFixed(2)} {evt.currency}
                              </span>
                            </span>
                          )}

                          {evt.orderId && (
                            <span className="flex items-center space-x-1">
                              <span className="text-slate-500">PayPal Order:</span>
                              <span className="text-blue-300">{evt.orderId}</span>
                            </span>
                          )}

                          {evt.ruleTriggered && (
                            <span className="flex items-center space-x-1">
                              <span className="text-slate-500">Rule:</span>
                              <span className="text-slate-300">{evt.ruleTriggered}</span>
                            </span>
                          )}
                        </div>

                        {/* VIOLATIONS & RAW EVIDENCE (When Blocked) */}
                        {isBlocked && evt.violations && evt.violations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-rose-900/60 space-y-2">
                            <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Policy Violations Caught:</span>
                            </div>
                            <ul className="list-disc list-inside text-xs text-rose-200 space-y-1 font-mono">
                              {evt.violations.map((v, idx) => (
                                <li key={idx} className="leading-snug">
                                  {v}
                                </li>
                              ))}
                            </ul>

                            {/* Raw Attack Payload Evidence (OWASP ASI09 Compliance) */}
                            {evt.rawEvidence && (
                              <div className="mt-2 bg-black/60 border border-rose-900/80 rounded-md p-2.5 font-mono text-[10px] text-rose-300 overflow-x-auto">
                                <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">
                                  Raw Intercepted Injection Evidence:
                                </span>
                                <code className="break-all">{evt.rawEvidence}</code>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-[#070b14] px-4 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">Consent Console</span>
            <span>—</span>
            <span>PayPal AI Hackathon 2026</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            &ldquo;Excessive agency is the control deciding whether an injection is an inconvenience or an incident.&rdquo; (OWASP 2026)
          </div>
        </div>
      </footer>
    </div>
  );
}
