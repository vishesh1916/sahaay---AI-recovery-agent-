'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';

export function HumanStoryCard() {
  const stories = [
    {
      id: 'medical_recovery',
      quote:
        '“Sahaay helped us understand our hospital insurance, arrange the remaining amount and make the payment — without starting over.”',
      author: 'Verified Hospital Patient Recovery',
      caseInfo: 'Inpatient Medical Emergency • Policy Clause Audit',
      image: '/images/mother_daughter_relief.jpg',
      alt: 'Mother tenderly embracing her young daughter with immense relief',
      note: 'Protected from proportionate room-rent deductions',
    },
    {
      id: 'collision_defense',
      quote:
        '“After our highway accident, the workshop asked for an unexpected deficit beyond insurer approval. Sahaay audited the zero-depreciation dispute and funded the gap directly.”',
      author: 'Verified Vehicle Claim Resolution',
      caseInfo: 'Vehicle Collision • Workshop Salvage Defense',
      image: '/images/card_vehicle_accident.jpg',
      alt: 'Vehicle owner and advisor reviewing collision repair claim',
      note: 'Zero-depreciation & parts salvage verified against policy',
    },
    {
      id: 'income_continuity',
      quote:
        '“When unexpected medical leave interrupted regular monthly inflow, our essential EMIs were at risk. Sahaay bridged our cash flow and restored household financial stability.”',
      author: 'Verified Household Financial Continuity',
      caseInfo: 'Income Interruption • Emergency Cashflow Bridge',
      image: '/images/card_income_interruption.jpg',
      alt: 'Couple thoughtfully organizing budget sheets and bridge relief',
      note: '100% essential EMIs shielded during recovery',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const story = stories[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-[36px] sm:rounded-[44px] overflow-hidden bg-white shadow-2xl border border-white/60 grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left Side: Authentic High-Res Documentary Image */}
        <div className="lg:col-span-6 relative min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] w-full bg-slate-100">
          <Image
            src={story.image}
            alt={story.alt}
            fill
            className="object-cover object-center transition-all duration-700"
            priority
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
          <div className="absolute bottom-4 left-4 lg:hidden text-xs text-white font-medium bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
            {story.caseInfo}
          </div>
        </div>

        {/* Right Side: Editorial Off-White Testimonial Container */}
        <div className="lg:col-span-6 bg-[#FAF9F6] p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
          <div>
            {/* Eyebrow matching reference */}
            <div className="text-[11px] font-bold tracking-widest uppercase text-[#596980] mb-6">
              REAL PEOPLE, REAL JOURNEYS.
            </div>

            {/* Quote in high contrast editorial serif font */}
            <blockquote className="font-serif-editorial text-2xl sm:text-3xl lg:text-[2.25rem] font-normal text-[#101B35] leading-[1.25] tracking-tight">
              {story.quote}
            </blockquote>

            <div className="mt-8 space-y-1">
              <div className="text-sm sm:text-base font-bold text-[#101B35]">
                {story.author}
              </div>
              <div className="text-xs text-[#596980]">
                {story.caseInfo}
              </div>
            </div>
          </div>

          {/* Bottom Bar: Protective highlight note + Navigation arrows */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {story.note}
            </span>

            {/* Navigation buttons matching reference */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-[#101B35] hover:bg-slate-100 transition-colors shadow-xs"
                aria-label="Previous story"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-[#101B35] hover:bg-slate-100 transition-colors shadow-xs"
                aria-label="Next story"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
