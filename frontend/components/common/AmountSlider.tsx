'use client';

import React from 'react';
import { formatINR } from '@/lib/utils';

interface AmountSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  label?: string;
  sublabel?: string;
}

export function AmountSlider({
  value,
  min = 10000,
  max = 100000,
  step = 1000,
  onChange,
  label = "Amount to Arrange",
  sublabel = "Simulate funding or buffer allocation",
}: AmountSliderProps) {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
          <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-3xl font-extrabold tracking-tight text-[#101B35] font-mono">
            {formatINR(value)}
          </span>
        </div>
      </div>

      {/* Slider range */}
      <div className="mt-6">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#246BB2] focus:outline-none"
        />
        <div className="mt-2.5 flex justify-between text-xs font-mono text-slate-500">
          <span>{formatINR(min)}</span>
          <span className="text-[#246BB2] font-bold">{formatINR(value)}</span>
          <span>{formatINR(max)}</span>
        </div>
      </div>

      {/* Quick jump pills */}
      <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
        {[20000, 24600, 35000, 46001, 60000, 80000].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded-full px-3.5 py-1 text-xs font-mono font-bold transition-all ${
              value === preset
                ? 'bg-[#246BB2] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            {formatINR(preset)}
          </button>
        ))}
      </div>
    </div>
  );
}
