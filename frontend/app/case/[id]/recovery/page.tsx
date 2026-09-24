'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Wallet,
  CheckCircle2,
  TrendingDown,
  Activity,
  HeartHandshake
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { AmountSlider } from '@/components/common/AmountSlider';
import { formatINR } from '@/lib/utils';
import { api } from '@/lib/api';
import { CaseData } from '@/lib/types';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

export default function RecoverySimulatorPage() {
  const params = useParams();
  const caseId = params?.id as string;
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [sliderAmount, setSliderAmount] = useState<number>(0);
  const [serverSimulation, setServerSimulation] = useState<any>(null);
  const [userName, setUserName] = useState<string>('You');

  useEffect(() => {
    async function load() {
      try {
        if (!caseId) return;
        const data = await api.getCase(caseId);
        if (data) {
          setCaseData(data);
          const gap = data.analysis?.gap_result?.potential_gap ?? (data.total_amount ? Math.round(data.total_amount * 0.3) : 0);
          setSliderAmount(gap);
          if (gap > 0) {
            const sim = await api.simulateRecovery(caseId, gap);
            if (sim?.simulation) setServerSimulation(sim.simulation);
          }
        }
      } catch (e) {
        console.warn('Failed to load case in recovery page', e);
      }
    }
    load();

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sahaay_user_name');
      if (stored) setUserName(stored.split(' ')[0]);
    }
  }, [caseId]);

  const handleSliderChange = async (val: number) => {
    setSliderAmount(val);
    try {
      const sim = await api.simulateRecovery(caseId, val);
      if (sim?.simulation) setServerSimulation(sim.simulation);
    } catch (e) {
      console.warn('Simulation update error', e);
    }
  };

  const gapAmount = caseData?.analysis?.gap_result?.potential_gap ?? (caseData?.total_amount ? Math.round(caseData.total_amount * 0.3) : 0);
  const potCovered = caseData?.analysis?.gap_result?.potential_claim_amount ?? Math.max((caseData?.total_amount || 0) - gapAmount, 0);

  const profile = caseData?.analysis?.financial_context || {
    average_inflow: 50000,
    recurring_expenses: 30000,
    existing_obligations: 5000,
    liquidity_buffer: 15000,
  };
  const currentBuffer = serverSimulation?.current_buffer ?? profile.liquidity_buffer ?? 15000;
  const monthlyInflow = profile.average_inflow ?? 50000;
  const monthlyExpenses = profile.recurring_expenses ?? 30000;
  const existingEMI = profile.existing_obligations ?? 5000;

  // Derived simulation formulas
  const remainingBuffer = serverSimulation?.remaining_buffer ?? Math.max(currentBuffer - sliderAmount, 0);
  const modeled12mEMI = serverSimulation?.modeled_emi ?? Math.round(sliderAmount / 12);
  const newTotalObligations = serverSimulation?.new_total_obligations ?? (existingEMI + modeled12mEMI);
  const paymentPressureRatio = (monthlyInflow - monthlyExpenses) > 0 ? (newTotalObligations / (monthlyInflow - monthlyExpenses)) : 1.0;

  const paymentPressureLabel = serverSimulation?.payment_pressure_label
    ? (serverSimulation.payment_pressure_label.charAt(0).toUpperCase() + serverSimulation.payment_pressure_label.slice(1))
    : (paymentPressureRatio < 0.4 ? 'Low' : paymentPressureRatio < 0.7 ? 'Moderate' : 'High Pressure');

  const pressureColor =
    paymentPressureRatio < 0.4
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : paymentPressureRatio < 0.7
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-rose-700 bg-rose-50 border-rose-200';

  // 6-Month cash-flow projection chart data
  const chartData = [
    { month: 'Current', buffer: currentBuffer, emi: existingEMI },
    { month: 'Month 1', buffer: remainingBuffer, emi: newTotalObligations },
    { month: 'Month 2', buffer: remainingBuffer + 2500, emi: newTotalObligations },
    { month: 'Month 3', buffer: remainingBuffer + 5000, emi: newTotalObligations },
    { month: 'Month 4', buffer: remainingBuffer + 7500, emi: newTotalObligations },
    { month: 'Month 5', buffer: remainingBuffer + 10000, emi: newTotalObligations },
    { month: 'Month 6', buffer: remainingBuffer + 12500, emi: newTotalObligations },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20">
      {/* Workflow Navigation */}
      <CaseWorkflowNav caseId={caseId} activeStation="recovery" emergencyTitle="Recovery Stress Simulator" />

      <div className="mx-auto flex max-w-6xl flex-col px-4 pt-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-[#246BB2] border border-sky-200">
              <Sliders className="h-3.5 w-3.5" />
              Recovery Simulator
            </span>
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
              Real-Time Stress Testing
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B35]">
            Simulate your financial resilience
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Test how different payment amounts and financing structures affect your liquid safety buffer and debt-to-income obligations.
          </p>
        </div>

        {/* Interactive Slider */}
        <div className="mt-8">
          <AmountSlider
            value={sliderAmount}
            onChange={handleSliderChange}
            label="Simulate Gap Amount to Arrange"
            sublabel={`Calculated out-of-pocket gap is ${formatINR(gapAmount)}. Adjust to test partial payments or full buffer absorption.`}
          />
        </div>

        {/* 4 Live Simulation Metrics */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Current Safety Buffer</span>
            <p className="text-2xl font-extrabold font-mono text-[#101B35] mt-1.5">{formatINR(currentBuffer)}</p>
            <span className="text-xs text-slate-500 mt-1 block">Unencumbered cash</span>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-xs">
            <span className="text-xs text-emerald-800 uppercase font-bold tracking-wider">Modeled Remaining Buffer</span>
            <p className="text-2xl font-extrabold font-mono text-emerald-700 mt-1.5">{formatINR(remainingBuffer)}</p>
            <span className="text-xs text-emerald-600 mt-1 block">
              {remainingBuffer === 0 ? 'Buffer fully exhausted' : 'Retained cushion'}
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Modeled 12M EMI</span>
            <p className="text-2xl font-extrabold font-mono text-[#246BB2] mt-1.5">{formatINR(modeled12mEMI)}/mo</p>
            <span className="text-xs text-slate-500 mt-1 block">If gap is financed</span>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Payment Pressure</span>
            <div className="mt-1.5">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${pressureColor}`}>
                {paymentPressureLabel}
              </span>
            </div>
            <span className="text-xs text-slate-500 block mt-1">
              New total EMI: {formatINR(newTotalObligations)}/mo
            </span>
          </div>
        </div>

        {/* Recharts Cash-Flow Stress Chart */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#101B35]">6-Month Buffer Recovery Projection</h3>
              <p className="text-xs text-slate-500 mt-0.5">Shows safety cushion rebound vs fixed obligations</p>
            </div>
            <div className="flex items-center gap-5 text-xs font-bold">
              <div className="flex items-center gap-2 text-[#246BB2]">
                <span className="h-3 w-3 rounded-full bg-[#246BB2]" />
                <span>Buffer Balance</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-600">
                <span className="h-3 w-3 rounded-full bg-indigo-500" />
                <span>Monthly Obligations</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#246BB2" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#246BB2" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '16px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(val: any) => [formatINR(Number(val)), '']}
                />
                <Area type="monotone" dataKey="buffer" stroke="#246BB2" strokeWidth={2.5} fillOpacity={1} fill="url(#skyGrad)" />
                <Area type="monotone" dataKey="emi" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#indigoGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Pathways (4 Recovery Options) */}
        <div className="mt-14">
          <div className="text-center mb-8">
            <span className="inline-block rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#246BB2] border border-sky-200">
              Action Pathways
            </span>
            <h2 className="text-2xl font-extrabold text-[#101B35] mt-2">What can you do next?</h2>
            <p className="text-xs text-slate-500 mt-1">Select your preferred recovery strategy. FlowPass moves with you.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Option 1: Complete Insurance */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="rounded-full bg-sky-50 text-[#246BB2] text-xs font-bold px-3 py-1 border border-sky-200">
                    Pathway A
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700">Covered: {formatINR(potCovered)}</span>
                </div>
                <h3 className="text-lg font-bold text-[#101B35]">Complete Insurance Claim Journey</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Submit verified bill line items and clinical discharge summary to insurer.
                  Track settlement and receive claim status in FlowPass.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3.5">
                  <p>• <strong>What happens:</strong> Insurer reviews pre-formatted claim package</p>
                  <p>• <strong>Info required:</strong> Prescription for pharmacy + Cancelled Cheque</p>
                  <p>• <strong>What changes:</strong> Provider receives {formatINR(potCovered)} direct payout</p>
                </div>
              </div>
              <Link
                href={`/case/${caseId}/documents`}
                className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-[#101B35] hover:bg-white hover:border-[#246BB2] transition-all"
              >
                <span>Upload Missing Documents</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Option 2: Explore Funding (Recommended) */}
            <div className="rounded-3xl bg-gradient-to-br from-[#246BB2] to-[#1B5894] text-white p-6 sm:p-7 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <span className="absolute top-4 right-4 bg-[#D9FF32] text-[#101B35] text-[10px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full shadow-xs">
                Recommended for {userName}
              </span>

              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="rounded-full bg-white/20 text-white text-xs font-bold px-3 py-1 border border-white/25">
                    Pathway B • FlowPass Powered
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Explore Recovery Funding</span>
                  <Sparkles className="h-4 w-4 text-[#D9FF32]" />
                </h3>
                <p className="text-xs text-sky-100 mt-2 leading-relaxed">
                  Fund the gap without depleting your emergency buffer.
                  <strong className="text-white font-bold"> The FlowPass engine carries verified income and obligations forward with zero re-entry.</strong>
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-sky-100 border-t border-white/15 pt-3.5">
                  <p>• <strong>What happens:</strong> Pre-populates verified income & hospital bill</p>
                  <p>• <strong>Info required:</strong> Repayment tenure selection (6 vs 12 mos)</p>
                  <p>• <strong>What changes:</strong> Preserves {userName}'s {formatINR(currentBuffer)} liquid savings</p>
                </div>
              </div>

              <Link
                href={`/case/${caseId}/funding`}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#D9FF32] text-[#101B35] py-3.5 text-xs font-extrabold shadow-md hover:bg-[#CCF025] hover:scale-102 transition-all"
              >
                <span>Continue into Funding (No Starting Over)</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
            </div>

            {/* Option 3: Use Available Funds */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="rounded-full bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1">
                    Pathway C
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">Buffer: {formatINR(currentBuffer)}</span>
                </div>
                <h3 className="text-lg font-bold text-[#101B35]">Use Liquid Savings Buffer</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Allocate {formatINR(Math.min(currentBuffer, sliderAmount))} from existing savings towards the bill and arrange the remaining balance.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3.5">
                  <p>• <strong>What happens:</strong> Immediate cash withdrawal</p>
                  <p className="text-amber-700 font-semibold">• <strong>Warning:</strong> Leaves safety buffer at {formatINR(Math.max(currentBuffer - sliderAmount, 0))} for next 3 months</p>
                </div>
              </div>
              <Link
                href={`/case/${caseId}/review`}
                className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-700 hover:bg-white hover:border-slate-300 transition-all"
              >
                <span>Review Partial Cash Allocation</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Option 4: Direct Paytm Payment */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-[#00BAF2] transition-all">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="rounded-full bg-sky-50 text-[#00BAF2] text-xs font-bold px-3 py-1 border border-sky-200">
                    Pathway D • Direct Settle
                  </span>
                  <span className="text-xs font-mono font-bold text-[#00BAF2]">{formatINR(sliderAmount)}</span>
                </div>
                <h3 className="text-lg font-bold text-[#101B35]">Direct Hospital Settlement (Paytm)</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Pay the entire hospital gap immediately via Paytm UPI / NetBanking to secure instant patient discharge.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3.5">
                  <p>• <strong>What happens:</strong> Launches verified Paytm session</p>
                  <p>• <strong>Status:</strong> Automatically marks invoice as paid</p>
                </div>
              </div>
              <Link
                href={`/case/${caseId}/payment`}
                className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full bg-sky-50 text-[#00BAF2] border border-sky-200 py-3 text-xs font-bold hover:bg-[#00BAF2] hover:text-white transition-all"
              >
                <span>Pay with Paytm</span>
                <CreditCard className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
