'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Globe, Check } from 'lucide-react';
import { useLanguage, Language } from '@/context/LanguageContext';

const languages = [
  {
    id: 'english',
    code: 'en' as Language,
    name: 'English',
    nativeName: 'English',
    sample: '"My mother is admitted. Hospital bill is ₹1,84,600."',
    description: 'Clear, concise English with itemized financial breakdowns',
  },
  {
    id: 'hindi',
    code: 'hi' as Language,
    name: 'हिंदी',
    nativeName: 'Hindi',
    sample: '"मेरी माँ अस्पताल में भर्ती हैं। बिल ₹1,84,600 है।"',
    description: 'शुद्ध और सरल हिंदी में पूरी वित्तीय सहायता',
  },
  {
    id: 'hinglish',
    code: 'hinglish' as Language,
    name: 'Hinglish',
    nativeName: 'Hindi + English',
    sample: '"Meri maa admit hain aur hospital bill ₹1,84,600 hai."',
    description: 'Casual, conversational everyday blend for quick voice input',
    popular: true,
  },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'hinglish');

  const handleContinue = () => {
    setLanguage(selectedLang);
    router.push('/consent');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF9F6] flex items-center justify-center px-4 py-16 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center">
        {/* Brand Logo */}
        <div className="relative h-12 w-52 mb-6">
          <Image
            src="/images/sahaay_logo.png"
            alt="Sahaay - Your Financial Journey Partner"
            fill
            priority
            className="object-contain"
          />
        </div>

        <div className="text-center">
          <span className="inline-block rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#246BB2] border border-sky-200">
            Step 1 of 3 • Language Preference
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#101B35] sm:text-4xl">
            Talk to Sahaay your way
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Choose the language you feel most comfortable explaining your emergency in.
          </p>
        </div>

        {/* Language cards */}
        <div className="mt-10 grid w-full gap-5 sm:grid-cols-3">
          {languages.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <div
                key={lang.id}
                onClick={() => setSelectedLang(lang.code)}
                className={`relative flex flex-col justify-between rounded-3xl border p-6 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'border-2 border-[#246BB2] bg-white shadow-xl shadow-[#246BB2]/10 scale-103 ring-4 ring-sky-100'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {lang.popular && (
                  <span className="absolute -top-3 right-5 rounded-full bg-[#D9FF32] px-3 py-0.5 text-[10px] font-extrabold text-[#101B35] shadow-xs">
                    Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#101B35]">{lang.name}</h3>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? 'border-[#246BB2] bg-[#246BB2] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{lang.description}</p>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/70">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Example Voice Prompt</span>
                  <p className="mt-1 text-xs italic text-slate-700 line-clamp-2">{lang.sample}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#D9FF32] px-8 py-3.5 text-sm font-bold text-[#101B35] shadow-sm hover:bg-[#CCF025] hover:scale-102 active:scale-98 transition-all"
        >
          <span>Continue to DPDP Consent</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
