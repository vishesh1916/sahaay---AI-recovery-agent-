import React from 'react';
import { CheckCircle2, FileSearch, UserCheck, Calculator, AlertTriangle, HelpCircle, XCircle } from 'lucide-react';
import { EvidenceStatus } from '@/lib/types';

interface EvidenceBadgeProps {
  status: EvidenceStatus | string;
  showIcon?: boolean;
  className?: string;
}

export function EvidenceBadge({ status, showIcon = true, className = '' }: EvidenceBadgeProps) {
  const normalized = (status || 'extracted').toLowerCase().replace(' ', '_');

  switch (normalized) {
    case 'verified':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] ${className}`}>
          {showIcon && <CheckCircle2 className="h-3.5 w-3.5" />}
          <span>Verified</span>
        </span>
      );
    case 'extracted':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] ${className}`}>
          {showIcon && <FileSearch className="h-3.5 w-3.5" />}
          <span>Extracted</span>
        </span>
      );
    case 'user_provided':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3EFFD] text-[#5B21B6] border border-[#DDD3F3] ${className}`}>
          {showIcon && <UserCheck className="h-3.5 w-3.5" />}
          <span>User Provided</span>
        </span>
      );
    case 'estimated':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] ${className}`}>
          {showIcon && <Calculator className="h-3.5 w-3.5" />}
          <span>Estimated</span>
        </span>
      );
    case 'conflicting':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] animate-pulse ${className}`}>
          {showIcon && <AlertTriangle className="h-3.5 w-3.5" />}
          <span>Conflicting</span>
        </span>
      );
    case 'needs_review':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] ${className}`}>
          {showIcon && <HelpCircle className="h-3.5 w-3.5" />}
          <span>Needs Review</span>
        </span>
      );
    case 'missing':
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] ${className}`}>
          {showIcon && <XCircle className="h-3.5 w-3.5" />}
          <span>Missing</span>
        </span>
      );
  }
}
