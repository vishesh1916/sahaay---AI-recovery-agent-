'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Car,
  HeartPulse,
  TrendingDown,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Coins,
  Loader2,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { FileUpload } from '@/components/common/FileUpload';
import { VoiceButton } from '@/components/sahaay/VoiceButton';
import { api } from '@/lib/api';

interface ConfigType {
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  placeholderText: string;
  placeholderAmount: string;
  exampleText: string;
  exampleAmount: number;
  doc1: { label: string; desc: string; type: string };
  doc2: { label: string; desc: string; type: string };
  doc3: { label: string; desc: string; type: string };
}

const emergencyConfigs: Record<string, ConfigType> = {
  medical: {
    title: 'Medical Emergency',
    subtitle: 'Hospitalization, surgery bill, health insurance claim & out-of-pocket gap',
    badge: 'Health & Surgery',
    icon: HeartPulse,
    placeholderText:
      'Describe what medical procedure or hospitalization occurred, which hospital/doctor, and whether you have health insurance...',
    placeholderAmount: 'e.g. 150000',
    exampleText:
      'Inpatient hospital admission for acute medical emergency. Final discharge invoice pending clearance with health insurance claim.',
    exampleAmount: 150000,
    doc1: {
      label: 'Health Insurance Policy (Optional PDF)',
      desc: 'Policy schedule or booklet with sub-limits',
      type: 'policy',
    },
    doc2: {
      label: 'Hospital Bill / Estimate (PDF / Image)',
      desc: 'Itemized invoice for room, surgeon, pharmacy & OT',
      type: 'bill',
    },
    doc3: {
      label: 'Discharge Summary (Optional PDF)',
      desc: 'Clinical summary, admission & diagnosis notes',
      type: 'discharge',
    },
  },
  vehicle: {
    title: 'Vehicle Accident',
    subtitle: 'Car / 2-wheeler collision, garage repair bill & zero-depreciation gap',
    badge: 'Motor & Collision',
    icon: Car,
    placeholderText:
      'Describe the vehicle accident, damaged parts (bumper, metal, glass, engine), authorized garage estimate, and insurer response...',
    placeholderAmount: 'e.g. 85000',
    exampleText:
      'My car collided with a divider on the highway. Front bumper, hood, headlight, and radiator are damaged. Authorized workshop repair estimate is ₹85,000. Insurer is deducting parts depreciation.',
    exampleAmount: 85000,
    doc1: {
      label: 'Motor Insurance Policy (Optional PDF)',
      desc: 'Comprehensive or Zero-Dep schedule',
      type: 'policy',
    },
    doc2: {
      label: 'Garage Repair Quote (PDF / Image)',
      desc: 'Itemized parts, consumables, and labor quote',
      type: 'bill',
    },
    doc3: {
      label: 'Spot Inspection / Surveyor Note (Optional)',
      desc: 'Accident photos or surveyor damage assessment',
      type: 'discharge',
    },
  },
  income: {
    title: 'Income Interruption & Cash-Flow Shock',
    subtitle: 'Freelance payment delays, layoff bridge financing & urgent EMI cover',
    badge: 'Income & Cash-Flow',
    icon: TrendingDown,
    placeholderText:
      'Describe your income shock (delayed client payment, layoff, medical leave), ongoing monthly commitments (rent, EMIs), and cash shortfall...',
    placeholderAmount: 'e.g. 120000',
    exampleText:
      'My primary client has delayed payment of ₹1,20,000 for 60 days. My fixed recurring rent of ₹25,000 and loan EMI of ₹6,500 are due next week, and my available bank buffer is only ₹15,800.',
    exampleAmount: 120000,
    doc1: {
      label: 'Contract / Delay Notice (Optional PDF)',
      desc: 'Agreement, invoice, or client delay email',
      type: 'policy',
    },
    doc2: {
      label: 'Bank Statement / Inflow Ledger (PDF)',
      desc: 'Statement demonstrating regular historic inflow',
      type: 'bill',
    },
    doc3: {
      label: 'Active EMI / Loan Schedule (Optional PDF)',
      desc: 'Loan repayment schedule or rental contract',
      type: 'discharge',
    },
  },
  unexpected: {
    title: 'Unexpected Critical Expense',
    subtitle: 'Emergency home repair, urgent structural remediation & contingency funding',
    badge: 'Contingency & Repair',
    icon: AlertTriangle,
    placeholderText:
      'Describe the unplanned critical emergency (severe water leak, wall collapse, electrical fire, urgent legal obligation) and amount required...',
    placeholderAmount: 'e.g. 65000',
    exampleText:
      'Severe pipe rupture flooded the flat ceiling and damaged electrical wiring. Urgent contractor repair and restoration quotation is ₹65,000 to prevent structural collapse.',
    exampleAmount: 65000,
    doc1: {
      label: 'Contractor Quote / Invoice (PDF / Image)',
      desc: 'Detailed quotation for urgent repair works',
      type: 'bill',
    },
    doc2: {
      label: 'Damage Evidence / Inspection (Optional)',
      desc: 'Damage photos or technician diagnosis note',
      type: 'discharge',
    },
    doc3: {
      label: 'Payment Demand / Agreement (Optional)',
      desc: 'Vendor payment notice or service agreement',
      type: 'policy',
    },
  },
};

function IntakeFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || 'medical';

  const [currentTypeKey, setCurrentTypeKey] = useState<string>(
    ['medical', 'vehicle', 'income', 'unexpected'].includes(typeParam) ? typeParam : 'medical'
  );

  const cfg = emergencyConfigs[currentTypeKey] || emergencyConfigs.medical;

  // Clean form state for real users
  const [situationText, setSituationText] = useState('');
  const [totalAmount, setTotalAmount] = useState<string>('');

  // Financial Context
  const [avgInflow, setAvgInflow] = useState(53700);
  const [recurringExpenses, setRecurringExpenses] = useState(31400);
  const [existingObligations, setExistingObligations] = useState(6500);
  const [liquidityBuffer, setLiquidityBuffer] = useState(15800);
  const [showFinancials, setShowFinancials] = useState(false);

  // Uploaded Files (real File objects or null)
  const [doc1File, setDoc1File] = useState<File | null>(null);
  const [doc2File, setDoc2File] = useState<File | null>(null);
  const [doc3File, setDoc3File] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>('');

  // When switching emergency type, reset text if empty
  useEffect(() => {
    // If user hasn't typed anything yet, keep it empty with new placeholder
  }, [currentTypeKey]);

  const handleLoadExample = () => {
    setSituationText(cfg.exampleText);
    setTotalAmount(String(cfg.exampleAmount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situationText.trim()) {
      alert('Please describe your situation.');
      return;
    }

    const numericAmount = parseFloat(totalAmount) || 0;
    if (numericAmount <= 0) {
      alert('Please enter a valid estimated incident amount.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Creating your secure recovery workspace...');

    try {
      const lang = typeof window !== 'undefined' ? localStorage.getItem('sahaay_lang') || 'hinglish' : 'hinglish';
      const userId = typeof window !== 'undefined' ? localStorage.getItem('sahaay_user_id') || 'user-default' : 'user-default';

      const financials = {
        average_inflow: avgInflow,
        recurring_expenses: recurringExpenses,
        existing_obligations: existingObligations,
        liquidity_buffer: liquidityBuffer,
      };

      // 1. Create case in backend with real emergency type and amount
      const createdCase = await api.createCase(
        situationText.trim(),
        currentTypeKey,
        numericAmount,
        lang,
        userId,
        financials
      );

      const caseId = createdCase.case_id;

      // 2. Upload any provided real documents with Groq AI analysis
      const uploads: Promise<any>[] = [];
      if (doc1File) {
        setSubmitStatus('Extracting policy clauses with Groq AI...');
        uploads.push(api.uploadDocument(caseId, doc1File, cfg.doc1.type));
      }
      if (doc2File) {
        setSubmitStatus('Extracting bill line items with Groq AI...');
        uploads.push(api.uploadDocument(caseId, doc2File, cfg.doc2.type));
      }
      if (doc3File) {
        setSubmitStatus('Uploading supporting emergency records...');
        uploads.push(api.uploadDocument(caseId, doc3File, cfg.doc3.type));
      }

      if (uploads.length > 0) {
        await Promise.all(uploads);
      }

      // 3. Store active case in storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('current_active_case_id', caseId);
        sessionStorage.setItem('sahaay_active_case_id', caseId);
        localStorage.setItem('sahaay_active_case_id', caseId);
      }

      // Navigate to Processing screen
      router.push(`/processing?caseId=${caseId}`);
    } catch (err) {
      console.error('Intake creation failed:', err);
      alert('Failed to initialize case. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

    const IconComponent = cfg.icon;

  return (
    <div className="min-h-screen bg-[#9BB0D8] text-[#0D1C34] px-4 py-8 sm:py-12 sm:px-6 lg:px-8 selection:bg-[#D9FF32] selection:text-[#0D1C34]">
      <div className="mx-auto flex max-w-4xl flex-col">
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/25">
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="text-xs font-bold text-white hover:text-white/80 transition-colors flex items-center gap-1.5"
          >
            ← Back to Emergency Dashboard
          </button>
          <span className="text-xs font-mono font-semibold text-white/80">
            STATION 01 • CASE INTAKE
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-[#2464A4] mb-3 shadow-xs">
            <IconComponent className="h-4 w-4" />
            <span>{cfg.badge}</span>
          </div>
          <h1 className="font-serif-editorial text-4xl sm:text-5xl font-normal tracking-tight text-white drop-shadow-sm">
            {cfg.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            {cfg.subtitle}. Enter your real figures and upload files for deterministic audit analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Situation Text Area with Voice Trigger */}
          <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs focus-within:border-[#246BB2] focus-within:ring-4 focus-within:ring-sky-50 transition-all">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Explain What Happened
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadExample}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#246BB2] hover:underline"
                >
                  <Sparkles className="h-3 w-3" />
                  Load Example Scenario
                </button>
                <VoiceButton
                  label="Speak in Hindi / Hinglish"
                  onTranscript={(text) => setSituationText(text)}
                  className="py-1.5 px-3 text-xs"
                />
              </div>
            </div>

            <textarea
              rows={4}
              value={situationText}
              onChange={(e) => setSituationText(e.target.value)}
              placeholder={cfg.placeholderText}
              className="w-full resize-none bg-transparent text-sm font-medium text-[#101B35] placeholder-slate-400 focus:outline-none leading-relaxed"
              required
            />

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500 gap-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Supports Hindi, Hinglish, and English voice or text
              </span>
              <span className="font-semibold text-slate-600">Powered by Groq LLM Intelligence</span>
            </div>
          </div>

          {/* Total Bill / Expense Input */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Total Incident Amount / Estimated Bill (₹)
            </label>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-[#246BB2] focus-within:bg-white transition-all">
              <span className="text-xl font-bold text-[#246BB2] font-mono">₹</span>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder={cfg.placeholderAmount}
                className="bg-transparent text-xl font-bold text-[#101B35] placeholder-slate-400 focus:outline-none w-full font-mono"
                required
              />
            </div>
            <span className="text-xs text-slate-500 mt-2.5 block">
              Enter the exact or estimated invoice amount. Sahaay will compute eligible coverage and your exact out-of-pocket gap.
            </span>
          </div>

          {/* Optional Financial Profile Customization */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <button
              type="button"
              onClick={() => setShowFinancials(!showFinancials)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-[#246BB2]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Customize Financial Profile (Account Aggregator Baseline)
                </span>
              </div>
              {showFinancials ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {showFinancials && (
              <div className="mt-4 pt-4 border-t border-slate-100 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] text-slate-500 font-bold mb-1">
                    Average Monthly Inflow (₹)
                  </label>
                  <input
                    type="number"
                    value={avgInflow}
                    onChange={(e) => setAvgInflow(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#101B35] font-mono focus:border-[#246BB2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-bold mb-1">
                    Fixed Recurring Expenses (₹)
                  </label>
                  <input
                    type="number"
                    value={recurringExpenses}
                    onChange={(e) => setRecurringExpenses(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#101B35] font-mono focus:border-[#246BB2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-bold mb-1">
                    Existing Monthly EMIs (₹)
                  </label>
                  <input
                    type="number"
                    value={existingObligations}
                    onChange={(e) => setExistingObligations(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#101B35] font-mono focus:border-[#246BB2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-bold mb-1">
                    Available Liquid Buffer / Savings (₹)
                  </label>
                  <input
                    type="number"
                    value={liquidityBuffer}
                    onChange={(e) => setLiquidityBuffer(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#101B35] font-mono focus:border-[#246BB2] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Document Upload Zones Tailored to Emergency Type */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-[#101B35]">Upload Supporting Documents</h3>
              <p className="text-xs text-slate-500">
                Upload your PDF bill, policy, or estimate. Groq AI reads each line item and extracts sub-limits automatically.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FileUpload
                label={cfg.doc1.label}
                description={cfg.doc1.desc}
                docType={cfg.doc1.type}
                onFileSelect={setDoc1File}
              />
              <FileUpload
                label={cfg.doc2.label}
                description={cfg.doc2.desc}
                docType={cfg.doc2.type}
                onFileSelect={setDoc2File}
              />
              <FileUpload
                label={cfg.doc3.label}
                description={cfg.doc3.desc}
                docType={cfg.doc3.type}
                onFileSelect={setDoc3File}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldAlert className="h-4 w-4 text-[#246BB2] shrink-0" />
              <span>Deterministic engine calculates exact out-of-pocket gap & funding scenario.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#D9FF32] px-8 py-4 text-sm font-bold text-[#101B35] shadow-sm hover:bg-[#CCF025] hover:scale-102 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{submitStatus || 'Initializing Reasoning Engine...'}</span>
                </>
              ) : (
                <>
                  <span>Understand My Situation</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function IntakeScreen() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-medium">Loading intake form...</div>}>
      <IntakeFormContent />
    </Suspense>
  );
}
