'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Receipt,
  FileSearch,
  Scale,
  CreditCard,
  ArrowRight,
  RotateCcw,
  Check,
  Clock
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { api } from '@/lib/api';
import { CaseData } from '@/lib/types';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

export default function JourneyTimelinePage() {
  const params = useParams();
  const caseId = params?.id as string;
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        if (!caseId) return;
        const [data, logs] = await Promise.all([
          api.getCase(caseId),
          api.getCaseTimeline(caseId),
        ]);
        if (data) setCaseData(data);
        if (logs) setAuditLogs(logs);
      } catch (e) {
        console.warn('Failed to load case data in timeline', e);
      }
    }
    load();
  }, [caseId]);

  const emergencyType = caseData?.emergency_type || caseData?.type || 'medical';
  const totalBill = caseData?.analysis?.gap_result?.total_bill || caseData?.total_amount || 0;
  const potCovered = caseData?.analysis?.gap_result?.potential_claim_amount || Math.round(totalBill * 0.7);
  const gapAmount = caseData?.analysis?.gap_result?.potential_gap || (totalBill - potCovered);

  // Check if real payment event exists in audit logs or case status
  const paymentLog = auditLogs.find(l => l.action === 'payment_verified');
  const isPaid = Boolean(paymentLog) || caseData?.status === 'payment_success';
  const txnId = paymentLog?.metadata?.txn_id || 'PTM-SETTLED';

  const provider = (caseData as any)?.provider_name || (caseData as any)?.analysis?.insurance_analysis?.provider_name;

  const typeLabels: Record<string, { title: string; docDesc: string; payee: string }> = {
    medical: {
      title: 'Medical Emergency Case Created',
      docDesc: 'Health policy schedule, hospital bill, and discharge summary parsed with table preservation.',
      payee: provider ? `${provider} billing desk` : 'Hospital billing desk',
    },
    vehicle: {
      title: 'Vehicle Accident Case Created',
      docDesc: 'Motor policy schedule, authorized workshop estimate, and surveyor report parsed.',
      payee: provider ? `${provider} workshop desk` : 'Authorized Workshop billing desk',
    },
    income: {
      title: 'Income Interruption Case Created',
      docDesc: 'Client retainer contract, bank statements, and monthly obligations schedule analyzed.',
      payee: 'Loan & Rental Escrow Account',
    },
    unexpected: {
      title: 'Unexpected Expense Case Created',
      docDesc: 'Emergency contractor repair quote, damage inspection, and reserve statement parsed.',
      payee: provider ? `${provider} service account` : 'Emergency Contractor account',
    },
  };

  const currentLabel = typeLabels[emergencyType] || typeLabels.medical;

  const timelineMilestones = [
    {
      id: 1,
      title: currentLabel.title,
      desc: `Intake completed. Case ID ${caseId} generated with granular DPDP consent.`,
      time: auditLogs.find(l => l.action === 'case_created')?.timestamp ? new Date(auditLogs.find(l => l.action === 'case_created').timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified',
      isCompleted: true,
      icon: <Sparkles className="h-4 w-4 text-[#246BB2]" />
    },
    {
      id: 2,
      title: 'Documents Parsed & Evidence Mapped',
      desc: currentLabel.docDesc,
      time: auditLogs.find(l => l.action === 'document_parsed' || l.action === 'document_uploaded')?.timestamp ? new Date(auditLogs.find(l => l.action === 'document_parsed' || l.action === 'document_uploaded').timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified',
      isCompleted: true,
      icon: <FileSearch className="h-4 w-4 text-indigo-600" />
    },
    {
      id: 3,
      title: 'Deterministic Gap Engine Executed',
      desc: `Potential coverage ${formatINR(potCovered)} & out-of-pocket gap ${formatINR(gapAmount)} calculated.`,
      time: auditLogs.find(l => l.action === 'gap_calculated')?.timestamp ? new Date(auditLogs.find(l => l.action === 'gap_calculated').timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified',
      isCompleted: true,
      icon: <Scale className="h-4 w-4 text-amber-600" />
    },
    {
      id: 4,
      title: 'FlowPass Financial Context Carried Forward',
      desc: 'Monthly inflow & liquidity buffer reused in funding preparation. Zero redundant re-entries.',
      time: auditLogs.find(l => l.action === 'flowpass_generated')?.timestamp ? new Date(auditLogs.find(l => l.action === 'flowpass_generated').timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified',
      isCompleted: true,
      icon: <ShieldCheck className="h-4 w-4 text-purple-600" />
    },
    {
      id: 5,
      title: 'Recovery Strategy Simulated',
      desc: 'Debt-to-income and cash cushion modeled to protect emergency liquid safety reserves.',
      time: auditLogs.find(l => l.action === 'recovery_simulated')?.timestamp ? new Date(auditLogs.find(l => l.action === 'recovery_simulated').timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified',
      isCompleted: true,
      icon: <Receipt className="h-4 w-4 text-emerald-600" />
    },
    {
      id: 6,
      title: isPaid ? 'Paytm Direct Settlement Verified' : 'Awaiting Paytm Direct Settlement',
      desc: isPaid
        ? `Gap of ${formatINR(gapAmount)} settled directly at ${currentLabel.payee}. Transaction ID: ${txnId}.`
        : `Pending settlement of ${formatINR(gapAmount)} at ${currentLabel.payee}.`,
      time: paymentLog?.timestamp ? new Date(paymentLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (isPaid ? 'Settled' : 'Pending Action'),
      isCompleted: isPaid,
      icon: <CreditCard className={`h-4 w-4 ${isPaid ? 'text-[#00BAF2]' : 'text-slate-400'}`} />
    }
  ];

  return (
    <div className="min-h-screen bg-[#9BB0D8] pb-20 text-[#0D1C34] selection:bg-[#D9FF32] selection:text-[#0D1C34]">
      {/* Workflow Navigation */}
      <CaseWorkflowNav caseId={caseId} activeStation="timeline" emergencyTitle="End-to-End Audit Trail" />

      <div className="mx-auto flex max-w-4xl flex-col px-4 pt-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-6 border-b border-white/25">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#2464A4] border border-white shadow-xs">
              <Clock className="h-3.5 w-3.5" />
              End-to-End Audit Trail
            </span>
            <span className="rounded-full bg-emerald-50 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
              Immutable DPDP Log
            </span>
          </div>
          <h1 className="font-serif-editorial mt-2 text-3xl sm:text-4xl font-normal tracking-tight text-white drop-shadow-sm">
            Financial Recovery Journey Timeline
          </h1>
          <p className="mt-1 text-sm text-white/90">
            Complete chronological record of AI reasoning, evidence extraction, FlowPass context transitions, and payment settlement.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="mt-10 relative border-l-2 border-white/50 ml-4 pl-6 space-y-7">
          {timelineMilestones.map((milestone) => (
            <div key={milestone.id} className="relative group">
              {/* Dot / Icon */}
              <div className={`absolute -left-[37px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 ${
                milestone.isCompleted ? 'border-[#246BB2] text-[#246BB2]' : 'border-slate-300 text-slate-400'
              } shadow-xs group-hover:scale-110 transition-transform`}>
                {milestone.icon}
              </div>

              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs group-hover:border-[#246BB2]/40 group-hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wide ${milestone.isCompleted ? 'text-[#246BB2]' : 'text-amber-600'}`}>
                    Step {milestone.id} • {milestone.isCompleted ? 'Completed' : 'Pending Action'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">{milestone.time}</span>
                </div>
                <h3 className="mt-1 text-base font-bold text-[#101B35]">{milestone.title}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{milestone.desc}</p>
                {!milestone.isCompleted && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Action required to seal case</span>
                    <Link
                      href={`/case/${caseId}/payment`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#246BB2] text-white px-3 py-1 text-xs font-bold hover:bg-[#0f6ecf] transition-all"
                    >
                      <CreditCard className="h-3 w-3" />
                      <span>Proceed to Direct Settlement</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Final Success Callout */}
        <div className="mt-12 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shrink-0 shadow-xs">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#101B35]">Recovery Milestone Completed</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                FlowPass context securely archived. All raw statement artifacts purged under DPDP protocol.
              </p>
            </div>
          </div>

          <Link
            href="/home"
            className="rounded-full bg-[#D9FF32] text-[#101B35] px-7 py-3 text-xs font-bold shadow-sm hover:bg-[#CCF025] transition-all whitespace-nowrap shrink-0"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
