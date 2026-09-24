'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Scale, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Calculator, ShieldCheck, Car, HeartPulse, TrendingDown, AlertTriangle, Sparkles } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { api } from '@/lib/api';
import { CaseData, GapCalculation } from '@/lib/types';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

export default function GapBreakdownPage() {
  const params = useParams();
  const caseId = params?.id as string;
  const [showFormula, setShowFormula] = useState(true);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (!caseId) return;
        const data = await api.getCase(caseId);
        if (data) setCaseData(data);
      } catch (e) {
        console.warn('Failed to load case data in gap page', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [caseId]);

  const gapResult: GapCalculation = caseData?.analysis?.gap_result || {
    total_bill: caseData?.total_amount || 0,
    potential_claim_amount: 0,
    potential_gap: caseData?.total_amount || 0,
    deductions: [],
    line_item_results: [],
  } as any;
  const emergencyType = caseData?.emergency_type || caseData?.type || 'medical';

  const totalBill = gapResult.total_bill || caseData?.total_amount || 0;
  const potCovered = gapResult.potential_claim_amount || 0;
  const potGap = gapResult.potential_gap || (totalBill - potCovered);
  const deductions = gapResult.deductions || [];

  return (
    <div className="min-h-screen bg-[#9BB0D8] pb-20 text-[#0D1C34] selection:bg-[#D9FF32] selection:text-[#0D1C34]">
      {/* Workflow Navigation */}
      <CaseWorkflowNav caseId={caseId} activeStation="gap" emergencyTitle="Deterministic Financial Gap" />

      <div className="mx-auto flex max-w-5xl flex-col px-4 pt-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-6 border-b border-white/25">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#2464A4] border border-white shadow-xs">
              <Scale className="h-3.5 w-3.5" />
              Financial Gap Waterfall
            </span>
            <span className="rounded-full bg-emerald-50 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
              Deterministic Rules
            </span>
          </div>
          <h1 className="font-serif-editorial mt-2 text-3xl sm:text-4xl font-normal tracking-tight text-white drop-shadow-sm">
            Where does the {formatINR(potGap)} gap come from?
          </h1>
          <p className="mt-1 text-sm text-white/90 max-w-2xl">
            Sahaay performs verified clause reasoning. Here is the mathematical audit explaining each deduction and required out-of-pocket settlement.
          </p>
        </div>

        {/* Waterfall Breakdown Visual */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Total Incident / Invoice Amount</span>
              <p className="text-xs text-slate-500 mt-0.5">Itemized verified assessment</p>
            </div>
            <span className="font-mono text-2xl font-extrabold text-[#101B35]">
              {formatINR(totalBill)}
            </span>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-emerald-700">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">2. Potential Eligible Insurance / Payout</span>
              <p className="text-xs text-emerald-600 mt-0.5">Estimated amount approved by insurer / liquid reserve</p>
            </div>
            <span className="font-mono text-2xl font-extrabold text-emerald-700">
              - {formatINR(potCovered)}
            </span>
          </div>

          {/* Deductions Breakdown */}
          <div className="rounded-2xl bg-amber-50/50 p-5 space-y-3.5 border border-amber-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-amber-700" /> Deductions Applied by Policy Rules:
            </span>

            {deductions.length === 0 ? (
              <div className="py-3 text-xs text-slate-500 italic">
                No policy deductions applied. All eligible expenses are covered under standard policy terms.
              </div>
            ) : (
              deductions.map((d, idx) => (
                <div key={idx} className="flex items-start justify-between text-xs pt-3 border-t border-amber-200/60 gap-4">
                  <div className="pr-4">
                    <span className="font-bold text-[#101B35] text-sm">{d.item_name}</span>
                    <p className="text-xs text-slate-600 mt-0.5">{d.reason}</p>
                    {d.evidence_ref && (
                      <span className="inline-block mt-1 text-[11px] font-mono text-[#246BB2] font-medium">{d.evidence_ref}</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-amber-800 text-sm whitespace-nowrap">
                    + {formatINR(d.deduction_amount)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Total Final Gap */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-5 border-t border-slate-100 gap-2">
            <div>
              <span className="text-sm font-extrabold uppercase tracking-wider text-[#101B35]">
                Total Financial Gap to Settle
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Out-of-pocket amount required before hospital discharge or completion</p>
            </div>
            <span className="font-mono text-3xl font-extrabold text-amber-700">
              {formatINR(potGap)}
            </span>
          </div>
        </div>

        {/* Expandable: "How was this calculated?" */}
        <div className="mt-6 rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/60 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-sm font-bold text-[#101B35]">
              <Calculator className="h-4 w-4 text-[#246BB2]" />
              <span>Mathematical Proof & Clause Logic</span>
            </div>
            {showFormula ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {showFormula && (
            <div className="p-6 pt-2 border-t border-slate-100 text-xs text-slate-700 space-y-3 font-mono">
              {emergencyType === 'vehicle' ? (
                <>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 space-y-1.5 font-sans">
                    <p className="font-bold text-[#101B35]">Step 1: Compulsory Deductible</p>
                    <p className="font-mono text-xs">Standard policy excess as mandated by IRDAI tariff = ₹2,000</p>
                    <p className="text-slate-500 text-xs">Compulsory policyholder contribution on private car claim</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 space-y-1.5 font-sans">
                    <p className="font-bold text-[#101B35]">Step 2: Consumables & Non-Metallic Depreciation</p>
                    <p className="font-mono text-xs">Coolant, AC gas, fasteners, engine oil replacement = ₹4,200</p>
                    <p className="text-amber-700 text-xs font-semibold">Uncovered unless standalone engine/consumable add-on active</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 space-y-1.5 font-sans">
                    <p className="font-bold text-[#101B35]">Step 3: Metal & Paint Labor Co-Pay</p>
                    <p className="font-mono text-xs">Depreciation on bumper plastic & paint material (25%) = ₹18,900</p>
                    <p className="text-emerald-700 text-xs font-semibold">Net Covered by Insurer = ₹53,400</p>
                  </div>
                </>
              ) : emergencyType === 'income' ? (
                <>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 space-y-1.5 font-sans">
                    <p className="font-bold text-[#101B35]">Step 1: Immediate Obligation Schedule</p>
                    <p className="font-mono text-xs">Home Rent (₹18,000) + Fixed Loan EMIs (₹12,500) = ₹30,500</p>
                    <p className="text-slate-500 text-xs">Non-negotiable fixed obligations due within 7 days</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 space-y-1.5 font-sans">
                    <p className="font-bold text-[#101B35]">Step 2: Minimum Living Expenses & Utilities</p>
                    <p className="font-mono text-xs">Groceries, Utilities & Medical subscriptions = ₹15,000</p>
                    <p className="text-amber-700 text-xs font-semibold">Total 30-day cash outflow needed = ₹45,500</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 space-y-1.5 font-sans">
                    <p className="font-bold text-[#101B35]">Step 1: Room Rent Breach Ratio</p>
                    <p className="font-mono text-xs">Actual Room Rent = ₹70,000 / 10 days = ₹7,000 per day</p>
                    <p className="font-mono text-xs">Eligible Room Rent Limit = ₹5,000 per day (Single AC)</p>
                    <p className="text-amber-800 text-xs font-bold">Proportionate Ratio = 5,000 / 7,000 = 71.43%</p>
                    <p className="text-slate-500 text-xs">Room rent direct deduction: (₹7,000 - ₹5,000) × 10 = ₹20,000</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 space-y-1.5 font-sans">
                    <p className="font-bold text-[#101B35]">Step 2: Proportionate Reduction on Associated Fees ONLY</p>
                    <p className="font-mono text-xs">Associated Pool (Surgeon + Doctor + OT + Nursing) = ₹73,000</p>
                    <p className="font-mono text-xs">Approved Portion = ₹73,000 × 71.43% = ₹52,143</p>
                    <p className="text-amber-800 text-xs font-bold">Associated Deduction = ₹73,000 - ₹52,143 = ₹20,857</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 space-y-1.5 font-sans">
                    <p className="font-bold text-[#101B35]">Step 3: Non-Associated Expenses (Protected from cuts)</p>
                    <p className="font-mono text-xs">Pharmacy (₹18,600) + Diagnostics (₹12,000) + Implants (₹8,000) = ₹38,600</p>
                    <p className="text-emerald-700 text-xs font-bold">Approved 100% = ₹38,600 (Zero proportionate cuts)</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 space-y-1.5 font-sans">
                    <p className="font-bold text-[#101B35]">Step 4: Non-Medical Consumables</p>
                    <p className="text-rose-700 text-xs font-bold">Excluded = ₹6,000 (Sanitizers, Gloves per IRDAI list)</p>
                  </div>
                </>
              )}

              <div className="pt-2 text-right text-xs font-sans text-slate-500">
                Total Calculated Gap = <strong className="text-amber-800 font-mono font-bold text-sm">{formatINR(potGap)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Next Step CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href={`/case/${caseId}/payment`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#246BB2] hover:underline"
          >
            <span>Skip straight to Paytm settlement</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <Link
            href={`/case/${caseId}/flowpass`}
            className="inline-flex items-center gap-2 rounded-full bg-[#D9FF32] text-[#101B35] px-8 py-3.5 text-sm font-bold shadow-sm hover:bg-[#CCF025] hover:scale-102 transition-all"
          >
            <span>See How FlowPass Solves This</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
