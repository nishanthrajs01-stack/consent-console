'use client';

import React from 'react';
import { ShieldCheck, Zap, Cpu, Lock } from 'lucide-react';

export default function TrustStrip() {
  return (
    <div className="surface-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Left: Your Safety. Our Priority */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-[#2E7CF6]/15 text-[#2E7CF6] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight">Your Safety. Our Priority.</div>
          <div className="text-xs text-[#94A3B8]">Powered by PayPal&apos;s Agent Toolkit and advanced AI controls.</div>
        </div>
      </div>

      {/* Middle & Right Trust Features */}
      <div className="flex items-center flex-wrap gap-3 sm:gap-5 text-xs text-slate-300">
        <div className="flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-[#2E7CF6] shrink-0" />
          <span className="font-medium text-[11px] sm:text-xs">Real-time Protection</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#2E7CF6] shrink-0" />
          <span className="font-medium text-[11px] sm:text-xs">AI-Powered Insights</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-[#2E7CF6] shrink-0" />
          <span className="font-medium text-[11px] sm:text-xs">Bank-Grade Security</span>
        </div>

        {/* Powered by PayPal Badge */}
        <div className="flex items-center space-x-1.5 bg-black/40 border border-white/[0.1] px-2.5 sm:px-3 py-1 rounded-full text-xs text-white">
          <svg className="w-3.5 h-3.5 fill-[#2E7CF6]" viewBox="0 0 32 32">
            <path d="M26.4 8.7C25.8 5.8 23.3 4 19.8 4H9.5C8.8 4 8.2 4.5 8.1 5.2L4.5 28c-.1.6.4 1.1 1 1.1h5.8c.7 0 1.3-.5 1.4-1.2l1-6.5c.1-.7.7-1.2 1.4-1.2h2.7c5.2 0 9.3-2.1 10.5-8.2.5-2.7.2-4.8-1.9-4.3z" />
          </svg>
          <span className="text-[10px] sm:text-[11px] text-[#94A3B8]">Powered by</span>
          <span className="font-bold text-[11px] sm:text-xs text-white">PayPal</span>
        </div>
      </div>
    </div>
  );
}
