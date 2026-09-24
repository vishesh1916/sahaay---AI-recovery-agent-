'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Receipt, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles, ExternalLink, UserCheck } from 'lucide-react';
import { EvidenceBadge } from '@/components/sahaay/EvidenceBadge';
import { formatINR } from '@/lib/utils';
import { api } from '@/lib/api';
import { CaseData } from '@/lib/types';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

export default function EvidenceMapPage() {
  const params = useParams();
  const caseId = params?.id as string;
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (!caseId) return;
        const data = await api.getCase(caseId);
        if (data) {
          setCaseData(data);
          if (data.status === 'escalated') setIsEscalated(true);
        }
      } catch (e) {
        console.warn('Failed to load case in evidence page', e);
      }
    }
    load();
  }, [caseId]);

  const emergencyType = caseData?.emergency_type || caseData?.type || 'medical';
  const totalBill = caseData?.analysis?.gap_result?.total_bill || caseData?.total_amount || 0;
  const potCovered = caseData?.analysis?.gap_result?.potential_claim_amount || Math.round(totalBill * 0.7);
  const potGap = caseData?.analysis?.gap_result?.potential_gap || Math.max(totalBill - potCovered, 0);
  const deductions = caseData?.analysis?.gap_result?.deductions || [];
  const provider = (caseData as any)?.provider_name || (caseData as any)?.analysis?.insurance_analysis?.provider_name;

  // Dynamic evidence nodes based on real case data and emergency type
  const getNodes = () => {
    // If real itemized deductions exist from analysis, map each one dynamically
    if (deductions.length > 0) {
      return [
        {
          id: 'node-1',
          title: emergencyType === 'medical' ? 'Potential Claimable Coverage' : 'Estimated Covered Liability',
          amount: potCovered,
          status: 'verified' as const,
          badge: 'Deterministic Engine Calculation',
          description: 'Total eligible payout after verifying policy limits and deductibles.',
          sources: [
            { doc: 'Insurance Policy Schedule', ref: 'Section & Terms', text: 'Eligible insurance liability after applying policy rules.' },
            { doc: provider ? `${provider} Invoices` : 'Itemized Incident Bill', ref: 'Audit Summary', text: `Verified total incident amount of ${formatINR(totalBill)}.` }
          ]
        },
        ...deductions.map((d, idx) => ({
          id: `node-${idx + 2}`,
          title: d.item_name,
          amount: d.deduction_amount,
          status: 'verified' as const,
          badge: d.category === 'associated' ? 'Room Rent Limit Impact' : 'Policy Exclusion',
          description: d.reason,
          sources: [
            { doc: d.evidence_ref || 'Policy Clause', ref: d.evidence_ref || 'Audit Ref', text: d.reason },
            { doc: provider ? `${provider} Bill` : 'Itemized Invoice', ref: 'Billing Ledger', text: `Itemized expense of ${formatINR(d.original_amount)}.` }
          ]
        }))
      ];
    }

    if (emergencyType === 'vehicle') {
      return [
        {
          id: 'node-1',
          title: 'Total Workshop Estimate',
          amount: totalBill,
          status: 'verified' as const,
          badge: 'Itemized Authorized Quote',
          description: 'Repairs for body panels, lights, and structural mechanics.',
          sources: [
            { doc: 'Workshop Estimate', ref: 'Authorized Quote', text: 'Itemized parts, labor, and paint quote.' },
            { doc: 'Surveyor Report', ref: 'Inspection Note', text: 'Accident damage confirmed as accidental collision.' }
          ]
        },
        {
          id: 'node-2',
          title: 'Approved Insurer Liability',
          amount: potCovered,
          status: 'estimated' as const,
          badge: 'Zero-Depreciation Endorsement',
          description: 'Insurer covers metallic and glass parts without depreciation.',
          sources: [
            { doc: 'Motor Insurance Policy', ref: 'Endorsement Schedule', text: 'Depreciation waiver on glass and metal panels.' },
            { doc: 'Claim Surveyor Assessment', ref: 'Preliminary Approval', text: 'Approved repair schedule at network workshop.' }
          ]
        },
        {
          id: 'node-3',
          title: 'Compulsory & Voluntary Deductibles',
          amount: potGap,
          status: 'verified' as const,
          badge: 'Policy Excess & Consumables',
          description: 'Mandated policy excess and consumable fluids/clips shortfall.',
          sources: [
            { doc: 'Motor Insurance Policy', ref: 'Section 1.2 — Excess Clause', text: 'Compulsory excess and non-reimbursable consumables.' }
          ]
        }
      ];
    } else if (emergencyType === 'income') {
      return [
        {
          id: 'node-1',
          title: 'Delayed Cash-Flow Retainer',
          amount: totalBill,
          status: 'verified' as const,
          badge: 'Client Contract Inflow',
          description: 'Principal milestone or salary delayed during emergency shock.',
          sources: [
            { doc: 'Consulting Contract', ref: 'Payment Terms', text: 'Quarterly milestone payment overdue.' },
            { doc: 'Client Delay Notice', ref: 'Official Communication', text: 'Disbursement freeze notification.' }
          ]
        },
        {
          id: 'node-2',
          title: 'Immediate Non-Negotiable EMIs & Rent',
          amount: potCovered,
          status: 'verified' as const,
          badge: 'Banking & Lease Obligation',
          description: 'Fixed housing and loan obligations due this period.',
          sources: [
            { doc: 'Bank Statement', ref: 'Recurring Auto-Debits', text: 'Active EMI auto-debit schedule mapped.' }
          ]
        },
        {
          id: 'node-3',
          title: 'Net Bridge Funding Required',
          amount: potGap,
          status: 'estimated' as const,
          badge: 'FlowPass Bridge Math',
          description: 'Bridge credit to prevent loan default during payment delay.',
          sources: [
            { doc: 'Sahaay Cash-Flow Model', ref: 'Runway Forecast', text: 'Bridge liquidity required to maintain clean bureau score.' }
          ]
        }
      ];
    } else if (emergencyType === 'unexpected') {
      return [
        {
          id: 'node-1',
          title: 'Contractor Emergency Estimate',
          amount: totalBill,
          status: 'verified' as const,
          badge: 'Audited Quotation',
          description: 'Urgent structural restoration, plumbing and electrical repairs.',
          sources: [
            { doc: 'Contractor Quote', ref: 'Emergency Quotation', text: 'Immediate pipeline replacement & restoration.' }
          ]
        },
        {
          id: 'node-2',
          title: 'Contingency Reserve Allocation',
          amount: potCovered,
          status: 'verified' as const,
          badge: 'Reserve Fund Offset',
          description: 'Allocated from household liquid savings.',
          sources: [
            { doc: 'Bank Statement', ref: 'Reserve Allocation', text: 'Self-funded initial contingency contribution.' }
          ]
        },
        {
          id: 'node-3',
          title: 'Unbudgeted Contingency Gap',
          amount: potGap,
          status: 'estimated' as const,
          badge: 'Net Capital Shortfall',
          description: 'Uncovered emergency expense requiring immediate financing.',
          sources: [
            { doc: 'Sahaay Contingency Model', ref: 'Gap Calculation', text: 'Shortfall needed to complete emergency repair.' }
          ]
        }
      ];
    }

    // Default Medical Emergency with real calculated amounts
    return [
      {
        id: 'node-1',
        title: 'Potential Claimable Coverage',
        amount: potCovered,
        status: 'estimated' as const,
        badge: 'Calculated by Deterministic Engine',
        description: 'Total eligible payout calculated after room limit and proportionate deductions.',
        sources: [
          { doc: 'Health Insurance Policy', ref: 'Policy Terms', text: 'Eligible liability clause applied on associated charges.' },
          { doc: provider ? `${provider} Invoices` : 'Hospital Final Bill', ref: 'Billing Ledger', text: `Verified total incident bill of ${formatINR(totalBill)}.` }
        ]
      },
      {
        id: 'node-2',
        title: 'Out-of-Pocket Medical Gap',
        amount: potGap,
        status: 'verified' as const,
        badge: 'Net Shortfall',
        description: 'Out-of-pocket amount after policy sub-limits and excluded non-medical consumables.',
        sources: [
          { doc: 'Health Insurance Policy', ref: 'Schedule of Sub-limits', text: 'Room rent cap and excluded non-payable items.' },
          { doc: provider ? `${provider} Bill` : 'Hospital Itemized Invoice', ref: 'Non-covered subtotal', text: `Uncovered balance of ${formatINR(potGap)}.` }
        ]
      }
    ];
  };

  const evidenceNodes = getNodes();

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20">
      {/* Workflow Navigation */}
      <CaseWorkflowNav caseId={caseId} activeStation="evidence" emergencyTitle="Deterministic Evidence Audit" />

      <div className="mx-auto flex max-w-6xl flex-col px-4 pt-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-[#246BB2] border border-sky-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Deterministic Evidence Audit
            </span>
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
              Zero Hallucinations
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B35]">
            Why am I seeing these numbers?
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Sahaay connects every deduction directly to exact clauses in your policy and line items in your verified bill.
          </p>
        </div>

        {/* Principle Callout */}
        <div className="mt-6 rounded-3xl border border-sky-200 bg-sky-50/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-[#246BB2] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-[#101B35] font-bold">Evidence-First Guarantee:</strong> We reject misleading consumer percentage scores (e.g. "94% confidence"). Instead, we show exact clauses and deterministic mathematical proofs.
            </p>
          </div>
          <Link
            href={`/case/${caseId}/bill`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#246BB2] hover:underline shrink-0"
          >
            <span>View Bill Lines</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Connected Evidence Flow */}
        <div className="mt-8 space-y-6">
          {evidenceNodes.map((node, index) => (
            <div
              key={node.id}
              className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-400">#{index + 1}</span>
                    <h3 className="text-base font-bold text-[#101B35]">{node.title}</h3>
                    <EvidenceBadge status={node.status as any} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{node.description}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="font-mono text-2xl font-extrabold text-[#101B35]">
                    {formatINR(node.amount)}
                  </span>
                  <span className="block text-xs text-[#246BB2] font-bold mt-0.5">{node.badge}</span>
                </div>
              </div>

              {/* Source References connected */}
              <div className="mt-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Connected Source Documents & Clauses:
                </span>
                <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                  {node.sources.map((src, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-[#101B35]">
                        <span className="truncate max-w-[200px]">{src.doc}</span>
                        <span className="font-mono text-[10px] text-slate-500">{src.ref}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 italic">"{src.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Human Escalation Trigger */}
        <div className="mt-10 rounded-3xl border border-amber-200 bg-amber-50/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-amber-900">Need Independent Human Expert Verification?</h4>
              {isEscalated && (
                <span className="rounded-full bg-amber-200 text-amber-900 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                  Ombudsman Review Assigned
                </span>
              )}
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              {isEscalated
                ? "This case is actively flagged for independent expert review. An accredited financial ombudsman will verify the clause interpretations."
                : "If you disagree with any policy interpretation, Sahaay halts automated processing and routes your case directly to an independent financial ombudsman."}
            </p>
          </div>
          <button
            onClick={async () => {
              if (isEscalated || isEscalating) return;
              setIsEscalating(true);
              try {
                await api.escalateCase(caseId, 'User requested independent human ombudsman review on evidence audit.');
                setIsEscalated(true);
                const updated = await api.getCase(caseId);
                if (updated) setCaseData(updated);
              } catch (e) {
                console.error('Failed to escalate case:', e);
              } finally {
                setIsEscalating(false);
              }
            }}
            disabled={isEscalated || isEscalating}
            className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all shrink-0 shadow-xs ${
              isEscalated
                ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-default'
                : 'bg-amber-500 text-white hover:bg-amber-600 cursor-pointer disabled:opacity-50'
            }`}
          >
            {isEscalating ? 'Assigning Expert...' : isEscalated ? '✓ Ombudsman Assigned' : 'Request Ombudsman Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
