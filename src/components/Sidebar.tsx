'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Home,
  Settings,
  Shield,
  BarChart3,
  Info,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Policies', href: '/policies', icon: Shield },
    { label: 'Activity Logs', href: '/activity', icon: BarChart3 },
    { label: 'About', href: '/about', icon: Info },
  ];

  return (
    <>
      {/* 1. MOBILE TOP NAVIGATION BAR (Visible only on < 1024px) */}
      <div className="lg:hidden w-full bg-[#111A38] border-b border-white/[0.08] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center space-x-2.5">
          <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
            <path
              d="M26.4 8.7C25.8 5.8 23.3 4 19.8 4H9.5C8.8 4 8.2 4.5 8.1 5.2L4.5 28c-.1.6.4 1.1 1 1.1h5.8c.7 0 1.3-.5 1.4-1.2l1-6.5c.1-.7.7-1.2 1.4-1.2h2.7c5.2 0 9.3-2.1 10.5-8.2.5-2.7.2-4.8-1.9-4.3z"
              fill="#2E7CF6"
            />
            <path
              d="M23.1 13.9c-.8 4.2-3.6 5.8-7.7 5.8h-2.1c-.6 0-1.1.4-1.2 1l-1.3 8.3c-.1.5.3.9.8.9h4.6c.6 0 1.1-.4 1.2-1l.8-5.3c.1-.6.6-1 1.2-1h1.5c4.1 0 7.3-1.7 8.3-6.6.4-2.2.1-3.9-1.3-4.6-.9 1.4-2.5 2.2-4.3 2.5z"
              fill="#1D63D8"
            />
          </svg>
          <span className="font-extrabold text-lg text-white">PayPal</span>
          <span className="text-white/[0.2]">|</span>
          <span className="font-bold text-xs text-[#2E7CF6] flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Consent</span>
          </span>
        </Link>

        {/* Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop blur */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-[#111A38] border-r border-white/[0.1] h-full flex flex-col justify-between p-6 z-10 shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              {/* Header with Close */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#2E7CF6]/15 border border-[#2E7CF6]/40 flex items-center justify-center text-[#2E7CF6]">
                    <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Consent Console</div>
                    <div className="text-[10px] text-[#94A3B8]">Control. Approve. Stay Safe.</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation items */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#2E7CF6] text-white shadow-lg shadow-[#2E7CF6]/25'
                          : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Promo */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0E1630] border border-white/[0.08] p-4 text-xs mt-6">
              <div className="space-y-1.5">
                <Sparkles className="w-4 h-4 text-[#2E7CF6]" />
                <p className="text-slate-300 font-medium leading-snug">
                  Built for a safer, smarter PayPal experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DESKTOP PERMANENT SIDEBAR (Visible on laptops & desktops >= 1024px) */}
      <aside className="hidden lg:flex w-60 bg-[#111A38] border-r border-white/[0.08] flex-col justify-between shrink-0 min-h-screen p-5 z-20 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          {/* PayPal Brand Header */}
          <Link href="/" className="flex items-center space-x-2 pt-1 group">
            <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
              <path
                d="M26.4 8.7C25.8 5.8 23.3 4 19.8 4H9.5C8.8 4 8.2 4.5 8.1 5.2L4.5 28c-.1.6.4 1.1 1 1.1h5.8c.7 0 1.3-.5 1.4-1.2l1-6.5c.1-.7.7-1.2 1.4-1.2h2.7c5.2 0 9.3-2.1 10.5-8.2.5-2.7.2-4.8-1.9-4.3z"
                fill="#2E7CF6"
              />
              <path
                d="M23.1 13.9c-.8 4.2-3.6 5.8-7.7 5.8h-2.1c-.6 0-1.1.4-1.2 1l-1.3 8.3c-.1.5.3.9.8.9h4.6c.6 0 1.1-.4 1.2-1l.8-5.3c.1-.6.6-1 1.2-1h1.5c4.1 0 7.3-1.7 8.3-6.6.4-2.2.1-3.9-1.3-4.6-.9 1.4-2.5 2.2-4.3 2.5z"
                fill="#1D63D8"
              />
            </svg>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center group-hover:text-blue-400 transition-colors">
              PayPal
            </span>
          </Link>

          {/* Consent Console Sub-brand Box */}
          <div className="flex items-start space-x-3 pt-1 pb-2">
            <div className="w-9 h-9 rounded-xl bg-[#2E7CF6]/15 border border-[#2E7CF6]/40 flex items-center justify-center text-[#2E7CF6] shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-tight leading-tight">Consent Console</div>
              <div className="text-[11px] text-[#94A3B8] mt-0.5">Control. Approve. Stay Safe.</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#2E7CF6] text-white shadow-lg shadow-[#2E7CF6]/25'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Promo Wave Card at Bottom of Sidebar */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0E1630] border border-white/[0.08] p-4 text-xs mt-6">
          <div className="relative z-10 space-y-1.5">
            <div className="text-[#2E7CF6]">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-slate-300 font-medium leading-snug">
              Built for a safer, smarter PayPal experience.
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tr from-[#2E7CF6]/20 to-[#60A5FA]/10 blur-xl rounded-full pointer-events-none" />
        </div>
      </aside>
    </>
  );
}
