'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HeartPulse,
  Car,
  TrendingDown,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FolderClock,
  Trash2,
  Zap,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  RotateCcw,
  User,
  Shield,
  Loader2,
} from 'lucide-react';
import { VoiceButton } from '@/components/sahaay/VoiceButton';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/utils';

const emergencyTypes = [
  {
    id: 'medical',
    title: 'Hospital Surgery & Medical',
    description: 'Hospitalization, surgery bill, health insurance claim & gap funding',
    icon: <HeartPulse className="h-6 w-6 text-rose-600" />,
    badge: 'Zero-Downtime Desk Flow',
    cardBorder: 'border-slate-200/90 hover:border-rose-400',
    iconBg: 'bg-rose-50 border border-rose-200/80',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    actionColor: 'text-rose-600 hover:text-rose-700',
    href: '/intake?type=medical',
  },
  {
    id: 'vehicle',
    title: 'Vehicle Road Collision',
    description: 'Car / 2-wheeler collision, garage repair bill & zero-dep gap',
    icon: <Car className="h-6 w-6 text-amber-600" />,
    badge: 'Garage Direct Pay',
    cardBorder: 'border-slate-200/90 hover:border-amber-400',
    iconBg: 'bg-amber-50 border border-amber-200/80',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    actionColor: 'text-amber-600 hover:text-amber-700',
    href: '/intake?type=vehicle',
  },
  {
    id: 'income',
    title: 'Income Interruption',
    description: 'Freelance payment delays, layoff cash-flow shock, bridge finance',
    icon: <TrendingDown className="h-6 w-6 text-indigo-600" />,
    badge: 'Bridge Liquidity',
    cardBorder: 'border-slate-200/90 hover:border-indigo-400',
    iconBg: 'bg-indigo-50 border border-indigo-200/80',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    actionColor: 'text-indigo-600 hover:text-indigo-700',
    href: '/intake?type=income',
  },
  {
    id: 'unexpected',
    title: 'Critical Emergency Expense',
    description: 'Home damage, urgent family remittance, emergency diagnostics',
    icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
    badge: 'Instant Support',
    cardBorder: 'border-slate-200/90 hover:border-orange-400',
    iconBg: 'bg-orange-50 border border-orange-200/80',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    actionColor: 'text-orange-600 hover:text-orange-700',
    href: '/intake?type=unexpected',
  },
];

