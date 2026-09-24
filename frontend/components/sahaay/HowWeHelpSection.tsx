'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Sparkles,
  CreditCard,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { SoaringGooseSolo } from './SoaringGeese';

export function HowWeHelpSection() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('current_active_case_id') || localStorage.getItem('sahaay_active_case_id');
      if (stored) setActiveCaseId(stored);
    }
  }, []);

  const helpRows = [
    {
      step: '01',
      title: 'Understand',
      icon: FileText,
      summary: 'Tell us what happened in simple language. Sahaay understands your situation, documents and financial context.',
      details: 'Accepts voice notes and documents: hospital discharge summaries, vehicle collision repair estimates, police GD/FIR receipts, or salary disruption notices.',
      href: '/intake',
    },
    {
      step: '02',
      title: 'Plan',
      icon: Sparkles,
      summary: 'Get a clear view of your insurance eligibility, potential gap and recovery options — with supporting evidence.',
      details: 'Audits health room rent caps, motor collision zero-depreciation clauses, and models short-term cash-flow buffers with source-linked evidence.',
      href: activeCaseId ? `/case/${activeCaseId}/evidence` : '/intake?station=evidence',
    },
    {
      step: '03',
      title: 'Take Action',
      icon: CreditCard,
      summary: 'Continue into funding and payments with your context already in place. No repeated forms.',
      details: 'FlowPass carries verified KYC and emergency breakdown directly to hospital checkout, workshop repair settlement, or emergency EMI relief.',
      href: activeCaseId ? `/case/${activeCaseId}/flowpass` : '/intake?station=flowpass',
    },
    {
      step: '04',
      title: 'Track Recovery',
      icon: TrendingUp,
      summary: 'Stay informed with real-time updates across your entire financial journey.',
      details: 'Maintains a single live case thread across insurer claim approvals, vehicle workshop delivery, wage restoration, and financial stability.',
      href: activeCaseId ? `/case/${activeCaseId}/recovery` : '/intake?station=recovery',
    },
  ];

  return (
    <section id="how-we-help" className="relative py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header matching reference */}
      <div className="max-w-3xl mb-12 sm:mb-16">
        <h2 className="font-serif-editorial text-4xl sm:text-5xl lg:text-[3.75rem] font-normal text-white drop-shadow-sm tracking-tight leading-[1.12]">
          How we can help you
        </h2>
        <p className="mt-3.5 text-base sm:text-lg text-white/90 max-w-xl leading-relaxed font-normal">
          From uncertainty to clarity, Sahaay guides you at every step.
        </p>
      </div>

      {/* 4 Clean Horizontal Rows with Thin Translucent Borders matching reference */}
      <div className="divide-y divide-white/25 border-y border-white/25">
        {helpRows.map((row, idx) => {
          const Icon = row.icon;
          const isHovered = hoveredRow === idx;

          return (
            <Link
              key={row.title}
              href={row.href}
              onMouseEnter={() => setHoveredRow(idx)}
              onMouseLeave={() => setHoveredRow(null)}
              className="group block py-7 sm:py-8 transition-all duration-300 relative"
            >
              {/* Subtle hover backlight */}
              <div
                className={`absolute inset-x-[-1rem] inset-y-0 rounded-2xl bg-white/10 backdrop-blur-xs transition-opacity duration-300 pointer-events-none ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
                {/* Left: Icon & Title */}
                <div className="flex items-center gap-5 sm:gap-6 md:w-1/3 shrink-0">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 group-hover:bg-white group-hover:text-[#0D1C34] transition-colors duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-editorial text-2xl sm:text-[1.85rem] font-normal text-white">
                      {row.title}
                    </h3>
                  </div>
                </div>

                {/* Center: Description & Revealed Details */}
                <div className="md:w-1/2">
                  <p className="text-sm sm:text-base text-white/95 leading-relaxed font-normal">
                    {row.summary}
                  </p>

                  {/* Expandable secondary detail on hover */}
                  <div
                    className={`overflow-hidden transition-all duration-300 text-xs text-white/80 flex items-center gap-2 ${
                      isHovered ? 'max-h-16 opacity-100 pt-2' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#D9FF32] shrink-0" />
                    <span>{row.details}</span>
                  </div>
                </div>

                {/* Right: Circular Arrow Action Button matching reference */}
                <div className="flex items-center justify-end md:w-auto shrink-0">
                  <div className="h-11 w-11 rounded-full bg-white text-[#0D1C34] flex items-center justify-center shadow-lg transition-all duration-300 group-hover:translate-x-1.5 group-hover:bg-[#D9FF32]">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Floating Goose in the lower right matching reference */}
      <div className="relative mt-8 flex justify-end pr-8 sm:pr-16 pointer-events-none">
        <SoaringGooseSolo size={80} rotation={0} opacity={0.95} variant={2} />
      </div>
    </section>
  );
}
