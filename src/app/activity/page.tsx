'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import TrustStrip from '@/components/TrustStrip';
import {
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Info,
  Download,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { ConsentEvent } from '@/types/consent';

export default function ActivityLogsPage() {
  const [events, setEvents] = useState<ConsentEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'BLOCKED' | 'INFO'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/events?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.events)) setEvents(data.events);
      })
      .catch((err) => console.error('Failed to load activity logs:', err));
  }, []);

  const clearFeed = async () => {
    if (confirm('Clear all recorded activity events?')) {
      await fetch('/api/events', { method: 'DELETE' });
      setEvents([]);
    }
  };

  const exportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `consent_console_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyPayload = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEvents = events.filter((evt) => {
    const matchesStatus = statusFilter === 'ALL' || evt.status === statusFilter;
    const matchesSearch =
      (evt.itemTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.ruleTriggered || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.orderId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#080D1F] text-[#F5F7FA] font-sans flex antialiased selection:bg-[#2E7CF6] selection:text-white">
      <Sidebar />

      <div className="flex-1 min-w-0 canvas-glow flex flex-col overflow-y-auto">
        <TopBar />

        <main className="px-8 py-6 max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#2E7CF6] uppercase tracking-wider">
                <BarChart3 className="w-4 h-4" />
                <span>Forensic Audit Trail</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Activity Logs</h1>
              <p className="text-sm text-[#94A3B8]">
                Complete chronological record of all autonomous tool calls, policy evaluations, and interceptions.
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={exportLogs}
                className="px-3.5 py-2 rounded-xl border border-white/[0.1] text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] flex items-center space-x-2 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={clearFeed}
                className="px-3.5 py-2 rounded-xl border border-white/[0.1] text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-white/[0.04] flex items-center space-x-2 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* FILTER & SEARCH BAR */}
          <div className="surface-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, rules, or items..."
                className="w-full pl-9 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-[#2E7CF6]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] text-xs self-stretch sm:self-auto justify-center">
              {(['ALL', 'APPROVED', 'BLOCKED', 'INFO'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setStatusFilter(mode)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === mode
                      ? 'bg-[#2E7CF6] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* AUDIT LOG LIST */}
          <div className="surface-card p-5 space-y-4">
            <div className="text-xs text-[#94A3B8] font-medium flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span>Showing {filteredEvents.length} events</span>
              <span>Sorted by Most Recent</span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <BarChart3 className="w-10 h-10 mx-auto text-slate-600 stroke-[1.2]" />
                <p className="text-sm font-semibold text-slate-300">No matching events found</p>
                <p className="text-xs text-slate-500">Try adjusting your search query or filter settings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((evt) => {
                  const isApproved = evt.status === 'APPROVED';
                  const isBlocked = evt.status === 'BLOCKED';

                  return (
                    <div
                      key={evt.id}
                      className={`rounded-xl border p-4 transition-all ${
                        isBlocked
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : isApproved
                          ? 'bg-[#0E1630] border-white/[0.08]'
                          : 'bg-white/[0.02] border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {isBlocked ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 flex items-center space-x-1">
                                <XCircle className="w-3 h-3" />
                                <span>BLOCKED</span>
                              </span>
                            ) : isApproved ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>APPROVED</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                {evt.status}
                              </span>
                            )}

                            <span className="text-xs font-bold text-white">
                              {evt.itemTitle || evt.action}
                            </span>
                          </div>

                          <p className="text-xs text-[#94A3B8] leading-relaxed font-sans pt-0.5">
                            {evt.summary}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          {evt.amount > 0 && (
                            <div
                              className={`text-sm font-bold font-mono ${
                                isBlocked ? 'text-rose-300' : 'text-emerald-300'
                              }`}
                            >
                              ₹{evt.amount.toLocaleString('en-IN')}
                            </div>
                          )}
                          <div className="text-[10px] text-[#5B6B87] font-mono mt-0.5">
                            {new Date(evt.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Rule & Order Metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#94A3B8] pt-3 mt-3 border-t border-white/[0.06] font-mono">
                        {evt.orderId && (
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-500">PayPal Order:</span>
                            <span className="text-blue-300 font-bold">{evt.orderId}</span>
                          </div>
                        )}

                        {evt.ruleTriggered && (
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-500">Evaluation:</span>
                            <span className="text-white">{evt.ruleTriggered}</span>
                          </div>
                        )}
                      </div>

                      {/* Raw Evidence Drawer (For Blocked Events) */}
                      {isBlocked && evt.rawEvidence && (
                        <div className="mt-3 pt-3 border-t border-rose-500/20 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-mono font-bold">
                            <span>Raw Extracted Payload:</span>
                            <button
                              onClick={() => copyPayload(evt.id, evt.rawEvidence!)}
                              className="text-slate-300 hover:text-white flex items-center space-x-1"
                            >
                              {copiedId === evt.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedId === evt.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <code className="block p-2 bg-black/50 border border-rose-900/50 rounded-lg text-[10px] font-mono text-rose-300 break-all leading-normal">
                            {evt.rawEvidence}
                          </code>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-6">
            <TrustStrip />
          </div>
        </main>
      </div>
    </div>
  );
}