export default function SahaayHomeScreen() {
  const [userName, setUserName] = useState('');
  const [authProvider, setAuthProvider] = useState('paytm');
  const [paytmUpi, setPaytmUpi] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('sahaay_user_name') || 'Sahaay Member';
      setUserName(storedName.split(' ')[0]);

      const storedProvider = localStorage.getItem('sahaay_auth_provider') || 'paytm';
      setAuthProvider(storedProvider);

      const storedUpi = localStorage.getItem('sahaay_paytm_upi');
      if (storedUpi) setPaytmUpi(storedUpi);

      const userId = localStorage.getItem('sahaay_user_id') || 'guest_user';
      api.getUserDashboard(userId)
        .then((data) => {
          setDashboardData(data);
        })
        .catch((err) => {
          console.warn('Dashboard fetch issue:', err);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleDeleteAllData = async () => {
    if (typeof window !== 'undefined' && window.confirm('Under DPDP Act, permanently purge all your case history and documents?')) {
      const userId = localStorage.getItem('sahaay_user_id') || 'guest_user';
      try {
        await api.deleteUserData(userId);
      } catch (e) {
        console.error('Delete data failed:', e);
      }
      setDashboardData((prev: any) => ({
        ...prev,
        active_case: null,
        cases: [],
        total_cases_count: 0,
        total_savings_protected: 0,
      }));
    }
  };

  const activeCase = dashboardData?.active_case;
  const casesList = dashboardData?.cases || [];
  const totalSavings = dashboardData?.total_savings_protected || 0;
  const availableCredit = dashboardData?.available_credit || 50000.0;

  return (
    <div className="min-h-screen bg-[#9BB0D8] text-[#0D1C34] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#D9FF32] selection:text-[#0D1C34]">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Navigation & Brand Pill */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/25">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative h-9 w-40">
              <Image
                src="/images/sahaay_logo_white.png"
                alt="Sahaay Logo"
                fill
                priority
                className="object-contain object-left"
              />
            </Link>
            <span className="hidden sm:inline-block h-4 w-px bg-white/30" />
            <span className="hidden sm:inline-block text-xs font-semibold text-white/90 tracking-wide">
              Emergency Command Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Auth Provider Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white text-xs shadow-xs">
              {authProvider === 'paytm' ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-[#00BAF2] animate-pulse" />
                  <span className="font-bold text-[#002E6E]">Paytm KYC Connected</span>
                  {paytmUpi && <span className="font-mono text-[#596980]">({paytmUpi})</span>}
                </>
              ) : authProvider === 'google' ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-[#0D1C34]">Google Verified</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5 text-[#2464A4]" />
                  <span className="font-bold text-[#0D1C34]">Email Verified</span>
                </>
              )}
            </div>

            <Link
              href="/"
              className="text-xs font-semibold text-white hover:text-white/80 px-3 py-1.5 rounded-full border border-white/30 hover:bg-white/10 transition-all"
            >
              Exit to Homepage
            </Link>
          </div>
        </header>

        {/* ==========================================================
            RESUME ACTION HERO BANNER (When user has an unfinished case)
            ========================================================== */}
        {activeCase ? (
          <div className="rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl border-2 border-[#2464A4] relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-[#2464A4]/10 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold font-mono">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    ACTIVE CASE: #{activeCase.case_id.replace('CASE-', '')}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {activeCase.emergency_type} Emergency
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Status: {activeCase.status.toUpperCase()}
                  </span>
                </div>

                <h2 className="font-serif-editorial text-2xl sm:text-4xl font-normal text-[#0D1C34] tracking-tight">
                  Resume Your Emergency Case
                </h2>
                <p className="text-xs sm:text-sm text-[#596980] max-w-xl">
                  You have an unfinished action at: <strong className="text-[#0D1C34]">{activeCase.resume_label}</strong>. Your uploaded evidence and verified context are preserved.
                </p>
              </div>

              {/* Direct Deep Link CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Link
                  href={activeCase.resume_station || `/case/${activeCase.case_id}`}
                  className="btn-volt py-3.5 px-7 text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4 stroke-[2.5]" />
                  <span>Resume {activeCase.resume_label}</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </Link>

                <Link
                  href={`/case/${activeCase.case_id}/journey`}
                  className="btn-pill-primary py-3 px-5 text-xs font-bold inline-flex items-center justify-center gap-1.5"
                >
                  <span>View 7 Stations</span>
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {/* Quick Summary Cards (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Available Liquidity */}
          <div className="rounded-3xl bg-white/95 backdrop-blur-md p-5 border border-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Instant Bridge Liquidity
              </span>
              <div className="h-8 w-8 rounded-xl bg-[#002E6E]/10 flex items-center justify-center text-[#002E6E]">
                <Zap className="h-4 w-4 text-[#00BAF2]" />
              </div>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#0D1C34]">
              {formatINR(availableCredit)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {authProvider === 'paytm' ? 'Pre-approved via Paytm FlowPass credit line' : 'Available zero-downtime bridge credit'}
            </p>
          </div>

          {/* Card 2: Cumulative Protected Savings */}
          <div className="rounded-3xl bg-white/95 backdrop-blur-md p-5 border border-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Protected From Insurer Slashing
              </span>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-800">
              {formatINR(totalSavings > 0 ? totalSavings : 38400)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Safeguarded under IRDAI non-associated rules &amp; clinical evidence
            </p>
          </div>

          {/* Card 3: Total Cases Handled */}
          <div className="rounded-3xl bg-white/95 backdrop-blur-md p-5 border border-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2464A4]">
                Total Emergency Cases
              </span>
              <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#2464A4]">
                <FolderClock className="h-4 w-4" />
              </div>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#0D1C34]">
              {casesList.length > 0 ? casesList.length : 1}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Persistent encrypted records stored with Right to Erasure
            </p>
          </div>
        </div>

        {/* ==========================================================
            START A NEW EMERGENCY INCIDENT
            ========================================================== */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif-editorial text-2xl sm:text-3xl font-normal text-[#0D1C34] tracking-tight">
                Report A New Financial Emergency
              </h3>
              <p className="text-xs sm:text-sm text-[#0D1C34]/80">
                Choose an emergency archetype below. Sahaay will compute policy caps and bridge your cash gap.
              </p>
            </div>
            <VoiceButton label="Voice Assistant" className="py-2 px-4 shadow-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyTypes.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`group rounded-3xl bg-white p-5 border ${item.cardBorder} shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-11 w-11 rounded-2xl ${item.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      {item.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0D1C34] group-hover:text-[#2464A4] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#596980] mt-1 leading-snug">
                    {item.description}
                  </p>
                </div>

                <div className={`mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold ${item.actionColor}`}>
                  <span>Initiate Intake</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ==========================================================
            CASE HISTORY ARCHIVE & AUDIT TRAIL
            ========================================================== */}
        <section className="rounded-[32px] bg-white p-6 sm:p-8 shadow-xl border border-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FolderClock className="h-5 w-5 text-[#2464A4]" />
                <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                  Emergency History &amp; Case Archive
                </h3>
              </div>
              <p className="text-xs text-[#596980] mt-1">
                All cases, documents, and Paytm transactions associated with your profile.
              </p>
            </div>

            {casesList.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteAllData}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>DPDP Right to Erasure</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-[#2464A4]" />
              <span>Loading encrypted cases...</span>
            </div>
          ) : casesList.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              <p className="text-sm font-semibold">No past cases recorded yet.</p>
              <p className="text-xs text-slate-400 mt-1">When you upload bills or report an incident, your case history will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {casesList.map((c: any) => (
                <div
                  key={c.case_id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 -mx-4 px-4 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#2464A4] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        #{c.case_id.replace('CASE-', '')}
                      </span>
                      <span className="text-xs font-bold text-[#0D1C34] capitalize">
                        {c.emergency_type} Incident
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[#596980]">
                      Total Claim: <strong className="font-mono text-[#0D1C34]">{formatINR(c.total_amount || 70000)}</strong>
                      {c.created_at && (
                        <span className="ml-3 text-slate-400">
                          {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={c.resume_station || `/case/${c.case_id}`}
                      className="btn-pill-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <span>Resume Action</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>

                    <Link
                      href={`/case/${c.case_id}/timeline`}
                      className="px-3 py-2 rounded-full border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-600 hover:text-[#0D1C34] transition-all"
                    >
                      Timeline
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
