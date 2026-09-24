'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Lock, CreditCard, Building, User, CheckCircle2, ShieldCheck, FileCheck2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { api } from '@/lib/api';
import { CaseData } from '@/lib/types';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

export default function ReviewAuthorizePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.id as string;
  const [gapAmount, setGapAmount] = useState<number>(0);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [userName, setUserName] = useState('User');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (!caseId) return;
        const data = await api.getCase(caseId);
        if (data) {
          setCaseData(data);
          const gap = data.analysis?.gap_result?.potential_gap;
          if (gap !== undefined) setGapAmount(gap);
        }
      } catch (e) {
        console.warn('Failed to load case data in review page', e);
      }
    }
    load();

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sahaay_user_name');
      if (stored) setUserName(stored);
    }
  }, [caseId]);

  const emergencyType = caseData?.emergency_type || caseData?.type || 'medical';
  const provider = (caseData as any)?.provider_name || (caseData as any)?.analysis?.insurance_analysis?.provider_name;

  const typeConfig: Record<string, { purpose: string; payee: string }> = {
    medical: {
      purpose: "Hospitalization & Surgery Gap Settlement",
      payee: provider ? `${provider} Billing Counter` : "Hospital Billing Desk",
    },
    vehicle: {
      purpose: "Vehicle Collision Repair & Deductible Settlement",
      payee: provider ? `${provider} Service Desk` : "Authorized Workshop Billing Desk",
    },
    income: {
      purpose: "Emergency Cash-Flow & Monthly EMI Bridge",
      payee: "Loan & Rental Escrow Account",
    },
    unexpected: {
      purpose: "Emergency Remediation & Contractor Quote",
      payee: provider ? `${provider} Service Account` : "Emergency Remediation Account",
    },
  };

  const currentConfig = typeConfig[emergencyType] || typeConfig.medical;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#101B35]">
      {/* Station Workflow Stepper */}
      <CaseWorkflowNav
        caseId={caseId}
        activeStation="review"
        statusTag="Pre-Authorization"
        voiceText="Reviewing verified transaction payload before Paytm checkout authorization."
      />

      <div className="mx-auto flex max-w-3xl flex-col px-4 py-8 sm:px-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/case/${caseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#246BB2] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Case Workspace</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-200">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#246BB2]/20 bg-[#246BB2]/10 px-3.5 py-1 text-xs font-bold text-[#246BB2] mb-3">
            <Lock className="h-3.5 w-3.5" />
            <span>Station 07 · Sovereign Authorization Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B35]">
            Authorize Paytm Settlement Payload
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Review the exact cryptographic payload and institutional counterparty verified under your FlowPass token before initiating payment.
          </p>
        </div>

        {/* Summary Review Card */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Settlement Target Amount</span>
              <p className="text-xs text-slate-500">Verified net gap after all policy deductibles</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-mono text-3xl font-extrabold text-[#101B35]">{formatINR(gapAmount)}</span>
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> Exact Claim Gap
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs pt-1">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Emergency Purpose</span>
              <span className="font-bold text-[#101B35] leading-snug">{currentConfig.purpose}</span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Institutional Payee</span>
              <span className="font-bold text-[#101B35] flex items-center gap-1.5 leading-snug">
                <Building className="h-4 w-4 text-[#246BB2] shrink-0" /> {currentConfig.payee}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Beneficiary Proposer</span>
              <span className="font-bold text-[#101B35] flex items-center gap-1.5 leading-snug">
                <User className="h-4 w-4 text-[#246BB2] shrink-0" /> {userName} (Verified KYC)
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Execution Layer</span>
              <span className="font-bold text-[#00BAF2] flex items-center gap-1.5 leading-snug font-mono">
                Paytm Settlement Gateway (Soundbox Enabled)
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-[#246BB2] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[#101B35] block mb-0.5">DPDP Compliant Sovereign Data Sharing</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Only verified itemized gap context and Case Ref <strong className="font-mono text-[#101B35]">#{caseId}</strong> are shared with the billing counterparty. Your full financial statement and personal records remain sealed under sovereign custody.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="mt-6 flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <input
            type="checkbox"
            id="confirm-auth"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 h-5 w-5 rounded-lg border-slate-300 text-[#246BB2] focus:ring-[#246BB2] cursor-pointer"
          />
          <label htmlFor="confirm-auth" className="text-xs text-slate-700 cursor-pointer leading-relaxed">
            I explicitly authorize Sahaay to pass this audited gap token of <strong className="text-[#101B35] font-bold font-mono">{formatINR(gapAmount)}</strong> to Paytm Checkout for real-time direct settlement with <strong className="text-[#101B35]">{currentConfig.payee}</strong> under case reference <span className="font-mono text-[#246BB2] font-bold">{caseId}</span>.
          </label>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <Link
            href={`/case/${caseId}`}
            className="text-xs font-semibold text-slate-500 hover:text-[#101B35] transition-colors"
          >
            Cancel and return to workspace
          </Link>

          <button
            onClick={() => router.push(`/case/${caseId}/payment?amount=${gapAmount}`)}
            disabled={!confirmed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#D9FF32] px-8 py-3.5 text-sm font-extrabold text-[#101B35] shadow-sm hover:bg-[#cbf028] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Proceed to Paytm Checkout</span>
            <CreditCard className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
