'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileText,
  Receipt,
  Scale,
  Activity,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileSearch,
  Sliders,
  CreditCard,
  Car,
  HeartPulse,
  TrendingDown,
  Clock,
  CheckCircle2,
  Lock,
  Wallet,
  FileCheck2,
  HeartHandshake
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { CaseData } from '@/lib/types';
import { VoiceButton } from '@/components/sahaay/VoiceButton';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

export default function CaseOverviewPage() {
  const params = useParams();
  const caseId = params?.id as string;
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getCase(caseId);
        setCaseData(data);
      } catch (e: any) {
        console.error('Failed to load case', e);
        setError(e.message || 'Failed to load case');
      } finally {
        setLoading(false);
      }
    }
    if (caseId) loadData();
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#246BB2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold text-sm">Loading case workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
        <div className="text-center max-w-md p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-[#101B35] text-xl font-bold">Case Not Found</h2>
          <p className="text-slate-500 mt-2 text-xs">{error || 'This case does not exist or has expired.'}</p>
          <Link href="/home" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#246BB2] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#1B5894] transition-all">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const analysis = caseData.analysis || {};
  const gapResult = analysis.gap_result;
  const totalBill = gapResult?.total_bill || caseData.total_amount || 0;
  const potCovered = gapResult?.potential_claim_amount || 0;
  const potGap = gapResult?.potential_gap || 0;
  const readiness = analysis.insurance_analysis?.claim_readiness || 0;

  const emergencyType = caseData.emergency_type || caseData.type || 'medical';

  const typeConfig: Record<string, { title: string; billLabel: string; coveredLabel: string; gapLabel: string; icon: any; color: string }> = {
    medical: {
      title: 'Medical Emergency',
      billLabel: 'Total Hospital Bill',
      coveredLabel: 'Potentially Covered',
      gapLabel: 'Potential Financial Gap',
      icon: HeartPulse,
      color: 'text-rose-600',
    },
    vehicle: {
      title: 'Vehicle Accident',
      billLabel: 'Total Garage Estimate',
      coveredLabel: 'Estimated Insurance Payout',
      gapLabel: 'Out-of-Pocket Gap',
      icon: Car,
      color: 'text-amber-600',
    },
    income: {
      title: 'Income Interruption',
      billLabel: 'Immediate Obligations Due',
      coveredLabel: 'Liquid Savings Buffer',
      gapLabel: 'Critical Liquidity Shortfall',
      icon: TrendingDown,
      color: 'text-indigo-600',
    },
    unexpected: {
      title: 'Unexpected Expense',
      billLabel: 'Total Contractor Quote',
      coveredLabel: 'Emergency Fund Allocated',
      gapLabel: 'Unfunded Contingency Gap',
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
  };

  const currentType = typeConfig[emergencyType] || typeConfig.medical;
  const TypeIcon = currentType.icon;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20">
      {/* Reusable Connected Horizontal Workflow Step Bar */}
      <CaseWorkflowNav caseId={caseId} activeStation="overview" emergencyTitle={currentType.title} />

      <div className="mx-auto flex max-w-7xl flex-col px-4 pt-8 sm:px-6 lg:px-8">
        {/* Workspace Title & Quick Context */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                <TypeIcon className="h-3.5 w-3.5" />
                <span>{currentType.title}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono font-medium">Status: {caseData.status}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Reasoning Verified
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B35]">
              {currentType.title} Case Workspace
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl line-clamp-1 italic">
              "{caseData.user_input || 'Financial emergency context analyzed by Sahaay'}"
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/case/${caseId}/payment`}
              className="inline-flex items-center gap-2 rounded-full bg-[#D9FF32] text-[#101B35] px-6 py-2.5 text-xs font-bold hover:bg-[#CCF025] shadow-sm transition-all"
            >
              <CreditCard className="h-4 w-4" />
              <span>Settle Gap via Paytm</span>
            </Link>
          </div>
        </div>

        {/* 4 Core Metric Cards */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Expense / Bill */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{currentType.billLabel}</span>
              <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B35] font-mono">
              {formatINR(totalBill)}
            </div>
            <p className="mt-2 text-xs text-slate-500">Total itemized incident cost</p>
          </div>

          {/* Potentially Covered */}
          <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/40 p-6 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{currentType.coveredLabel}</span>
              <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-700 font-mono">
              {formatINR(potCovered)}
            </div>
            <p className="mt-2 text-xs text-emerald-600">Estimated payout / covered support</p>
          </div>

          {/* Potential Financial Gap */}
          <div className="rounded-3xl border border-amber-200/80 bg-amber-50/40 p-6 shadow-xs">
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{currentType.gapLabel}</span>
              <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-800 font-mono">
              {formatINR(potGap)}
            </div>
            <p className="mt-2 text-xs text-amber-700">Uncovered out-of-pocket obligation</p>
          </div>

          {/* Readiness / Milestone Completeness */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Claim Readiness</span>
              <div className="h-8 w-8 rounded-xl bg-sky-50 flex items-center justify-center text-[#246BB2]">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#246BB2] font-mono">
                {readiness}%
              </span>
              <span className="text-xs font-bold text-slate-500">Verified</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-[#246BB2] h-full rounded-full transition-all duration-500" style={{ width: `${readiness}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Journey milestone indicator</p>
          </div>
        </div>

        {/* Connected FlowPass Workspace Modules (8 Cards) */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Connected FlowPass Workspace
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">One continuous context • No starting over</p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-[#246BB2] border border-sky-200">
              8 Stations Active
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Bill / Invoice Analysis */}
            <Link
              href={`/case/${caseId}/bill`}
              className="group rounded-3xl border border-slate-200/90 bg-white p-6 hover:border-[#246BB2] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="rounded-2xl bg-sky-50 p-3 text-[#246BB2] border border-sky-100">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold rounded-full bg-sky-50 text-[#246BB2] px-2.5 py-0.5 border border-sky-200">
                    Station 02
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101B35] group-hover:text-[#246BB2] transition-colors">
                  Itemized Invoice Breakdown
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Line-item classification: Covered vs. Non-Associated vs. Excluded expenses.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-[#246BB2] pt-3 border-t border-slate-100">
                <span>View Items</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Gap Breakdown */}
            <Link
              href={`/case/${caseId}/gap`}
              className="group rounded-3xl border border-slate-200/90 bg-white p-6 hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-700 border border-amber-200">
                    <Scale className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 border border-amber-200">
                    Station 04
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101B35] group-hover:text-amber-700 transition-colors">
                  Deterministic Gap Waterfall
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Why is there a {formatINR(potGap)} gap? Sub-limits, consumables & deductibles.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-amber-700 pt-3 border-t border-slate-100">
                <span>Inspect Gap Math</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Evidence Map */}
            <Link
              href={`/case/${caseId}/evidence`}
              className="group rounded-3xl border border-slate-200/90 bg-white p-6 hover:border-[#246BB2] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700 border border-indigo-100">
                    <FileSearch className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 border border-indigo-200">
                    Station 03
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101B35] group-hover:text-indigo-700 transition-colors">
                  Ground-Truth Evidence
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Every deduction mapped to specific document clauses and invoice citations.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-indigo-700 pt-3 border-t border-slate-100">
                <span>Explore Evidence</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* FlowPass Financial Context */}
            <Link
              href={`/case/${caseId}/flowpass`}
              className="group rounded-3xl border border-sky-200 bg-sky-50/50 p-6 hover:border-[#246BB2] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="rounded-2xl bg-[#246BB2] p-3 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold rounded-full bg-[#246BB2] text-white px-2.5 py-0.5">
                    Station 05
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101B35] group-hover:text-[#246BB2] transition-colors">
                  FlowPass State Engine
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Portable financial context packet with verified evidence and consent status.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-[#246BB2] pt-3 border-t border-sky-100">
                <span>View FlowPass State</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Recovery Simulator */}
            <Link
              href={`/case/${caseId}/recovery`}
              className="group rounded-3xl border border-slate-200/90 bg-white p-6 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 border border-emerald-200">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 border border-emerald-200">
                    Station 08
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101B35] group-hover:text-emerald-700 transition-colors">
                  Recovery Simulator
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Simulate savings buffer, EMI scenarios, and payment pressure ratios.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-700 pt-3 border-t border-slate-100">
                <span>Simulate Scenarios</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Funding Transition */}
            <Link
              href={`/case/${caseId}/funding`}
              className="group rounded-3xl border border-slate-200/90 bg-white p-6 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="rounded-2xl bg-purple-50 p-3 text-purple-700 border border-purple-200">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 px-2.5 py-0.5 border border-purple-200">
                    Station 06
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101B35] group-hover:text-purple-700 transition-colors">
                  Pre-Approved Bridge Funding
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Inherits verified incident data into credit underwriting without re-entry.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-purple-700 pt-3 border-t border-slate-100">
                <span>Inspect Application</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Direct Paytm Payment */}
            <Link
              href={`/case/${caseId}/payment`}
              className="group rounded-3xl border-2 border-[#246BB2]/30 bg-gradient-to-br from-white to-sky-50/80 p-6 hover:border-[#246BB2] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="rounded-2xl bg-[#D9FF32] p-3 text-[#101B35]">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold rounded-full bg-[#D9FF32] text-[#101B35] px-2.5 py-0.5">
                    Station 07
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101B35] group-hover:text-[#246BB2] transition-colors">
                  Direct Paytm Settlement
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Settle {formatINR(potGap)} gap directly with soundbox confirmation & UPI PIN.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-[#246BB2] pt-3 border-t border-sky-100">
                <span>Execute Payment</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Journey Audit & Timeline */}
            <Link
              href={`/case/${caseId}/timeline`}
              className="group rounded-3xl border border-slate-200/90 bg-white p-6 hover:border-slate-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 border border-slate-200">
                    Audit Log
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101B35] group-hover:text-slate-800 transition-colors">
                  Journey Audit & Milestones
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Immutable DPDP compliance trail of all AI extractions and user approvals.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-slate-600 pt-3 border-t border-slate-100">
                <span>View Timeline</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
