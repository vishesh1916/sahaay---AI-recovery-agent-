'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Receipt, ArrowRight, ShieldCheck, HelpCircle, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { api } from '@/lib/api';
import { CaseData, LineItem } from '@/lib/types';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

export default function BillIntelligencePage() {
  const params = useParams();
  const caseId = params?.id as string;
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [caseType, setCaseType] = useState('medical');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (!caseId) return;
        const data = await api.getCase(caseId);
        if (data) {
          if (data.emergency_type) setCaseType(data.emergency_type);
          const items = data.analysis?.insurance_analysis?.line_items || data.analysis?.gap_result?.line_item_results;
          if (items && items.length > 0) {
            setLineItems(items);
          }
        }
      } catch (e) {
        console.warn('Failed to load line items', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [caseId]);

  const totalBill = lineItems.reduce((acc, i) => acc + i.amount, 0);
  const totalCovered = lineItems.reduce((acc, i) => acc + (i.covered_amount || 0), 0);
  const totalDeductions = Math.max(totalBill - totalCovered, 0);

  const titles: Record<string, { pageTitle: string; colName: string; desc: string }> = {
    medical: {
      pageTitle: 'Hospital Bill Intelligence',
      colName: 'Hospital Expense',
      desc: 'Sahaay isolates line items and applies proportionate deduction logic only to associated expenses, protecting pharmacy, diagnostics, and implants.',
    },
    vehicle: {
      pageTitle: 'Garage Repair Estimate & Parts Intelligence',
      colName: 'Vehicle Repair Line Item',
      desc: 'Sahaay isolates parts from labor and paint charges, applying zero-depreciation endorsements while highlighting compulsory deductibles.',
    },
    income: {
      pageTitle: 'Income Interruption & Obligation Ledger',
      colName: 'Obligation / Scheduled Payment',
      desc: 'Sahaay analyzes non-negotiable EMIs, rent, and utility commitments versus your liquid savings buffer to isolate the urgent shortfall.',
    },
    unexpected: {
      pageTitle: 'Emergency Remediation Invoice Intelligence',
      colName: 'Contingency Item',
      desc: 'Sahaay audits contractor quotes, emergency supplies, and critical repairs to calculate the exact unfunded gap.',
    },
  };

  const currentMeta = titles[caseType] || titles.medical;

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'associated':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
            Associated
          </span>
        );
      case 'non_associated':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            Non-Associated
          </span>
        );
      case 'excluded':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
            Excluded / Gap
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            Under Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#9BB0D8] pb-20 text-[#0D1C34] selection:bg-[#D9FF32] selection:text-[#0D1C34]">
      {/* Workflow Navigation */}
      <CaseWorkflowNav caseId={caseId} activeStation="bill" emergencyTitle={currentMeta.pageTitle} />

      <div className="mx-auto flex max-w-7xl flex-col px-4 pt-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/25">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#2464A4] border border-white shadow-xs">
                <Receipt className="h-3.5 w-3.5" />
                Document Agent Intelligence
              </span>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
                Table Preserved
              </span>
            </div>
            <h1 className="font-serif-editorial mt-2 text-3xl sm:text-4xl font-normal tracking-tight text-white drop-shadow-sm">
              {currentMeta.pageTitle}
            </h1>
            <p className="mt-1 text-sm text-white/90 max-w-2xl">
              {currentMeta.desc}
            </p>
          </div>

          <Link
            href={`/case/${caseId}/gap`}
            className="btn-volt px-6 py-2.5 text-xs font-bold shadow-md transition-all self-start md:self-auto shrink-0 inline-flex items-center gap-2"
          >
            <span>See Gap Waterfall</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* Summary Chips */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Itemized Amount</span>
            <p className="text-2xl font-extrabold font-mono text-[#101B35] mt-1.5">{formatINR(totalBill)}</p>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-xs">
            <span className="text-xs text-emerald-800 uppercase font-bold tracking-wider">Covered / Supported</span>
            <p className="text-2xl font-extrabold font-mono text-emerald-700 mt-1.5">{formatINR(totalCovered)}</p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-6 shadow-xs">
            <span className="text-xs text-amber-800 uppercase font-bold tracking-wider">Total Deductions (Gap)</span>
            <p className="text-2xl font-extrabold font-mono text-amber-800 mt-1.5">{formatINR(totalDeductions)}</p>
          </div>
        </div>

        {/* Itemized Table Container */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-4 px-5 font-bold">{currentMeta.colName}</th>
                  <th className="py-4 px-5 font-bold">Category</th>
                  <th className="py-4 px-5 font-bold text-right">Billed Amount</th>
                  <th className="py-4 px-5 font-bold text-right">Eligible Payout</th>
                  <th className="py-4 px-5 font-bold text-right">Deduction</th>
                  <th className="py-4 px-5 font-bold">Reasoning & Treatment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-[#246BB2]" />
                          <span>Auditing line items with reasoning engine...</span>
                        </div>
                      ) : (
                        <span>No itemized lines extracted. Upload a bill or estimate to analyze specific line items.</span>
                      )}
                    </td>
                  </tr>
                ) : (
                  lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-5 font-bold text-[#101B35]">
                        <div>{item.name}</div>
                        {item.source_ref && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.source_ref}</div>
                        )}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        {getCategoryBadge(item.category)}
                      </td>
                      <td className="py-4 px-5 text-right font-mono font-bold text-[#101B35] whitespace-nowrap">
                        {formatINR(item.amount)}
                      </td>
                      <td className="py-4 px-5 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {formatINR(item.covered_amount || 0)}
                      </td>
                      <td className="py-4 px-5 text-right font-mono font-bold text-amber-700 whitespace-nowrap">
                        {item.deduction && item.deduction > 0 ? formatINR(item.deduction) : '—'}
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-600 max-w-xs leading-relaxed">
                        {item.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Table Footer */}
              <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200/80">
                <tr>
                  <td className="py-4 px-5 text-[#101B35] uppercase tracking-wider text-xs">Total Amount</td>
                  <td className="py-4 px-5"></td>
                  <td className="py-4 px-5 text-right font-mono text-[#101B35] text-base">{formatINR(totalBill)}</td>
                  <td className="py-4 px-5 text-right font-mono text-emerald-700 text-base">{formatINR(totalCovered)}</td>
                  <td className="py-4 px-5 text-right font-mono text-amber-800 text-base">{formatINR(totalDeductions)}</td>
                  <td className="py-4 px-5 text-xs text-emerald-700 font-medium">Calculated by Deterministic Gap Engine</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
