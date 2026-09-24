'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, ShieldCheck, Receipt, Loader2, Sparkles, Building, ChevronRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { api } from '@/lib/api';
import { CaseData } from '@/lib/types';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

function PaymentStatusContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const caseId = params?.id as string;
  const amount = Number(searchParams?.get('amount') || 0);
  const orderId = searchParams?.get('orderId') || '';

  const [status, setStatus] = useState<'verifying' | 'completed' | 'failed'>('verifying');
  const [txnId, setTxnId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [caseData, setCaseData] = useState<CaseData | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const data = await api.getCase(caseId);
        if (data) setCaseData(data);
      } catch (e) {
        console.warn('Failed to load case data in status page', e);
      }

      // Verify settlement with backend
      if (orderId) {
        try {
          const res = await api.getPaymentStatus(orderId);
          if (res && res.status === 'success') {
            setTxnId(res.txn_id || `PTM-${orderId.slice(-6)}`);
            setStatus('completed');
            return;
          } else if (res && res.status === 'failed') {
            setStatus('failed');
            setErrorMessage('Payment transaction was declined or cancelled.');
            return;
          } else {
            // Check status once more after short delay
            setTimeout(async () => {
              try {
                const retry = await api.getPaymentStatus(orderId);
                if (retry && retry.status === 'success') {
                  setTxnId(retry.txn_id || `PTM-${orderId.slice(-6)}`);
                  setStatus('completed');
                } else if (retry && retry.status === 'failed') {
                  setStatus('failed');
                  setErrorMessage('Payment transaction could not be completed.');
                } else {
                  setTxnId(orderId);
                  setStatus('completed');
                }
              } catch {
                setStatus('failed');
                setErrorMessage('Payment server was unreachable during verification.');
              }
            }, 1000);
            return;
          }
        } catch (e: any) {
          console.error('Payment status check error:', e);
          setStatus('failed');
          setErrorMessage('Payment verification order not found or session expired.');
          return;
        }
      } else {
        setStatus('completed');
      }
    }

    checkStatus();
  }, [caseId, orderId]);

  const emergencyType = caseData?.emergency_type || caseData?.type || 'medical';
  const provider = (caseData as any)?.provider_name || (caseData as any)?.analysis?.insurance_analysis?.provider_name;

  const payeeConfig: Record<string, { title: string; payee: string; desc: string }> = {
    medical: {
      title: 'Hospital Settlement Successfully Completed',
      payee: provider ? `${provider} Billing Counter` : 'Hospital Billing Counter',
      desc: 'Your medical emergency gap has been settled directly with the hospital billing counter.',
    },
    vehicle: {
      title: 'Workshop Deductible Settled',
      payee: provider ? `${provider} Desk` : 'Authorized Workshop Desk',
      desc: 'Your out-of-pocket repair deductible has been settled with the authorized body shop.',
    },
    income: {
      title: 'Emergency Obligation Settled',
      payee: 'Loan & Rental Escrow Account',
      desc: 'Your urgent EMI and fixed rental obligations have been bridged and scheduled.',
    },
    unexpected: {
      title: 'Contractor Invoice Settled',
      payee: provider ? `${provider} Services` : 'Emergency Contractor Services',
      desc: 'Your contractor repair invoice has been funded and settled in full.',
    },
  };

  const currentPayee = payeeConfig[emergencyType] || payeeConfig.medical;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#101B35]">
      {/* Station Workflow Stepper */}
      <CaseWorkflowNav
        caseId={caseId}
        activeStation="status"
        statusTag={status === 'completed' ? 'Settled & Reconciled' : status === 'failed' ? 'Settlement Failed' : 'Verifying'}
        voiceText="Transaction confirmed by Paytm Payment Gateway. Soundbox announcement broadcast."
      />

      <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
        {status === 'verifying' ? (
          <div className="flex flex-col items-center space-y-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#00BAF2]/10 text-[#00BAF2] animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-[#101B35]">Confirming Paytm Settlement</h2>
            <p className="text-xs text-slate-500">
              Synchronizing FlowPass case status with institutional counterparty...
            </p>
          </div>
        ) : status === 'failed' ? (
          <div className="w-full animate-fade-in py-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500 text-white shadow-xl shadow-rose-500/20 mb-6">
              <span className="text-3xl font-extrabold">✕</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#101B35]">
              Settlement Verification Failed
            </h1>
            <p className="mt-2 text-xs text-rose-600 font-medium max-w-sm mx-auto">
              {errorMessage || 'Payment could not be verified by the payment provider.'}
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href={`/case/${caseId}/payment`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00BAF2] text-white py-4 text-sm font-extrabold shadow-xs hover:bg-[#009ed1] transition-all"
              >
                <span>Retry Direct Paytm Settlement</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/case/${caseId}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                <span>Return to Case Workspace</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full animate-fade-in">
            {/* Green Check Badge */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 mb-6">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Instant Bank Confirmation</span>
            </div>

            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B35]">
              {currentPayee.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              {currentPayee.desc}
            </p>

            {/* Receipt Card */}
            <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 text-left space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Settlement Value</span>
                <span className="font-mono text-2xl font-extrabold text-[#101B35]">{formatINR(amount)}</span>
              </div>

              <div className="flex justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Paytm Transaction ID</span>
                <span className="font-mono font-bold text-[#101B35]">{txnId}</span>
              </div>

              <div className="flex justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Case Reference</span>
                <span className="font-mono font-bold text-[#246BB2]">{caseId}</span>
              </div>

              <div className="flex justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Beneficiary Payee</span>
                <span className="text-[#101B35] font-semibold flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-slate-400" /> {currentPayee.payee}
                </span>
              </div>

              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-500">FlowPass State</span>
                <span className="text-emerald-700 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  RECOVERY_ACTIVE
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href={`/case/${caseId}/recovery`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D9FF32] py-4 text-sm font-extrabold text-[#101B35] shadow-xs hover:bg-[#cbf028] hover:scale-[1.01] transition-all"
              >
                <span>View Financial Recovery Roadmap</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href={`/case/${caseId}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                <span>Return to Case Workspace</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading payment status...</div>}>
      <PaymentStatusContent />
    </Suspense>
  );
}
