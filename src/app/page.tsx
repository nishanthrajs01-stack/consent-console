'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  Lock,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { PolicyConfig, ConsentEvent, CatalogProduct } from '@/types/consent';

export default function ConsentConsole() {
  // State
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'all' | 'blocked' | 'approved'>('all');
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
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Toggle Pause (Kill Switch)
  const togglePause = async () => {
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
      console.error('Failed to toggle pause:', err);
    }
  };

  // Save Policy Settings
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
        setShowSettings(false);
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

  // Clear feed
  const clearFeed = async () => {
    await fetch('/api/events', { method: 'DELETE' });
    setEvents([]);
  };

  // Copy raw payload snippet
  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculations
  const spendPercent = Math.min(100, Math.round((policy.currentDaySpend / (policy.dailySpendCap || 1)) * 100));
  const remainingLiquidity = Math.max(0, policy.dailySpendCap - policy.currentDaySpend);
  const blockedCount = events.filter((e) => e.status === 'BLOCKED').length;
  const approvedCount = events.filter((e) => e.status === 'APPROVED').length;

  const filteredEvents = events.filter((evt) => {
    if (filterMode === 'blocked') return evt.status === 'BLOCKED';
    if (filterMode === 'approved') return evt.status === 'APPROVED';
    return true;
  });

  return (
    <div className="min-h-screen studio-gradient text-slate-100 flex flex-col font-sans">
      {/* EXECUTIVE HEADER */}
      <header className="border-b border-white/[0.08] bg-[#0c101c]/80 backdrop-blur-xl sticky top-0 z-40 px-6 sm:px-10 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Product Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-base">
              C
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-base font-semibold text-white tracking-tight">Consent Console</h1>
                <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>PayPal Sandbox</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">Deterministic spend & policy guardrails for autonomous agents</p>
            </div>
          </div>

          {/* Master Controls */}
          <div className="flex items-center space-x-3">
            {/* Policy Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-all flex items-center space-x-2"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Spend Rules</span>
            </button>

            {/* Apple/Linear Style Master Pause Switch */}
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
              <button
                onClick={togglePause}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  !policy.killSwitchActive
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${!policy.killSwitchActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <span>Active</span>
              </button>
              <button
                onClick={togglePause}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  policy.killSwitchActive
                    ? 'bg-rose-500/20 text-rose-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${policy.killSwitchActive ? 'bg-rose-400' : 'bg-slate-500'}`} />
                <span>Paused</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* PAUSE BANNER */}
      {policy.killSwitchActive && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2 text-rose-300 text-xs text-center flex items-center justify-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span><strong>Autonomous Purchasing Paused:</strong> All agent order requests will be declined until resumed.</span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-6">
        {/* EXECUTIVE METRICS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Spend Cap Card */}
          <div className="card-base rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium">Daily Spend Allowance</span>
              <DollarSign className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-baseline space-x-2 mb-3">
              <span className="text-2xl font-bold text-white tracking-tight">${policy.currentDaySpend.toFixed(2)}</span>
              <span className="text-xs text-slate-400">of ${policy.dailySpendCap.toFixed(2)} limit</span>
            </div>
            {/* Smooth Progress Bar */}
            <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${spendPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>${remainingLiquidity.toFixed(2)} remaining</span>
              <span>{spendPercent}% used</span>
            </div>
          </div>

          {/* Permitted Category Card */}
          <div className="card-base rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium">Category Allowlist</span>
              <Tag className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mb-3">
              <div className="text-xl font-bold text-white tracking-tight">{policy.allowedCategory}</div>
              <div className="text-xs text-slate-400 mt-0.5">Strict non-LLM policy lock</div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 pt-2 border-t border-white/[0.06]">
              <Lock className="w-3 h-3 text-blue-400" />
              <span>Out-of-category purchases automatically blocked</span>
            </div>
          </div>

          {/* Interceptions & Interventions Card */}
          <div className="card-base rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium">Policy Interventions</span>
              <ShieldCheck className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-baseline space-x-2 mb-3">
              <span className="text-2xl font-bold text-white tracking-tight">{blockedCount}</span>
              <span className="text-xs text-slate-400">unauthorized attempts prevented</span>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center space-x-1.5 pt-2 border-t border-white/[0.06]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero funds moved without policy compliance</span>
            </div>
          </div>
        </div>

        {/* WORKSPACE: TWO COLUMN PRIMARY WORKFLOW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: PROCUREMENT ENVIRONMENT & DEMOS (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* QUICK ACTIONS CARD */}
            <div className="card-base rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h2 className="text-sm font-semibold text-white">Interactive Demonstration</h2>
                <span className="text-xs text-slate-400">Test Scenarios</span>
              </div>

              {/* ACTION BUTTON 1: LEGITIMATE ORDER */}
              <div
                onClick={() => !isRunning && !policy.killSwitchActive && runAgent({ productId: 'prod-001' })}
                className="card-base card-hover rounded-xl p-4 cursor-pointer border border-white/[0.06] hover:border-blue-500/40 group transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-white">1. Authorized Office Purchase</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Agent buys Recycled Gel Pens ($14.99). Passes spend cap ($50.00) and matches permitted category.
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-blue-600/10 group-hover:bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 ml-3 transition-colors">
                    <Play className="w-3.5 h-3.5 fill-blue-400" />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON 2: POISONED PROMPT INJECTION ATTACK */}
              <div
                onClick={() => !isRunning && !policy.killSwitchActive && runAgent({ productId: 'prod-003', forceAttack: true })}
                className="card-base card-hover rounded-xl p-4 cursor-pointer border border-rose-500/20 hover:border-rose-500/50 group transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                        <span>2. Indirect Prompt Injection Attack</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Poisoned catalog item instructs agent to place an unauthorized bulk order for $2,400 GPU compute tokens. Intercepted instantly.
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-rose-500/10 group-hover:bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 ml-3 transition-colors">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* RUNNING INDICATOR */}
              {isRunning && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center space-x-3 text-xs text-blue-300">
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Agent reading catalog and evaluating purchase with PayPal Agent Toolkit...</span>
                </div>
              )}

              {lastAgentMessage && !isRunning && (
                <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-slate-300 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Agent Thought & Output</span>
                  <p className="leading-relaxed">{lastAgentMessage}</p>
                </div>
              )}

              {/* CUSTOM NATURAL LANGUAGE PROMPT */}
              <div className="pt-2 border-t border-white/[0.06]">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Custom Agent Instruction
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customGoal.trim() && !isRunning && !policy.killSwitchActive) {
                        runAgent({ customGoal });
                        setCustomGoal('');
                      }
                    }}
                    placeholder="e.g. Order 2 boxes of heavy duty staples"
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    disabled={!customGoal.trim() || isRunning || policy.killSwitchActive}
                    onClick={() => {
                      runAgent({ customGoal });
                      setCustomGoal('');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-medium transition-colors"
                  >
                    Run
                  </button>
                </div>
              </div>
            </div>

            {/* CATALOG PREVIEW & INSPECTOR */}
            <div className="card-base rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Storefront Catalog Items
                </h3>
                <span className="text-xs text-slate-500">{catalog.length} items</span>
              </div>

              <div className="space-y-2.5">
                {catalog.map((product) => {
                  const isExpanded = selectedProduct?.id === product.id;
                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(isExpanded ? null : product)}
                      className={`card-base card-hover rounded-xl p-3.5 cursor-pointer border transition-all ${
                        product.isMalicious
                          ? isExpanded
                            ? 'border-rose-500/40 bg-rose-500/5'
                            : 'border-white/[0.06] hover:border-rose-500/30'
                          : isExpanded
                          ? 'border-blue-500/40 bg-blue-500/5'
                          : 'border-white/[0.06] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-white">{product.title}</span>
                            {product.isMalicious && (
                              <span className="text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded-md">
                                Injected
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                            <span>{product.category}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-200">${product.price.toFixed(2)} USD</span>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Expandable Description and Injection Viewer */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3 text-xs">
                          <p className="text-slate-300 leading-relaxed font-sans">{product.description}</p>
                          {product.injectionPayload && (
                            <div className="p-3 bg-black/40 border border-rose-500/30 rounded-xl space-y-1.5">
                              <div className="flex items-center justify-between text-rose-400 text-[11px] font-medium">
                                <span className="flex items-center space-x-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Hidden Prompt Injection Directive:</span>
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copySnippet(product.id, product.injectionPayload!);
                                  }}
                                  className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                                >
                                  {copiedId === product.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedId === product.id ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <p className="font-mono text-[11px] text-rose-200/90 leading-relaxed break-all">
                                {product.injectionPayload}
                              </p>
                            </div>
                          )}
                          <button
                            disabled={isRunning || policy.killSwitchActive}
                            onClick={(e) => {
                              e.stopPropagation();
                              runAgent({ productId: product.id, forceAttack: product.isMalicious });
                            }}
                            className="w-full py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Order This Item with Agent
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: REAL-TIME ACTIVITY & AUDIT RECEIPTS (7 Cols) */}
          <div className="lg:col-span-7 card-base rounded-2xl p-6 flex flex-col min-h-[640px]">
            {/* Feed Header */}
            <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-white/[0.06] gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Live Transaction Activity</h2>
                <p className="text-xs text-slate-400">Human audit log with plain-English rationales</p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Clean Filter Tabs */}
                <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] text-xs">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterMode === 'all' ? 'bg-white/[0.1] text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({events.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('blocked')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterMode === 'blocked' ? 'bg-rose-500/20 text-rose-300 font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Blocked ({blockedCount})
                  </button>
                  <button
                    onClick={() => setFilterMode('approved')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterMode === 'approved' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Approved ({approvedCount})
                  </button>
                </div>

                <button
                  onClick={clearFeed}
                  className="p-1.5 rounded-lg border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors"
                  title="Clear feed"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* RECEIPT CARDS STREAM */}
            <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
              {filteredEvents.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <ShieldCheck className="w-10 h-10 text-slate-600 mb-2 stroke-[1.2]" />
                  <p className="text-xs font-semibold text-slate-300">No Transactions Recorded Yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Click &quot;1. Authorized Purchase&quot; or &quot;2. Indirect Injection Attack&quot; on the left to see the human oversight layer in action.
                  </p>
                </div>
              ) : (
                filteredEvents.map((evt) => {
                  const isApproved = evt.status === 'APPROVED';
                  const isBlocked = evt.status === 'BLOCKED';

                  return (
                    <div
                      key={evt.id}
                      className={`card-base rounded-xl p-4 transition-all ${
                        isBlocked
                          ? 'border-rose-500/30 bg-rose-500/[0.03]'
                          : isApproved
                          ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                          : 'border-white/[0.06]'
                      }`}
                    >
                      {/* Top Row: Status, Title, Amount */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            {isBlocked ? (
                              <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md">
                                <XCircle className="w-3 h-3" />
                                <span>Intervention: Blocked</span>
                              </span>
                            ) : isApproved ? (
                              <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approved</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md">
                                {evt.status}
                              </span>
                            )}
                            <span className="text-xs font-medium text-white">{evt.itemTitle || evt.action}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </div>
                        </div>

                        {/* Amount */}
                        {evt.amount > 0 && (
                          <div className="text-right">
                            <span
                              className={`text-sm font-semibold tracking-tight ${
                                isBlocked ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              ${evt.amount.toFixed(2)} {evt.currency}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Plain-English Human Translation */}
                      <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                        {evt.summary}
                      </p>

                      {/* Metadata Details Row */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
                        {evt.orderId && (
                          <span className="flex items-center space-x-1 font-mono">
                            <span className="text-slate-500">PayPal ID:</span>
                            <span className="text-blue-300 font-medium">{evt.orderId}</span>
                          </span>
                        )}
                        {evt.ruleTriggered && (
                          <span className="flex items-center space-x-1">
                            <span className="text-slate-500">Evaluation:</span>
                            <span className="text-slate-300">{evt.ruleTriggered}</span>
                          </span>
                        )}
                      </div>

                      {/* VIOLATIONS BREAKDOWN & RAW AUDIT SNIPPET */}
                      {isBlocked && (
                        <div className="mt-3 pt-3 border-t border-rose-500/20 space-y-2">
                          <div className="text-[11px] font-semibold text-rose-300 flex items-center justify-between">
                            <span>Policy Interception Details:</span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              Zero Funds Transmitted to PayPal
                            </span>
                          </div>

                          {evt.violations && evt.violations.length > 0 && (
                            <ul className="text-xs text-rose-200/90 space-y-1">
                              {evt.violations.map((violation, idx) => (
                                <li key={idx} className="flex items-start space-x-1.5">
                                  <span className="text-rose-400 font-bold">✕</span>
                                  <span>{violation}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {evt.rawEvidence && (
                            <div className="mt-2 p-2.5 bg-black/40 border border-rose-500/20 rounded-xl space-y-1 font-mono text-[10px]">
                              <div className="flex items-center justify-between text-slate-400">
                                <span className="font-semibold uppercase text-[9px]">Intercepted Supplier String:</span>
                                <button
                                  onClick={() => copySnippet(evt.id, evt.rawEvidence!)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  {copiedId === evt.id ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <code className="text-rose-300 break-all leading-normal block">
                                {evt.rawEvidence}
                              </code>
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
      </main>

      {/* POLICY SETUP MODAL (Screen 1) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="card-base max-w-lg w-full rounded-2xl p-6 shadow-2xl relative border border-white/[0.1]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Spend & Category Policies</h3>
                  <p className="text-xs text-slate-400">Configure boundaries for autonomous agent actions</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-4">
              {/* Daily Spend Cap */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Single Transaction Spend Cap (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-xs">
                    $
                  </div>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    max="5000"
                    value={policy.dailySpendCap}
                    onChange={(e) => setPolicy({ ...policy, dailySpendCap: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Orders exceeding this threshold are blocked by deterministic code before reaching PayPal.
                </p>
              </div>

              {/* Category Lock */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Allowed Category Policy
                </label>
                <select
                  value={policy.allowedCategory}
                  onChange={(e) => setPolicy({ ...policy, allowedCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121624] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Office Supplies">Office Supplies (Pens, Paper, Deskware)</option>
                  <option value="Software Subscriptions">Software & Cloud Subscriptions</option>
                  <option value="Books & Research">Books & Research Materials</option>
                  <option value="Peripherals">Hardware & Peripherals</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Agent cannot buy outside this category, even if instructed by an indirect injection prompt.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-2.5 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Apply Policies
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFINED FOOTER */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#080a12] px-6 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">Consent Console</span>
            <span className="text-slate-600">•</span>
            <span>PayPal AI Hackathon 2026</span>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-2 text-[11px] text-slate-400">
            <span className="bg-white/[0.03] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
              OWASP LLM03: Excessive Agency
            </span>
            <span className="bg-white/[0.03] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
              OWASP ASI01: Goal Hijack Defense
            </span>
            <span className="bg-white/[0.03] border border-white/[0.06] px-2.5 py-0.5 rounded-full text-emerald-400">
              PayPal Sandbox Enforced
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
