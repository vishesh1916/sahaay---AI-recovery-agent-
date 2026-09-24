import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface FlowPassCardProps {
  label: string;
  amount: number;
  source: string;
  sourceType?: 'imported' | 'estimated' | 'user_provided' | 'verified';
  icon?: React.ReactNode;
  subtitle?: string;
  highlight?: boolean;
}

export function FlowPassCard({
  label,
  amount,
  source,
  sourceType = 'imported',
  icon,
  subtitle,
  highlight = false,
}: FlowPassCardProps) {
  const getSourceBadge = () => {
    switch (sourceType) {
      case 'imported':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E8E4F6] px-2.5 py-0.5 text-[10px] font-bold text-[#246BB2] border border-[#D9D3EF]">
            <ShieldCheck className="h-3 w-3" />
            <span>Imported via AA</span>
          </span>
        );
      case 'estimated':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
            <span>Derived / Estimated</span>
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3 w-3" />
            <span>Verified Record</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E8E4F6] px-2.5 py-0.5 text-[10px] font-bold text-[#246BB2] border border-[#D9D3EF]">
            <span>User Provided</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${
        highlight
          ? 'border-2 border-[#246BB2] bg-white shadow-xl shadow-[#246BB2]/10 ring-4 ring-[#E8E4F6]'
          : 'border-[#D9D3EF]/80 bg-white hover:border-[#246BB2]/50 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#596980] uppercase">{label}</span>
          <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B35] font-mono">{formatINR(amount)}</h3>
          {subtitle && <p className="mt-1 text-xs text-[#596980]">{subtitle}</p>}
        </div>
        {icon && <div className="rounded-2xl bg-[#FAF9F6] p-2.5 border border-[#D9D3EF]/70 shrink-0 text-[#246BB2]">{icon}</div>}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
        {getSourceBadge()}
        <span className="text-[11px] text-[#596980] font-medium truncate max-w-[160px]" title={source}>
          {source}
        </span>
      </div>
    </div>
  );
}
