'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Power,
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  Lock,
  Unlock,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  Terminal,
  Activity,
  Cpu,
  Radio,
  Fingerprint,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Flame,
  Layers,
} from 'lucide-react';
import { PolicyConfig, ConsentEvent, CatalogProduct } from '@/types/consent';

export default function ConsentConsole() {
  // State
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
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
  const [activePipelineStage, setActivePipelineStage] = useState<number>(0);
  const [customGoal, setCustomGoal] = useState<string>('');
  const [lastAgentMessage, setLastAgentMessage] = useState<string | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<CatalogProduct | null>(null);
  const [copiedPayloadId, setCopiedPayloadId] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Load initial configuration & catalog
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

  // Save Policy Modal Changes
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
        setShowSetupModal(false);
      }
    } catch (err) {
      console.error('Failed to update policy:', err);
    }
  };

  // Run Agent Scenario
  const runAgent = async (params: { productId?: string; forceAttack?: boolean; customGoal?: string }) => {
    setIsRunning(true);
    setLastAgentMessage(null);
    setActivePipelineStage(1);

    // Simulate animated pipeline progression
    const timer1 = setTimeout(() => setActivePipelineStage(2), 400);
    const timer2 = setTimeout(() => setActivePipelineStage(3), 850);

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
      setActivePipelineStage(4);
      if (data.result?.response) {
        setLastAgentMessage(data.result.response);
      }
    } catch (err: any) {
      setLastAgentMessage(`Execution failed: ${err?.message || 'Network error'}`);
    } finally {
      setIsRunning(false);
      setTimeout(() => setActivePipelineStage(0), 2000);
    }
  };

  // Clear feed
  const clearFeed = async () => {
    await fetch('/api/events', { method: 'DELETE' });
    setEvents([]);
  };

  // Copy raw payload snippet
  const copyPayload = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayloadId(id);
    setTimeout(() => setCopiedPayloadId(null), 2000);
  };

  // Calculations
  const spendPercent = Math.min(100, Math.round((policy.currentDaySpend / (policy.dailySpendCap || 1)) * 100));
  const blockedCount = events.filter((e) => e.status === 'BLOCKED').length;
  const approvedCount = events.filter((e) => e.status === 'APPROVED').length;

  const filteredEvents = events.filter((evt) => {
    if (filterMode === 'blocked') return evt.status === 'BLOCKED';
    if (filterMode === 'approved') return evt.status === 'APPROVED';
    return true;
  });

  return (
    <div className="relative min-h-screen cyber-grid text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* RADIANT AMBIENT LIGHTING GLOWS */}
      <div className="absolute top-[-10%] left-[10%] w-[550px] h-[550px] bg-blue-600/10 blur-[150px] pointer-events-none rounded-full animate-pulse-glow" />
      <div className="absolute top-[25%] right-[5%] w-[450px] h-[450px] bg-indigo-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[10%] left-[30%] w-[500px] h-[500px] bg-emerald-500/5 blur-[160px] pointer-events-none rounded-full" />

      {/* TOP TELEMETRY HUD BAR */}
      <div className="border-b border-white/[0.06] bg-[#070b16]/80 backdrop-blur-md px-4 sm:px-8 py-2 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3 relative z-20">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold tracking-wider uppercase text-[10px]">PAYPAL SANDBOX PROTOCOL</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>POLICY ENGINE: <strong className="text-slate-200">ZERO-LLM DETERMINISTIC</strong></span>
          </span>
        </div>

        <div className="flex items-center space-x-4 text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>INTERCEPTED: <strong className="text-rose-300 font-bold">{blockedCount}</strong></span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>APPROVED: <strong className="text-emerald-300 font-bold">{approvedCount}</strong></span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center space-x-1 text-slate-400">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="text-[10px] text-cyan-300">LIVE FEED</span>
          </div>
        </div>
      </div>

      {/* HEADER BAR */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#090d19]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative h-10 w-10 rounded-xl bg-slate-950 border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-xl">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                <span>Consent Console</span>
              </h1>
              <span className="text-[10px] font-mono tracking-widest uppercase bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                PAYPAL DEFENSE LAYER
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Agent Authorization & Indirect Injection Interceptor</p>
          </div>
        </div>

        {/* Top Control Cluster */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Spend Cap Monitor Pill */}
          <div className="glass-panel px-3.5 py-1.5 rounded-xl flex items-center space-x-3">
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Authorized Liquidity</div>
              <div className="font-mono text-xs font-bold text-slate-200">
                ${policy.currentDaySpend.toFixed(2)}{' '}
                <span className="text-slate-500 font-normal">/ ${policy.dailySpendCap.toFixed(2)}</span>
              </div>
            </div>
            {/* Visual Mini Progress Bar */}
            <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1">
              <div
                className={`h-full transition-all duration-500 ${
                  spendPercent > 80 ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${spendPercent}%` }}
              />
            </div>
          </div>

          {/* Category Lock Pill */}
          <div className="glass-panel px-3.5 py-1.5 rounded-xl flex items-center space-x-2.5">
            <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Category Lock</div>
              <div className="font-mono text-xs font-bold text-blue-300">{policy.allowedCategory}</div>
            </div>
          </div>

          {/* Policy Settings Modal Trigger */}
          <button
            onClick={() => setShowSetupModal(true)}
            className="glass-panel hover:bg-slate-800/80 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center space-x-1.5"
            title="Configure spend caps, categories, and audit rules"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Policy Config</span>
          </button>

          {/* PHYSICAL TACTILE KILL SWITCH BUTTON */}
          <div className="relative group">
            <div
              className={`absolute -inset-0.5 rounded-xl blur transition duration-300 ${
                policy.killSwitchActive
                  ? 'bg-rose-600 opacity-90 animate-pulse'
                  : 'bg-slate-700 opacity-30 group-hover:opacity-60'
              }`}
            />
            <button
              onClick={toggleKillSwitch}
              className={`relative px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center space-x-2 border shadow-lg ${
                policy.killSwitchActive
                  ? 'bg-gradient-to-r from-rose-700 to-rose-600 text-white border-rose-400/60 shadow-rose-900/60'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-white/10 hover:border-slate-600'
              }`}
            >
              <Power className={`w-3.5 h-3.5 ${policy.killSwitchActive ? 'text-white' : 'text-rose-400'}`} />
              <span>{policy.killSwitchActive ? 'KILL SWITCH ENGAGED' : 'SAFETY READY'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* KILL SWITCH ACTIVE EMERGENCY HUD */}
      {policy.killSwitchActive && (
        <div className="hazard-stripes border-b border-rose-500/50 bg-rose-950/80 px-4 py-2 text-rose-200 text-xs font-mono flex items-center justify-center space-x-3 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-bold tracking-wider uppercase">EMERGENCY KILL SWITCH ENGAGED:</span>
          <span className="text-rose-300">All autonomous PayPal checkout tools are physically disconnected.</span>
        </div>
      )}

      {/* MAIN BENTO GRID DASHBOARD */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
        {/* ROW 1: THE COMMAND PIPELINE & ACTION LAUNCHPAD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* BENTO CARD 1: SENSORY MISSION LAUNCHPAD (7 Cols) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            {/* Top Bar inside card */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
                  Autonomous Mission Launcher
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">1-Tap Live Execution</span>
            </div>

            {/* TWO PRIMARY ACTION MISSION CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-1">
              {/* BUTTON 1: AUTHORIZED PROCUREMENT (Green Shimmer) */}
              <button
                disabled={isRunning || policy.killSwitchActive}
                onClick={() => runAgent({ productId: 'prod-001' })}
                className="group/btn relative text-left p-4 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-950/80 hover:border-emerald-400/70 hover:from-emerald-950/50 transition-all duration-300 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/btn:opacity-60 transition-opacity">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                      Normal Flow
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white group-hover/btn:text-emerald-300 transition-colors">
                    1. Authorized Purchase
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    Recycled Gel Pens ($14.99). Under $50 spend cap and matches permitted office category.
                  </p>
                  <div className="mt-3 inline-flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400 group-hover/btn:translate-x-1 transition-transform">
                    <span>Execute Sandbox Order</span>
                    <Play className="w-3 h-3 fill-emerald-400" />
                  </div>
                </div>
              </button>

              {/* BUTTON 2: THE POISONED INJECTION ATTACK (Crimson Hazard Shimmer) */}
              <button
                disabled={isRunning || policy.killSwitchActive}
                onClick={() => runAgent({ productId: 'prod-003', forceAttack: true })}
                className="group/btn relative text-left p-4 rounded-xl border border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-slate-900/60 to-slate-950/80 hover:border-rose-400/80 hover:from-rose-950/60 transition-all duration-300 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/btn:opacity-60 transition-opacity">
                  <ShieldAlert className="w-12 h-12 text-rose-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-rose-400">
                      Live Attack Vector
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white group-hover/btn:text-rose-300 transition-colors flex items-center space-x-1.5">
                    <span>2. Indirect Injection Attack</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    Poisoned listing triggers hidden directive for $2,400 GPU tokens. Intercepted independently.
                  </p>
                  <div className="mt-3 inline-flex items-center space-x-1.5 text-[11px] font-mono text-rose-400 group-hover/btn:translate-x-1 transition-transform">
                    <span>Simulate Attack</span>
                    <Play className="w-3 h-3 fill-rose-400" />
                  </div>
                </div>
              </button>
            </div>

            {/* CUSTOM AGENT COMMAND PROMPT BAR */}
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
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
                    placeholder="Enter custom autonomous procurement prompt (e.g. Order 3 boxes of staples)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button
                  disabled={!customGoal.trim() || isRunning || policy.killSwitchActive}
                  onClick={() => {
                    runAgent({ customGoal });
                    setCustomGoal('');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold font-mono transition-all shadow-md shadow-blue-600/30"
                >
                  Prompt Agent
                </button>
              </div>

              {/* QUICK PROMPT SUGGESTION CHIPS */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] font-mono text-slate-500">
                <span>Try prompt:</span>
                <button
                  onClick={() => runAgent({ customGoal: 'Purchase 2 boxes of heavy duty staples' })}
                  className="text-slate-400 hover:text-blue-300 underline underline-offset-2"
                >
                  &quot;Buy heavy staples&quot;
                </button>
                <span>•</span>
                <button
                  onClick={() => runAgent({ customGoal: 'Order high-end noise canceling headphones for executive' })}
                  className="text-slate-400 hover:text-blue-300 underline underline-offset-2"
                >
                  &quot;Buy $300 headphones (exceeds cap)&quot;
                </button>
              </div>
            </div>

            {/* RUNNING SPINNER OR AGENT FEEDBACK */}
            {isRunning && (
              <div className="mt-3 p-3 bg-blue-950/60 border border-blue-500/40 rounded-xl flex items-center space-x-3 text-xs text-blue-200 animate-pulse">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-mono">AI Purchasing Agent orchestrating tool calls through Consent Console Gate...</span>
              </div>
            )}

            {lastAgentMessage && !isRunning && (
              <div className="mt-3 p-3 bg-slate-950/90 border border-white/10 rounded-xl text-xs font-mono text-slate-300 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="text-slate-500 font-bold uppercase text-[10px] block">Agent Status Output:</span>
                  {lastAgentMessage}
                </div>
              </div>
            )}
          </div>

          {/* BENTO CARD 2: REAL-TIME DEFENSE PIPELINE RADAR (5 Cols) */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
                  Zero-Trust Telemetry Radar
                </h2>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">SHIELD INTEGRITY: 100%</span>
            </div>

            {/* PIPELINE FLOWCHART VISUALIZER */}
            <div className="space-y-2.5 my-auto py-2">
              {/* Step 1: Purchasing Agent */}
              <div
                className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  activePipelineStage === 1
                    ? 'bg-blue-950/60 border-blue-400 shadow-md shadow-blue-500/20'
                    : 'bg-slate-950/60 border-white/[0.06]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-mono font-bold text-blue-400">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Autonomous Agent (LLM)</div>
                    <div className="text-[10px] text-slate-500 font-mono">Decides purchase intent & parameters</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {activePipelineStage === 1 ? 'PROCESSING' : 'ACTIVE'}
                </div>
              </div>

              {/* Step 2: Ingestion Vector */}
              <div
                className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  activePipelineStage === 2
                    ? 'bg-purple-950/60 border-purple-400 shadow-md shadow-purple-500/20'
                    : 'bg-slate-950/60 border-white/[0.06]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[10px] font-mono font-bold text-purple-400">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Catalog Content Ingestion</div>
                    <div className="text-[10px] text-slate-500 font-mono">External data input (Untrusted Surface)</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {activePipelineStage === 2 ? 'EVALUATING' : 'SCANNED'}
                </div>
              </div>

              {/* Step 3: Consent Console Policy Gate */}
              <div
                className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  activePipelineStage === 3
                    ? 'bg-amber-950/60 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950/60 border-white/[0.06]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px] font-mono font-bold text-amber-400">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Consent Console Policy Gate</div>
                    <div className="text-[10px] text-slate-500 font-mono">Deterministic code rules (Spend/Category)</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-amber-300 font-bold">
                  {activePipelineStage === 3 ? 'VERIFYING' : 'GUARDING'}
                </div>
              </div>

              {/* Step 4: PayPal Sandbox Core */}
              <div
                className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  activePipelineStage === 4
                    ? 'bg-emerald-950/60 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950/60 border-white/[0.06]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400">
                    4
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">PayPal Sandbox Core API</div>
                    <div className="text-[10px] text-slate-500 font-mono">Orders.create / capture execution</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 font-bold">SHIELDED</div>
              </div>
            </div>

            {/* Quick Stat Bar at bottom of radar */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Consent Decision Time: &lt;42ms</span>
              <span className="text-emerald-400 font-semibold">0 False Positives</span>
            </div>
          </div>
        </div>

        {/* ROW 2: ANALYSIS DECK (CATALOG INSPECTION & AUDIT STREAM) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: STOREFRONT CATALOG & ATTACK PAYLOAD DECOMPILER (5 Cols) */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Product Catalog Surface</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Untrusted data sources read by agent</p>
              </div>
              <span className="text-[10px] font-mono bg-slate-900 border border-white/10 px-2 py-0.5 rounded text-slate-400">
                {catalog.length} Items Loaded
              </span>
            </div>

            {/* PRODUCT CARDS LIST */}
            <div className="space-y-3">
              {catalog.map((product) => {
                const isSelected = selectedProductDetails?.id === product.id;
                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProductDetails(isSelected ? null : product)}
                    className={`rounded-xl border p-3.5 cursor-pointer transition-all duration-200 ${
                      product.isMalicious
                        ? isSelected
                          ? 'glass-danger-glow'
                          : 'bg-rose-950/20 border-rose-800/40 hover:border-rose-600/70'
                        : isSelected
                        ? 'glass-panel-glow'
                        : 'bg-slate-950/60 border-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{product.title}</span>
                          {product.isMalicious ? (
                            <span className="text-[9px] font-mono uppercase tracking-wider bg-rose-900/60 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold animate-pulse">
                              POISONED
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
                              CLEAN
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                          <span>{product.category}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-400 font-bold">${product.price.toFixed(2)} USD</span>
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                          isSelected ? 'rotate-180 text-blue-400' : ''
                        }`}
                      />
                    </div>

                    {/* EXPANDED PAYLOAD DECOMPILER */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-3 text-xs">
                        <p className="text-slate-300 text-xs leading-relaxed font-sans">{product.description}</p>

                        {/* Raw Embedded Injection Payload Inspector */}
                        {product.injectionPayload && (
                          <div className="p-3 bg-black/80 border border-rose-500/40 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase font-bold text-rose-400 flex items-center space-x-1">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                <span>Extracted Prompt Injection:</span>
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyPayload(product.id, product.injectionPayload!);
                                }}
                                className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center space-x-1"
                              >
                                {copiedPayloadId === product.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <code className="block text-[11px] font-mono text-rose-300 break-all leading-normal bg-rose-950/30 p-2 rounded border border-rose-900/40">
                              {product.injectionPayload}
                            </code>
                          </div>
                        )}

                        <button
                          disabled={isRunning || policy.killSwitchActive}
                          onClick={(e) => {
                            e.stopPropagation();
                            runAgent({ productId: product.id, forceAttack: product.isMalicious });
                          }}
                          className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white font-mono shadow-md shadow-blue-600/30 transition-all"
                        >
                          Trigger Agent Against This Item
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: LIVE POLICY AUDIT STREAM & THREAT QUARANTINE (7 Cols) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-5 shadow-2xl flex flex-col min-h-[640px]">
            {/* Header & Filter Switcher */}
            <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-white/[0.06] gap-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h2 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-bold">
                  Neural Policy Audit Feed
                </h2>
                <span className="text-[11px] font-mono text-slate-500">({events.length} records)</span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Filter Pills */}
                <div className="flex bg-slate-950 p-0.5 rounded-xl border border-white/10 text-xs font-mono">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterMode === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterMode('blocked')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterMode === 'blocked' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800/60' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Blocked ({blockedCount})
                  </button>
                  <button
                    onClick={() => setFilterMode('approved')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterMode === 'approved' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Approved ({approvedCount})
                  </button>
                </div>

                <button
                  onClick={clearFeed}
                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Clear live feed"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* EVENT CARDS STREAM CONTAINER */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {filteredEvents.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <ShieldCheck className="w-12 h-12 text-slate-700 mb-3 stroke-[1.2]" />
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Telemetry Stream Silent
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Execute an authorized purchase or trigger an indirect injection attack on the left to observe real-time policy interception.
                  </p>
                </div>
              ) : (
                filteredEvents.map((evt) => {
                  const isApproved = evt.status === 'APPROVED';
                  const isBlocked = evt.status === 'BLOCKED';

                  return (
                    <div
                      key={evt.id}
                      className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                        isBlocked
                          ? 'glass-danger-glow border-rose-500/40'
                          : isApproved
                          ? 'glass-success-glow border-emerald-500/30'
                          : 'bg-slate-950/70 border border-white/[0.06] text-slate-400'
                      }`}
                    >
                      {/* Top Header Strip */}
                      <div
                        className={`px-4 py-2 border-b flex items-center justify-between text-xs font-mono ${
                          isBlocked
                            ? 'bg-rose-950/60 border-rose-900/60 text-rose-300'
                            : isApproved
                            ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-300'
                            : 'bg-slate-900/60 border-white/[0.06] text-slate-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {isBlocked ? (
                            <span className="flex items-center space-x-1.5 font-bold tracking-wider uppercase text-[10px] bg-rose-900 text-rose-200 px-2 py-0.5 rounded-full shadow">
                              <XCircle className="w-3 h-3 text-rose-300" />
                              <span>INTERCEPTED & QUARANTINED</span>
                            </span>
                          ) : isApproved ? (
                            <span className="flex items-center space-x-1.5 font-bold tracking-wider uppercase text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded-full shadow">
                              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                              <span>VERIFIED & APPROVED</span>
                            </span>
                          ) : (
                            <span className="uppercase text-[10px]">{evt.status}</span>
                          )}
                          <span className="text-slate-400 text-[11px]">{evt.action}</span>
                        </div>

                        <div className="text-[10px] text-slate-400">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3">
                        {/* Plain English AI Explanation */}
                        <div className="text-xs font-medium text-slate-100 leading-relaxed font-sans">
                          {evt.summary}
                        </div>

                        {/* Metadata Tag Row */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1 border-t border-white/[0.06]">
                          {evt.amount > 0 && (
                            <div className="flex items-center space-x-1">
                              <span className="text-slate-500">Amount:</span>
                              <span
                                className={`font-bold ${
                                  isBlocked ? 'text-rose-300' : 'text-emerald-300'
                                }`}
                              >
                                ${evt.amount.toFixed(2)} {evt.currency}
                              </span>
                            </div>
                          )}

                          {evt.orderId && (
                            <div className="flex items-center space-x-1">
                              <span className="text-slate-500">PayPal Order:</span>
                              <span className="text-blue-300 font-bold bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-900">
                                {evt.orderId}
                              </span>
                            </div>
                          )}

                          {evt.ruleTriggered && (
                            <div className="flex items-center space-x-1">
                              <span className="text-slate-500">Rule:</span>
                              <span className="text-slate-300">{evt.ruleTriggered}</span>
                            </div>
                          )}
                        </div>

                        {/* THREAT QUARANTINE DOSSIER (When Blocked) */}
                        {isBlocked && (
                          <div className="mt-3 p-3.5 bg-black/60 rounded-xl border border-rose-500/40 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-rose-400 flex items-center space-x-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                                <span>Policy Violations Caught:</span>
                              </span>
                              <span className="text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-bold uppercase">
                                Zero Bytes Sent To PayPal
                              </span>
                            </div>

                            {evt.violations && evt.violations.length > 0 && (
                              <ul className="space-y-1 text-xs font-mono text-rose-200">
                                {evt.violations.map((violation, idx) => (
                                  <li key={idx} className="flex items-start space-x-1.5">
                                    <span className="text-rose-500 font-bold">›</span>
                                    <span>{violation}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {/* Raw Evidence Payload Box (OWASP ASI09 Compliance) */}
                            {evt.rawEvidence && (
                              <div className="mt-2 pt-2 border-t border-rose-900/60">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] font-mono uppercase font-bold text-slate-400">
                                    Raw Attack Snippet Intercepted:
                                  </span>
                                  <button
                                    onClick={() => copyPayload(evt.id, evt.rawEvidence!)}
                                    className="text-[9px] font-mono text-slate-400 hover:text-white flex items-center space-x-1"
                                  >
                                    {copiedPayloadId === evt.id ? (
                                      <span className="text-emerald-400">Copied</span>
                                    ) : (
                                      <span>Copy Evidence</span>
                                    )}
                                  </button>
                                </div>
                                <code className="block p-2 bg-slate-950 border border-rose-950 rounded text-[10px] font-mono text-rose-300 break-all leading-normal">
                                  {evt.rawEvidence}
                                </code>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* SCREEN 1: POLICY CONFIGURATION MODAL (The 10-Second Ritual) */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-glow max-w-lg w-full rounded-2xl p-6 shadow-2xl relative border border-blue-500/30">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Consent Policy Setup
                  </h3>
                  <p className="text-xs text-slate-400">10-Second Human Authorization Ritual</p>
                </div>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-slate-500 hover:text-slate-300 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-4">
              {/* Daily Spend Cap */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                  Single Transaction Spend Cap (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-mono">
                    $
                  </div>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    max="5000"
                    value={policy.dailySpendCap}
                    onChange={(e) => setPolicy({ ...policy, dailySpendCap: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Orders exceeding this threshold are blocked immediately by deterministic code.
                </p>
              </div>

              {/* Permitted Category Lock */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                  Category Lock (Whitelist)
                </label>
                <select
                  value={policy.allowedCategory}
                  onChange={(e) => setPolicy({ ...policy, allowedCategory: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Office Supplies">Office Supplies (Pens, Paper, Deskware)</option>
                  <option value="Software Subscriptions">Software & SaaS Subscriptions</option>
                  <option value="Books & Research">Books & Educational Materials</option>
                  <option value="Peripherals">Hardware & Peripherals</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Agent cannot buy items outside this category regardless of prompt instructions.
                </p>
              </div>

              {/* Audit Sensitivity */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                  Audit Stream Sensitivity
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPolicy({ ...policy, alertSensitivity: 'standard' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      policy.alertSensitivity === 'standard'
                        ? 'bg-blue-950/70 border-blue-500 text-white shadow'
                        : 'bg-slate-950 border-white/[0.06] text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">Standard</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Alerts on real policy blocks</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPolicy({ ...policy, alertSensitivity: 'strict' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      policy.alertSensitivity === 'strict'
                        ? 'bg-blue-950/70 border-blue-500 text-white shadow'
                        : 'bg-slate-950 border-white/[0.06] text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">Strict Audit</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Logs all internal sub-steps</div>
                  </button>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold shadow-lg shadow-blue-600/30 transition-all"
                >
                  Save & Apply Policies
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#060914] px-4 py-4 text-xs text-slate-500 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300 font-mono">Consent Console</span>
            <span className="text-slate-600">•</span>
            <span>PayPal AI Hackathon 2026 Submission</span>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-2 font-mono text-[10px] text-slate-400">
            <span className="bg-slate-900 border border-white/[0.06] px-2 py-0.5 rounded">
              OWASP LLM03: Excessive Agency (#3 in 2026)
            </span>
            <span className="bg-slate-900 border border-white/[0.06] px-2 py-0.5 rounded">
              OWASP ASI01: Goal Hijack Defense
            </span>
            <span className="bg-slate-900 border border-white/[0.06] px-2 py-0.5 rounded text-emerald-400">
              PayPal Sandbox Enforced
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
