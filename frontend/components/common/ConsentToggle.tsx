'use client';

import React from 'react';

interface ConsentToggleProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}

export function ConsentToggle({
  id,
  title,
  description,
  icon,
  checked,
  onChange,
  required = false,
}: ConsentToggleProps) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`relative flex items-start gap-4 rounded-3xl border p-5 sm:p-6 cursor-pointer transition-all duration-200 ${
        checked
          ? 'border-[#246BB2]/40 bg-white shadow-md shadow-[#246BB2]/5 ring-2 ring-sky-50'
          : 'border-slate-200/90 bg-white/70 opacity-80 hover:opacity-100 hover:border-slate-300'
      }`}
    >
      <div
        className={`rounded-2xl p-3 shrink-0 transition-colors ${
          checked ? 'bg-sky-50 text-[#246BB2]' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-[#101B35] flex items-center gap-2">
            <span>{title}</span>
            {required && (
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Required
              </span>
            )}
          </h4>

          {/* Toggle Switch */}
          <div
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              checked ? 'bg-[#246BB2]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                checked ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
