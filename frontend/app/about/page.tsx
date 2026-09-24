'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Shield,
  HeartPulse,
  Scale,
  Lock,
  Wallet,
  Building2,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  UserCheck,
  Zap,
  Globe2,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function AboutSahaayPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check real authenticated session
    const storedUser = localStorage.getItem('sahaay_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch {
        setCurrentUser(null);
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-[#9BB0D8] text-[#0D1C34] selection:bg-[#D9FF32] selection:text-[#0D1C34] min-h-screen overflow-x-hidden">
      {/* ==========================================================
          01. STICKY NAVBAR
          ========================================================== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-3.5 border-b border-[#D9D3EF]/70'
            : 'bg-transparent py-5 sm:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
            <div className="relative h-8 sm:h-9 w-36 sm:w-44">
              <Image
                src={isScrolled ? '/images/sahaay_logo.png' : '/images/sahaay_logo_white.png'}
                alt="Sahaay - Your Financial Journey Partner"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          <div
            className={`hidden lg:flex items-center gap-8 text-[13px] font-medium tracking-wide transition-colors ${
              isScrolled ? 'text-[#596980]' : 'text-white'
            }`}
          >
            <Link href="/" className="hover:text-white/80 transition-colors">
              Home
            </Link>
            <Link href="/#how-it-works" className="hover:text-white/80 transition-colors">
              How It Works
            </Link>
            <Link href="/#flowpass" className="hover:text-white/80 transition-colors">
              FlowPass
            </Link>
            <Link href="/about" className="font-bold underline underline-offset-4 decoration-[#D9FF32] decoration-2 text-white">
              About Sahaay
            </Link>
            <Link href="/#security" className="hover:text-white/80 transition-colors">
              Security
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                href="/home"
                className={`hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                  isScrolled
                    ? 'text-[#0D1C34] bg-slate-100 hover:bg-slate-200 border border-slate-300'
                    : 'text-white bg-white/15 hover:bg-white/25 border border-white/30'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{currentUser.name?.split(' ')[0] || 'Member'} • Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/consent"
                className={`hidden md:inline-flex text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                  isScrolled
                    ? 'text-[#596980] border border-slate-300 hover:text-[#0D1C34]'
                    : 'text-white border border-white/30 hover:bg-white/10'
                }`}
              >
                Sign In
              </Link>
            )}

            <Link
              href={currentUser ? "/home" : "/consent?redirect=/intake"}
              className="btn-pill-white text-xs py-2 px-4 sm:px-5 font-semibold shadow-md active:scale-95 inline-flex items-center gap-1.5"
            >
              <span>{currentUser ? "My Dashboard" : "Start With Sahaay"}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ==========================================================
          02. HERO: INSTITUTIONAL MISSION
          ========================================================== */}
      <section className="relative pt-36 sm:pt-44 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/25 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white uppercase tracking-widest mb-6 border border-white/40">
          <span className="h-2 w-2 rounded-full bg-[#D9FF32] animate-pulse" />
          <span>ABOUT SAHAAY TECHNOLOGIES</span>
        </div>

        <h1 className="font-serif-editorial text-4xl sm:text-6xl md:text-[4.25rem] font-normal tracking-tight text-white leading-[1.12] drop-shadow-sm max-w-4xl mx-auto">
          Financial emergencies shouldn't become financial ruin.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-normal">
          Sahaay was founded to solve a silent, devastating crisis: the sudden out-of-pocket gap during life-critical hospitalizations, vehicle accidents, and income shocks.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/intake"
            className="btn-pill-white text-xs sm:text-sm py-3 px-7 font-bold shadow-xl inline-flex items-center gap-2"
          >
            <span>Start With Sahaay</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/#how-it-works"
            className="btn-translucent-light text-xs sm:text-sm py-3 px-6 font-semibold inline-flex items-center gap-2"
          >
            <span>Explore The Connected Journey</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ==========================================================
          03. THE THREE EMERGENCY FRACTURES
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-white px-3 py-1 rounded-full">
            THE CRISIS WE SOLVE
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
            One incident creates multiple cascading problems.
          </h2>
          <p className="mt-3 text-base text-[#0D1C34]/80">
            When an emergency strikes in India, medical trauma is immediately followed by administrative and cash-flow shockwaves.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Fracture 01: Medical Gap */}
          <div className="rounded-[32px] p-7 sm:p-8 bg-white border border-white/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                <HeartPulse className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-widest block mb-1">
                FRACTURE 01
              </span>
              <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                The Hospital Billing Trap
              </h3>
              <p className="text-xs sm:text-sm text-[#596980] mt-3 leading-relaxed">
                Even with comprehensive health insurance, policyholders face arbitrary 20% to 40% out-of-pocket deductions at the billing desk due to proportionate room rent capping and non-payable consumables lists.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0D1C34]">
              <span>Average Gap</span>
              <span className="font-mono text-red-600">₹30,000 – ₹1,20,000</span>
            </div>
          </div>

          {/* Fracture 02: Vehicle Repair Impounds */}
          <div className="rounded-[32px] p-7 sm:p-8 bg-white border border-white/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                <Scale className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-widest block mb-1">
                FRACTURE 02
              </span>
              <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                Collision Depreciation Gaps
              </h3>
              <p className="text-xs sm:text-sm text-[#596980] mt-3 leading-relaxed">
                Motor insurance policies apply mandatory 50% plastic depreciation, age-based metal cuts, and scrap salvage retention. Garages refuse vehicle release until the family pays upfront in cash.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0D1C34]">
              <span>Vehicle Impound Delay</span>
              <span className="font-mono text-amber-700">7 to 14 Days</span>
            </div>
          </div>

          {/* Fracture 03: Income Interruption */}
          <div className="rounded-[32px] p-7 sm:p-8 bg-white border border-white/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#2464A4] flex items-center justify-center mb-6">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-[#2464A4] uppercase tracking-widest block mb-1">
                FRACTURE 03
              </span>
              <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                Unpaid Recovery Deficit
              </h3>
              <p className="text-xs sm:text-sm text-[#596980] mt-3 leading-relaxed">
                Bed rest and physical therapy often exhaust paid medical leave, while fixed obligations (rent, EMI, school fees) continue unabated, driving middle-class families into predatory high-interest debt.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0D1C34]">
              <span>Monthly EMI Exposure</span>
              <span className="font-mono text-[#2464A4]">₹15,000 – ₹45,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          04. THE SAHAAY STANDARD: HOW WE ARE BUILT
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[36px] sm:rounded-[48px] bg-white border border-white/80 p-8 sm:p-14 shadow-2xl">
          <div className="max-w-3xl mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-[#E8E4F6] px-3 py-1 rounded-full">
              THE SAHAAY ARCHITECTURE
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
              Deterministic intelligence. Zero black boxes.
            </h2>
            <p className="mt-3 text-base text-[#596980]">
              We reject arbitrary LLM guesswork. Every audit calculation is bounded by signed policy schedules and official regulatory rules.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF9F6] border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#2464A4] text-white">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <h4 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                  IRDAI 2024 Clause Mapping
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-[#596980] leading-relaxed">
                Under IRDAI Master Circular guidelines, insurers are prohibited from applying proportionate room rent deductions to non-associated expenses such as pharmacy and diagnostic tests. Sahaay automatically isolates these deductions and protects every eligible rupee.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF9F6] border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                  FlowPass Continuity Protocol
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-[#596980] leading-relaxed">
                Rather than forcing traumatized families to re-enter their KYC, hospital bills, and policy limits at every counter, FlowPass packages verified context into a reusable token that carries forward automatically to bridge lenders and hospital desks.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF9F6] border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                  <Lock className="h-5 w-5" />
                </div>
                <h4 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                  DPDP Act 2023 Compliance
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-[#596980] leading-relaxed">
                Your medical prescriptions, identity proofs, and salary records belong strictly to you. Sahaay operates on a Zero-Knowledge paradigm with client-side encryption, zero data selling, and one-click Right to Erasure controls.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF9F6] border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#002E6E] text-white">
                  <Wallet className="h-5 w-5" />
                </div>
                <h4 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                  Paytm Institutional Execution
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-[#596980] leading-relaxed">
                Integrated directly with Paytm payment gateways, Paytm Soundbox voice confirmation, and pre-approved emergency credit lines, allowing patients to settle bills and walk out of the hospital without waiting hours for claim managers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          05. INSTITUTIONAL ECOSYSTEM
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-white/80 mb-2">
            TRUSTED PARTNER ECOSYSTEM
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
            Integrated with India's leading institutions.
          </h2>
        </div>

        <div className="rounded-[32px] bg-white/95 backdrop-blur-md p-8 sm:p-12 border border-white/80 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-sm text-[#0D1C34] block">MAX HEALTHCARE</span>
              <span className="text-[10px] text-[#596980]">Provider Integration</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-sm text-[#0D1C34] block">APOLLO HOSPITALS</span>
              <span className="text-[10px] text-[#596980]">Direct Desk Clearance</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-sm text-[#0D1C34] block">HDFC ERGO</span>
              <span className="text-[10px] text-[#596980]">Policy Audit Mapping</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-sm text-[#002E6E] block">PAYTM</span>
              <span className="text-[10px] text-[#00BAF2]">Bridge Liquidity Desk</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-sm text-[#0D1C34] block">ICICI LOMBARD</span>
              <span className="text-[10px] text-[#596980]">Clause Verification</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          06. CALL TO ACTION
          ========================================================== */}
      <section className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-[36px] sm:rounded-[48px] bg-gradient-to-br from-[#1E5FA8] via-[#2464A4] to-[#0D1C34] text-white p-10 sm:p-16 lg:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-block rounded-full bg-white/15 backdrop-blur-md px-4 py-1 text-xs font-bold text-[#D9FF32] uppercase tracking-wider mb-6">
              RECOVER WITH DIGNITY
            </span>

            <h2 className="font-serif-editorial text-4xl sm:text-6xl font-normal tracking-tight text-white leading-[1.14]">
              Start your emergency recovery with Sahaay today.
            </h2>

            <p className="mt-6 text-base sm:text-lg text-blue-100 max-w-xl mx-auto leading-relaxed">
              Upload your hospital bill, repair quote, or income interruption slip to generate your verified audit and bridge funding in minutes.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/intake"
                className="btn-pill-white text-sm sm:text-base py-3.5 px-8 shadow-2xl"
              >
                <span>Start With Sahaay</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="btn-translucent-light text-sm sm:text-base py-3.5 px-7 cursor-pointer"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          07. FOOTER
          ========================================================== */}
      <footer className="border-t border-white/20 py-12 px-4 sm:px-6 lg:px-8 text-white/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 group transition-opacity hover:opacity-90">
            <div className="relative h-9 w-40">
              <Image
                src="/images/sahaay_logo_white.png"
                alt="Sahaay - Your Financial Journey Partner"
                fill
                className="object-contain object-left"
              />
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-white/80">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="/#flowpass" className="hover:text-white transition-colors">FlowPass</Link>
            <Link href="/about" className="hover:text-white transition-colors text-white font-bold">About Sahaay</Link>
            <Link href="/#security" className="hover:text-white transition-colors">Security</Link>
            <Link href="/consent" className="hover:text-white transition-colors">Sign In</Link>
          </div>

          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} SAHAAY Technologies. Powered by FlowPass Protocol.
          </p>
        </div>
      </footer>
    </div>
  );
}
