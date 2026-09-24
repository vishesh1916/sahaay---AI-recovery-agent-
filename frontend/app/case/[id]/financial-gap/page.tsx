'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, AlertTriangle, Shield, TrendingDown } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { api } from '@/lib/api';
import { CaseData } from '@/lib/types';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

export default function FinancialGapPage() {
  const params = useParams();
  const caseId = params?.id as string;
  const [gapAmount, setGapAmount] = useState<number>(0);
  const [buffer, setBuffer] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCase(caseId);
        if (data) {
          const gap = data.analysis?.gap_result?.potential_gap;
          if (gap) setGapAmount(gap);
          const buf = data.analysis?.financial_context?.liquidity_buffer;
          if (buf) setBuffer(buf);
        }
      } catch (e) {
        console.warn('Failed to load case data in financial-gap', e);
      } finally {
        setLoading(false);
      }
    }
    if (caseId) load();
  }, [caseId]);

  const deficit = Math.max(gapAmount - buffer, 0);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20">
      <CaseWorkflowNav caseId={caseId} activeStation="gap" emergencyTitle="Calculated Financial Gap" />

      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 pt-12 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 mb-6 shadow-xs">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>Calculated Financial Gap</span>
        </div>

        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
          Potential Out-of-Pocket Amount to Arrange
        </span>

        {/* Big Number */}
        <h1 className="mt-3 text-5xl sm:text-7xl font-extrabold tracking-tight text-amber-800 font-mono">
          {formatINR(gapAmount)}
        </h1>

        <p className="mt-4 text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          "Let's see how this may affect your current household financial position and liquidity buffer."
        </p>

        {/* Mini Buffer Comparison Box */}
        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Current Cash Buffer</span>
            <p className="text-2xl font-extrabold font-mono text-[#246BB2] mt-1.5">{formatINR(buffer)}</p>
          </div>
          <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs">
            <span className="text-xs font-bold text-rose-800 uppercase">Immediate Deficit</span>
            <p className="text-2xl font-extrabold font-mono text-rose-700 mt-1.5">
              {deficit > 0 ? formatINR(deficit) : '₹0 (Covered)'}
            </p>
          </div>
        </div>

        {/* CTA to Simulator */}
        <div className="mt-10">
          <Link
            href={`/case/${caseId}/recovery`}
            className="inline-flex items-center gap-2 rounded-full bg-[#D9FF32] text-[#101B35] px-8 py-4 text-sm font-bold shadow-sm hover:bg-[#CCF025] hover:scale-102 transition-all"
          >
            <span>Simulate Recovery Scenarios</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
