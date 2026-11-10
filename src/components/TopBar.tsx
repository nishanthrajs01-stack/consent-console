'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 flex flex-wrap items-center justify-between gap-3">
      {/* Hackathon Pill */}
      <div className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full text-[11px] sm:text-xs text-slate-300 font-medium">
        <span className="text-[#F5A623]">⚡</span>
        <span className="truncate">PayPal AI Hackathon 2026</span>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Sandbox Mode Pill */}
        <div className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-white/[0.04] border border-white/[0.08] px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs text-slate-300 font-medium shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>Sandbox Mode</span>
        </div>

        {/* Profile Avatar Pill */}
        <div className="inline-flex items-center space-x-2 bg-white/[0.04] border border-white/[0.08] pl-1 pr-2.5 sm:pr-3 py-1 rounded-full text-[11px] sm:text-xs text-slate-200 cursor-pointer hover:bg-white/[0.08] transition-colors shrink-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#2E7CF6] flex items-center justify-center text-white font-bold text-[10px] sm:text-xs">
            N
          </div>
          <span className="font-medium hidden xs:inline truncate max-w-[110px] sm:max-w-none">Nishanth Raj S</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
