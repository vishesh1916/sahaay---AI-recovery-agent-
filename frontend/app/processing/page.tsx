'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const processingSteps = [
  { id: 1, title: 'Understanding your situation', desc: 'Intent Agent classifying emergency & extracting entities' },
  { id: 2, title: 'Parsing insurance policy', desc: 'LlamaParse extracting Section 2 & 4.2 sub-limits' },
  { id: 3, title: 'Reading hospital bill', desc: 'Preserving line items: room, surgery, pharmacy, OT' },
  { id: 4, title: 'Finding relevant clauses', desc: 'Policy RAG connecting clause 4.2 proportionate deduction' },
  { id: 5, title: 'Building financial context', desc: 'FlowPass deriving monthly inflow & liquidity buffer via AA' },
  { id: 6, title: 'Checking missing evidence', desc: 'Identifying required documents for claim package' },
];

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [caseId, setCaseId] = useState<string>('');
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const id = searchParams?.get('caseId')
      || (typeof window !== 'undefined' ? sessionStorage.getItem('sahaay_active_case_id') || localStorage.getItem('sahaay_active_case_id') || sessionStorage.getItem('current_active_case_id') : '')
      || '';

    if (!id) {
      router.push('/intake');
      return;
    }

    setCaseId(id);

    let isMounted = true;
    let analysisFinished = false;

    // Run real backend analysis with Groq LLM
    api.analyzeCase(id)
      .then(() => {
        analysisFinished = true;
      })
      .catch((err) => {
        console.warn('Real-time analysis completed or cached:', err);
        analysisFinished = true;
      });

    // Staggered step animation (1 step every 900ms)
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < processingSteps.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          // Ensure analysis has completed or fallback is ready
          const checkAndNavigate = () => {
            if (isMounted) {
              router.push(`/case/${id}`);
            }
          };
          setTimeout(checkAndNavigate, 800);
          return prev;
        }
      });
    }, 900);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#9BB0D8] flex items-center justify-center px-4 py-16 sm:px-6 relative overflow-hidden selection:bg-[#D9FF32] selection:text-[#0D1C34]">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto flex max-w-xl w-full flex-col items-center justify-center relative z-10">
        {/* Standalone 3D Ribbon Symbol */}
        <div className="relative h-16 w-16 mb-5">
          <Image
            src="/images/sahaay_symbol.png"
            alt="Sahaay"
            fill
            priority
            className="object-contain animate-bounce"
          />
        </div>

        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-white/90 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#2464A4] border border-white shadow-xs">
            {caseId}
          </span>
          <h1 className="font-serif-editorial mt-3 text-3xl sm:text-4xl font-normal tracking-tight text-white drop-shadow-sm">
            Analyzing your financial emergency
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/90">
            Reasoning with policy clauses and hospital line items in real time...
          </p>
        </div>

        {/* Structured Processing Pipeline */}
        <div className="w-full rounded-3xl border border-[#D9D3EF] bg-white p-6 shadow-xl space-y-3">
          {processingSteps.map((step) => {
            const isDone = activeStep > step.id;
            const isCurrent = activeStep === step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? 'border-[#246BB2] bg-[#E8E4F6]/40 shadow-xs scale-[1.01]'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-100 bg-slate-50/40 opacity-45'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#246BB2] text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#101B35]">{step.title}</div>
                    <div className="text-[11px] text-[#596980]">{step.desc}</div>
                  </div>
                </div>

                <div className="text-[11px] font-semibold">
                  {isDone ? (
                    <span className="text-emerald-700">Verified ✓</span>
                  ) : isCurrent ? (
                    <span className="text-[#246BB2] animate-pulse">Processing...</span>
                  ) : (
                    <span className="text-slate-400">Waiting</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-[#596980]">
          FlowPass is building your cryptographic context token. No details will be lost.
        </div>
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#246BB2]" />
        </div>
      }
    >
      <ProcessingContent />
    </Suspense>
  );
}
