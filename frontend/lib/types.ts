export type EmergencyType =
  | 'medical'
  | 'vehicle'
  | 'income'
  | 'unexpected'
  | 'other';

export type EvidenceStatus =
  | 'verified'
  | 'extracted'
  | 'user_provided'
  | 'estimated'
  | 'conflicting'
  | 'needs_review'
  | 'missing';

export type LineItemCategory =
  | 'associated'
  | 'non_associated'
  | 'excluded'
  | 'needs_review';

export type PaymentState =
  | 'pending'
  | 'approved'
  | 'checkout_open'
  | 'processing'
  | 'success'
  | 'failed';

export type JourneyState =
  | 'intake'
  | 'processing'
  | 'analyzed'
  | 'gap_calculated'
  | 'recovery_planned'
  | 'funding_prepared'
  | 'payment_pending'
  | 'completed'
  | 'escalated';

export interface User {
  user_id: string;
  name: string;
  language: string;
  consent_health: boolean;
  consent_financial: boolean;
  consent_payment: boolean;
}

export interface DocumentInfo {
  document_id: string;
  case_id: string;
  type: string;
  filename: string;
  file_path?: string;
  status: string;
  parsed_content?: string;
  created_at: string;
}

export interface EvidenceItem {
  evidence_id: string;
  document_id: string;
  page: number;
  section: string;
  source_text: string;
  field: string;
  value: string;
  status: EvidenceStatus;
}

export interface LineItem {
  name: string;
  amount: number;
  category: LineItemCategory;
  covered_amount?: number;
  deduction?: number;
  reason?: string;
  evidence_status?: EvidenceStatus;
  source_ref?: string;
}

export interface DeductionDetail {
  item_name: string;
  original_amount: number;
  covered_amount: number;
  deduction_amount: number;
  reason: string;
  category: string;
  evidence_ref: string;
}

export interface FinancialProfile {
  average_inflow: number;
  recurring_expenses: number;
  existing_obligations: number;
  liquidity_buffer: number;
  source: string;
  months_analyzed?: number;
  field_sources?: Record<string, string>;
}

export interface InsuranceAnalysis {
  potential_coverage: number;
  potential_gap: number;
  missing_documents: string[];
  claim_readiness: number;
  policy_flags?: Record<string, any>;
  line_items: LineItem[];
  coverage_analysis?: any[];
  room_rent_analysis?: {
    limit_per_day: number;
    clause_reference: string;
    proportionate_clause_exists: boolean;
    proportionate_clause_reference: string;
  };
  exclusions_found?: string[];
}

export interface GapCalculation {
  total_bill: number;
  total_associated: number;
  total_non_associated: number;
  total_excluded: number;
  room_rent_actual_per_day: number;
  room_rent_allowed_per_day: number;
  proportionate_ratio: number;
  associated_after_deduction: number;
  non_associated_covered: number;
  excluded_amount: number;
  potential_claim_amount: number;
  potential_gap: number;
  deductions: DeductionDetail[];
  line_item_results: any[];
}

export interface RecoveryScenario {
  id: string;
  title: string;
  description: string;
  amount_from_insurance: number;
  amount_from_savings: number;
  amount_from_funding: number;
  remaining_buffer: number;
  monthly_impact: number;
  payment_pressure: 'low' | 'medium' | 'high';
  recommended: boolean;
  action: string;
  emi_options?: Array<{ months: number; emi: number }>;
}

export interface FlowPass {
  case_id: string;
  user_preferences: {
    language: string;
  };
  verified_evidence: Array<{
    document_id: string;
    field: string;
    status: EvidenceStatus;
    source_ref: string;
  }>;
  insurance_state: {
    potential_coverage: number;
    potential_gap: number;
    missing_documents: string[];
    claim_readiness: number;
    exclusions_found: string[];
  };
  financial_profile: FinancialProfile;
  recovery_scenario: {
    scenarios: RecoveryScenario[];
    selected_path: string | null;
    gap_amount: number;
  };
  funding_context?: {
    amount_required: number;
    purpose: string;
    already_verified: Array<{ field: string; value: string; source: string }>;
    needs_confirmation: Array<{ field: string; description: string; pre_filled: string | null }>;
    verified_count: number;
    confirmation_count: number;
    flowpass_reused: boolean;
    traditional_fields_required: number;
    fields_eliminated: number;
  };
  journey_state: JourneyState;
}

export interface CaseData {
  case_id: string;
  user_id: string;
  type: string;
  emergency_type?: string;
  total_amount?: number;
  status: string;
  user_input: string;
  language: string;
  documents: DocumentInfo[];
  created_at: string;
  updated_at: string;
  analysis?: {
    insurance_analysis?: InsuranceAnalysis;
    financial_context?: FinancialProfile;
    gap_result?: GapCalculation;
    recovery_scenarios?: RecoveryScenario[];
    flowpass?: FlowPass;
    journey_state?: JourneyState;
    escalation?: any;
  };
}

export interface PaymentRecord {
  transaction_id: string;
  case_id: string;
  provider: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  paytm_order_id?: string;
  paytm_txn_token?: string;
  txn_id?: string;
  created_at: string;
}
