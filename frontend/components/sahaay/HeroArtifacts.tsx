'use client';

import React from 'react';
import { ShieldCheck, HeartPulse, Scale, CheckCircle2, CreditCard } from 'lucide-react';

export function HeroArtifacts() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20" aria-hidden="true">
      {/* 01. FLOWPASS — Context Verified (Top Left) */}
      <div
        className="absolute top-28 sm:top-36 left-4 sm:left-10 lg:left-16 floating-artifact p-3 sm:p-3.5 flex items-center gap-3 animate-float-gentle"
        style={{ animationDuration: '8s' }}
      >
        <div className="h-8 w-8 rounded-xl bg-[#246BB2]/15 text-[#246BB2] flex items-center justify-center shrink-0">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="text-left">
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#596980]">FlowPass</div>
          <div className="text-xs font-bold text-[#101B35] flex items-center gap-1.5">
            <span>Context Verified</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 02. INSURANCE — Potential Coverage ₹1,60,000 (Top Right) */}
      <div
        className="absolute top-24 sm:top-32 right-4 sm:right-12 lg:right-24 floating-artifact p-3 sm:p-3.5 flex items-center gap-3 animate-float-delayed"
        style={{ animationDuration: '9s' }}
      >
        <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <HeartPulse className="h-4 w-4" />
        </div>
        <div className="text-left">
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#596980]">Insurance Coverage</div>
          <div className="text-xs font-mono font-bold text-emerald-700">₹1,60,000 Verified</div>
        </div>
      </div>

      {/* 03. FINANCIAL GAP — ₹24,600 (Lower Left) */}
      <div
        className="hidden md:flex absolute bottom-36 sm:bottom-44 left-8 lg:left-24 floating-artifact p-3 sm:p-3.5 items-center gap-3 animate-float-delayed"
        style={{ animationDuration: '7.5s' }}
      >
        <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Scale className="h-4 w-4" />
        </div>
        <div className="text-left">
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#596980]">Financial Gap</div>
          <div className="text-xs font-mono font-bold text-[#101B35]">₹24,600 Out-of-Pocket</div>
        </div>
      </div>

      {/* 04. RECOVERY — 3 Steps Remaining (Mid Right) */}
      <div
        className="hidden sm:flex absolute bottom-28 sm:bottom-36 right-6 lg:right-28 floating-artifact p-3 sm:p-3.5 items-center gap-3 animate-float-gentle"
        style={{ animationDuration: '8.5s' }}
      >
        <div className="h-8 w-8 rounded-xl bg-[#246BB2]/10 text-[#246BB2] flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="text-left">
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#596980]">Recovery Plan</div>
          <div className="text-xs font-bold text-[#101B35]">3 Steps Remaining</div>
        </div>
      </div>

      {/* 05. PAYMENT — Ready (Bottom Center-Right) */}
      <div
        className="hidden lg:flex absolute bottom-16 right-1/4 floating-artifact px-3 py-2 items-center gap-2 animate-float-delayed"
        style={{ animationDuration: '9.5s' }}
      >
        <CreditCard className="h-3.5 w-3.5 text-[#246BB2]" />
        <span className="text-[11px] font-semibold text-[#101B35]">Hospital Settlement Ready</span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#D9FF32] border border-[#101B35]/20" />
      </div>
    </div>
  );
}
