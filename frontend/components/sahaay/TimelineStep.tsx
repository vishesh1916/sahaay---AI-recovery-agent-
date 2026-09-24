import React from 'react';
import { Check, Loader2, Circle } from 'lucide-react';

interface TimelineStepProps {
  label: string;
  sublabel?: string;
  status: 'completed' | 'active' | 'pending';
  stepNumber?: number;
}

export function TimelineStep({ label, sublabel, status, stepNumber }: TimelineStepProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all ${
            status === 'completed'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-xs'
              : status === 'active'
              ? 'border-[#246BB2] bg-sky-50 text-[#246BB2] shadow-md shadow-[#246BB2]/15'
              : 'border-slate-200 bg-slate-100 text-slate-400'
          }`}
        >
          {status === 'completed' ? (
            <Check className="h-4 w-4 stroke-[3]" />
          ) : status === 'active' ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#246BB2]" />
          ) : (
            <span>{stepNumber || '•'}</span>
          )}
        </div>
      </div>
      <div className="pt-0.5">
        <h4
          className={`text-sm font-bold tracking-tight ${
            status === 'completed'
              ? 'text-[#101B35]'
              : status === 'active'
              ? 'text-[#246BB2]'
              : 'text-slate-400'
          }`}
        >
          {label}
        </h4>
        {sublabel && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
