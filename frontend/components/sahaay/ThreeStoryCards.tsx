'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface ThreeStoryCardsProps {
  vehicleGap?: number;
  recoveryDays?: number;
}

export function ThreeStoryCards({ vehicleGap = 28250, recoveryDays = 45 }: ThreeStoryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
      {/* ========================================================
          CARD 01: MEDICAL EMERGENCY (Dark Navy #0D1C34)
          ======================================================== */}
      <Link
        href="/intake?type=medical"
        className="group rounded-[32px] bg-[#0D1C34] text-white p-7 sm:p-8 flex flex-col justify-between min-h-[480px] shadow-2xl relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[#0D1C34]/40"
      >
        {/* Top Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-editorial text-2xl sm:text-[1.75rem] font-normal tracking-tight text-white flex items-baseline gap-2">
              <span className="font-sans text-xs font-mono text-white/50">01</span>
              <span>Medical Emergency</span>
            </h3>
            <div className="h-10 w-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#0D1C34] transition-all duration-300 shrink-0">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-[280px]">
            A hospital admission or surgery unexpectedly triggers room rent caps, co-pays and non-payable deductions.
          </p>
        </div>

        {/* Bottom Image: Authentic hospital support moment */}
        <div className="relative mt-6 h-52 sm:h-56 w-full rounded-2xl overflow-hidden shadow-md">
          <Image
            src="/images/card_hospital_support.jpg"
            alt="Adult son supporting smiling elderly father during hospital recovery"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1C34]/85 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 text-[11px] font-medium text-white/95">
            Hospital Inpatient • Instant Policy Audit &amp; Gap Protection
          </div>
        </div>
      </Link>

      {/* ========================================================
          CARD 02: VEHICLE ACCIDENT (Crisp Pure White #FFFFFF)
          ======================================================== */}
      <Link
        href="/intake?type=vehicle"
        className="group rounded-[32px] bg-white text-[#0D1C34] p-7 sm:p-8 flex flex-col justify-between min-h-[480px] shadow-xl relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-editorial text-2xl sm:text-[1.75rem] font-normal tracking-tight text-[#0D1C34] flex items-baseline gap-2">
              <span className="font-sans text-xs font-mono text-slate-400">02</span>
              <span>Vehicle Accident</span>
            </h3>
            <div className="h-10 w-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[#0D1C34] group-hover:bg-[#0D1C34] group-hover:text-white transition-all duration-300 shrink-0">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#596980] leading-relaxed max-w-[280px]">
            A road collision halts mobility and triggers disputed workshop estimates, salvage deductions and zero-dep gaps.
          </p>
        </div>

        {/* Middle Stats & Workshop Claims Photo */}
        <div className="relative mt-6 pt-2 flex items-end justify-between gap-3">
          <div className="space-y-4">
            <div>
              <div className="font-serif-editorial text-3xl sm:text-4xl font-normal text-[#0D1C34] font-mono">
                {formatINR(vehicleGap)}
              </div>
              <p className="text-xs text-[#596980] mt-0.5 font-medium">Modeled workshop gap</p>
            </div>
            <div>
              <div className="font-serif-editorial text-2xl sm:text-3xl font-normal text-[#0D1C34]">
                Zero-Dep
              </div>
              <p className="text-xs text-[#596980] mt-0.5 font-medium">Salvage &amp; parts audit</p>
            </div>
          </div>

          {/* Right Service Center Photo cutout matching reference card 2 proportions */}
          <div className="relative h-44 w-36 rounded-2xl overflow-hidden shadow-sm shrink-0">
            <Image
              src="/images/card_vehicle_accident.jpg"
              alt="Vehicle owner and advisor reviewing collision repair claim at service bay"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </Link>

      {/* ========================================================
          CARD 03: INCOME INTERRUPTION (Slate Blue #203A60)
          ======================================================== */}
      <Link
        href="/intake?type=income"
        className="group rounded-[32px] bg-[#203A60] text-white p-7 sm:p-8 flex flex-col justify-between min-h-[480px] shadow-2xl relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[#203A60]/40"
      >
        {/* Top Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-editorial text-2xl sm:text-[1.75rem] font-normal tracking-tight text-white flex items-baseline gap-2">
              <span className="font-sans text-xs font-mono text-white/50">03</span>
              <span>Income Interruption</span>
            </h3>
            <div className="h-10 w-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#0D1C34] transition-all duration-300 shrink-0">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-[280px]">
            Prolonged recovery, medical leave or sudden wage disruption halts cash flow while essential rent and EMIs continue.
          </p>
        </div>

        {/* Middle Stats & Family Budget Relief Photo */}
        <div className="relative z-10 mt-6 pt-2 flex items-end justify-between gap-3">
          <div className="space-y-4">
            <div>
              <div className="font-serif-editorial text-3xl sm:text-4xl font-normal text-white">
                {recoveryDays} Days
              </div>
              <p className="text-xs text-blue-100/80 mt-0.5 font-medium">Average recovery cash gap</p>
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-[#D9FF32] bg-[#D9FF32]/15 px-2.5 py-1 rounded-full border border-[#D9FF32]/30 inline-block">
                100% Shielded
              </div>
              <p className="text-xs text-blue-100/80 mt-1 font-medium">Essential EMI protection</p>
            </div>
          </div>

          {/* Right Family Budget Relief Photo cutout */}
          <div className="relative h-44 w-36 rounded-2xl overflow-hidden shadow-sm shrink-0">
            <Image
              src="/images/card_income_interruption.jpg"
              alt="Couple reviewing household budget and emergency relief"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
