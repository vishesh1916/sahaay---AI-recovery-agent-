'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  Shield,
  HeartPulse,
  Scale,
  Lock,
  Wallet,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Globe,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Building2,
  Activity,
  FileText,
  Zap,
  HelpCircle,
  Clock,
  Eye,
  Layers,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SoaringGooseSolo } from '@/components/sahaay/SoaringGeese';

export default function AboutSahaayPage() {
  const { language, setLanguage, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Fracture / Crisis Scenario Tab
  const [activeScenario, setActiveScenario] = useState<'medical' | 'vehicle' | 'income'>('medical');

  // Interactive Technology Architecture Tab
  const [activeTechTab, setActiveTechTab] = useState<'irdai' | 'flowpass' | 'settlement' | 'dpdp'>('irdai');

  // FlowPass ZK Token inspection toggle
  const [isZkMode, setIsZkMode] = useState(false);

  // Interactive FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Check real authenticated session
    if (typeof window !== 'undefined') {
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
        setIsScrolled(window.scrollY > 25);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const crisisScenarios = {
    medical: {
      id: 'medical',
      label: 'Hospital Billing Desk',
      icon: HeartPulse,
      title: 'The Proportionate Room Rent & Consumable Trap',
      subtitle: 'Average out-of-pocket deficit: ₹35,000 – ₹1,20,000',
      description:
        'Even with a ₹10 Lakh health policy, staying in a room ₹2,000 above the policy cap triggers proportional deduction across surgeon, OT, and nursing fees. Hospitals withhold discharge clearance until the cash deficit is cleared.',
      withoutSahaay: [
        'Confusing 6-page itemized hospital bill presented 30 minutes before discharge',
        'Arbitrary cuts applied to all line items, including valid pharmacy and pathology tests',
        'Family forced to scramble for emergency cash or borrow from relatives at 36% APR',
        'Discharge delayed 6 to 10 hours while waiting for physical insurance surveyor calls',
      ],
      withSahaay: [
        'Deterministic IRDAI 2024 clause extraction instantly shields pharmacy and diagnostic costs',
        'Mathematical out-of-pocket gap isolated with zero hallucination in under 60 seconds',
        'Pre-approved Paytm bridge liquidity settles counter gap directly to hospital accounts',
        'Soundbox audio clearance allows the patient to return home with dignity immediately',
      ],
      statLabel: 'Protected From Cuts',
      statValue: '100% IRDAI Compliant',
      statSub: 'Zero arbitrary deductions',
    },
    vehicle: {
      id: 'vehicle',
      label: 'Accident Repair Garage',
      icon: Scale,
      title: 'Collision Plastic & Metal Depreciation Penalties',
      subtitle: 'Average workshop impound delay: 7 to 14 Days',
      description:
        'Standard motor insurance policies enforce mandatory 50% depreciation on fiber and plastic panels, age depreciation on paint, and compulsory deductibles. Garages refuse vehicle handover without immediate co-pay.',
      withoutSahaay: [
        'Workshop quotes ₹45,000 in repair estimates with vague depreciation deductions',
        'Policyholder is left alone arguing whether body panels are plastic, metal, or fiberglass',
        'Vehicle sits locked in the garage lot, disrupting daily commute and family livelihood',
        'Manual document re-entry required for every spare part dispute',
      ],
      withSahaay: [
        'Automated IMT schedule audit separates zero-depreciation items from standard deductibles',
        'Digital repair quote verification directly with certified authorized service workshops',
        'FlowPass verified context authorizes immediate garage release without advance cash calls',
        'Zero out-of-pocket shock for parts legitimately covered by policy endorsements',
      ],
      statLabel: 'Handover Acceleration',
      statValue: 'Zero Garage Hold',
      statSub: 'Verified digital guarantee',
    },
    income: {
      id: 'income',
      label: 'Household Cash Flow',
      icon: Wallet,
      title: 'Post-Emergency Income Disability & Fixed EMI Shock',
      subtitle: 'Average monthly exposure: ₹18,000 – ₹50,000',
      description:
        'A medical trauma or physical injury halts work days and exhausts sick leave. Meanwhile, home rent, vehicle EMIs, utility bills, and children’s school fees do not stop, causing devastating liquidity failure.',
      withoutSahaay: [
        'Sudden medical expense exhausts emergency emergency savings in 48 hours',
        'Upcoming monthly loan auto-debits risk bouncing, destroying CIBIL scores',
        'Household turns to high-interest predatory payday apps or gold pawning',
        'Compounded emotional anxiety impairs physical patient recovery',
      ],
      withSahaay: [
        'FlowPass solvency proofs demonstrate verified income capacity without exposing private banking data',
        'Low-cost bridge liquidity provides breathing room for 30 to 90 day recovery periods',
        'Existing obligations and EMI calendars are factored into a realistic debt-free plan',
        'Household savings buffer stays guarded, ensuring long-term financial resilience',
      ],
      statLabel: 'Family Buffer Shield',
      statValue: 'Zero Default Risk',
      statSub: 'Structured recovery glidepath',
    },
  };

  const faqs = [
    {
      q: 'Why does health insurance rarely pay 100% of a private hospital bill in India?',
      a: 'Most health policies contain fine-print clauses such as Proportionate Room Rent Capping (Section 4.2), Co-Pay Deductibles, and Non-Medical Consumable Exclusions (Section 6.1). If you choose a room with a tariff higher than your policy limit (e.g., ₹7,000/day when your limit is ₹5,000/day), insurers often slash associated surgeon and nursing charges proportionally. Sahaay uses IRDAI master circular guidelines to ensure non-associated items like pharmacy and diagnostics are 100% protected from unlawful cuts.',
    },
    {
      q: 'What is FlowPass and how is it different from a loan or health card?',
      a: 'FlowPass is an open context continuity protocol, not a credit card or traditional loan. When you face an emergency, you verify your incident, bills, and identity once. FlowPass packages that verified context into a secure, single-use cryptographic token. When you need hospital clearance, insurance reimbursement, or bridge liquidity, you share the token without having to fill out the same 16+ form fields and submit physical xeroxes again.',
    },
    {
      q: 'Does Sahaay use generative AI to make financial or medical decisions?',
      a: 'No. Sahaay firmly rejects probabilistic AI or hallucinated confidence scores for financial arithmetic. We use deterministic algorithms that cross-reference itemized invoices against the exact policy schedules you upload and IRDAI circulars. If a policy clause contains conflicting wording, our system automatically pauses and routes it for human specialist review rather than guessing.',
    },
    {
      q: 'How does Sahaay protect my sensitive personal and health data?',
      a: 'Sahaay is built from the ground up to comply with India’s Digital Personal Data Protection (DPDP) Act 2023. We utilize Zero-Knowledge (ZK) proofs to verify solvency and insurance coverage without exposing your private banking balances or unnecessary medical diagnoses to third parties. We never sell user data, and you can invoke complete data deletion with a single click at any time.',
    },
    {
      q: 'How does Paytm instant desk settlement work at the hospital counter?',
      a: 'Once Sahaay calculates your exact out-of-pocket gap, you can choose to settle it immediately via Paytm UPI QR or pre-approved bridge funding. The hospital billing desk receives real-time transaction confirmation through the Paytm Soundbox audio chime, generating an immediate discharge receipt so your family does not have to wait hours at the counter.',
    },
  ];

  return (
    <div className="relative bg-[#9BB0D8] text-[#0D1C34] selection:bg-[#D9FF32] selection:text-[#0D1C34] min-h-screen overflow-x-hidden">
      
      {/* ==========================================================
          01. STICKY DYNAMIC NAVBAR (Integrated with Atmospheric Theme)
          ========================================================== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,padding,border-color,box-shadow] duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-3 border-b border-[#D9D3EF]/70'
            : 'bg-transparent py-5 sm:py-6 border-b border-transparent shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
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

          {/* Center Navigation Links */}
          <div
            className={`hidden lg:flex items-center gap-8 text-[13px] font-medium tracking-wide transition-colors ${
              isScrolled ? 'text-[#596980]' : 'text-white'
            }`}
          >
            <Link href="/" className="hover:text-white/80 transition-colors">
              {t('nav_home')}
            </Link>
            <Link href="/#how-it-works" className="hover:text-white/80 transition-colors">
              {t('nav_how_it_works')}
            </Link>
            <Link href="/#flowpass" className="hover:text-white/80 transition-colors">
              {t('nav_flowpass')}
            </Link>
            <Link
              href="/about"
              className={`font-bold transition-all relative py-1 ${
                isScrolled ? 'text-[#2464A4]' : 'text-white'
              }`}
            >
              <span>About Sahaay</span>
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D9FF32] rounded-full" />
            </Link>
            <Link href="/#security" className="hover:text-white/80 transition-colors">
              {t('nav_security')}
            </Link>
          </div>

          {/* Right: Language Switcher, Sign In, CTA */}
          <div className="flex items-center gap-3">
            {/* Interactive Language Selector */}
            <div
              className={`hidden sm:inline-flex items-center p-0.5 rounded-full border transition-all ${
                isScrolled
                  ? 'bg-slate-100/90 border-slate-300 text-[#0D1C34]'
                  : 'bg-black/25 backdrop-blur-md border-white/20 text-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                  language === 'en'
                    ? isScrolled ? 'bg-[#0D1C34] text-white shadow-xs' : 'bg-white text-[#0D1C34] shadow-xs'
                    : 'hover:opacity-100 opacity-70'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                  language === 'hi'
                    ? isScrolled ? 'bg-[#0D1C34] text-white shadow-xs' : 'bg-white text-[#0D1C34] shadow-xs'
                    : 'hover:opacity-100 opacity-70'
                }`}
              >
                हि
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hinglish')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                  language === 'hinglish'
                    ? 'bg-[#D9FF32] text-[#0D1C34] shadow-xs'
                    : 'hover:opacity-100 opacity-70'
                }`}
              >
                Hinglish
              </button>
            </div>

            {/* User Profile or Sign In */}
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

            {/* Primary Action Button */}
            <Link
              href={currentUser ? "/home" : "/consent?redirect=/intake"}
              className="btn-pill-white text-xs py-2 px-4 sm:px-5 font-semibold shadow-md active:scale-95 inline-flex items-center gap-1.5"
            >
              <span>{currentUser ? "Open Dashboard" : "Start With Sahaay"}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl transition-colors ${
                isScrolled ? 'text-[#0D1C34] hover:bg-slate-100' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-5 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 text-[#0D1C34]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold hover:text-[#2464A4]"
            >
              Home
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold hover:text-[#2464A4]"
            >
              How It Works
            </Link>
            <Link
              href="/#flowpass"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold hover:text-[#2464A4]"
            >
              FlowPass Protocol
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-[#2464A4]"
            >
              About Sahaay
            </Link>
            <Link
              href="/#security"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold hover:text-[#2464A4]"
            >
              Security &amp; Privacy
            </Link>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/consent"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-[#596980]"
              >
                Sign In
              </Link>
              <Link
                href="/intake"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-volt text-xs py-2 px-4 inline-flex items-center gap-1"
              >
                <span>Start Intake</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ==========================================================
          02. HERO: INSTITUTIONAL MISSION & STATS
          (Notice: Pill badge from Image 2 is permanently removed)
          ========================================================== */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Soaring Geese Background Motif */}
        <div className="absolute top-16 left-8 sm:left-24 opacity-60 pointer-events-none hidden md:block">
          <SoaringGooseSolo size={56} opacity={0.65} />
        </div>
        <div className="absolute top-28 right-8 sm:right-20 opacity-45 pointer-events-none hidden md:block">
          <SoaringGooseSolo size={42} opacity={0.5} />
        </div>

        {/* Clean Editorial Display Headline */}
        <h1 className="font-serif-editorial text-4xl sm:text-6xl md:text-[4.5rem] font-normal tracking-tight text-white leading-[1.12] drop-shadow-sm max-w-4xl mx-auto">
          Financial emergencies shouldn't become financial ruin.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-normal">
          Sahaay was built to solve the hidden, devastating crisis of sudden out-of-pocket gaps during life-critical hospitalizations, vehicle collisions, and acute income interruptions.
        </p>

        {/* Action CTAs */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/intake"
            className="btn-pill-white text-xs sm:text-sm py-3.5 px-8 font-bold shadow-2xl inline-flex items-center gap-2 group hover:scale-[1.02] transition-transform"
          >
            <span>Start With Sahaay</span>
            <ArrowRight className="h-4 w-4 text-[#0D1C34] group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/#how-it-works"
            className="btn-translucent-light text-xs sm:text-sm py-3.5 px-6 font-semibold inline-flex items-center gap-2"
          >
            <span>Explore 7-Station Journey</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Real-World Key Performance Guarantees */}
        <div className="mt-14 sm:mt-18 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="rounded-2xl p-4 sm:p-5 bg-white/20 backdrop-blur-md border border-white/30 text-white">
            <div className="flex items-center gap-2 text-[#D9FF32] mb-1 font-mono text-xs font-bold">
              <Zap className="h-3.5 w-3.5" />
              <span>DETERMINISTIC</span>
            </div>
            <div className="font-serif-editorial text-2xl sm:text-3xl font-normal text-white">100% Math</div>
            <p className="text-[11px] text-white/80 mt-1 leading-snug">Zero hallucinated confidence scores or guesses</p>
          </div>

          <div className="rounded-2xl p-4 sm:p-5 bg-white/20 backdrop-blur-md border border-white/30 text-white">
            <div className="flex items-center gap-2 text-[#D9FF32] mb-1 font-mono text-xs font-bold">
              <Shield className="h-3.5 w-3.5" />
              <span>IRDAI 2024</span>
            </div>
            <div className="font-serif-editorial text-2xl sm:text-3xl font-normal text-white">Protected</div>
            <p className="text-[11px] text-white/80 mt-1 leading-snug">Pharmacy &amp; lab tests shielded from room rent cuts</p>
          </div>

          <div className="rounded-2xl p-4 sm:p-5 bg-white/20 backdrop-blur-md border border-white/30 text-white">
            <div className="flex items-center gap-2 text-[#D9FF32] mb-1 font-mono text-xs font-bold">
              <Layers className="h-3.5 w-3.5" />
              <span>FLOWPASS</span>
            </div>
            <div className="font-serif-editorial text-2xl sm:text-3xl font-normal text-white">16+ Fields</div>
            <p className="text-[11px] text-white/80 mt-1 leading-snug">Redundant paperwork eliminated with single-use tokens</p>
          </div>

          <div className="rounded-2xl p-4 sm:p-5 bg-white/20 backdrop-blur-md border border-white/30 text-white">
            <div className="flex items-center gap-2 text-[#D9FF32] mb-1 font-mono text-xs font-bold">
              <Lock className="h-3.5 w-3.5" />
              <span>DPDP ACT 2023</span>
            </div>
            <div className="font-serif-editorial text-2xl sm:text-3xl font-normal text-white">Zero Selling</div>
            <p className="text-[11px] text-white/80 mt-1 leading-snug">Zero data monetization &amp; one-click erasure rights</p>
          </div>
        </div>
      </section>

      {/* ==========================================================
          03. INTERACTIVE CRISIS SCENARIO EXPLORER
          Users can switch between Hospital, Workshop, and Income shocks
          to see "Without Sahaay" vs "With Sahaay" live!
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-white px-3 py-1 rounded-full shadow-xs">
            THE REAL-WORLD PROBLEM
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
            How one emergency fragments into multiple crises.
          </h2>
          <p className="mt-3 text-base text-[#0D1C34]/85 leading-relaxed">
            Click across the three primary emergency categories to explore the operational breakdown families encounter, and how Sahaay fundamentally resolves it.
          </p>
        </div>

        {/* Interactive Scenario Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {(Object.keys(crisisScenarios) as Array<keyof typeof crisisScenarios>).map((key) => {
            const item = crisisScenarios[key];
            const Icon = item.icon;
            const isSelected = activeScenario === key;
            return (
              <button
                key={key}
                onClick={() => setActiveScenario(key)}
                className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#2464A4] shadow-xl ring-2 ring-[#2464A4]/30 scale-[1.02]'
                    : 'bg-white/80 border-white/60 hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#2464A4] text-white' : 'bg-slate-100 text-[#596980]'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider block text-[#596980]">
                      Scenario {key === 'medical' ? '01' : key === 'vehicle' ? '02' : '03'}
                    </span>
                    <h3 className="text-sm font-bold text-[#0D1C34]">{item.label}</h3>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-50 text-[#2464A4]' : 'text-slate-400'}`}>
                  {isSelected ? 'Viewing' : 'Inspect'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Scenario Interactive Display Card */}
        {(() => {
          const current = crisisScenarios[activeScenario];
          return (
            <div className="rounded-[32px] sm:rounded-[40px] bg-white border border-white/80 p-6 sm:p-10 shadow-2xl animate-in fade-in duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2464A4]">
                    {current.label} • Deep Dive
                  </span>
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl font-normal text-[#0D1C34] mt-1">
                    {current.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                    {current.description}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 shrink-0 lg:text-right">
                  <span className="text-[10px] uppercase font-bold text-[#596980] block">
                    {current.statLabel}
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#2464A4] block mt-0.5">
                    {current.statValue}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">{current.statSub}</span>
                </div>
              </div>

              {/* Side-by-Side: Without Sahaay vs With Sahaay */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Traditional / Broken Experience */}
                <div className="p-6 rounded-3xl bg-red-50/60 border border-red-200/80">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-800">
                      Without Sahaay (The Broken Status Quo)
                    </span>
                  </div>
                  <ul className="space-y-3.5 text-xs text-red-950">
                    {current.withoutSahaay.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sahaay Guided Experience */}
                <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200/80">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      With Sahaay (Deterministic Dignity)
                    </span>
                  </div>
                  <ul className="space-y-3.5 text-xs text-emerald-950">
                    {current.withSahaay.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ==========================================================
          04. INTERACTIVE TECHNOLOGY & ARCHITECTURE DEEP-DIVE
          Inspect IRDAI 2024, FlowPass Protocol, Settlement, DPDP
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[36px] sm:rounded-[48px] bg-white border border-white/80 p-8 sm:p-14 shadow-2xl">
          <div className="max-w-3xl mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-[#E8E4F6] px-3 py-1 rounded-full font-mono">
              THE SAHAAY STANDARD
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
              Deterministic systems. Never black boxes.
            </h2>
            <p className="mt-3 text-base text-[#596980]">
              Explore the four core engineering standards that power every automated audit and settlement on the Sahaay platform.
            </p>
          </div>

          {/* Interactive Technology Selector Pills */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            <button
              onClick={() => setActiveTechTab('irdai')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTechTab === 'irdai'
                  ? 'bg-[#0D1C34] text-white shadow-md'
                  : 'bg-slate-100 text-[#596980] hover:bg-slate-200'
              }`}
            >
              1. IRDAI 2024 Audit Engine
            </button>
            <button
              onClick={() => setActiveTechTab('flowpass')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTechTab === 'flowpass'
                  ? 'bg-[#2464A4] text-white shadow-md'
                  : 'bg-slate-100 text-[#596980] hover:bg-slate-200'
              }`}
            >
              2. FlowPass ZK Continuity
            </button>
            <button
              onClick={() => setActiveTechTab('settlement')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTechTab === 'settlement'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 text-[#596980] hover:bg-slate-200'
              }`}
            >
              3. Paytm Desk Settlement
            </button>
            <button
              onClick={() => setActiveTechTab('dpdp')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTechTab === 'dpdp'
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'bg-slate-100 text-[#596980] hover:bg-slate-200'
              }`}
            >
              4. DPDP Act 2023 Shield
            </button>
          </div>

          {/* Active Architecture Card Content */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF9F6] border border-slate-200">
            {activeTechTab === 'irdai' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-5 w-5 text-[#2464A4]" />
                    <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                      Deterministic IRDAI Master Circular Compliance
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#2464A4] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    CIRCULAR: 2024/HLT/07
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#596980] leading-relaxed">
                  In 2024, the Insurance Regulatory and Development Authority of India (IRDAI) mandated that insurers cannot arbitrarily cut non-associated medical expenses (such as pharmacy medicines, intravenous drips, blood tests, and MRI imaging) simply because a patient opted for a higher-tier room.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs">
                    <span className="font-bold text-[#0D1C34] block mb-1">Associated Medical Fees</span>
                    <p className="text-[#596980]">Surgeon, OT, and nursing fees may be subjected to proportionate capping based on eligible tariff ratio.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                    <span className="font-bold text-emerald-900 block mb-1">Protected Non-Associated Expenses</span>
                    <p className="text-emerald-800">Pharmacy, blood bank, diagnostic pathology, and implants are strictly shielded from proportionate deductions.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTechTab === 'flowpass' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                      Zero-Knowledge Context Continuity Protocol
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsZkMode(!isZkMode)}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="h-3 w-3" />
                    <span>{isZkMode ? 'Show Audited View' : 'Show ZK Token View'}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-[#596980] leading-relaxed">
                  FlowPass eliminates redundant document requests across the care continuum. Instead of repeatedly photocopying Aadhaar cards, PAN cards, and discharge notes, context travels via single-use encrypted tokens.
                </p>
                {!isZkMode ? (
                  <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-[#0D1C34] block">Identity Context</span>
                      <span className="text-[#596980] text-[11px]">Verified beneficiary record with zero manual re-entry.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-[#0D1C34] block">Incident Ledger</span>
                      <span className="text-[#596980] text-[11px]">Itemized diagnosis and admission credentials preserved.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-[#0D1C34] block">Solvency Guarantee</span>
                      <span className="text-[#596980] text-[11px]">Bridge liquidity authorization confirmed in advance.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-1.5">
                    <div className="text-emerald-400 font-bold">FLOWPASS_ZK_ENCRYPTED_TOKEN_PAYLOAD:</div>
                    <div className="text-slate-400 text-[11px] break-all">
                      TOKEN: eyJhbGciOiJFRDI1NTE5IiwicnByb29mIjoiWktfU05BUktfQkFMQU5DRV9PQyJ9...
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      IDENTITY_COMMITMENT: SHA256: 8f4a21ec90b8f104d5e... (Zero PII Exposed)
                    </div>
                    <div className="text-purple-400 text-[11px]">
                      VERIFICATION: SIGNED_BY_COUNTER_DESK_PROTOCOL (ED25519)
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTechTab === 'settlement' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-[#002E6E]" />
                    <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                      Paytm Bridge Liquidity &amp; Soundbox Audio Verification
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#00BAF2] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    INSTANT DISCHARGE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#596980] leading-relaxed">
                  Instead of waiting for physical reimbursement checks that take 45 to 60 days to arrive by post, Sahaay integrates with Paytm institutional settlement rails. The audited gap is paid immediately to the hospital counter or authorized garage.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-[#0D1C34] block mb-1">Direct Desk Disbursement</span>
                    <p className="text-[#596980]">Funds land directly in the hospital cashier’s merchant account via instant UPI or bridge credit line.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                    <span className="font-bold text-emerald-900 block mb-1">Soundbox Audio Clearance</span>
                    <p className="text-emerald-800">Real-time voice chime confirms payment instantly, eliminating administrative counter arguments.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTechTab === 'dpdp' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                      DPDP Act 2023 Compliance &amp; Client-Side Sovereignty
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                    ZERO DATA SELLING
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#596980] leading-relaxed">
                  Your medical diagnostic records, vehicle registration, and salary slips belong exclusively to you. Sahaay treats emergency financial data with strict legal fiduciary respect.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-[#0D1C34] block mb-1">Zero Commercialization</span>
                    <p className="text-[#596980] text-[11px]">We never sell, rent, or broker user telemetry or medical histories.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-[#0D1C34] block mb-1">Ephemeral Storage</span>
                    <p className="text-[#596980] text-[11px]">Unconsented documents expire automatically after audit clearance.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-[#0D1C34] block mb-1">Right to Erasure</span>
                    <p className="text-[#596980] text-[11px]">One-click purge deletes every byte associated with your case.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================================
          05. OUR CORE PHILOSOPHY & VALUES
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-white px-3 py-1 rounded-full shadow-xs">
            WHY WE EXIST
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
            Built on radical dignity and mathematical truth.
          </h2>
          <p className="mt-3 text-base text-[#0D1C34]/85">
            Nobody should have to negotiate insurance legalities while holding their family member’s hand in an ICU.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-white/95 border border-white/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="h-11 w-11 rounded-2xl bg-blue-50 text-[#2464A4] flex items-center justify-center mb-5">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="font-serif-editorial text-xl font-normal text-[#0D1C34]">
                Radical Certainty
              </h3>
              <p className="text-xs text-[#596980] mt-2 leading-relaxed">
                We never tell patients what "might" happen. Every out-of-pocket calculation is mathematically proven against policy clauses.
              </p>
            </div>
            <span className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-[#2464A4] font-bold">
              01 • CERTAINTY
            </span>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-white/95 border border-white/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <HeartPulse className="h-5 w-5" />
              </div>
              <h3 className="font-serif-editorial text-xl font-normal text-[#0D1C34]">
                Patient Dignity
              </h3>
              <p className="text-xs text-[#596980] mt-2 leading-relaxed">
                Emergency desks are places of human vulnerability. Our technology removes bureaucratic friction so families can focus on care.
              </p>
            </div>
            <span className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-emerald-700 font-bold">
              02 • DIGNITY
            </span>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-white/95 border border-white/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="font-serif-editorial text-xl font-normal text-[#0D1C34]">
                Zero Kickbacks
              </h3>
              <p className="text-xs text-[#596980] mt-2 leading-relaxed">
                We never take commissions on claim rejections or inflated bills. Our sole fiduciary obligation is to the recovering patient.
              </p>
            </div>
            <span className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-purple-700 font-bold">
              03 • FIDUCIARY
            </span>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-white/95 border border-white/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-serif-editorial text-xl font-normal text-[#0D1C34]">
                Zero Starting Over
              </h3>
              <p className="text-xs text-[#596980] mt-2 leading-relaxed">
                When you share verified context once, it travels forward. Traumatized people must never be forced to re-fill 5-page forms.
              </p>
            </div>
            <span className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-amber-800 font-bold">
              04 • CONTINUITY
            </span>
          </div>
        </div>
      </section>

      {/* ==========================================================
          06. INSTITUTIONAL ECOSYSTEM
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-white px-3 py-1 rounded-full shadow-xs">
            INSTITUTIONAL ECOSYSTEM
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
            Integrated across India's health &amp; finance rails.
          </h2>
        </div>

        <div className="rounded-[32px] bg-white/95 backdrop-blur-md p-8 sm:p-12 border border-white/80 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center text-center">
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200 hover:border-[#2464A4] transition-all hover:scale-105">
              <span className="font-bold text-sm text-[#0D1C34] block">MAX HEALTHCARE</span>
              <span className="text-[10px] text-[#2464A4] font-semibold mt-1 inline-block">Hospital Network</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200 hover:border-[#2464A4] transition-all hover:scale-105">
              <span className="font-bold text-sm text-[#0D1C34] block">APOLLO HOSPITALS</span>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">Counter Clearance</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200 hover:border-[#2464A4] transition-all hover:scale-105">
              <span className="font-bold text-sm text-[#0D1C34] block">HDFC ERGO</span>
              <span className="text-[10px] text-purple-700 font-semibold mt-1 inline-block">Policy Mapping</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200 hover:border-[#00BAF2] transition-all hover:scale-105">
              <span className="font-bold text-sm text-[#002E6E] block">PAYTM</span>
              <span className="text-[10px] text-[#00BAF2] font-semibold mt-1 inline-block">Soundbox Settlement</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200 hover:border-[#2464A4] transition-all hover:scale-105">
              <span className="font-bold text-sm text-[#0D1C34] block">ICICI LOMBARD</span>
              <span className="text-[10px] text-[#2464A4] font-semibold mt-1 inline-block">Claim Verification</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          07. INTERACTIVE FAQ & TRUTH IN HEALTHCARE
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-white px-3 py-1 rounded-full shadow-xs">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
            Truth in emergency healthcare &amp; finance.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-white border border-white/80 shadow-md overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <span className="font-serif-editorial text-lg sm:text-xl font-normal text-[#0D1C34]">
                    {faq.q}
                  </span>
                  <div className={`p-2 rounded-full transition-transform ${isOpen ? 'bg-[#2464A4] text-white rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#596980] leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================================
          08. CALL TO ACTION
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
                className="btn-pill-white text-sm sm:text-base py-3.5 px-8 shadow-2xl inline-flex items-center gap-2 group"
              >
                <span>Start With Sahaay</span>
                <ArrowRight className="h-4 w-4 text-[#0D1C34] group-hover:translate-x-0.5 transition-transform" />
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
          09. CLEAN MINIMAL FOOTER
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
            <Link href="/about" className="hover:text-white transition-colors text-white font-bold underline underline-offset-4 decoration-[#D9FF32]">About Sahaay</Link>
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
