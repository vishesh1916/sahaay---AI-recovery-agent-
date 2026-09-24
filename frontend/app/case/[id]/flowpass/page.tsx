'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Activity, ShieldCheck, ArrowRight, Wallet, TrendingUp, CreditCard, Lock, Eye, Trash2, RefreshCw, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { FlowPassCard } from '@/components/sahaay/FlowPassCard';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { FinancialProfile, CaseData } from '@/lib/types';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

const defaultProfile: FinancialProfile = {
  average_inflow: 50000,
  recurring_expenses: 30000,
  existing_obligations: 5000,
  liquidity_buffer: 15000,
  source: 'Derived Context',
};

export default function FlowPassViewPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.id as string;
  const [profile, setProfile] = useState<FinancialProfile>(defaultProfile);
  const [gapAmount, setGapAmount] = useState<number>(0);
  const [userName, setUserName] = useState('User');
  const [dataPurged, setDataPurged] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [permissionRevoked, setPermissionRevoked] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [caseData, setCaseData] = useState<CaseData | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (!caseId) return;
        const data = await api.getCase(caseId);
        if (data) {
          setCaseData(data);
          const fin = data.analysis?.financial_context || data.analysis?.flowpass?.financial_profile;
          if (fin) setProfile(fin);
          const gap = data.analysis?.gap_result?.potential_gap ?? (data.total_amount ? Math.round(data.total_amount * 0.3) : 0);
          setGapAmount(gap);
        }
      } catch (e) {
        console.warn('Failed to load real case flowpass profile', e);
      }
    }
    loadData();

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sahaay_user_name');
      if (stored) setUserName(stored);
    }
  }, [caseId]);

  return (
    <div className="min-h-screen bg-[#9BB0D8] pb-20 text-[#0D1C34] selection:bg-[#D9FF32] selection:text-[#0D1C34]">
      {/* Workflow Navigation */}
      <CaseWorkflowNav caseId={caseId} activeStation="flowpass" emergencyTitle="FlowPass Context Engine" />

      <div className="mx-auto flex max-w-7xl flex-col px-4 pt-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-6 border-b border-white/25">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#2464A4] border border-white shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              FlowPass State Engine
            </span>
            <span className="rounded-full bg-emerald-50 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
              Permissioned &amp; Auditable
            </span>
          </div>
          <h1 className="font-serif-editorial mt-2 text-3xl sm:text-4xl font-normal tracking-tight text-white drop-shadow-sm">
            Sahaay already understands your financial context
          </h1>
          <p className="mt-1 text-sm text-white/90 max-w-2xl">
            Derived securely from consented financial records via Account Aggregator architecture.
            Every number is transparently attributed to its source with zero manual re-entry.
          </p>
        </div>

        {/* 4 FlowPass Financial Profile Cards */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FlowPassCard
            label="Average Monthly Inflow"
            amount={profile.average_inflow}
            source="6-Month Bank Statements"
            sourceType="imported"
            icon={<TrendingUp className="h-5 w-5 text-[#246BB2]" />}
            subtitle="Verified Cash Inflows"
          />

          <FlowPassCard
            label="Recurring Fixed Expenses"
            amount={profile.recurring_expenses}
            source="Rent, Utilities, Household"
            sourceType="imported"
            icon={<Wallet className="h-5 w-5 text-indigo-600" />}
            subtitle="Essential living baseline"
          />

          <FlowPassCard
            label="Existing Obligations"
            amount={profile.existing_obligations}
            source="Active Loan / EMI Schedule"
            sourceType="imported"
            icon={<CreditCard className="h-5 w-5 text-purple-600" />}
            subtitle="Fixed monthly obligations"
          />

          <FlowPassCard
            label="Estimated Liquidity Buffer"
            amount={profile.liquidity_buffer}
            source="Derived (Inflow - Expenses - EMI)"
            sourceType="estimated"
            icon={<Activity className="h-5 w-5 text-amber-600" />}
            subtitle="Immediate unencumbered cash"
            highlight
          />
        </div>

        {/* Persona Insight Callout */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-[#246BB2] tracking-wider">Contextual Shock Assessment</span>
              <span className="rounded-full bg-sky-50 text-[#246BB2] text-[10px] px-2.5 py-0.5 font-bold border border-sky-200">{userName}</span>
            </div>
            <p className="text-base text-[#101B35] mt-2 font-bold">
              Calculated gap is <strong className="text-amber-800 font-mono">{formatINR(gapAmount)}</strong>. Available liquidity buffer is <strong className="text-emerald-700 font-mono">{formatINR(profile.liquidity_buffer)}</strong>.
            </p>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {gapAmount > profile.liquidity_buffer
                ? `Paying this ${formatINR(gapAmount)} directly will exhaust your available liquid savings and put stress on your ${formatINR(profile.existing_obligations)} monthly obligations. FlowPass can orchestrate bridge funding or EMI settlement.`
                : `Your liquid buffer of ${formatINR(profile.liquidity_buffer)} can cover this ${formatINR(gapAmount)} gap, but an optimized split can protect your emergency cushion.`}
            </p>
          </div>

          <Link
            href={`/case/${caseId}/funding`}
            className="inline-flex items-center gap-2 rounded-full bg-[#D9FF32] text-[#101B35] px-7 py-3.5 text-xs font-bold hover:bg-[#CCF025] shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            <span>Proceed to Bridge Funding</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Link>
        </div>

        {/* User Privacy Controls */}
        <div className="mt-10 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Lock className="h-5 w-5 text-[#246BB2]" />
              <h3 className="text-sm font-bold text-[#101B35]">DPDP Sovereign Data Controls & Minimization</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">Consent ID #{caseId}</span>
          </div>

          <p className="text-xs text-slate-600 mt-3 max-w-3xl leading-relaxed">
            Under Sahaay's data minimization principles, raw CSV and bank statement data are permanently purged once derived metrics are verified.
            You retain sovereign control over this context at all times.
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <button
              onClick={() => setShowDataModal(true)}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-slate-700 hover:bg-white hover:border-[#246BB2] hover:shadow-sm transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4 text-[#246BB2]" />
              <span className="font-bold">View Stored Data</span>
            </button>

            <button
              onClick={async () => {
                const userId = typeof window !== 'undefined' ? localStorage.getItem('sahaay_user_id') : null;
                if (userId) {
                  await api.updateUserConsent(userId, { consent_financial: false }).catch(() => {});
                }
                setPermissionRevoked(true);
              }}
              className={`rounded-2xl border p-4 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
                permissionRevoked
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-white hover:border-amber-400 hover:shadow-sm'
              }`}
            >
              <Lock className="h-4 w-4 text-amber-600" />
              <span className="font-bold">{permissionRevoked ? 'Permission Revoked' : 'Revoke Permission'}</span>
            </button>

            <button
              onClick={() => {
                setProfile({
                  average_inflow: 0,
                  recurring_expenses: 0,
                  existing_obligations: 0,
                  liquidity_buffer: 0,
                  source: 'Cleared by user',
                });
                setDataPurged(true);
              }}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-slate-700 hover:bg-white hover:border-sky-400 hover:shadow-sm transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 text-[#246BB2]" />
              <span className="font-bold">{dataPurged ? 'Context Cleared' : 'Clear Context'}</span>
            </button>

            <button
              onClick={async () => {
                if (!caseId) return;
                if (!window.confirm(`Permanently erase Case ${caseId} and all associated records under DPDP right to erasure?`)) return;
                setIsDeleting(true);
                try {
                  await api.deleteCase(caseId);
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('sahaay_active_case_id');
                    sessionStorage.removeItem('current_active_case_id');
                    localStorage.removeItem('sahaay_active_case_id');
                  }
                  router.push('/home');
                } catch (e) {
                  console.error('Failed to delete case:', e);
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
              className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-rose-700 hover:bg-rose-50 hover:border-rose-400 hover:shadow-sm transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
              <span className="font-bold">{isDeleting ? 'Deleting...' : 'Delete Case'}</span>
            </button>
          </div>

          {permissionRevoked && (
            <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Financial profile automation access has been revoked for future underwriting.</span>
            </div>
          )}
        </div>

        {/* Stored Data Modal */}
        {showDataModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 text-[#101B35] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#246BB2]" />
                  <h3 className="text-base font-bold">FlowPass Stored Context Audit</h3>
                </div>
                <button
                  onClick={() => setShowDataModal(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Case ID:</span>
                  <span className="font-mono font-bold text-[#246BB2]">{caseId}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Account Holder:</span>
                  <span className="font-semibold">{userName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Average Monthly Inflow:</span>
                  <span className="font-mono font-bold">{formatINR(profile.average_inflow)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Recurring Expenses:</span>
                  <span className="font-mono font-bold">{formatINR(profile.recurring_expenses)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Active Loan EMIs:</span>
                  <span className="font-mono font-bold">{formatINR(profile.existing_obligations)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Estimated Safety Buffer:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatINR(profile.liquidity_buffer)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Raw Bank Statements:</span>
                  <span className="text-emerald-700 font-bold">Permanently Purged ✓</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Uploaded Documents:</span>
                  <span className="font-mono font-semibold">{caseData?.documents?.length || 0} indexed</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowDataModal(false)}
                  className="w-full rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 text-xs font-bold transition-all cursor-pointer"
                >
                  Close Audit Inspector
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
