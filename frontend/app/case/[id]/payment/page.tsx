'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  Shield,
  CheckCircle2,
  Building,
  Volume2,
  Smartphone,
  ArrowRight,
  X,
  Lock,
  Sparkles,
  Car,
  HeartPulse,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { api } from '@/lib/api';
import { CaseData } from '@/lib/types';
import { CaseWorkflowNav } from '@/components/sahaay/CaseWorkflowNav';

export default function PaytmCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = params?.id as string;

  const [amount, setAmount] = useState<number>(0);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [orderId, setOrderId] = useState<string>(`PTM-ORD-${Date.now().toString().slice(-6)}`);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isPaytmAppOpen, setIsPaytmAppOpen] = useState(false);
  const [upiPin, setUpiPin] = useState(['', '', '', '']);
  const [pinStep, setPinStep] = useState<'enter_pin' | 'processing' | 'paid'>('enter_pin');
  const [soundboxPlayed, setSoundboxPlayed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (!caseId) return;
        const queryAmt = searchParams?.get('amount');
        let targetAmt = 0;
        if (queryAmt && !isNaN(Number(queryAmt))) {
          targetAmt = Number(queryAmt);
        }

        const data = await api.getCase(caseId);
        if (data) {
          setCaseData(data);
          const gap = data.analysis?.gap_result?.potential_gap ?? (data.total_amount ? Math.round(data.total_amount * 0.3) : 0);
          if (!targetAmt) {
            targetAmt = gap;
          }
        }
        setAmount(targetAmt);

        // Initialize backend payment order
        if (targetAmt > 0) {
          const userId = typeof window !== 'undefined' ? localStorage.getItem('sahaay_user_id') || 'user-default' : 'user-default';
          const order = await api.createPayment(caseId, targetAmt, userId);
          if (order && (order.paytm_order_id || (order as any).order_id)) {
            setOrderId(order.paytm_order_id || (order as any).order_id);
          }
        }
      } catch (e) {
        console.warn('Failed to initialize payment order', e);
      }
    }
    load();
  }, [caseId, searchParams]);

  const emergencyType = caseData?.emergency_type || caseData?.type || 'medical';

  const provider = (caseData as any)?.provider_name || (caseData as any)?.analysis?.insurance_analysis?.provider_name;

  const merchantConfig: Record<string, { name: string; desc: string }> = {
    medical: {
      name: provider ? `${provider} Counter` : 'Hospital Billing Counter',
      desc: 'Hospital Billing Desk Settlement',
    },
    vehicle: {
      name: provider ? `${provider} Workshop` : 'Authorized Workshop Desk',
      desc: 'Garage Repair & Deductible Settlement',
    },
    income: {
      name: 'Verified Loan & Rental Escrow',
      desc: 'Urgent Monthly Obligations Bridge',
    },
    unexpected: {
      name: provider ? `${provider} Service` : 'Emergency Remediation Service',
      desc: 'Emergency Remediation Invoice',
    },
  };

  const currentMerchant = merchantConfig[emergencyType] || merchantConfig.medical;

  // Play pleasant Paytm Soundbox style chime using Web Audio API
  const playPaytmChime = (paidAmount: number) => {
    try {
      if (typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const now = ctx.currentTime;

          // Note 1 (E5)
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(659.25, now);
          gain1.gain.setValueAtTime(0.3, now);
          gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.35);

          // Note 2 (G#5)
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(830.61, now + 0.15);
          gain2.gain.setValueAtTime(0.3, now + 0.15);
          gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(now + 0.15);
          osc2.stop(now + 0.55);

          // Note 3 (B5 - high finish)
          const osc3 = ctx.createOscillator();
          const gain3 = ctx.createGain();
          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(987.77, now + 0.3);
          gain3.gain.setValueAtTime(0.35, now + 0.3);
          gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
          osc3.connect(gain3);
          gain3.connect(ctx.destination);
          osc3.start(now + 0.3);
          osc3.stop(now + 0.85);
        }

        // Voice announcement fallback
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(`Paytm par ${paidAmount} rupaye prapt hue`);
          utterance.lang = 'hi-IN';
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (e) {
      console.log('Audio feedback:', e);
    }
  };

  const handleOpenPaytm = () => {
    setIsPaytmAppOpen(true);
    setPinStep('enter_pin');
    setUpiPin(['', '', '', '']);
    setSoundboxPlayed(false);
  };

  const handleSimulatePinInput = async (digit: string) => {
    const nextIndex = upiPin.findIndex(val => val === '');
    if (nextIndex !== -1) {
      const newPin = [...upiPin];
      newPin[nextIndex] = digit;
      setUpiPin(newPin);

      // Auto-trigger approval when 4 digits filled
      if (nextIndex === 3) {
        setPinStep('processing');
        try {
          const res = await api.simulatePaymentSuccess(orderId);
          if (res && res.status === 'success') {
            setPinStep('paid');
            playPaytmChime(amount);
            setSoundboxPlayed(true);
          } else {
            setPinStep('enter_pin');
            alert('Payment settlement could not be verified by server.');
          }
        } catch (err) {
          console.error('Payment settlement error:', err);
          setPinStep('enter_pin');
        }
      }
    }
  };

  const handleInstantOneClickPay = async () => {
    setUpiPin(['●', '●', '●', '●']);
    setPinStep('processing');
    try {
      const res = await api.simulatePaymentSuccess(orderId);
      if (res && res.status === 'success') {
        setPinStep('paid');
        playPaytmChime(amount);
        setSoundboxPlayed(true);
      } else {
        setPinStep('enter_pin');
        alert('Payment settlement could not be verified.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPinStep('enter_pin');
    }
  };

  const handleReturnToSahaay = () => {
    router.push(`/case/${caseId}/status?orderId=${orderId}&amount=${amount}`);
  };

  return (
    <div className="min-h-screen bg-[#9BB0D8] pb-20 text-[#0D1C34] selection:bg-[#D9FF32] selection:text-[#0D1C34]">
      {/* Workflow Navigation */}
      <CaseWorkflowNav caseId={caseId} activeStation="payment" emergencyTitle="Direct Paytm Settlement" />

      <div className="mx-auto flex max-w-xl flex-col px-4 pt-8 sm:px-6">
        {/* Main Billing Desk Card */}
        <div className="rounded-[32px] border border-white bg-white p-6 sm:p-8 shadow-2xl">
          <div className="text-center pb-6 border-b border-slate-100">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
              TOTAL PAYABLE GAP SETTLEMENT
            </span>
            <div className="mt-2 text-4xl sm:text-5xl font-extrabold text-[#0D1C34] font-mono tracking-tight">
              {formatINR(amount)}
            </div>
            <p className="text-xs text-slate-600 mt-2 font-semibold">
              Beneficiary: {currentMerchant.name}
            </p>
          </div>

          {/* Paytm Secure Checkout Inner Container */}
          <div className="mt-6 rounded-3xl border-2 border-[#00BAF2] bg-sky-50/30 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#00BAF2] font-black text-white text-xs shadow-xs">
                  P
                </div>
                <span className="text-sm font-bold text-[#101B35] tracking-wide">
                  Paytm Secure Checkout
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                {orderId}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2.5">
              {/* Paytm UPI */}
              <div
                onClick={() => setSelectedMethod('upi')}
                className={`flex items-center justify-between rounded-2xl p-4 border cursor-pointer transition-all ${
                  selectedMethod === 'upi'
                    ? 'border-[#00BAF2] bg-white shadow-sm ring-2 ring-sky-100'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-[#101B35] block">Paytm UPI</span>
                  <span className="text-[11px] text-slate-500 font-medium">Instant 1-Click verified bank debit</span>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedMethod === 'upi'
                      ? 'border-[#00BAF2] bg-[#00BAF2]'
                      : 'border-slate-300 bg-transparent'
                  }`}
                >
                  {selectedMethod === 'upi' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </div>

              {/* Credit / Debit Card */}
              <div
                onClick={() => setSelectedMethod('card')}
                className={`flex items-center justify-between rounded-2xl p-4 border cursor-pointer transition-all ${
                  selectedMethod === 'card'
                    ? 'border-[#00BAF2] bg-white shadow-sm ring-2 ring-sky-100'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-[#101B35] block">Credit / Debit Card</span>
                  <span className="text-[11px] text-slate-500 font-medium">Visa, Mastercard, RuPay, Corporate</span>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedMethod === 'card'
                      ? 'border-[#00BAF2] bg-[#00BAF2]'
                      : 'border-slate-300 bg-transparent'
                  }`}
                >
                  {selectedMethod === 'card' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </div>

              {/* Net Banking */}
              <div
                onClick={() => setSelectedMethod('netbanking')}
                className={`flex items-center justify-between rounded-2xl p-4 border cursor-pointer transition-all ${
                  selectedMethod === 'netbanking'
                    ? 'border-[#00BAF2] bg-white shadow-sm ring-2 ring-sky-100'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-[#101B35] block">Net Banking</span>
                  <span className="text-[11px] text-slate-500 font-medium">All Indian Scheduled Banks Supported</span>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedMethod === 'netbanking'
                      ? 'border-[#00BAF2] bg-[#00BAF2]'
                      : 'border-slate-300 bg-transparent'
                  }`}
                >
                  {selectedMethod === 'netbanking' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </div>

            {/* Action Button that Opens Paytm App Simulator */}
            <button
              onClick={handleOpenPaytm}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-full bg-[#D9FF32] hover:bg-[#CCF025] text-[#101B35] font-extrabold py-4 text-sm shadow-sm active:scale-[0.99] transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
              <span>Authorize & Pay {formatINR(amount)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* REALISTIC PAYTM APP OVERLAY MODAL */}
      {isPaytmAppOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          {/* Mobile phone frame */}
          <div className="relative w-full max-w-sm overflow-hidden rounded-[36px] border-4 border-slate-800 bg-[#002E6E] shadow-2xl text-white">
            {/* Top Phone notch / status bar */}
            <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[11px] text-slate-300 border-b border-white/10">
              <span className="font-semibold">9:41</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Paytm App Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#00BAF2] text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#002E6E] font-black text-xs">
                  P
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase">Paytm UPI</h4>
                  <span className="text-[9px] text-white/90">Verified Merchant Settlement</span>
                </div>
              </div>

              {pinStep !== 'paid' && (
                <button
                  onClick={() => setIsPaytmAppOpen(false)}
                  className="rounded-full bg-black/20 p-1 text-white hover:bg-black/30"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* SCREEN 1: ENTER UPI PIN */}
            {pinStep === 'enter_pin' && (
              <div className="p-6 bg-[#002E6E] space-y-5">
                <div className="text-center pt-2">
                  <span className="text-[10px] text-slate-300 uppercase tracking-widest">Paying To</span>
                  <h3 className="text-base font-bold text-white mt-0.5 flex items-center justify-center gap-1">
                    <Building className="h-4 w-4 text-[#00BAF2]" /> {currentMerchant.name}
                  </h3>
                  <div className="mt-3 text-3xl font-extrabold text-white font-mono">
                    {formatINR(amount)}
                  </div>
                  <span className="text-[10px] text-slate-300 block mt-1">
                    From: Bank A/c ending in **4912
                  </span>
                </div>

                {/* 4-digit PIN Boxes */}
                <div className="py-2">
                  <span className="text-[11px] text-center block text-slate-300 mb-2">
                    Enter 4-Digit UPI PIN or 1-Click Pay:
                  </span>
                  <div className="flex justify-center gap-3">
                    {upiPin.map((val, idx) => (
                      <div
                        key={idx}
                        className={`h-11 w-11 rounded-xl border-2 flex items-center justify-center font-bold text-xl ${
                          val
                            ? 'border-[#00BAF2] bg-white/20 text-white'
                            : 'border-white/20 bg-black/30 text-slate-500'
                        }`}
                      >
                        {val ? '●' : ''}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Keypad */}
                <div className="grid grid-cols-3 gap-2 text-center text-sm font-bold">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                    <button
                      key={d}
                      onClick={() => handleSimulatePinInput(d)}
                      className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 active:scale-95 transition-all text-white"
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    onClick={() => setUpiPin(['', '', '', ''])}
                    className="rounded-xl bg-white/5 p-2.5 text-xs text-slate-400 hover:bg-white/10"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => handleSimulatePinInput('0')}
                    className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 text-white"
                  >
                    0
                  </button>
                  <button
                    onClick={handleInstantOneClickPay}
                    className="rounded-xl bg-[#D9FF32] text-[#101B35] p-2.5 text-xs font-black shadow-md hover:bg-[#CCF025]"
                  >
                    Pay
                  </button>
                </div>

                {/* Instant 1-Click bypass button */}
                <button
                  onClick={handleInstantOneClickPay}
                  className="w-full rounded-full bg-gradient-to-r from-[#00BAF2] to-[#D9FF32] text-[#101B35] font-black py-3 text-xs shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                >
                  ⚡ Instant 1-Click Biometric Pay ({formatINR(amount)})
                </button>
              </div>
            )}

            {/* SCREEN 2: PROCESSING ANIMATION */}
            {pinStep === 'processing' && (
              <div className="p-10 bg-[#002E6E] text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00BAF2]/20 border border-[#00BAF2]/40 animate-pulse">
                  <div className="h-8 w-8 rounded-full border-4 border-[#00BAF2] border-t-transparent animate-spin" />
                </div>
                <h3 className="text-base font-bold text-white">Connecting with Bank UPI Server...</h3>
                <p className="text-xs text-slate-300">Debiting {formatINR(amount)} for {currentMerchant.name}</p>
              </div>
            )}

            {/* SCREEN 3: ICONIC PAYTM "PAID SUCCESSFULLY" SCREEN */}
            {pinStep === 'paid' && (
              <div className="p-6 bg-gradient-to-b from-[#002E6E] to-[#0A4D9E] text-center space-y-4 animate-fade-in">
                {/* Big Green checkmark */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/40 animate-bounce">
                  <CheckCircle2 className="h-12 w-12 stroke-[2.5]" />
                </div>

                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                    Payment Successful
                  </span>
                  <div className="mt-1 text-3xl font-extrabold text-white font-mono">
                    {formatINR(amount)}
                  </div>
                  <p className="text-xs text-slate-200 mt-1 font-semibold">
                    Paid to {currentMerchant.name}
                  </p>
                </div>

                {/* Soundbox chime confirmation notification */}
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-left flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00BAF2] text-white shrink-0 shadow-md">
                    <Volume2 className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-[#00BAF2] block">Paytm Soundbox Broadcast:</span>
                    <span className="text-white italic">"Paytm par {formatINR(amount)} prapt hue"</span>
                  </div>
                </div>

                {/* Transaction receipt metadata */}
                <div className="rounded-2xl bg-black/40 p-3 text-[11px] text-slate-300 text-left space-y-1.5 border border-white/5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">UPI Ref ID:</span>
                    <span className="font-bold text-white">426189392102</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Order ID:</span>
                    <span className="text-white">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Time:</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* CTA to return to Sahaay case */}
                <button
                  onClick={handleReturnToSahaay}
                  className="w-full mt-2 rounded-full bg-[#D9FF32] text-[#101B35] font-black py-3.5 text-xs shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Return to Sahaay Case Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
