'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Shield, Globe, ArrowRight, Menu, X } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const isCaseRoute = pathname.includes('/case/');
  const currentCaseId = pathname.match(/\/case\/([^\/]+)/)?.[1];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // On the landing page, the atmospheric hero contains its own integrated transparent navbar
  if (pathname === '/') return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D9D3EF]/60 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Official Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90">
          <div className="relative h-8 sm:h-9 w-36 sm:w-44">
            <Image
              src="/images/sahaay_logo.png"
              alt="Sahaay - Your Financial Journey Partner"
              fill
              priority
              className="object-contain object-left"
            />
          </div>
        </Link>

        {/* Center: Quiet Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#596980]">
          <Link href="/#how-it-works" className="hover:text-[#101B35] transition-colors">
            How It Works
          </Link>
          <Link href="/#how-we-help" className="hover:text-[#101B35] transition-colors">
            How We Help
          </Link>
          <Link href="/#flowpass" className="hover:text-[#101B35] transition-colors">
            FlowPass
          </Link>
          <Link href="/about" className="hover:text-[#101B35] transition-colors">
            About Sahaay
          </Link>
          <Link href="/#security" className="hover:text-[#101B35] transition-colors">
            Security
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Active Case indicator when in case route */}
          {isCaseRoute && currentCaseId && (
            <Link
              href={`/case/${currentCaseId}`}
              className="hidden lg:flex items-center gap-1.5 rounded-full bg-[#E8E4F6] px-3 py-1 text-xs font-semibold text-[#246BB2] border border-[#D9D3EF] hover:bg-[#D9D3EF]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#246BB2] animate-pulse" />
              <span>{currentCaseId}</span>
            </Link>
          )}

          {/* Language Selector */}
          <Link
            href="/language"
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-[#596980] hover:text-[#101B35] hover:bg-slate-100 transition-all"
            title="Choose language"
          >
            <Globe className="h-3.5 w-3.5 text-[#246BB2]" />
            <span className="hidden sm:inline">English / हिंदी</span>
          </Link>

          {/* Sign in */}
          <Link
            href="/consent"
            className="hidden sm:inline-flex text-xs font-semibold text-[#596980] hover:text-[#101B35] px-2.5 py-1 transition-colors"
          >
            Sign in
          </Link>

          {/* Start With Sahaay Button */}
          <Link
            href="/intake"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#101B35] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#246BB2] hover:shadow-md transition-all active:scale-[0.98]"
          >
            <span>Start With Sahaay</span>
            <ArrowRight className="h-3 w-3" />
          </Link>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#596980] hover:text-[#101B35] rounded-lg hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#D9D3EF] bg-white px-5 py-4 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2 text-sm font-medium text-[#596980]">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#101B35]"
            >
              How It Works
            </Link>
            <Link
              href="/#how-we-help"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#101B35]"
            >
              How We Help
            </Link>
            <Link
              href="/#flowpass"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#101B35]"
            >
              FlowPass
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#101B35]"
            >
              About Sahaay
            </Link>
            <Link
              href="/#security"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#101B35]"
            >
              Security
            </Link>
            <Link
              href="/consent"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#101B35]"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
