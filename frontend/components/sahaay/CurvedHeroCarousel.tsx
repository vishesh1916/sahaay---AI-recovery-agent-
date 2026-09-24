'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Shield,
  FileText,
  Scale,
  Sparkles,
  Activity,
  CreditCard,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface CardDef {
  id: string;
  type: 'doc' | 'coverage' | 'photo-sarah' | 'chart' | 'flowpass-dark' | 'glass-cyan' | 'datapoints' | 'phone-settle' | 'photo-rohan' | 'photo-family';
  linkHref: string;
}

const getBaseCards = (caseId?: string | null): CardDef[] => [
  { id: 'card-doc', type: 'doc', linkHref: caseId ? `/case/${caseId}/evidence` : '/intake?station=evidence' },
  { id: 'card-coverage', type: 'coverage', linkHref: caseId ? `/case/${caseId}/bill` : '/intake?station=bill' },
  { id: 'card-sarah', type: 'photo-sarah', linkHref: caseId ? `/case/${caseId}` : '/home' },
  { id: 'card-chart', type: 'chart', linkHref: caseId ? `/case/${caseId}/gap` : '/intake?station=gap' },
  { id: 'card-flowpass', type: 'flowpass-dark', linkHref: caseId ? `/case/${caseId}/flowpass` : '/intake?station=flowpass' },
  { id: 'card-glass', type: 'glass-cyan', linkHref: caseId ? `/case/${caseId}/funding` : '/intake?type=income' },
  { id: 'card-data', type: 'datapoints', linkHref: '/home' },
  { id: 'card-phone', type: 'phone-settle', linkHref: caseId ? `/case/${caseId}/payment` : '/intake?type=medical' },
  { id: 'card-rohan', type: 'photo-rohan', linkHref: caseId ? `/case/${caseId}` : '/home' },
  { id: 'card-family', type: 'photo-family', linkHref: caseId ? `/case/${caseId}/recovery` : '/home' },
];

const UNIQUE_CARDS = getBaseCards(null);
const ALL_CARDS = [...UNIQUE_CARDS, ...UNIQUE_CARDS];

const CARD_WIDTH = 186;
const CARD_GAP = 16;
const STRIDE = CARD_WIDTH + CARD_GAP; // 202px
const TOTAL_WIDTH = ALL_CARDS.length * STRIDE; // 4040px

