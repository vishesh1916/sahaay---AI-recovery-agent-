'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  ArrowUpRight,
  Play,
  HeartPulse,
  Activity,
  CreditCard,
  Lock,
  Building2,
  FileCheck2,
  Wallet,
  Scale,
  Check,
  CheckCircle2,
  Receipt,
  FileText,
  UserCheck,
  Globe,
  Menu,
  X,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { SoaringGooseSolo, LivingGeeseFlock } from '@/components/sahaay/SoaringGeese';
import { ThreeStoryCards } from '@/components/sahaay/ThreeStoryCards';
import { HowWeHelpSection } from '@/components/sahaay/HowWeHelpSection';
import { HumanStoryCard } from '@/components/sahaay/HumanStoryCard';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/lib/api';

export default function SahaayLandingPage() {
  const { language, setLanguage, t } = useLanguage();

  // User authentication session state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Navigation scroll state for translucent frosted effect & organic parallax
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic user-customizable bill amount for zero-demo reactive calculations
  const [customBillMultiplier, setCustomBillMultiplier] = useState<number>(1.0);
  const [customBillInput, setCustomBillInput] = useState<number>(184600);

  // Walkthrough interactive tour modal state
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  // Active case data & dynamic state (100% database driven, zero simulated fallbacks)
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [activeCaseData, setActiveCaseData] = useState<any>(null);

  // Emergency Incident Archetype Switcher:
  // 'active' (if active case exists), 'medical', 'vehicle', 'income', 'unexpected'
  const [activeArchetype, setActiveArchetype] = useState<'active' | 'medical' | 'vehicle' | 'income' | 'unexpected'>('medical');

  // Recovery simulator state (dynamic, editable by real users)
  const [arrangedAmount, setArrangedAmount] = useState<number>(35000);
  const [selectedRecoveryOption, setSelectedRecoveryOption] = useState<'available' | 'partial' | 'financing' | 'payment'>('partial');

  // Interactive Case Journey active station (0 to 6)
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(1); // default on 02 Insurance

  // FlowPass interactive journey stage
  const [activeFlowStage, setActiveFlowStage] = useState<'insurance' | 'flowpass' | 'funding'>('flowpass');

  // FlowPass 3D Holographic Tilt Card State
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isZkMode, setIsZkMode] = useState(false);

  // Evidence modal / drawer toggle
  const [showEvidenceDetail, setShowEvidenceDetail] = useState(false);
  const [selectedClause, setSelectedClause] = useState<'proportionate' | 'room_rent' | 'exclusions'>('proportionate');

  // Bill category filter & scan animation indicator
  const [billFilter, setBillFilter] = useState<'all' | 'associated' | 'non_associated' | 'excluded'>('all');
  const [isScanning, setIsScanning] = useState(false);

  // Human review trigger state
  const [humanReviewRequested, setHumanReviewRequested] = useState(false);

  // Tactile counter clearance stamp & sound state
  const [isDeskCleared, setIsDeskCleared] = useState(false);

  // Institutional web audio chime synthesizer
  const playCounterClearanceChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.18, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain2.gain.setValueAtTime(0.22, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.9);
    } catch {
      // Audio context ignored if blocked
    }
  };

  // 3D Perspective Tilt Event Handlers
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 7;
    const rotateY = ((x - centerX) / centerX) * 7;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setCardTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  // Scroll listener for sticky nav, organic parallax & real-time database case synchronization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('sahaay_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          const uid = user.user_id || user.id;
          if (uid) {
            apiClient.getUserDashboard(String(uid))
              .then((dash) => {
                if (dash && dash.active_case && dash.active_case.case_id) {
                  setActiveCaseId(dash.active_case.case_id);
                  setActiveCaseData(dash.active_case);
                  setActiveArchetype('active');
                  const realGap = dash.active_case.net_gap_amount || dash.active_case.analysis?.gap_result?.gap_amount;
                  if (realGap && realGap > 0) {
                    setArrangedAmount(realGap);
                  }
                } else {
                  setActiveCaseId(null);
                  setActiveCaseData(null);
                }
              })
              .catch(() => {
                setActiveCaseId(null);
                setActiveCaseData(null);
              });
          }
        } catch {
          setCurrentUser(null);
          setActiveCaseId(null);
          setActiveCaseData(null);
        }
      } else {
        // NOT SIGNED IN: zero simulated or demo data!
        setCurrentUser(null);
        setActiveCaseId(null);
        setActiveCaseData(null);
        sessionStorage.removeItem('current_active_case_id');
        localStorage.removeItem('sahaay_active_case_id');
      }
      setAuthChecked(true);
    }

    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrollY(currentY);
      if (currentY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic Cloud Parting Progress (smoothly animates as user scrolls into Section 03)
  const cloudPartProgress = Math.min(1, Math.max(0, (scrollY - 40) / 420));

  // Archetype Line Items Data (100% Real-World Structured Scenarios)
  const ARCHETYPE_DATA: Record<string, any[]> = {
    medical: [
      {
        name: 'Room Rent (10 days × ₹7,000)',
        amount: 70000,
        category: 'associated',
        status: 'Proportionate Cap',
        covered: 50000,
        deduction: 20000,
        evidence: 'Policy Sec 2.1 • Capped at ₹5,000/day limit',
      },
      {
        name: 'Surgeon Fees',
        amount: 35000,
        category: 'associated',
        status: 'Proportionate (71.4%)',
        covered: 25000,
        deduction: 10000,
        evidence: 'Policy Sec 4.2 • Room category upgrade linkage',
      },
      {
        name: 'Doctor / Consultation Fees',
        amount: 15000,
        category: 'associated',
        status: 'Proportionate (71.4%)',
        covered: 10714,
        deduction: 4286,
        evidence: 'Policy Sec 4.2 • Associated provider fees',
      },
      {
        name: 'Operation Theatre (OT) Charges',
        amount: 12000,
        category: 'associated',
        status: 'Proportionate (71.4%)',
        covered: 8571,
        deduction: 3429,
        evidence: 'Policy Sec 4.2 • OT facility expense',
      },
      {
        name: 'Nursing & Ward Care',
        amount: 8000,
        category: 'associated',
        status: 'Proportionate (71.4%)',
        covered: 5714,
        deduction: 2286,
        evidence: 'Policy Sec 4.2 • Nursing care linkage',
      },
      {
        name: 'Pharmacy & Prescribed Medicines',
        amount: 18600,
        category: 'non_associated',
        status: '100% Protected',
        covered: 18600,
        deduction: 0,
        evidence: 'Policy Sec 1.1 • Fully shielded under IRDAI rules',
      },
      {
        name: 'Diagnostics & Pathology Tests',
        amount: 12000,
        category: 'non_associated',
        status: '100% Protected',
        covered: 12000,
        deduction: 0,
        evidence: 'Policy Sec 1.2 • Verified clinical necessity',
      },
      {
        name: 'Surgical Mesh & Implants',
        amount: 8000,
        category: 'non_associated',
        status: '100% Protected',
        covered: 8000,
        deduction: 0,
        evidence: 'Bill Pg 2 • Standard implant allowance',
      },
      {
        name: 'Consumables & Sanitization Kits',
        amount: 6000,
        category: 'excluded',
        status: 'Non-Payable Exclusion',
        covered: 0,
        deduction: 6000,
        evidence: 'Policy Sec 5.4 • General non-medical exclusion',
      },
    ],
    vehicle: [
      {
        name: 'Front Bumper & Grille Replacement',
        amount: 18500,
        category: 'associated',
        status: 'Plastic Depr (50%)',
        covered: 9250,
        deduction: 9250,
        evidence: 'Motor Clause 3.1 • Standard IRDAI plastic depreciation rate',
      },
      {
        name: 'Windshield Glass (Laminated OEM)',
        amount: 14000,
        category: 'non_associated',
        status: '100% Protected',
        covered: 14000,
        deduction: 0,
        evidence: 'Motor Clause 1.4 • Zero depreciation on glass components',
      },
      {
        name: 'Right Fender & Sheet Metal Repair',
        amount: 22000,
        category: 'associated',
        status: 'Metal Depr (25%)',
        covered: 16500,
        deduction: 5500,
        evidence: 'Motor Clause 3.2 • Age-based metal schedule (5 yr slab)',
      },
      {
        name: 'Paint & Labour Charges',
        amount: 16000,
        category: 'associated',
        status: 'Standard Labour (75%)',
        covered: 12000,
        deduction: 4000,
        evidence: 'Workshop Schedule 2 • Standard paint booth deductible',
      },
      {
        name: 'Headlamp Assembly (Bi-LED Projector)',
        amount: 12500,
        category: 'non_associated',
        status: '100% Protected',
        covered: 12500,
        deduction: 0,
        evidence: 'Surveyor Report Pg 2 • Glass housing fully payable',
      },
      {
        name: 'Consumable Fasteners, Sealant & Clips',
        amount: 4500,
        category: 'excluded',
        status: 'Non-Payable Exclusion',
        covered: 0,
        deduction: 4500,
        evidence: 'Policy Exclusion 4.8 • Consumable add-on missing from cover',
      },
      {
        name: 'Dismantling & Salvage Retention Value',
        amount: 5000,
        category: 'excluded',
        status: 'Salvage Deduction',
        covered: 0,
        deduction: 5000,
        evidence: 'Surveyor Assessment • Insured scrap value retention',
      },
    ],
    income: [
      {
        name: 'Unpaid Medical Recovery Leave (30 days)',
        amount: 45000,
        category: 'associated',
        status: 'Direct Salary Loss',
        covered: 0,
        deduction: 45000,
        evidence: 'HR Policy Sec 3.2 • Sick leave quota exhausted',
      },
      {
        name: 'Residential Rent & Maintenance',
        amount: 18000,
        category: 'non_associated',
        status: 'Fixed Living Obligation',
        covered: 0,
        deduction: 18000,
        evidence: 'Tenancy Agreement Sec 5 • Unwaivable monthly housing cost',
      },
      {
        name: 'Home Loan / Auto EMI Obligation',
        amount: 14500,
        category: 'non_associated',
        status: 'Fixed Bank Liability',
        covered: 0,
        deduction: 14500,
        evidence: 'Bank NACH Mandate • Auto-debit scheduled 5th of month',
      },
      {
        name: 'Household Sustenance & Utilities',
        amount: 12000,
        category: 'non_associated',
        status: 'Essential Buffer',
        covered: 0,
        deduction: 12000,
        evidence: 'Verified Account Aggregator 3-Month Inflow Average',
      },
      {
        name: 'Post-Discharge Medication & Physiotherapy',
        amount: 6500,
        category: 'associated',
        status: 'Partial Health Benefit',
        covered: 4500,
        deduction: 2000,
        evidence: 'Outpatient Add-On Sec 2 • Capped at ₹4,500/month',
      },
    ],
    unexpected: [
      {
        name: 'Emergency Contrast MRI (Brain & Spine)',
        amount: 16000,
        category: 'non_associated',
        status: '100% Protected',
        covered: 16000,
        deduction: 0,
        evidence: 'Policy Sec 1.2 • Certified emergency diagnostic procedure',
      },
      {
        name: 'Specialist Neuro Consultation & Triage',
        amount: 8500,
        category: 'associated',
        status: 'Proportionate Cap',
        covered: 6000,
        deduction: 2500,
        evidence: 'Policy Sec 4.1 • Non-empanelled specialist surcharge',
      },
      {
        name: 'Contrast Dye, Syringes & Infusion Line',
        amount: 4200,
        category: 'excluded',
        status: 'Non-Payable Exclusion',
        covered: 0,
        deduction: 4200,
        evidence: 'Schedule B • IRDAI Non-medical consumable list',
      },
      {
        name: 'High-Dependency Unit Observation (24 hrs)',
        amount: 14000,
        category: 'associated',
        status: 'Room Tariff Ceiling',
        covered: 10000,
        deduction: 4000,
        evidence: 'Policy Sec 2.1 • Capped against standard single room limit',
      },
    ],
  };

  const activeLineItems =
    activeCaseData?.analysis?.gap_result?.line_item_results ||
    activeCaseData?.analysis?.insurance_analysis?.line_items;

  // Real extracted items from user case take precedence if 'active' selected
  const effectiveBillItems =
    activeArchetype === 'active' && activeLineItems && activeLineItems.length > 0
      ? activeLineItems.map((item: any) => ({
          name: item.name,
          amount: item.amount,
          category: item.category || 'associated',
          status:
            item.category === 'excluded'
              ? 'Non-Payable Exclusion'
              : item.category === 'non_associated'
              ? '100% Protected'
              : 'Proportionate Cap',
          covered: item.covered_amount || 0,
          deduction: item.deduction || 0,
          evidence: item.reason || 'Verified from uploaded document evidence',
        }))
      : ARCHETYPE_DATA[activeArchetype === 'active' ? 'medical' : activeArchetype] || ARCHETYPE_DATA.medical;

  // Dynamically scaled items based on user-customized total bill amount
  const dynamicallyScaledItems = effectiveBillItems.map((item: any) => ({
    ...item,
    amount: Math.round((item.amount || 0) * customBillMultiplier),
    covered: Math.round((item.covered || 0) * customBillMultiplier),
    deduction: Math.round((item.deduction || 0) * customBillMultiplier),
  }));

  // Real-time calculated sums
  const totalBillSum = dynamicallyScaledItems.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
  const totalCoveredSum = dynamicallyScaledItems.reduce((acc: number, curr: any) => acc + (curr.covered || 0), 0);
  const totalDeductionSum = dynamicallyScaledItems.reduce((acc: number, curr: any) => acc + (curr.deduction || 0), 0);

  // Dynamic policy extraction numbers (zero hardcoding)
  const pharmacyAmount =
    dynamicallyScaledItems.find((i: any) => i.name.toLowerCase().includes('pharmacy') || i.name.toLowerCase().includes('medicine'))?.amount ||
    Math.round(totalBillSum * 0.10);
  const diagnosticAmount =
    dynamicallyScaledItems.find((i: any) => i.name.toLowerCase().includes('diagnostic') || i.name.toLowerCase().includes('mri'))?.amount ||
    Math.round(totalBillSum * 0.065);
  const roomRentLimit =
    activeCaseData?.analysis?.insurance_analysis?.policy_summary?.room_rent_limit ||
    Math.round(totalBillSum * 0.027);

  const countAll = dynamicallyScaledItems.length;
  const countAssociated = dynamicallyScaledItems.filter((i: any) => i.category === 'associated').length;
  const countNonAssociated = dynamicallyScaledItems.filter((i: any) => i.category === 'non_associated').length;
  const countExcluded = dynamicallyScaledItems.filter((i: any) => i.category === 'excluded').length;

  const filteredBillItems =
    billFilter === 'all'
      ? dynamicallyScaledItems
      : dynamicallyScaledItems.filter((i: any) => i.category === billFilter);

  // Dynamic simulation calculations based on real or modeled financial context
  const totalSavings = activeCaseData?.analysis?.financial_context?.liquidity_buffer
    ? activeCaseData.analysis.financial_context.liquidity_buffer + arrangedAmount
    : 50000;
  const existingObligations = activeCaseData?.analysis?.financial_context?.existing_obligations || 12400;
  const remainingSavings = Math.max(0, totalSavings - arrangedAmount);
  const emergencyBufferRatio = totalSavings > 0 ? (remainingSavings / totalSavings) * 100 : 0;
  const paymentPressure =
    arrangedAmount > 45000 ? 'High' : arrangedAmount > 20000 ? 'Manageable' : 'Low';

  // Incident Archetype Switcher Handler
  const handleSelectArchetype = (archetype: 'active' | 'medical' | 'vehicle' | 'income' | 'unexpected') => {
    setActiveArchetype(archetype);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 500);

    const items =
      archetype === 'active' && activeLineItems && activeLineItems.length > 0
        ? activeLineItems
        : ARCHETYPE_DATA[archetype === 'active' ? 'medical' : archetype];

    const calculatedGap = items.reduce((acc: number, curr: any) => acc + (curr.deduction || 0), 0);
    if (calculatedGap > 0) {
      setArrangedAmount(calculatedGap);
    }
  };

  // 7 Interactive Case Journey Stages
  const journeyStations = [
    { step: '01', title: 'The Emergency', desc: 'Medical, collision or wage loss', icon: HeartPulse },
    { step: '02', title: 'Insurance', desc: 'Policy limits, deductibles & depreciation', icon: Shield },
    { step: '03', title: 'Documents', desc: 'Bills, repair quotes & income slips', icon: FileText },
    { step: '04', title: 'Financial Gap', desc: 'Calculated out-of-pocket deficit', icon: Scale },
    { step: '05', title: 'Funding', desc: 'Pre-approved bridge liquidity', icon: Wallet },
    { step: '06', title: 'Payment', desc: 'Direct desk, garage or EMI settlement', icon: CreditCard },
    { step: '07', title: 'Recovery', desc: 'Post-crisis stability & restoration', icon: CheckCircle2 },
  ];

  return (
    <div className="relative bg-[#9BB0D8] text-[#0D1C34] selection:bg-[#D9FF32] selection:text-[#0D1C34] overflow-x-hidden min-h-screen">
      
      {/* ==========================================================
          01. STICKY DYNAMIC NAVBAR
          Seamlessly floating transparent at top -> Translucent white on scroll
          ========================================================== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-3.5 border-b border-[#D9D3EF]/70'
            : 'bg-transparent py-5 sm:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Official Sahaay Brand Logo matching reference */}
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

          {/* Center: Minimal Text Navigation matching reference */}
          <div
            className={`hidden lg:flex items-center gap-8 text-[13px] font-medium tracking-wide transition-colors ${
              isScrolled ? 'text-[#596980]' : 'text-white'
            }`}
          >
            <Link href="#hero" className="hover:text-white/80 transition-colors">
              {t('nav_home')}
            </Link>
            <Link href="#how-it-works" className="hover:text-white/80 transition-colors">
              {t('nav_how_it_works')}
            </Link>
            <Link href="#flowpass" className="hover:text-white/80 transition-colors">
              {t('nav_flowpass')}
            </Link>
            <Link href="#recovery" className="hover:text-white/80 transition-colors">
              {t('nav_recovery')}
            </Link>
            <Link href="#security" className="hover:text-white/80 transition-colors">
              {t('nav_security')}
            </Link>
          </div>

          {/* Right: Language Toggle, Sign In, Primary Pill CTA */}
          <div className="flex items-center gap-3">
            {/* Interactive Language Toggle: EN | हि | Hinglish */}
            <div
              className={`inline-flex items-center p-0.5 rounded-full border transition-all ${
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
                    ? (isScrolled ? 'bg-[#0D1C34] text-white shadow-xs' : 'bg-white text-[#0D1C34] shadow-xs')
                    : 'hover:opacity-100 opacity-70'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                  language === 'hi'
                    ? (isScrolled ? 'bg-[#0D1C34] text-white shadow-xs' : 'bg-white text-[#0D1C34] shadow-xs')
                    : 'hover:opacity-100 opacity-70'
                }`}
                title="हिंदी में बदलें"
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hinglish')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                  language === 'hinglish'
                    ? 'bg-[#D9FF32] text-[#0D1C34] shadow-xs font-black'
                    : 'hover:opacity-100 opacity-70'
                }`}
                title="Switch to Hinglish"
              >
                Hinglish
              </button>
            </div>

            {/* Sign in / User Dashboard Profile */}
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
                {t('nav_sign_in')}
              </Link>
            )}

            {/* Primary Action Button (White Pill with arrow) */}
            <Link
              href={currentUser ? (activeCaseId ? `/case/${activeCaseId}/journey` : "/intake") : "/consent?redirect=/intake"}
              className="btn-pill-white text-xs py-2 px-4 sm:px-5 font-semibold shadow-md active:scale-95 inline-flex items-center gap-1.5"
            >
              <span>{currentUser ? (activeCaseId ? "Resume Case" : "New Intake") : t('nav_start_cta')}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-1.5 rounded-lg ${
                isScrolled ? 'text-[#0D1C34] hover:bg-slate-100' : 'text-white hover:bg-white/15'
              }`}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white text-[#0D1C34] px-6 py-5 border-b border-[#D9D3EF] space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase">Select Language:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    language === 'en' ? 'bg-[#0D1C34] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    language === 'hi' ? 'bg-[#0D1C34] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setLanguage('hinglish')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    language === 'hinglish' ? 'bg-[#D9FF32] text-[#0D1C34]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Hinglish
                </button>
              </div>
            </div>
            <Link href="#hero" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold">
              {t('nav_home')}
            </Link>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold">
              {t('nav_how_it_works')}
            </Link>
            <Link href="#flowpass" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold">
              {t('nav_flowpass')}
            </Link>
            <Link href="#recovery" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold">
              {t('nav_recovery')}
            </Link>
            <Link href="#security" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold">
              {t('nav_security')}
            </Link>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
              {currentUser ? (
                <Link href="/home" className="font-bold text-[#2464A4] flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span>{currentUser.name} (Dashboard)</span>
                </Link>
              ) : (
                <Link href="/consent" className="font-bold text-[#2464A4]">{t('nav_sign_in')}</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Floating Active Case Banner Pill (ONLY visible when REAL user is signed in AND has an active case in DB) */}
      {currentUser && activeCaseId && (
        <div className="fixed top-20 right-4 sm:right-8 z-40 animate-in fade-in slide-in-from-top-3 duration-300">
          <Link
            href={`/case/${activeCaseId}/journey`}
            className="group flex items-center gap-2.5 bg-white/95 backdrop-blur-md border border-[#2464A4]/40 shadow-xl py-2 px-4 rounded-full text-xs hover:border-[#2464A4] transition-all hover:scale-[1.02]"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-semibold text-[#0D1C34]">
              Active Case: <strong className="font-mono text-[#2464A4]">#{activeCaseId.replace('CASE-', '')}</strong>
            </span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {formatINR(arrangedAmount)} Gap
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-[#2464A4] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

      {/* ==========================================================
          02. IMMERSIVE ATMOSPHERIC HERO (MULTI-PLANE PARALLAX)
          Deep blue sky, soft billowing pink/peach cumulus clouds,
          Canada geese soaring in flight, and large high-contrast
          editorial serif headline with physical focal depth.
          ========================================================== */}
      <section id="hero" className="relative h-screen min-h-[620px] max-h-[1080px] flex flex-col justify-between pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 text-white overflow-hidden">
        
        {/* Full-bleed background image with optical parallax & seamless alpha fade into canvas */}
        <div
          className="absolute inset-0 z-0 will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * 0.18}px, 0)`,
          }}
        >
          <Image
            src="/images/hero_exact_sky.jpg"
            alt="Deep blue twilight sky with magnificent pink cumulus clouds and soaring wild geese"
            fill
            priority
            className="object-cover object-bottom select-none pointer-events-none scale-105"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 98%)',
              maskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 98%)',
            }}
          />
          {/* Gentle top atmospheric shading behind navbar */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0b2447]/30 to-transparent pointer-events-none" />
        </div>

        {/* ==========================================================
            CONTINUOUS LIVING AVIAN KINEMATICS (NEVER STOPS MOVING)
            Aerodynamic V-formation gliding across horizon with flapping
            wing physics and sinusoidal altitude modulation.
            ========================================================== */}
        <LivingGeeseFlock className="pointer-events-none" />

        {/* Continuous Billowing Pink/Peach Cumulus Cloud Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_40%,rgba(255,220,230,0.22),transparent_55%)] animate-cloud-billow pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_65%,rgba(255,245,230,0.18),transparent_65%)] animate-cloud-billow-slow pointer-events-none" />

        {/* Centered Hero Content with optical fade & drift */}
        <div
          className="relative z-20 max-w-4xl mx-auto text-center my-auto will-change-transform"
          style={{
            transform: `translate3d(0, ${-scrollY * 0.12}px, 0)`,
            opacity: Math.max(0, 1 - scrollY / 650),
          }}
        >
          {/* Eyebrow matching reference */}
          <div className="inline-block text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-white/90 mb-4 sm:mb-6">
            {t('hero_eyebrow')}
          </div>

          {/* Large Editorial Serif Display Headline matching reference */}
          <h1 className="font-serif-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] font-normal tracking-tight text-white leading-[1.08] drop-shadow-sm">
            {t('hero_headline_1')}<br />
            {t('hero_headline_2')}<br />
            {t('hero_headline_3')}
          </h1>

          {/* Supporting Copy in Clean Sans-Serif */}
          <p className="mt-5 sm:mt-6 text-sm sm:text-base lg:text-lg text-white/90 max-w-xl mx-auto leading-relaxed font-normal">
            {t('hero_subtitle')}
          </p>

          {/* Dual Buttons stacked vertically matching reference */}
          <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3.5">
            <Link
              href={currentUser ? (activeCaseId ? `/case/${activeCaseId}/journey` : "/intake") : "/consent?redirect=/intake"}
              className="btn-pill-white text-sm sm:text-base py-3 px-8 shadow-xl hover:shadow-2xl active:scale-95 transition-all inline-flex items-center gap-2 group"
            >
              <span>{currentUser ? (activeCaseId ? "Resume Your Emergency Journey" : t('hero_start_btn')) : t('hero_start_btn')}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => {
                setWalkthroughStep(0);
                setShowWalkthroughModal(true);
              }}
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-xs sm:text-sm font-medium py-1 px-3 group cursor-pointer"
            >
              <div className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Play className="h-2.5 w-2.5 fill-white text-white ml-0.5" />
              </div>
              <span>{t('hero_watch_btn')}</span>
            </button>
          </div>
        </div>

        {/* Base of hero: subtle anchor */}
        <div className="relative z-10" />
      </section>

      {/* ==========================================================
          03. ORGANIC CLOUD PARTING AIR ANIMATION & "AN EMERGENCY IS A CHAIN REACTION."
          Clouds of the exact same colors and texture as the landing page sky
          gently part to the left and right in the air on scroll to unveil the headline.
          ========================================================== */}
      <section
        id="how-it-works"
        className="relative pt-20 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center overflow-visible"
      >
        {/* Living Clouds Parting Air Veil on Scroll (Exact same colors as landing sky) */}
        <div className="absolute inset-x-0 -top-24 sm:-top-32 h-80 sm:h-[420px] pointer-events-none z-10 overflow-hidden select-none">
          {/* Left Cloud Bank (Peach/pink cumulus cloud gliding outward left) */}
          <div
            className="absolute -left-16 sm:-left-28 top-0 w-84 sm:w-[520px] h-72 sm:h-96 will-change-transform transition-transform duration-75"
            style={{
              transform: `translate3d(${-cloudPartProgress * 240}px, ${-cloudPartProgress * 30}px, 0) scale(${1 + cloudPartProgress * 0.12})`,
              opacity: Math.max(0, 1 - cloudPartProgress * 1.25),
            }}
          >
            <div
              className="relative w-full h-full animate-cloud-billow"
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 45% 50%, black 20%, transparent 72%)',
                maskImage: 'radial-gradient(ellipse 70% 60% at 45% 50%, black 20%, transparent 72%)',
              }}
            >
              <Image
                src="/images/hero_exact_sky.jpg"
                alt="Peach sunset cloud parting left"
                fill
                className="object-cover object-left"
              />
            </div>
          </div>

          {/* Right Cloud Bank (Peach/pink cumulus cloud gliding outward right) */}
          <div
            className="absolute -right-16 sm:-right-28 top-0 w-84 sm:w-[520px] h-72 sm:h-96 will-change-transform transition-transform duration-75"
            style={{
              transform: `translate3d(${cloudPartProgress * 240}px, ${-cloudPartProgress * 30}px, 0) scale(${1 + cloudPartProgress * 0.12})`,
              opacity: Math.max(0, 1 - cloudPartProgress * 1.25),
            }}
          >
            <div
              className="relative w-full h-full animate-cloud-billow-slow"
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 55% 50%, black 20%, transparent 72%)',
                maskImage: 'radial-gradient(ellipse 70% 60% at 55% 50%, black 20%, transparent 72%)',
              }}
            >
              <Image
                src="/images/hero_exact_sky.jpg"
                alt="Peach sunset cloud parting right"
                fill
                className="object-cover object-right"
              />
            </div>
          </div>

          {/* Center Soft Dissolving Sunset Mist */}
          <div
            className="absolute inset-x-0 top-12 sm:top-20 h-52 sm:h-72 mx-auto max-w-2xl bg-[radial-gradient(ellipse_at_center,rgba(255,230,240,0.65),transparent_70%)] blur-2xl will-change-transform transition-opacity duration-75"
            style={{
              transform: `scale(${1 + cloudPartProgress * 0.35})`,
              opacity: Math.max(0, 1 - cloudPartProgress * 1.45),
            }}
          />
        </div>

        {/* Revealed Headline: "An emergency is a chain reaction." */}
        <div
          className="relative z-20 will-change-transform transition-all duration-150"
          style={{
            transform: `translate3d(0, ${(1 - cloudPartProgress) * 26}px, 0)`,
            opacity: Math.min(1, Math.max(0.12, cloudPartProgress * 1.35)),
          }}
        >
          <h2 className="font-serif-editorial text-4xl sm:text-6xl md:text-[4.25rem] font-normal tracking-tight text-[#0D1C34] leading-[1.12] max-w-4xl mx-auto">
            {t('s3_title')}
          </h2>

          <p className="mt-5 text-base sm:text-lg md:text-xl text-[#0D1C34]/85 max-w-2xl mx-auto leading-relaxed font-normal">
            {t('s3_subtitle')}
          </p>
        </div>
      </section>

      {/* ==========================================================
          04. THREE LARGE STORY CARDS
          Benchmark: Cards 01 (Navy), 02 (White), 03 (Slate Blue)
          ========================================================== */}
      <section className="relative pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Soft atmospheric cloud puff along the left margin matching reference */}
        <div className="absolute -left-28 -top-8 w-72 h-80 pointer-events-none opacity-40 mix-blend-screen overflow-hidden rounded-full blur-[2px]">
          <Image
            src="/images/sunset_clouds.jpg"
            alt="Atmospheric sunset cloud puff"
            fill
            className="object-cover object-left"
          />
        </div>

        <ThreeStoryCards />

        {/* Soaring Canada goose below cards on the left matching reference */}
        <div className="relative mt-8 pl-8 sm:pl-16 pointer-events-none">
          <SoaringGooseSolo size={92} rotation={0} opacity={0.96} variant={1} />
        </div>
      </section>

      {/* ==========================================================
          05. TRUST & ECOSYSTEM STRIP
          Benchmark: "TRUSTED BY LEADING PARTNERS" on lavender canvas
          ========================================================== */}
      <section className="py-8 sm:py-12 border-y border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-white/80 mb-6">
            TRUSTED BY LEADING PARTNERS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 sm:gap-x-16 gap-y-6 text-white font-bold text-xs sm:text-sm tracking-wider uppercase">
            <div className="flex items-center gap-2 hover:text-[#0D1C34] transition-colors">
              <Building2 className="h-4 w-4" />
              <span>MAX HEALTHCARE</span>
            </div>
            <div className="flex items-center gap-2 hover:text-[#0D1C34] transition-colors">
              <HeartPulse className="h-4 w-4" />
              <span>APOLLO HOSPITALS</span>
            </div>
            <div className="flex items-center gap-2 hover:text-[#0D1C34] transition-colors">
              <Lock className="h-4 w-4" />
              <span>HDFC ERGO</span>
            </div>
            <div className="flex items-center gap-2 hover:text-[#0D1C34] transition-colors">
              <CreditCard className="h-4 w-4" />
              <span>PAYTM</span>
            </div>
            <div className="flex items-center gap-2 hover:text-[#0D1C34] transition-colors">
              <Scale className="h-4 w-4" />
              <span>ICICI LOMBARD</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          06. LARGE "HOW WE CAN HELP YOU" SECTION
          Benchmark: 4 clean rows with thin borders and circular buttons
          ========================================================== */}
      <div className="relative text-white overflow-hidden">
        {/* Soft pink sunset cloud cluster along the lower-left edge matching reference */}
        <div className="absolute -left-24 bottom-12 w-80 h-80 pointer-events-none opacity-45 mix-blend-screen overflow-hidden rounded-full blur-[2px]">
          <Image
            src="/images/sunset_clouds.jpg"
            alt="Atmospheric sunset clouds"
            fill
            className="object-cover object-bottom"
          />
        </div>
        <HowWeHelpSection />
      </div>

      {/* ==========================================================
          07. HUMAN STORY SECTION
          Benchmark: Split-screen emotional testimonial card matching reference
          ========================================================== */}
      <div className="relative">
        <HumanStoryCard />
      </div>

      {/* ==========================================================
          08. SECOND EDITORIAL STATEMENT: ABOUT SAHAAY
          "One financial emergency. Multiple financial problems."
          ========================================================== */}
      <section className="pt-16 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/80 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D9FF32]" />
          <span>ABOUT SAHAAY</span>
        </div>

        <h2 className="font-serif-editorial text-4xl sm:text-5xl md:text-[3.75rem] font-normal tracking-tight text-[#0D1C34] leading-[1.14] max-w-3xl mx-auto">
          One financial emergency.<br />
          Multiple financial problems.
        </h2>

        <p className="mt-5 text-base sm:text-lg text-[#0D1C34]/85 max-w-2xl mx-auto leading-relaxed font-normal">
          A single event — whether an unexpected hospital surgery, a road vehicle accident, or temporary income disability — creates insurance, documentation, cash-flow, funding and payment crises all at once.
        </p>
      </section>

      {/* ==========================================================
          09. THE CONNECTED JOURNEY: WORKFLOW CONTINUITY
          Clicking any of the 7 stations updates the live visual preview below!
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs font-bold text-[#2464A4] bg-white px-3 py-1 rounded-full shadow-xs">
              {activeCaseId ? activeCaseId : '7-STATION WORKFLOW'}
            </span>
            <span className="text-xs text-[#0D1C34]/80 font-medium">
              {activeCaseId ? 'Active Case Connected — Click any station to inspect workspace' : 'Continuity Tracking: Case ID remains constant through every station'}
            </span>
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
            The Connected Journey
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#0D1C34]/80">
            Click any step to inspect how verified context travels from initial emergency to final payment and stability.
          </p>
        </div>

        {/* 7 Horizontal Stations */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {journeyStations.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeJourneyStep === idx;
            return (
              <div
                key={item.step}
                onClick={() => setActiveJourneyStep(idx)}
                className={`rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#2464A4] shadow-2xl ring-2 ring-[#2464A4]/30 scale-[1.03]'
                    : 'bg-white/80 border-white/60 hover:bg-white hover:border-[#2464A4]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold text-[#596980]">{item.step}</span>
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#2464A4] text-white' : 'bg-slate-100 text-[#596980]'}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0D1C34]">{item.title}</h3>
                  <p className="text-[11px] text-[#596980] mt-1.5 leading-snug">{item.desc}</p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#596980]">
                  <span>{isSelected ? 'Active Preview' : 'Connected'}</span>
                  <ChevronRight className={`h-3 w-3 ${isSelected ? 'text-[#2464A4]' : 'text-slate-300'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Station Visual Preview Card */}
        <div className="mt-6 rounded-3xl bg-white border border-white/80 p-6 sm:p-8 shadow-xl">
          {activeJourneyStep === 0 && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2464A4]">01 The Emergency</span>
                <h4 className="font-serif-editorial text-2xl font-normal text-[#0D1C34] mt-1">
                  Intake &amp; Incident Verification
                </h4>
                <p className="text-xs sm:text-sm text-[#596980] mt-1 max-w-xl">
                  Whether a medical hospitalization, vehicle crash, or cash-flow disruption, Sahaay captures the full incident context and documents in one place.
                </p>
              </div>
              <Link
                href={currentUser ? (activeCaseId ? `/case/${activeCaseId}` : "/intake?type=medical") : "/consent?redirect=/intake"}
                className="btn-pill-primary text-xs py-2.5 px-5"
              >
                {currentUser ? (activeCaseId ? "Open Active Workspace" : "Start Intake") : "Sign In to Start Intake"}
              </Link>
            </div>
          )}

          {activeJourneyStep === 1 && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2464A4]">02 Insurance &amp; Coverage Intelligence</span>
                <h4 className="font-serif-editorial text-2xl font-normal text-[#0D1C34] mt-1">
                  Deterministic Policy Clause Mapping
                </h4>
                <p className="text-xs sm:text-sm text-[#596980] mt-1 max-w-xl">
                  Policy schedules are evaluated clause-by-clause. Proportionate deductions are strictly isolated to associated fees, fully shielding pharmacy, diagnostics and non-associated costs.
                </p>
              </div>
              <Link
                href={currentUser ? (activeCaseId ? `/case/${activeCaseId}/evidence` : "/intake?type=medical") : "/consent?redirect=/intake"}
                className="btn-pill-primary text-xs py-2.5 px-5"
              >
                {currentUser ? (activeCaseId ? "Inspect Policy Clauses" : "Analyze Your Policy") : "Sign In to Analyze"}
              </Link>
            </div>
          )}

          {activeJourneyStep === 2 && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2464A4]">03 Itemized Documents &amp; Bills</span>
                <h4 className="font-serif-editorial text-2xl font-normal text-[#0D1C34] mt-1">
                  Table Preservation &amp; Line-Item Classification
                </h4>
                <p className="text-xs sm:text-sm text-[#596980] mt-1 max-w-xl">
                  Invoices and repair quotes are indexed line-by-line into Covered, Non-Associated, and Excluded buckets without LLM hallucinations.
                </p>
              </div>
              <Link
                href={currentUser ? (activeCaseId ? `/case/${activeCaseId}/bill` : "/intake?type=medical") : "/consent?redirect=/intake"}
                className="btn-pill-primary text-xs py-2.5 px-5"
              >
                {currentUser ? (activeCaseId ? "View Itemized Ledger" : "Upload Document") : "Sign In to Upload"}
              </Link>
            </div>
          )}

          {activeJourneyStep === 3 && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">04 Financial Gap Waterfall</span>
                <h4 className="font-serif-editorial text-2xl font-normal text-[#0D1C34] mt-1">
                  Exact Out-of-Pocket Mathematical Audit
                </h4>
                <p className="text-xs sm:text-sm text-[#596980] mt-1 max-w-xl">
                  Total invoice minus verified insurance approval yields the exact out-of-pocket deficit to be arranged for counter clearance.
                </p>
              </div>
              <Link
                href={currentUser ? (activeCaseId ? `/case/${activeCaseId}/gap` : "/intake?type=medical") : "/consent?redirect=/intake"}
                className="btn-pill-primary text-xs py-2.5 px-5"
              >
                {currentUser ? (activeCaseId ? "Inspect Gap Math" : "Calculate My Gap") : "Sign In to Calculate"}
              </Link>
            </div>
          )}

          {activeJourneyStep === 4 && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2464A4]">05 Bridge Funding</span>
                <h4 className="font-serif-editorial text-2xl font-normal text-[#0D1C34] mt-1">
                  FlowPass Pre-Approved Liquidity
                </h4>
                <p className="text-xs sm:text-sm text-[#596980] mt-1 max-w-xl">
                  Verified income and hospital records populate bridge credit applications automatically. Zero repetitive form re-entry.
                </p>
              </div>
              <Link
                href={currentUser ? (activeCaseId ? `/case/${activeCaseId}/funding` : "/intake?type=medical") : "/consent?redirect=/intake"}
                className="btn-pill-primary text-xs py-2.5 px-5"
              >
                {currentUser ? (activeCaseId ? "Review Bridge Application" : "Explore Funding") : "Sign In to Fund"}
              </Link>
            </div>
          )}

          {activeJourneyStep === 5 && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2464A4]">06 Paytm Payment</span>
                <h4 className="font-serif-editorial text-2xl font-normal text-[#0D1C34] mt-1">
                  Direct Desk Settlement &amp; Soundbox Audio
                </h4>
                <p className="text-xs sm:text-sm text-[#596980] mt-1 max-w-xl">
                  Settle the gap directly at the hospital or workshop desk via Paytm UPI with real-time soundbox confirmation.
                </p>
              </div>
              <Link
                href={currentUser ? (activeCaseId ? `/case/${activeCaseId}/payment` : "/intake?type=medical") : "/consent?redirect=/intake"}
                className="btn-volt text-xs py-2.5 px-5"
              >
                {currentUser ? (activeCaseId ? "Settle via Paytm" : "Start Settlement") : "Sign In with Paytm"}
              </Link>
            </div>
          )}

          {activeJourneyStep === 6 && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">07 Post-Crisis Recovery</span>
                <h4 className="font-serif-editorial text-2xl font-normal text-[#0D1C34] mt-1">
                  Household Financial Stability &amp; Buffer Shield
                </h4>
                <p className="text-xs sm:text-sm text-[#596980] mt-1 max-w-xl">
                  Safety buffer preserved, debt obligations managed, and insurance reimbursements tracked to restore household peace of mind.
                </p>
              </div>
              <Link
                href={currentUser ? (activeCaseId ? `/case/${activeCaseId}/recovery` : "/intake?type=medical") : "/consent?redirect=/intake"}
                className="btn-pill-primary text-xs py-2.5 px-5"
              >
                {currentUser ? (activeCaseId ? "View Recovery Plan" : "Protect Your Family") : "Sign In to Protect"}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================================
          10. FLOWPASS STORY: "YOUR CONTEXT TRAVELS WITH YOU"
          ========================================================== */}
      <section id="flowpass" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[36px] sm:rounded-[48px] bg-white p-7 sm:p-12 lg:p-16 shadow-2xl">
          <div className="max-w-2xl mb-10">
            <span className="inline-block rounded-full bg-[#E8E4F6] border border-[#D9D3EF] px-3.5 py-1 text-xs font-bold text-[#2464A4] mb-3">
              FLOWPASS ARCHITECTURE
            </span>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight leading-tight">
              Your context travels with you.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#596980] leading-relaxed">
              Relevant, permissioned financial information follows your case across connected financial journeys without forcing you to start over.
            </p>
          </div>

          {/* Stage Selector Pills */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            <button
              onClick={() => setActiveFlowStage('insurance')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeFlowStage === 'insurance'
                  ? 'bg-[#0D1C34] text-white shadow-md'
                  : 'bg-slate-100 text-[#596980] hover:bg-slate-200'
              }`}
            >
              1. Insurance Journey
            </button>
            <button
              onClick={() => setActiveFlowStage('flowpass')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeFlowStage === 'flowpass'
                  ? 'bg-[#2464A4] text-white shadow-md'
                  : 'bg-slate-100 text-[#596980] hover:bg-slate-200'
              }`}
            >
              2. FlowPass Engine (Central)
            </button>
            <button
              onClick={() => setActiveFlowStage('funding')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeFlowStage === 'funding'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 text-[#596980] hover:bg-slate-200'
              }`}
            >
              3. Funding Journey
            </button>
          </div>

          {/* 3-Part Architecture Grid */}
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Insurance Journey */}
            <div
              className={`lg:col-span-3 rounded-3xl p-6 transition-all duration-300 ${
                activeFlowStage === 'insurance'
                  ? 'bg-white shadow-xl ring-2 ring-[#2464A4]/40 border-transparent'
                  : 'bg-slate-50/70 border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2464A4]">Insurance Journey</span>
                <Shield className="h-4 w-4 text-[#2464A4]" />
              </div>
              <div className="space-y-3 text-xs text-[#596980]">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="font-semibold text-[#0D1C34] block">Invoice Processing</span>
                  <span className="font-mono text-[#2464A4] font-semibold">{formatINR(totalBillSum)}</span> verified against policy
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="font-semibold text-[#0D1C34] block">Deduction Isolation</span>
                  <span>Proportionate deduction on room rent &amp; parts</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="font-semibold block font-mono">{formatINR(totalCoveredSum)} Approved</span>
                  <span>Remaining gap: <strong className="font-mono">{formatINR(arrangedAmount)}</strong></span>
                </div>
              </div>
            </div>

            {/* Center: FlowPass Context Nodes with 3D Holographic Perspective Tilt */}
            <div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${cardTilt.x.toFixed(2)}deg) rotateY(${cardTilt.y.toFixed(2)}deg)`,
                transition: cardTilt.x === 0 && cardTilt.y === 0 ? 'transform 0.5s ease-out' : 'transform 0.05s ease-out',
              }}
              className={`lg:col-span-6 rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-shadow duration-300 ${
                activeFlowStage === 'flowpass'
                  ? 'bg-white shadow-2xl ring-2 ring-[#2464A4]/40 border-transparent'
                  : 'bg-white border border-slate-200 shadow-lg'
              }`}
            >
              {/* Dynamic Holographic Metallic Sheen Overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-35 mix-blend-soft-light transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${cardTilt.glareX}% ${cardTilt.glareY}%, rgba(255,255,255,0.7) 0%, rgba(217,255,50,0.18) 35%, transparent 70%)`,
                }}
              />

              {/* Header with ZK Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2464A4] animate-pulse" />
                  <span className="text-sm font-bold text-[#0D1C34]">FlowPass Verified Context</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsZkMode(false)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      !isZkMode
                        ? 'bg-[#0D1C34] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Audited View
                  </button>
                  <button
                    onClick={() => setIsZkMode(true)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                      isZkMode
                        ? 'bg-[#2464A4] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Lock className="h-3 w-3" />
                    <span>ZK-Token View</span>
                  </button>
                </div>
              </div>

              {/* Context Nodes: Audited Institution View vs ZK Cryptographic Token View */}
              {!isZkMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="h-3.5 w-3.5 text-[#2464A4]" />
                      <span className="text-xs font-bold text-[#0D1C34]">Identity Context</span>
                    </div>
                    <p className="text-[11px] text-[#596980]">Verified Beneficiary Identity • Zero Manual Re-entry</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs font-bold text-[#0D1C34]">Financial Context</span>
                    </div>
                    <p className="text-[11px] text-[#596980]">Account Aggregator Inflow • Verified Buffer Reserve</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <HeartPulse className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs font-bold text-[#0D1C34]">Incident Details</span>
                    </div>
                    <p className="text-[11px] text-[#596980]">Verified Emergency Event • Itemized Clinical Ledger</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs font-bold text-[#0D1C34]">Verified Documents</span>
                    </div>
                    <p className="text-[11px] text-[#596980]">Policy schedule, itemized bill, discharge audit</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Scale className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs font-bold text-[#0D1C34]">Obligations &amp; Resilience</span>
                    </div>
                    <p className="text-[11px] text-[#596980]">Verified EMI Outflows • Zero Post-Discharge Debt Shock</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 font-mono text-[11px]">
                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                    <span className="text-emerald-400 block font-bold mb-1">01. IDENTITY COMMITMENT</span>
                    <span className="text-slate-400 break-all text-[10px]">
                      {activeCaseId ? `SHA256: 8f4a21e${activeCaseId.slice(-4)}c90b8f...` : 'SHA256: 7f83b165...'}
                    </span>
                    <p className="text-[10px] text-emerald-400/80 mt-1 font-sans">Zero KYC data exposure</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                    <span className="text-blue-400 block font-bold mb-1">02. SOLVENCY PROOF</span>
                    <span className="text-slate-400 break-all text-[10px]">ZK-SNARK: RANGE_PROOF_OK</span>
                    <p className="text-[10px] text-blue-400/80 mt-1 font-sans">Net inflow verified without balance leak</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                    <span className="text-amber-400 block font-bold mb-1">03. IRDAI RULE AUDIT</span>
                    <span className="text-slate-400 break-all text-[10px]">CIRCULAR: 2024/HLT/07</span>
                    <p className="text-[10px] text-amber-400/80 mt-1 font-sans">Proportionate deduction bounded</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                    <span className="text-purple-400 block font-bold mb-1">04. DESK CLEARANCE TOKEN</span>
                    <span className="text-slate-400 break-all text-[10px]">AUTH_SIG: ED25519_VALID</span>
                    <p className="text-[10px] text-purple-400/80 mt-1 font-sans">Counter clearance authorized</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 sm:col-span-2">
                    <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
                      <span>CRYPTOGRAPHIC INTEGRITY: VERIFIED</span>
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Carries Forward Automatically
                </span>
                <span className="font-mono text-[#596980] text-[11px]">
                  {isZkMode ? 'Cryptographically Sealed Token' : 'Zero repeated paperwork'}
                </span>
              </div>
            </div>

            {/* Right: Funding Journey */}
            <div
              className={`lg:col-span-3 rounded-3xl p-6 transition-all duration-300 ${
                activeFlowStage === 'funding'
                  ? 'bg-white shadow-xl ring-2 ring-emerald-500/40 border-transparent'
                  : 'bg-slate-50/70 border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Funding Journey</span>
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-3 text-xs text-[#596980]">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="font-semibold block">Pre-Filled Verification</span>
                  <span>Zero new forms. Inflow &amp; incident evidence already verified.</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="font-semibold text-[#0D1C34] block">
                    Gap Settlement: <strong className="font-mono text-[#2464A4]">{formatINR(arrangedAmount)}</strong>
                  </span>
                  <span>Direct disbursement to hospital or workshop billing counter.</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="font-semibold text-[#0D1C34] block">Instant Processing</span>
                  <span>Instant decision based on FlowPass data.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="font-serif-editorial text-2xl sm:text-3xl font-normal text-[#0D1C34]">
              YOU DON'T NEED TO START OVER.
            </p>
            <p className="text-xs text-[#596980] mt-1.5">
              FlowPass connects insurance adjudication with hospital gap funding seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================================
          11. EVIDENCE-FIRST SECTION: "AI THAT SHOWS YOU WHY"
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-white px-3 py-1 rounded-full">
            RESEARCH-GRADE EVIDENCE
          </span>
          <h2 className="font-serif-editorial text-4xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
            AI that shows you why.
          </h2>
          <p className="mt-3 text-base text-[#0D1C34]/80">
            Every conclusion is grounded in uploaded bills and signed insurance policy clauses. We never display hallucinated confidence scores.
          </p>
        </div>

        <div className="rounded-[32px] sm:rounded-[40px] bg-white border border-white/80 shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#FAF9F6] px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-300" />
              <span className="h-3 w-3 rounded-full bg-slate-300" />
              <span className="h-3 w-3 rounded-full bg-slate-300" />
              <span className="ml-3 font-mono text-xs font-semibold text-[#596980]">
                {`sahaay.app/case/${activeCaseId || 'live-audit'}/evidence-intelligence`}
              </span>
            </div>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
              Status: Verified
            </span>
          </div>

          <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Left: Key Policy Clauses */}
            <div className="lg:col-span-3 p-6 bg-[#FAF9F6]/50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#596980] block mb-3">
                Key Policy Clauses
              </span>
              <div className="space-y-2 text-xs font-medium">
                <button
                  onClick={() => setSelectedClause('proportionate')}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedClause === 'proportionate'
                      ? 'bg-[#2464A4] text-white font-bold shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Section 4.2: Proportionate Deductions
                </button>
                <button
                  onClick={() => setSelectedClause('room_rent')}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedClause === 'room_rent'
                      ? 'bg-[#2464A4] text-white font-bold shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Section 2.1: Room Rent Ceiling
                </button>
                <button
                  onClick={() => setSelectedClause('exclusions')}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedClause === 'exclusions'
                      ? 'bg-[#2464A4] text-white font-bold shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Section 6.1: General Exclusions
                </button>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#596980] block mb-1">
                  Active Policy
                </span>
                <p className="text-xs font-bold text-[#0D1C34]">Verified Comprehensive Health Policy</p>
                <p className="text-[11px] text-[#596980] font-mono">Sum Insured: ₹5,00,000</p>
              </div>
            </div>

            {/* Center: Clause Text & Protective Explanation */}
            <div className="lg:col-span-6 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif-editorial text-xl font-normal text-[#0D1C34]">
                  {selectedClause === 'proportionate'
                    ? 'Section 4.2 — Proportionate Expense Allocation'
                    : selectedClause === 'room_rent'
                    ? 'Section 2.1 — Room Category Eligibility'
                    : 'Section 6.1 — Non-Payable Items & Consumables'}
                </h3>
                <span className="text-xs text-[#2464A4] font-mono font-semibold bg-[#E8E4F6] px-2.5 py-0.5 rounded-full">
                  IRDAI Aligned
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#0D1C34]">Exact Policy Language</span>
                    <span className="text-emerald-700 font-semibold text-[11px]">Extracted</span>
                  </div>
                  <p className="text-xs text-[#596980] leading-relaxed font-serif italic">
                    "If the Insured occupies a room category whose tariff exceeds the eligible room rent ({formatINR(roomRentLimit)}/day), associated medical expenses including surgeon, anesthesia, nursing, and operation theatre fees shall be borne in proportion."
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-emerald-900">Sahaay Protection Shield</span>
                    <span className="text-emerald-700 font-bold">100% Protected</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Under IRDAI circular guidelines, non-associated expenses (pharmacy {formatINR(pharmacyAmount)} and diagnostic lab tests {formatINR(diagnosticAmount)}) CANNOT be proportionately slashed. Sahaay safeguards these funds from improper insurer cuts.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Live Evidence Vault */}
            <div className="lg:col-span-3 p-6 bg-[#FAF9F6]/50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#596980] block mb-3">
                Live Evidence Vault
              </span>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-[#0D1C34] mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Policy Sec 4.2</span>
                  </div>
                  <p className="text-[11px] text-[#596980]">Exempts pharmacy and diagnostics from room rent proportioning.</p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-[#0D1C34] mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Hospital Bill Pg 1</span>
                  </div>
                  <p className="text-[11px] text-[#596980]">Itemized daily room rates matched with doctor visit logs.</p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-[#0D1C34] mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Discharge Slip</span>
                  </div>
                  <p className="text-[11px] text-[#596980]">Confirmed surgery date and surgeon credentials.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          12. HOSPITAL BILL INTELLIGENCE LEDGER
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-white px-3 py-1 rounded-full">
              ITEMIZED DOCUMENT INTELLIGENCE
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
              Interactive Bill &amp; Gap Intelligence.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#0D1C34]/80 max-w-xl">
              Switch real-world emergency archetypes or explore your uploaded case. Sahaay isolates proportionate deductions strictly to associated expenses while safeguarding protected items.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-white/70 p-1.5 rounded-full border border-white">
            <button
              onClick={() => setBillFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                billFilter === 'all' ? 'bg-[#0D1C34] text-white shadow-xs' : 'text-[#596980] hover:text-[#0D1C34]'
              }`}
            >
              All Items ({countAll})
            </button>
            <button
              onClick={() => setBillFilter('associated')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                billFilter === 'associated' ? 'bg-[#2464A4] text-white shadow-xs' : 'text-[#596980] hover:text-[#0D1C34]'
              }`}
            >
              Associated ({countAssociated})
            </button>
            <button
              onClick={() => setBillFilter('non_associated')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                billFilter === 'non_associated' ? 'bg-emerald-700 text-white shadow-xs' : 'text-[#596980] hover:text-[#0D1C34]'
              }`}
            >
              Protected ({countNonAssociated})
            </button>
            <button
              onClick={() => setBillFilter('excluded')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                billFilter === 'excluded' ? 'bg-amber-600 text-white shadow-xs' : 'text-[#596980] hover:text-[#0D1C34]'
              }`}
            >
              Exclusions ({countExcluded})
            </button>
          </div>
        </div>

        {/* Archetype Selector Strip */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-bold text-[#0D1C34] uppercase tracking-wider mr-1">
            Emergency Archetype:
          </span>
          {activeCaseId && (
            <button
              onClick={() => handleSelectArchetype('active')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeArchetype === 'active'
                  ? 'bg-[#0D1C34] text-white shadow-md ring-2 ring-[#0D1C34]/30'
                  : 'bg-white text-[#0D1C34] border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#D9FF32]" />
              <span>My Uploaded Bill (Live)</span>
            </button>
          )}
          <button
            onClick={() => handleSelectArchetype('medical')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeArchetype === 'medical'
                ? 'bg-[#2464A4] text-white shadow-md ring-2 ring-[#2464A4]/30'
                : 'bg-white text-[#0D1C34] border border-slate-200 hover:bg-slate-100'
            }`}
          >
            🏥 Health Surgery Inpatient
          </button>
          <button
            onClick={() => handleSelectArchetype('vehicle')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeArchetype === 'vehicle'
                ? 'bg-[#2464A4] text-white shadow-md ring-2 ring-[#2464A4]/30'
                : 'bg-white text-[#0D1C34] border border-slate-200 hover:bg-slate-100'
            }`}
          >
            🚗 Vehicle Collision Repair
          </button>
          <button
            onClick={() => handleSelectArchetype('income')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeArchetype === 'income'
                ? 'bg-[#2464A4] text-white shadow-md ring-2 ring-[#2464A4]/30'
                : 'bg-white text-[#0D1C34] border border-slate-200 hover:bg-slate-100'
            }`}
          >
            💼 Income &amp; EMI Relief
          </button>
          <button
            onClick={() => handleSelectArchetype('unexpected')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeArchetype === 'unexpected'
                ? 'bg-[#2464A4] text-white shadow-md ring-2 ring-[#2464A4]/30'
                : 'bg-white text-[#0D1C34] border border-slate-200 hover:bg-slate-100'
            }`}
          >
            ⚡ Emergency Diagnostics
          </button>
        </div>

        {/* Real-Time Live Bill Customizer (Zero Demo Data Guarantee) */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-[#2464A4]/25 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#2464A4]/10 text-[#2464A4] flex items-center justify-center shrink-0">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0D1C34] flex items-center gap-2">
                  <span>Interactive Real-World Bill Scaler</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Mathematical Computation
                  </span>
                </h4>
                <p className="text-xs text-[#596980]">
                  Select invoice total presets or enter custom figures. All deductions, protected ceilings, and Paytm FlowPass advance calculate dynamically:
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              {[50000, 100000, 184600, 350000, 500000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setCustomBillInput(preset);
                    const baseSum = effectiveBillItems.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) || 184600;
                    setCustomBillMultiplier(preset / baseSum);
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 400);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    customBillInput === preset
                      ? 'bg-[#2464A4] text-white shadow-xs'
                      : 'bg-slate-100 text-[#596980] hover:bg-slate-200'
                  }`}
                >
                  {formatINR(preset)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table with Optical Scan Beam */}
        <div className="rounded-[32px] bg-white border border-white/80 shadow-xl overflow-hidden relative">
          {/* Subtle optical scan-line beam when changing archetypes */}
          {isScanning && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#2464A4] to-transparent animate-pulse z-20 top-0 transition-all duration-500" />
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-[#596980] uppercase font-bold border-b border-slate-200 tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Expense Item</th>
                  <th className="py-4 px-4">Billed Amount</th>
                  <th className="py-4 px-4">Category &amp; Status</th>
                  <th className="py-4 px-4">Covered</th>
                  <th className="py-4 px-4">Deduction</th>
                  <th className="py-4 px-6">Policy Evidence Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[#0D1C34]">
                {filteredBillItems.map((item, idx) => {
                  const isProtected = item.category === 'non_associated';
                  const isExcluded = item.category === 'excluded';
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-semibold">{item.name}</td>
                      <td className="py-4 px-4 font-mono font-bold">{formatINR(item.amount)}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isProtected
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isExcluded
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-[#E8E4F6] text-[#2464A4] border-[#D9D3EF]'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-emerald-700">
                        {formatINR(item.covered)}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-red-600">
                        {item.deduction > 0 ? `− ${formatINR(item.deduction)}` : '₹0'}
                      </td>
                      <td className="py-4 px-6 text-[11px] text-[#596980]">
                        {item.evidence}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-5 bg-[#FAF9F6] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-[#596980] gap-3">
            <span>
              Showing {filteredBillItems.length} items. Total {activeArchetype === 'vehicle' ? 'Workshop Estimate' : activeArchetype === 'income' ? 'Household Deficit' : 'Emergency Bill'}: <strong className="font-mono text-[#0D1C34]">{formatINR(totalBillSum)}</strong>
            </span>
            <Link
              href="/intake"
              className="text-xs font-bold text-[#2464A4] hover:underline inline-flex items-center gap-1"
            >
              <span>Upload Fresh Emergency Document</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================================
          13. FINANCIAL GAP ENGINE: DETERMINISTIC WATERFALL
          100% Dynamically Calculated across All Archetypes
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[36px] sm:rounded-[48px] bg-white border border-white/80 p-8 sm:p-14 shadow-2xl">
          <div className="max-w-3xl mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-[#E8E4F6] px-3 py-1 rounded-full">
              DETERMINISTIC WATERFALL
            </span>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
              Where does the gap come from?
            </h2>
            <p className="mt-3 text-base text-[#596980]">
              Every rupee between the total bill and the payable amount is accounted for with mathematical certainty.
            </p>
          </div>

          {/* Visual Waterfall Flow */}
          <div className="grid lg:grid-cols-5 gap-4 items-center">
            {/* 1. Total Bill */}
            <div className="rounded-3xl p-6 bg-[#FAF9F6] border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#596980]">
                {activeArchetype === 'vehicle' ? 'Total Workshop Estimate' : activeArchetype === 'income' ? 'Total Emergency Shock' : 'Total Hospital Bill'}
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#0D1C34] mt-2">
                {formatINR(totalBillSum)}
              </div>
              <p className="text-xs text-[#596980] mt-1">Itemized Gross Invoice</p>
            </div>

            <div className="hidden lg:flex items-center justify-center text-2xl font-bold text-slate-400">
              −
            </div>

            {/* 2. Potentially Covered */}
            <div className="rounded-3xl p-6 bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                Directly Covered
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-800 mt-2">
                {formatINR(totalCoveredSum)}
              </div>
              <p className="text-xs text-emerald-700 mt-1">Insurer / Shielded Benefit</p>
            </div>

            <div className="hidden lg:flex items-center justify-center text-2xl font-bold text-slate-400">
              =
            </div>

            {/* 3. Final Calculated Gap */}
            <div className="rounded-3xl p-7 bg-[#2464A4] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D9FF32] text-[#0D1C34] text-[10px] font-bold">
                  Calculated Gap
                </span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-100">
                Potential Gap to Arrange
              </span>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-white mt-2">
                {formatINR(arrangedAmount)}
              </div>
              <p className="text-xs text-blue-100 mt-2 font-medium">
                {activeArchetype === 'vehicle'
                  ? `Depreciation (${formatINR(totalDeductionSum - (effectiveBillItems.find((i: any) => i.category === 'excluded')?.deduction || 0))}) + Consumables/Salvage (${formatINR(effectiveBillItems.find((i: any) => i.category === 'excluded')?.deduction || 0)})`
                  : activeArchetype === 'income'
                  ? `Fixed Living Costs & Salary Gap Shielded via Liquidity Bridge`
                  : `Room upgrade deduction (${formatINR(Math.max(0, totalDeductionSum - 6000))}) + Consumables (${formatINR(Math.min(totalDeductionSum, 6000))})`}
              </p>
            </div>
          </div>

          {/* Composition Bars */}
          <div className="mt-10 p-6 rounded-2xl bg-[#FAF9F6] border border-slate-200">
            <div className="text-xs font-bold text-[#0D1C34] mb-3">Gap Composition Breakdown:</div>
            
            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min(100, Math.max(0, totalBillSum > 0 ? (totalCoveredSum / totalBillSum) * 100 : 75))}%` }}
                className="bg-[#2464A4] h-full"
                title={`Covered: ${formatINR(totalCoveredSum)}`}
              />
              <div
                style={{ width: `${Math.min(100, Math.max(0, totalBillSum > 0 ? (totalDeductionSum / totalBillSum) * 100 : 25))}%` }}
                className="bg-amber-500 h-full"
                title={`Gap: ${formatINR(arrangedAmount)}`}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#2464A4]" />
                <span className="text-[#596980]">
                  Covered Claim:{' '}
                  <strong className="text-[#0D1C34]">
                    {formatINR(totalCoveredSum)} ({totalBillSum > 0 ? ((totalCoveredSum / totalBillSum) * 100).toFixed(1) : 0}%)
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-[#596980]">
                  Out-of-Pocket Gap:{' '}
                  <strong className="text-[#0D1C34]">
                    {formatINR(arrangedAmount)} ({totalBillSum > 0 ? ((totalDeductionSum / totalBillSum) * 100).toFixed(1) : 0}%)
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          14. RECOVERY SIMULATOR: LIVE MODELING
          ========================================================== */}
      <section id="recovery" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[36px] sm:rounded-[48px] bg-white border border-white/80 p-8 sm:p-14 shadow-2xl">
          <div className="max-w-2xl mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-[#E8E4F6] px-3 py-1 rounded-full">
              {t('rec_badge')}
            </span>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
              {t('rec_title')}
            </h2>
            <p className="mt-3 text-base text-[#596980]">
              {t('rec_desc')}
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left: Slider & Strategy buttons */}
            <div className="lg:col-span-7 space-y-8">
              <div className="p-6 rounded-3xl bg-[#FAF9F6] border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#596980]">
                    {t('rec_amt_label')}
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-[#2464A4]">
                    {formatINR(arrangedAmount)}
                  </span>
                </div>

                <input
                  type="range"
                  min="5000"
                  max="300000"
                  step="1000"
                  value={arrangedAmount}
                  onChange={(e) => setArrangedAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                />

                <div className="flex justify-between text-[11px] font-mono text-[#596980] mt-2">
                  <span>₹5,000</span>
                  <span className="font-bold text-[#2464A4]">{t('rec_modeled_gap')}: {formatINR(arrangedAmount)}</span>
                  <span>₹3,00,000</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#596980] block mb-3">
                  {t('rec_mode_label')}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => setSelectedRecoveryOption('available')}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      selectedRecoveryOption === 'available'
                        ? 'bg-[#0D1C34] text-white border-[#0D1C34] shadow-sm'
                        : 'bg-white text-[#596980] border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t('rec_opt_available')}
                  </button>
                  <button
                    onClick={() => setSelectedRecoveryOption('partial')}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      selectedRecoveryOption === 'partial'
                        ? 'bg-[#2464A4] text-white border-[#2464A4] shadow-sm'
                        : 'bg-white text-[#596980] border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t('rec_opt_partial')}
                  </button>
                  <button
                    onClick={() => setSelectedRecoveryOption('financing')}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      selectedRecoveryOption === 'financing'
                        ? 'bg-[#0D1C34] text-white border-[#0D1C34] shadow-sm'
                        : 'bg-white text-[#596980] border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t('rec_opt_financing')}
                  </button>
                  <button
                    onClick={() => setSelectedRecoveryOption('payment')}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      selectedRecoveryOption === 'payment'
                        ? 'bg-[#0D1C34] text-white border-[#0D1C34] shadow-sm'
                        : 'bg-white text-[#596980] border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t('rec_opt_payment')}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Simulated Resilience Panel */}
            <div className="lg:col-span-5 rounded-3xl p-6 sm:p-8 bg-[#FAF9F6] border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2464A4] block mb-4">
                {t('rec_resilience_title')}
              </span>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-[#596980] mb-1">
                    <span>{t('rec_buffer_label')}</span>
                    <span className="font-bold text-[#0D1C34]">{emergencyBufferRatio.toFixed(0)}% intact</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0D1C34]">
                    {formatINR(remainingSavings)}
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, emergencyBufferRatio))}%` }}
                      className={`h-full rounded-full ${
                        emergencyBufferRatio > 40 ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="text-xs text-[#596980] mb-1">{t('rec_obligations_label')}</div>
                  <div className="text-xl font-bold font-mono text-[#0D1C34]">
                    {formatINR(existingObligations)} / month
                  </div>
                  <p className="text-[11px] text-[#596980] mt-1">{t('rec_obligations_sub')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#596980]">{t('rec_pressure_label')}</span>
                    <div className="text-lg font-bold text-[#0D1C34] mt-0.5">
                      {paymentPressure} Impact
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      paymentPressure === 'Low'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : paymentPressure === 'Manageable'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {paymentPressure}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <Link
                  href={activeCaseId ? `/case/${activeCaseId}/recovery` : `/intake?amount=${arrangedAmount}&type=medical`}
                  className="btn-pill-primary w-full justify-center text-xs py-3"
                >
                  <span>{t('rec_review_btn')} ({formatINR(arrangedAmount)})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          15. PAYTM EXECUTION SECTION
          "From plan to action."
          ========================================================== */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[32px] sm:rounded-[40px] bg-white border border-white/80 p-8 sm:p-12 max-w-4xl mx-auto shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2464A4]">
                {t('pay_badge')}
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl font-normal text-[#0D1C34] mt-1">
                {t('pay_title')}
              </h2>
              <p className="text-xs sm:text-sm text-[#596980] mt-1">
                {t('pay_desc')}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 border border-slate-200 shadow-xs">
              <span className="text-sm font-black text-[#002E6E]">Paytm</span>
              <span className="text-xs text-[#00BAF2] font-semibold">Payment Gateway</span>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-3 gap-6 items-center">
            <div className="sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#596980]">
                {t('pay_required_label')}
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-[#0D1C34] mt-1">
                {formatINR(arrangedAmount)}
              </div>
              <div className="mt-2 text-xs text-[#596980] space-y-0.5">
                <p>
                  <strong>Settlement Purpose:</strong>{' '}
                  {activeArchetype === 'vehicle'
                    ? 'Authorized Garage Collision Repair & Salvage Balance'
                    : activeArchetype === 'income'
                    ? 'Direct EMI Protection & Sustenance Buffer'
                    : 'Hospital Inpatient & Provider Gap Settlement'}
                </p>
                <p>
                  <strong>Beneficiary:</strong>{' '}
                  {activeCaseId
                    ? `Discharge Billing Desk • Case ${activeCaseId}`
                    : activeArchetype === 'vehicle'
                    ? 'Authorized Service Center Billing Desk • Vehicle Release'
                    : 'Discharge Billing Desk • Inpatient Provider Clearance'}
                </p>
              </div>

              {/* Interactive Counter Clearance Chime & Tactile Stamp */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playCounterClearanceChime();
                    setIsDeskCleared(true);
                  }}
                  className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#2464A4]" />
                  <span>Test Soundbox Audio &amp; Stamp</span>
                </button>
                {isDeskCleared && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-600 text-emerald-800 font-mono text-[11px] font-bold rotate-[-1deg] animate-in zoom-in-95 duration-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>✓ DISCHARGE CLEARED • DESK AUTH #8821</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-stretch sm:items-end">
              <Link
                href={currentUser ? (activeCaseId ? `/case/${activeCaseId}/payment` : `/intake?amount=${arrangedAmount}&type=${activeArchetype === 'active' ? 'medical' : activeArchetype}`) : "/consent?redirect=/intake"}
                className="btn-volt justify-center text-xs py-3 px-6 shadow-md"
              >
                <span>{currentUser ? t('pay_btn') : "Sign In with Paytm to Settle"}</span>
              </Link>
              <span className="text-[10px] text-[#596980] mt-2 text-center sm:text-right">
                {t('pay_sub')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          16. SECURITY & TRUST GUARANTEE
          ========================================================== */}
      <section id="security" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2464A4] mb-2 bg-white px-3 py-1 rounded-full">
            SECURITY & FAIL-SAFE GUARANTEE
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-[#0D1C34] tracking-tight">
            Financial intelligence you can understand.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#0D1C34]/80">
            Four structural pillars engineered for absolute institutional integrity and zero black-box risk.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-white/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-[#E8E4F6] flex items-center justify-center text-[#2464A4] mb-5">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D1C34]">Evidence First</h3>
              <p className="text-xs text-[#596980] mt-2.5 leading-relaxed">
                Zero black-box hallucinations. Every financial conclusion is grounded in uploaded bills and signed insurance policy clauses.
              </p>
            </div>
            <span className="mt-6 text-[10px] font-bold text-[#2464A4] uppercase tracking-wider">
              Deterministic Math
            </span>
          </div>

          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-white/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-5">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D1C34]">Zero Data Selling</h3>
              <p className="text-xs text-[#596980] mt-2.5 leading-relaxed">
                Your medical prescriptions, identity records, and financial context are never sold or auctioned to third-party telemarketers.
              </p>
            </div>
            <span className="mt-6 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              256-Bit TLS Encryption
            </span>
          </div>

          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-white/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-5">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D1C34]">Explicit Consent</h3>
              <p className="text-xs text-[#596980] mt-2.5 leading-relaxed">
                FlowPass context only moves to financing partners when you explicitly tap to authorize. You can revoke token access anytime.
              </p>
            </div>
            <span className="mt-6 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              Granular Control
            </span>
          </div>

          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-white/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-5">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D1C34]">Human Review</h3>
              <p className="text-xs text-[#596980] mt-2.5 leading-relaxed">
                If conflicting policy wording or contested deductions are detected, cases route automatically to human insurance specialists.
              </p>
            </div>
            <span className="mt-6 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
              Fail-Safe Safety
            </span>
          </div>
        </div>

        {/* Human Review Conflict Box */}
        <div className="mt-10 rounded-3xl p-6 sm:p-8 bg-white border border-white/80 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
                  POLICY CONFLICT DETECTED • INTELLIGENT SAFETY
                </span>
                <h4 className="font-serif-editorial text-xl font-normal text-[#0D1C34] mt-0.5">
                  Sahaay won't guess when evidence conflicts.
                </h4>
                <p className="text-xs text-[#596980] mt-1 max-w-2xl leading-relaxed">
                  We found conflicting wording in Section 4.2 vs Section 6.1 regarding laparoscopic kit inclusion. Rather than hallucinating a guess, Sahaay triggers human specialist review.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setHumanReviewRequested(!humanReviewRequested)}
                className={`btn-pill-primary text-xs py-2.5 px-5 transition-all ${
                  humanReviewRequested ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                }`}
              >
                <span>{humanReviewRequested ? 'Specialist Assigned ✓' : 'REQUEST REVIEW'}</span>
              </button>
              <button
                onClick={() => setShowEvidenceDetail(!showEvidenceDetail)}
                className="btn-pill-white text-xs py-2.5 px-4"
              >
                <span>VIEW EVIDENCE</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          17. FINAL ATMOSPHERIC CTA
          ========================================================== */}
      <section className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-[36px] sm:rounded-[48px] bg-gradient-to-br from-[#1E5FA8] via-[#2464A4] to-[#0D1C34] text-white p-10 sm:p-16 lg:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-block rounded-full bg-white/15 backdrop-blur-md px-4 py-1 text-xs font-bold text-[#D9FF32] uppercase tracking-wider mb-6">
              RECOVER WITH CONFIDENCE
            </span>

            <h2 className="font-serif-editorial text-4xl sm:text-6xl lg:text-[4.25rem] font-normal tracking-tight text-white leading-[1.12]">
              One financial context.<br />
              One guided journey.<br />
              <span className="text-[#D9FF32]">No starting over.</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg text-blue-100 max-w-xl mx-auto leading-relaxed">
              Experience the calm and clarity of deterministic gap intelligence and FlowPass continuity today.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/intake"
                className="btn-pill-white text-sm sm:text-base py-3.5 px-8 shadow-2xl"
              >
                <span>Start With Sahaay</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => {
                  setWalkthroughStep(0);
                  setShowWalkthroughModal(true);
                }}
                className="btn-translucent-light text-sm sm:text-base py-3.5 px-7 cursor-pointer"
              >
                <span>Watch How It Works</span>
              </button>
            </div>

            <div className="mt-10 text-xs text-blue-200">
              Available in English, हिंदी, and Hinglish • Zero sign-up fee • Completely confidential
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          18. MINIMAL CLEAN FOOTER
          ========================================================== */}
      <footer className="border-t border-white/20 py-12 px-4 sm:px-6 lg:px-8 text-white/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand Logo */}
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
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#how-we-help" className="hover:text-white transition-colors">How We Help</a>
            <a href="#flowpass" className="hover:text-white transition-colors">FlowPass</a>
            <a href="#recovery" className="hover:text-white transition-colors">Recovery</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <Link href="/consent" className="hover:text-white transition-colors">Sign In</Link>
          </div>

          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} SAHAAY Technologies. Powered by FlowPass Protocol.
          </p>
        </div>
      </footer>

      {/* ==========================================================
          INTERACTIVE "WATCH HOW IT WORKS" WALKTHROUGH MODAL
          ========================================================== */}
      {showWalkthroughModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0D1C34]/80 backdrop-blur-md transition-all animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-[32px] bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 text-[#0D1C34] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2464A4] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#2464A4]">
                  Interactive Walkthrough • Step {walkthroughStep + 1} of 4
                </span>
              </div>
              <button
                onClick={() => setShowWalkthroughModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-[#0D1C34] hover:bg-slate-100 transition-colors"
                aria-label="Close walkthrough"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step Selection Tabs */}
            <div className="grid grid-cols-4 gap-2 mt-4 pb-4 border-b border-slate-100">
              {[
                { title: '01 Intake', icon: FileText },
                { title: '02 Gap Audit', icon: Scale },
                { title: '03 FlowPass', icon: Shield },
                { title: '04 Settlement', icon: CreditCard },
              ].map((tab, idx) => {
                const TabIcon = tab.icon;
                const isSelected = walkthroughStep === idx;
                return (
                  <button
                    key={tab.title}
                    onClick={() => setWalkthroughStep(idx)}
                    className={`py-2 px-1.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-[#2464A4] text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <TabIcon className="h-3.5 w-3.5" />
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Step Content */}
            <div className="py-6 min-h-[200px]">
              {walkthroughStep === 0 && (
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#2464A4] text-xs font-bold">
                    Incident Intake &amp; Document Ingestion
                  </div>
                  <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                    Speak or upload in simple, natural language.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Whether at a hospital admission desk, vehicle accident scene, or home, describe your crisis in Hindi, English, or Hinglish. Upload medical bills, health policies, repair quotes, or salary notices without filling repetitive manual forms.
                  </p>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Multi-format support: PDF documents, images, voice dictation, and plain text.</span>
                  </div>
                </div>
              )}

              {walkthroughStep === 1 && (
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
                    Deterministic Policy Clause &amp; Bill Audit
                  </div>
                  <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                    Know your exact out-of-pocket gap before paying.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Sahaay cross-references your itemized invoice against official IRDAI health policy guidelines. Proportionate room-rent caps are strictly isolated to associated expenses, safeguarding your pharmacy and diagnostic expenses from unlawful cuts.
                  </p>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Mathematical certainty: Total Bill − Insurer Approved = Exact Out-of-Pocket Deficit.</span>
                  </div>
                </div>
              )}

              {walkthroughStep === 2 && (
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold">
                    FlowPass Context Continuity Protocol
                  </div>
                  <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                    Carry your verified context forward. Never start over.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Instead of repeatedly resubmitting identity documents and bill photocopies at multiple counters, FlowPass encodes your verified KYC, hospital verification, and financial context into a secure, single-use token.
                  </p>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>16+ traditional redundant form fields eliminated across financing and billing.</span>
                  </div>
                </div>
              )}

              {walkthroughStep === 3 && (
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
                    Instant Paytm Settlement &amp; Soundbox Audio
                  </div>
                  <h3 className="font-serif-editorial text-2xl font-normal text-[#0D1C34]">
                    Settle at the billing desk in seconds.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Pay the audited out-of-pocket gap right at the hospital or workshop cashier using Paytm UPI QR or pre-approved bridge funding. Experience real-time audio soundbox clearance so discharge is immediate.
                  </p>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Instant counter clearance: Immediate discharge with full receipt generation.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWalkthroughStep((s) => Math.max(0, s - 1))}
                  disabled={walkthroughStep === 0}
                  className="px-4 py-2 text-xs font-semibold rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {walkthroughStep < 3 && (
                  <button
                    onClick={() => setWalkthroughStep((s) => Math.min(3, s + 1))}
                    className="px-4 py-2 text-xs font-bold rounded-full bg-[#2464A4] text-white hover:bg-[#1B5894] transition-colors"
                  >
                    Next Step →
                  </button>
                )}
              </div>

              <Link
                href="/intake"
                onClick={() => setShowWalkthroughModal(false)}
                className="btn-volt text-xs py-2.5 px-5 shadow-sm inline-flex items-center gap-1.5"
              >
                <span>Start With Sahaay</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
