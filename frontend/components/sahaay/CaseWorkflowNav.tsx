'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  FileCheck2,
  Scale,
  ShieldCheck,
  Wallet,
  CreditCard,
  HeartHandshake,
  Check,
  ChevronRight,
} from 'lucide-react';
import { VoiceButton } from '@/components/sahaay/VoiceButton';

interface CaseWorkflowNavProps {
  caseId: string;
  activeStation?: string;
  emergencyTitle?: string;
  statusTag?: string;
  voiceText?: string;
}

export function CaseWorkflowNav({
  caseId,
  activeStation,
  emergencyTitle = 'Medical Emergency',
  statusTag,
  voiceText,
}: CaseWorkflowNavProps) {
  const pathname = usePathname();

  const stations = [
    {
      id: 'overview',
      step: '01',
      title: 'Overview',
      path: `/case/${caseId}`,
      icon: LayoutDashboard,
    },
    {
      id: 'bill',
      step: '02',
      title: 'Bill Ledger',
      path: `/case/${caseId}/bill`,
      icon: Receipt,
    },
    {
      id: 'documents',
      step: '03',
      title: 'Evidence Vault',
      path: `/case/${caseId}/documents`,
      icon: FileCheck2,
    },
    {
      id: 'evidence',
      step: '04',
      title: 'Evidence Audit',
      path: `/case/${caseId}/evidence`,
      icon: FileCheck2,
    },
    {
      id: 'gap',
      step: '05',
      title: 'Financial Gap',
      path: `/case/${caseId}/gap`,
      icon: Scale,
    },
    {
      id: 'flowpass',
      step: '06',
      title: 'FlowPass Token',
      path: `/case/${caseId}/flowpass`,
      icon: ShieldCheck,
    },
    {
      id: 'funding',
      step: '07',
      title: 'Bridge Funding',
      path: `/case/${caseId}/funding`,
      icon: Wallet,
    },
    {
      id: 'review',
      step: '08',
      title: 'Pre-Authorization',
      path: `/case/${caseId}/review`,
      icon: Check,
    },
    {
      id: 'payment',
      step: '09',
      title: 'Paytm Settlement',
      path: `/case/${caseId}/payment`,
      icon: CreditCard,
    },
    {
      id: 'status',
      step: '10',
      title: 'Reconciliation',
      path: `/case/${caseId}/status`,
      icon: Check,
    },
    {
      id: 'recovery',
      step: '11',
      title: 'Recovery Plan',
      path: `/case/${caseId}/recovery`,
      icon: HeartHandshake,
    },
    {
      id: 'timeline',
      step: '12',
      title: 'Audit Trail',
      path: `/case/${caseId}/timeline`,
      icon: LayoutDashboard,
    },
  ];

  // Determine current active station
  const getCurrentActiveIndex = () => {
    if (activeStation) {
      const idx = stations.findIndex((s) => s.id === activeStation);
      if (idx !== -1) return idx;
    }
    const idx = stations.findIndex((s) => s.path === pathname);
    return idx !== -1 ? idx : 0;
  };

  const activeIndex = getCurrentActiveIndex();

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-b border-[#D9D3EF]/70 sticky top-16 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar: Case badge & Quick voice/status */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 overflow-x-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2464A4]/10 px-3 py-1 text-xs font-mono font-bold text-[#2464A4] border border-[#2464A4]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2464A4] animate-ping" />
              {caseId}
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-[#596980]">
              {emergencyTitle}
            </span>
            <span className="hidden md:inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
              FlowPass Synced
            </span>
          </div>

          <div className="flex items-center gap-2">
            <VoiceButton label="Ask Sahaay" caseId={caseId} className="text-xs py-1 px-3" />
            <Link
              href={`/case/${caseId}/payment`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#D9FF32] text-[#0D1C34] px-3.5 py-1 text-xs font-bold hover:bg-[#CCF025] transition-all shadow-xs"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Direct Settlement</span>
              <span className="sm:hidden">Pay</span>
            </Link>
          </div>
        </div>

        {/* Continuous Connected Horizontal Station Steps */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {stations.map((station, index) => {
            const isActive = index === activeIndex;
            const isCompleted = index < activeIndex;

            return (
              <React.Fragment key={station.id}>
                <Link
                  href={station.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2464A4] text-white shadow-md shadow-[#2464A4]/25 scale-[1.02]'
                      : isCompleted
                      ? 'bg-[#E8E4F6] text-[#0D1C34] hover:bg-[#D9D3EF]'
                      : 'bg-white text-[#596980] hover:text-[#0D1C34] hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isCompleted ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : station.step}
                  </span>
                  <span>{station.title}</span>
                </Link>

                {index < stations.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