export function CurvedHeroCarousel() {
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('current_active_case_id') || localStorage.getItem('sahaay_active_case_id');
      if (stored) setActiveCaseId(stored);
    }
  }, []);

  const baseCards = getBaseCards(activeCaseId);
  const activeCards = [...baseCards, ...baseCards];

  const containerRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animFrameId = useRef<number | null>(null);

  // Position offset in pixels
  const offsetRef = useRef<number>(0);
  const targetOffsetRef = useRef<number | null>(null);
  const isHoveredRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartOffsetRef = useRef<number>(0);

  // Render direct transforms on 60fps animation frame
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Handle smooth interpolation to target if user clicked card or button
      if (targetOffsetRef.current !== null) {
        const diff = targetOffsetRef.current - offsetRef.current;
        if (Math.abs(diff) < 0.5) {
          offsetRef.current = targetOffsetRef.current;
          targetOffsetRef.current = null;
        } else {
          offsetRef.current += diff * 0.14;
        }
      } else if (!isHoveredRef.current && !isDraggingRef.current) {
        // Continuous smooth sliding motion (42px / sec)
        offsetRef.current -= 42 * dt;
      }

      // Keep offset bounded within single loop range
      const singleLoopWidth = UNIQUE_CARDS.length * STRIDE;
      if (offsetRef.current <= -singleLoopWidth) {
        offsetRef.current += singleLoopWidth;
        if (targetOffsetRef.current !== null) targetOffsetRef.current += singleLoopWidth;
      } else if (offsetRef.current > 0) {
        offsetRef.current -= singleLoopWidth;
        if (targetOffsetRef.current !== null) targetOffsetRef.current -= singleLoopWidth;
      }

      const containerWidth = containerRef.current?.offsetWidth || 1200;
      const halfViewport = containerWidth / 2;
      const arcWidthRadius = Math.max(500, Math.min(halfViewport * 1.1, 780));

      for (let i = 0; i < ALL_CARDS.length; i++) {
        const el = cardElementsRef.current[i];
        if (!el) continue;

        // Calculate card's horizontal offset from viewport center
        let rawX = i * STRIDE + offsetRef.current;
        // Normalize to [-TOTAL_WIDTH / 2, TOTAL_WIDTH / 2]
        rawX = ((rawX % TOTAL_WIDTH) + TOTAL_WIDTH) % TOTAL_WIDTH;
        if (rawX > TOTAL_WIDTH / 2) {
          rawX -= TOTAL_WIDTH;
        }

        // Clip cards that are well offscreen to save GPU
        if (Math.abs(rawX) > halfViewport + CARD_WIDTH + 80) {
          el.style.display = 'none';
          continue;
        }

        el.style.display = 'block';

        // Normalized position from -1.0 (far left) to 0.0 (center) to +1.0 (far right)
        const norm = Math.max(-1.3, Math.min(1.3, rawX / arcWidthRadius));
        const absNorm = Math.abs(norm);

        // Parabolic arc (center highest, wings gently dip)
        const y = norm * norm * 34;

        // Depth (center closest, wings recede into 3D space)
        const z = -norm * norm * 75;

        // Tangent 3D rotation (left cards face right, right cards face left)
        const rotY = -norm * 26;

        // Subtle horizon banking tilt
        const rotZ = -norm * 3.2;

        // Scale (center 1.0, wings 0.88)
        const scale = Math.max(0.84, 1.0 - norm * norm * 0.12);

        // Edge fade
        const opacity = absNorm > 0.95 ? Math.max(0, 1 - (absNorm - 0.95) / 0.3) : 1;

        // Z-Index (center cards always in front of wings)
        const zIndex = Math.round(100 - norm * norm * 50);

        el.style.zIndex = String(zIndex);
        el.style.opacity = String(opacity);
        el.style.transform = `translate3d(${rawX}px, ${y}px, ${z}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  // Pointer drag controls
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    targetOffsetRef.current = null;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    offsetRef.current = dragStartOffsetRef.current + deltaX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div className="relative w-full select-none overflow-hidden pt-2 pb-6">
      {/* 3D Curved Viewport Stage */}
      <div
        ref={containerRef}
        className="relative w-full h-[270px] sm:h-[290px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          perspective: '1300px',
          perspectiveOrigin: '50% 45%',
          transformStyle: 'preserve-3d',
          touchAction: 'pan-y',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
      >
        {activeCards.map((card, idx) => {
          return (
            <div
              key={`${card.id}-${idx}`}
              ref={(el) => {
                cardElementsRef.current[idx] = el;
              }}
              className="absolute top-1/2 left-1/2 will-change-transform"
              style={{
                width: `${CARD_WIDTH}px`,
                height: '232px',
                marginTop: '-116px',
                marginLeft: `-${CARD_WIDTH / 2}px`,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              <Link href={card.linkHref} className="block w-full h-full cursor-pointer transition-transform hover:scale-[1.02]">
              {/* ========================================================
                  CARD 1: DOCUMENTS & EVIDENCE (Checklist & Green Bars)
                  ======================================================== */}
              {card.type === 'doc' && (
                <div className="w-full h-full rounded-[26px] bg-white/95 backdrop-blur-xl border border-white/90 p-3.5 shadow-[0_16px_36px_-8px_rgba(7,36,86,0.22)] flex flex-col justify-between text-[#101B35]">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>Documents</span>
                      <FileText className="h-3.5 w-3.5 text-[#246BB2]" />
                    </div>
                    <div className="text-2xl font-black font-mono tracking-tight text-[#101B35]">
                      4 / 5
                    </div>
                    <div className="text-[10px] font-bold text-[#059669] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>IRDAI Matched</span>
                    </div>
                  </div>

                  {/* Vertical mini progress indicators matching reference Card 1 */}
                  <div className="space-y-1.5 py-1">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                      <span>Room Rent</span>
                      <span className="text-[#059669] font-bold">100%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="w-full h-full bg-emerald-500 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                      <span>Consumables</span>
                      <span className="text-amber-600 font-bold">82%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="w-[82%] h-full bg-amber-500 rounded-full" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Status</span>
                    <span className="font-bold text-[#059669]">Audited ✓</span>
                  </div>
                </div>
              )}

              {/* ========================================================
                  CARD 2: COVERAGE BREAKDOWN ($110 / Progress Bars)
                  ======================================================== */}
              {card.type === 'coverage' && (
                <div className="w-full h-full rounded-[26px] bg-white/95 backdrop-blur-xl border border-white/90 p-3.5 shadow-[0_16px_36px_-8px_rgba(7,36,86,0.22)] flex flex-col justify-between text-[#101B35]">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>Coverage</span>
                      <Shield className="h-3.5 w-3.5 text-[#059669]" />
                    </div>
                    <div className="text-2xl font-black font-mono tracking-tight text-[#059669]">
                      ₹1,60,000
                    </div>
                    <div className="text-[10px] font-bold text-[#101B35] mt-0.5">
                      Potentially Covered
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-2 border border-slate-100 text-[10px] space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Sum Insured</span>
                      <span className="font-mono font-bold text-[#101B35]">₹5,00,000</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Policy</span>
                      <span className="font-semibold text-[#246BB2]">Verified Active</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Co-pay</span>
                    <span className="font-bold text-[#101B35]">10% Standard</span>
                  </div>
                </div>
              )}

              {/* ========================================================
                  CARD 3: PICTURE CARD 1 - SARAH (Exact match of reference woman photo card!)
                  ======================================================== */}
              {card.type === 'photo-sarah' && (
                <div className="w-full h-full rounded-[26px] bg-white/95 backdrop-blur-xl border border-white/90 p-2.5 shadow-[0_16px_36px_-8px_rgba(7,36,86,0.22)] flex flex-col justify-between text-[#101B35]">
                  {/* Curved photo frame with smiling caregiver */}
                  <div className="relative h-[138px] w-full rounded-[18px] overflow-hidden bg-slate-100 shadow-inner">
                    <Image
                      src="/images/caregiver_portrait.jpg"
                      alt="Healthcare Coordinator providing empathetic care"
                      fill
                      sizes="200px"
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101B35]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                      <span className="text-xs font-bold">Sahaay Guide</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#D9FF32] text-[#101B35] font-black text-[9px] uppercase tracking-wider">
                        AI Lead
                      </span>
                    </div>
                  </div>

                  {/* Two distinct financial pills side-by-side ($2,670 / $1,200 style in reference!) */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                    <div className="rounded-xl bg-slate-50 p-1.5 text-center border border-slate-100">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Cashflow</span>
                      <span className="font-mono font-bold text-xs text-[#101B35]">Verified</span>
                    </div>
                    <div className="rounded-xl bg-emerald-50/70 p-1.5 text-center border border-emerald-100">
                      <span className="text-[8px] uppercase tracking-wider text-emerald-600 font-bold block">Buffer</span>
                      <span className="font-mono font-bold text-xs text-[#059669]">Protected</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  CARD 4: CHART CARD ("Intelligence in Every Decision")
                  ======================================================== */}
              {card.type === 'chart' && (
                <div className="w-full h-full rounded-[26px] bg-white/95 backdrop-blur-xl border border-white/90 p-3.5 shadow-[0_16px_36px_-8px_rgba(7,36,86,0.22)] flex flex-col justify-between text-[#101B35]">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#246BB2] uppercase tracking-wider mb-1">
                      <span>Intelligence</span>
                      <Scale className="h-3.5 w-3.5 text-[#246BB2]" />
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      In Decision
                    </div>
                    <div className="text-lg font-black font-mono tracking-tight text-[#101B35] mt-0.5">
                      Audited Gap
                    </div>
                  </div>

                  {/* Clean glowing SVG Line/Area Chart */}
                  <div className="h-14 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`skyGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#246BB2" stopOpacity="0.38" />
                          <stop offset="100%" stopColor="#246BB2" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 34 Q 25 12, 50 22 T 100 8 L 100 40 L 0 40 Z"
                        fill={`url(#skyGrad-${idx})`}
                      />
                      <path
                        d="M0 34 Q 25 12, 50 22 T 100 8"
                        fill="none"
                        stroke="#246BB2"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] font-semibold text-slate-500">
                    <span>Covered: 82%</span>
                    <span className="text-amber-600 font-bold">Gap: 18%</span>
                  </div>
                </div>
              )}

              {/* ========================================================
                  CARD 5: CENTERPIECE BLACK CARD (FlowPass Protocol)
                  ======================================================== */}
              {card.type === 'flowpass-dark' && (
                <div className="w-full h-full rounded-[26px] bg-[#101B35] text-white p-4 shadow-[0_20px_42px_-6px_rgba(10,17,40,0.5)] border border-white/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#D9FF32] uppercase tracking-wider mb-1.5">
                      <span>FlowPass</span>
                      <Sparkles className="h-3.5 w-3.5 text-[#D9FF32]" />
                    </div>
                    <div className="text-xs font-extrabold text-white leading-snug">
                      Expertise that Combines Strategy, Data, and AI
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/10 p-2 border border-white/10 text-[10px] space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Pre-Approved</span>
                      <span className="font-mono font-bold text-white">₹1,00,000</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Re-entry</span>
                      <span className="font-bold text-[#D9FF32]">Zero (0)</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[9px]">
                    <span className="text-slate-300 font-mono">Token: FP-9920</span>
                    <span className="text-emerald-400 font-bold">Verified ✓</span>
                  </div>
                </div>
              )}

              {/* ========================================================
                  CARD 6: TRANSLUCENT SKY BLUE GLASS CARD (Data Training)
                  ======================================================== */}
              {card.type === 'glass-cyan' && (
                <div className="w-full h-full rounded-[26px] bg-white/25 backdrop-blur-xl border border-white/40 text-white p-3.5 shadow-[0_16px_36px_-8px_rgba(7,36,86,0.22)] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white/90 uppercase tracking-wider">
                    <span>Hospital Sync</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  {/* Circular '+' icon matching reference */}
                  <div className="flex flex-col items-center justify-center my-auto py-1">
                    <div className="h-9 w-9 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white text-base font-bold shadow-sm mb-1.5">
                      +
                    </div>
                    <div className="text-sm font-extrabold text-white">
                      Live TPA Desk
                    </div>
                    <div className="text-[10px] text-blue-100 font-medium">
                      Max Super Speciality
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px]">
                    <span className="text-white/80">Desk API</span>
                    <span className="font-bold text-[#D9FF32]">Connected</span>
                  </div>
                </div>
              )}

              {/* ========================================================
                  CARD 7: DATAPOINTS 520k+ CARD
                  ======================================================== */}
              {card.type === 'datapoints' && (
                <div className="w-full h-full rounded-[26px] bg-white/95 backdrop-blur-xl border border-white/90 p-3.5 shadow-[0_16px_36px_-8px_rgba(7,36,86,0.22)] flex flex-col justify-between text-[#101B35]">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>Data Points</span>
                      <Activity className="h-3.5 w-3.5 text-[#246BB2]" />
                    </div>
                    {/* Reference 520k+ Number */}
                    <div className="text-3xl font-black font-mono tracking-tight text-[#101B35]">
                      520k+
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 leading-snug font-medium">
                    Claims analyzed monthly to power smarter settlements.
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Success Rate</span>
                    <span className="font-bold text-[#059669]">99.4%</span>
                  </div>
                </div>
              )}

              {/* ========================================================
                  CARD 8: MOBILE PHONE SETTLEMENT CARD (Reference Right Phone)
                  ======================================================== */}
              {card.type === 'phone-settle' && (
                <div className="w-full h-full rounded-[26px] bg-white/95 backdrop-blur-xl border border-white/90 p-3 shadow-[0_16px_36px_-8px_rgba(7,36,86,0.22)] flex flex-col justify-between text-[#101B35]">
                  {/* Phone notch bar matching reference */}
                  <div className="w-full rounded-xl bg-slate-900 p-2 text-white flex items-center justify-between text-[9px] font-mono">
                    <span className="font-bold text-[#00BAF2]">Paytm UPI</span>
                    <span className="h-1.5 w-6 rounded-full bg-slate-700" />
                  </div>

                  <div className="py-2 text-center">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Amount Due</span>
                    <span className="font-mono text-xl font-black text-[#101B35]">₹24,600</span>
                    <span className="inline-block mt-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                      Zero Re-entry
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Execution</span>
                    <span className="font-bold text-[#00BAF2]">Instant 1-Tap</span>
                  </div>
                </div>
              )}

              {/* ========================================================
                  CARD 9: PICTURE CARD 2 - ROHAN (Patient / Beneficiary)
                  ======================================================== */}
              {card.type === 'photo-rohan' && (
                <div className="w-full h-full rounded-[26px] bg-white/95 backdrop-blur-xl border border-white/90 p-2.5 shadow-[0_16px_36px_-8px_rgba(7,36,86,0.22)] flex flex-col justify-between text-[#101B35]">
                  <div className="relative h-[138px] w-full rounded-[18px] overflow-hidden bg-slate-100 shadow-inner">
                    <Image
                      src="/images/rohan_portrait.jpg"
                      alt="Beneficiary supported through emergency recovery"
                      fill
                      sizes="200px"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101B35]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                      <span className="text-xs font-bold">Desk Clearance</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#246BB2] text-white font-bold text-[9px]">
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                    <div className="rounded-xl bg-slate-50 p-1.5 text-center border border-slate-100">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Hospital Bill</span>
                      <span className="font-mono font-bold text-xs text-[#101B35]">Audited</span>
                    </div>
                    <div className="rounded-xl bg-blue-50/70 p-1.5 text-center border border-blue-100">
                      <span className="text-[8px] uppercase tracking-wider text-[#246BB2] font-bold block">Settled Gap</span>
                      <span className="font-mono font-bold text-xs text-[#246BB2]">1-Tap UPI</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  CARD 10: PICTURE CARD 3 - FAMILY RELIEF
                  ======================================================== */}
              {card.type === 'photo-family' && (
                <div className="w-full h-full rounded-[26px] bg-white/95 backdrop-blur-xl border border-white/90 p-2.5 shadow-[0_16px_36px_-8px_rgba(7,36,86,0.22)] flex flex-col justify-between text-[#101B35]">
                  <div className="relative h-[138px] w-full rounded-[18px] overflow-hidden bg-slate-100 shadow-inner">
                    <Image
                      src="/images/family_relief.jpg"
                      alt="Family relieved after hospital discharge payment"
                      fill
                      sizes="200px"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101B35]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                      <span className="text-xs font-bold">Aditi & Family</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#059669] text-white font-bold text-[9px]">
                        Settled
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                    <div className="rounded-xl bg-emerald-50/70 p-1.5 text-center border border-emerald-100">
                      <span className="text-[8px] uppercase tracking-wider text-emerald-600 font-bold block">Claim Payout</span>
                      <span className="font-mono font-bold text-xs text-[#059669]">₹1.60L</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-1.5 text-center border border-slate-100">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Deduction</span>
                      <span className="font-mono font-bold text-xs text-[#101B35]">₹0 Surprise</span>
                    </div>
                  </div>
                </div>
              )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
