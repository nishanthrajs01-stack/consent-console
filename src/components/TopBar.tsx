'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="px-8 pt-6 pb-2 flex items-center justify-between">
      {/* Hackathon Pill */}
      <div className="inline-flex items-center space-x-2 bg-white/[0.04] border border-white/[0.08] px-3.5 py-1 rounded-full text-xs text-slate-300 font-medium">
        <span className="text-[#F5A623]">⚡</span>
        <span>PayPal AI Hackathon 2026</span>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center space-x-3">
        {/* Sandbox Mode Pill */}
        <div className="inline-flex items-center space-x-2 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full text-xs text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>Sandbox Mode</span>
        </div>

        {/* Profile Avatar Pill */}
        <div className="inline-flex items-center space-x-2.5 bg-white/[0.04] border border-white/[0.08] pl-1 pr-3 py-1 rounded-full text-xs text-slate-200 cursor-pointer hover:bg-white/[0.08] transition-colors">
          <div className="w-6 h-6 rounded-full bg-[#2E7CF6] flex items-center justify-center text-white font-bold text-xs">
            N
          </div>
          <span className="font-medium">Nishanth Raj S</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
