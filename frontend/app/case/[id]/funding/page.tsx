'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronRight,
  Building2,
  Calendar,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { api } from '@/lib/api';
import { CaseData } from '@/lib/types';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

export default function FundingJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.id as string;

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [userName, setUserName] = useState('User');
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [showStageTwo, setShowStageTwo] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (!caseId) return;
        const data = await api.getCase(caseId);
        if (data) setCaseData(data);
      } catch (e) {
        console.warn('Failed to load case data in funding page', e);
      }
    }
    load();

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sahaay_user_name');
      if (stored) setUserName(stored);
    }
  }, [caseId]);

  const emergencyType = caseData?.emergency_type || caseData?.type || 'medical';
  const totalBill = caseData?.analysis?.gap_result?.total_bill || caseData?.total_amount || 0;
  const gapAmount = caseData?.analysis?.gap_result?.potential_gap ?? (caseData?.total_amount ? Math.round(caseData.total_amount * 0.3) : 0);
  const inflow = caseData?.analysis?.financial_context?.average_inflow || 50000;
  const obligations = caseData?.analysis?.financial_context?.existing_obligations || 5000;
  const buffer = caseData?.analysis?.financial_context?.liquidity_buffer || 15000;

  const provider = (caseData as any)?.provider_name || (caseData as any)?.analysis?.insurance_analysis?.provider_name;
  const hospitalDesc = provider ? `Hospitalized at ${provider} • Verified Clinical Invoice` : 'Hospitalized Emergency • Verified Clinical Invoice';
  const hospitalPayee = provider ? `${provider} Billing Counter (Direct)` : 'Hospital Billing Counter (Direct)';
  const vehiclePayee = provider ? `${provider} Workshop Desk (Direct)` : 'Authorized Workshop Billing Desk (Direct)';
  const contractorPayee = provider ? `${provider} Service Account` : 'Emergency Contractor Remediation Account';

  const typeDetails: Record<string, { desc: string; payee: string }> = {
    medical: {
      desc: hospitalDesc,
      payee: hospitalPayee,
    },
    vehicle: {
      desc: provider ? `Vehicle Repair at ${provider} • Authorized Quote` : 'Vehicle Collision Repair • Authorized Workshop Estimate',
      payee: vehiclePayee,
    },
    income: {
      desc: 'Income Interruption Shock • Verified Contract & Retainer',
      payee: 'Direct Verified Loan & Rental Escrow Account',
    },
    unexpected: {
      desc: 'Emergency Remediation • Contractor Damage Estimate',
      payee: contractorPayee,
    },
  };

  const currentDetail = typeDetails[emergencyType] || typeDetails.medical;

  const checklist = [
    { title: 'Identity & KYC Profile', desc: `${userName} (Aadhaar / PAN verified via consent)` },
    { title: 'Incident & Emergency Context', desc: currentDetail.desc },
    { title: 'Consented Cash-Flow Profile', desc: `${formatINR(inflow)}/mo verified inflow via Account Aggregator` },
    { title: 'Existing Fixed Obligations', desc: `${formatINR(obligations)}/mo active EMI schedule already mapped` },
    { title: 'Verified Invoices & Quotes', desc: `Itemized amount of ${formatINR(totalBill)} verified with clause evidence` },
  ];

  useEffect(() => {
    // Sequentially check off items every 350ms for maximum impact
    checklist.forEach((_, index) => {
      setTimeout(() => {
        setCheckedItems((prev) => [...prev, index]);
      }, (index + 1) * 350);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20">
      {/* Workflow Navigation */}
      <CaseWorkflowNav caseId={caseId} activeStation="funding" emergencyTitle="Zero-Friction Bridge Funding" />

      <div className="mx-auto flex max-w-5xl flex-col px-4 pt-8 sm:px-6 lg:px-8">
        {/* THE FLOWPASS WOW MOMENT */}
        <div className="rounded-3xl bg-gradient-to-br from-[#246BB2] to-[#1B5894] text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full pointer-events-none" />

          <div className="flex items-center gap-2 mb-4 relative z-10">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#D9FF32] animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-100">
              FlowPass Zero-Re-Entry Protocol
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight relative z-10">
            You don't need to start over.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-sky-100 max-w-2xl leading-relaxed relative z-10">
            Traditional lenders ask: <span className="text-rose-200 line-through">"Name? Income? Existing EMI? Upload 12 documents? Re-explain trauma?"</span>
            <br />
            <strong className="text-white font-bold">Sahaay already carried your verified financial context across the entire journey.</strong>
          </p>

          {/* Animated Staggered Context Carry-over checklist */}
          <div className="mt-8 space-y-3 relative z-10">
            {checklist.map((item, index) => {
              const isChecked = checkedItems.includes(index);
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
                    isChecked
                      ? 'border-white/30 bg-white/15 backdrop-blur-md translate-x-1 shadow-sm'
                      : 'border-white/10 bg-white/5 opacity-40 translate-x-0'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-transform duration-300 ${
                        isChecked
                          ? 'bg-[#D9FF32] text-[#101B35] scale-110 shadow-sm'
                          : 'bg-white/20 text-transparent'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-sky-100/80">{item.desc}</p>
                    </div>
                  </div>

                  {isChecked && (
                    <span className="text-xs font-mono text-[#D9FF32] font-bold hidden sm:inline-block">
                      FlowPass Verified ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Benchmark Badge */}
          <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold tracking-widest text-sky-200 uppercase">Friction Benchmark</span>
              <p className="text-xs text-white mt-0.5">
                Traditional lending: <span className="line-through text-sky-200">18 fields + 7 document re-uploads</span>.
                <br />
                Sahaay flow: <strong className="text-[#D9FF32]">0 re-entered fields • 1 continuous context</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowStageTwo(true)}
              className="rounded-full bg-[#D9FF32] hover:bg-[#CCF025] text-[#101B35] px-7 py-3 text-xs font-extrabold shadow-sm hover:scale-102 transition-all whitespace-nowrap cursor-pointer"
            >
              Review Pre-Populated Application
            </button>
          </div>
        </div>

        {/* PREPARE FUNDING JOURNEY */}
        {showStageTwo && (
          <div className="mt-10 space-y-6 animate-fade-in">
            <div className="pb-4 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#246BB2]">Step 2: Partner Execution</span>
                <h2 className="text-xl font-bold text-[#101B35] mt-0.5">Pre-Approved Bridge Credit Application</h2>
              </div>
              <span className="font-mono text-xs font-bold text-[#246BB2] bg-sky-50 px-3.5 py-1 rounded-full border border-sky-200">
                Gap: {formatINR(gapAmount)}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Already Available (FlowPass) */}
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Already Verified via FlowPass (5 items)</span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex justify-between items-start text-xs pb-3 border-b border-emerald-100">
                    <div>
                      <span className="text-slate-500 font-bold">Applicant Name</span>
                      <p className="text-[10px] text-slate-400">Identity Record</p>
                    </div>
                    <span className="font-mono font-bold text-[#101B35] text-right">{userName}</span>
                  </div>
                  <div className="flex justify-between items-start text-xs pb-3 border-b border-emerald-100">
                    <div>
                      <span className="text-slate-500 font-bold">Monthly Inflow</span>
                      <p className="text-[10px] text-slate-400">Account Aggregator Statement</p>
                    </div>
                    <span className="font-mono font-bold text-[#101B35] text-right">{formatINR(inflow)}</span>
                  </div>
                  <div className="flex justify-between items-start text-xs pb-3 border-b border-emerald-100">
                    <div>
                      <span className="text-slate-500 font-bold">Active Obligations</span>
                      <p className="text-[10px] text-slate-400">Bureau EMI Schedule</p>
                    </div>
                    <span className="font-mono font-bold text-[#101B35] text-right">{formatINR(obligations)}/mo</span>
                  </div>
                  <div className="flex justify-between items-start text-xs pb-3 border-b border-emerald-100">
                    <div>
                      <span className="text-slate-500 font-bold">Liquid Buffer</span>
                      <p className="text-[10px] text-slate-400">Derived Savings Cushion</p>
                    </div>
                    <span className="font-mono font-bold text-[#101B35] text-right">{formatINR(buffer)}</span>
                  </div>
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="text-slate-500 font-bold">Uncovered Gap Required</span>
                      <p className="text-[10px] text-slate-400">Sahaay Deterministic Engine</p>
                    </div>
                    <span className="font-mono font-bold text-amber-800 text-right">{formatINR(gapAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Needs Confirmation */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-5">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span>Only 2 Items Need Your Final Choice</span>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                      <label className="text-xs font-bold text-[#101B35] block">Repayment Tenure</label>
                      <p className="text-[11px] text-slate-500 mb-2">Pre-calculated based on your monthly cash flow buffer</p>
                      <select className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-[#101B35] focus:border-[#246BB2] focus:outline-none">
                        <option>12 Months @ {formatINR(Math.round(gapAmount / 12 * 1.08))} / month (Low Pressure)</option>
                        <option>6 Months @ {formatINR(Math.round(gapAmount / 6 * 1.05))} / month (Moderate Pressure)</option>
                      </select>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                      <label className="text-xs font-bold text-[#101B35] block">Disbursement Destination</label>
                      <p className="text-[11px] text-slate-500 mb-2">Direct settlement counter</p>
                      <input
                        type="text"
                        disabled
                        value={currentDetail.payee}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2.5">
                  <Link
                    href={`/case/${caseId}/review`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D9FF32] text-[#101B35] py-3.5 text-xs font-extrabold shadow-sm hover:bg-[#CCF025] hover:scale-101 transition-all cursor-pointer"
                  >
                    <span>Pre-Authorize & Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </Link>
                  <Link
                    href={`/case/${caseId}/payment`}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#246BB2] transition-colors py-1"
                  >
                    <span>Skip straight to Paytm Settlement →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
