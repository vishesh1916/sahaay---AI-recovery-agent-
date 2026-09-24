import { CaseData, FlowPass, GapCalculation, LineItem, RecoveryScenario } from './types';

export const mockLineItems: LineItem[] = [
  {
    name: "Room Rent (10 days × ₹7,000)",
    amount: 70000,
    category: "associated",
    covered_amount: 50000,
    deduction: 20000,
    reason: "Room rent capped at ₹5,000/day limit. Excess ₹2,000/day not payable.",
    evidence_status: "verified",
    source_ref: "Policy Sec 2.1; Hospital Bill Pg 1"
  },
  {
    name: "Surgeon Fees",
    amount: 35000,
    category: "associated",
    covered_amount: 25000,
    deduction: 10000,
    reason: "Proportionate deduction (71.43%) applied due to room category upgrade.",
    evidence_status: "estimated",
    source_ref: "Policy Sec 4.2"
  },
  {
    name: "Doctor / Consultation Fees",
    amount: 15000,
    category: "associated",
    covered_amount: 10714,
    deduction: 4286,
    reason: "Proportionate deduction applied.",
    evidence_status: "estimated",
    source_ref: "Policy Sec 4.2"
  },
  {
    name: "OT (Operation Theatre) Charges",
    amount: 12000,
    category: "associated",
    covered_amount: 8571,
    deduction: 3429,
    reason: "Proportionate deduction applied.",
    evidence_status: "estimated",
    source_ref: "Policy Sec 4.2"
  },
  {
    name: "Nursing Charges",
    amount: 8000,
    category: "associated",
    covered_amount: 5714,
    deduction: 2286,
    reason: "Proportionate deduction applied.",
    evidence_status: "estimated",
    source_ref: "Policy Sec 4.2"
  },
  {
    name: "Pharmacy & Medicines",
    amount: 18600,
    category: "non_associated",
    covered_amount: 18600,
    deduction: 0,
    reason: "Covered 100% (non-associated with room rent). Prescriptions verified.",
    evidence_status: "verified",
    source_ref: "Policy Sec 1.1; Pharmacy Invoices"
  },
  {
    name: "Diagnostics & Lab Tests",
    amount: 12000,
    category: "non_associated",
    covered_amount: 12000,
    deduction: 0,
    reason: "Covered 100% (non-associated). Pathology & Ultrasound reports present.",
    evidence_status: "verified",
    source_ref: "Policy Sec 1.2; Lab Reports"
  },
  {
    name: "Surgical Implants",
    amount: 8000,
    category: "non_associated",
    covered_amount: 8000,
    deduction: 0,
    reason: "Covered within standard implant limits.",
    evidence_status: "extracted",
    source_ref: "Bill Pg 2; Implant Invoice"
  },
  {
    name: "Consumables & PPE",
    amount: 6000,
    category: "excluded",
    covered_amount: 0,
    deduction: 6000,
    reason: "Standard policy exclusion for non-medical items & sanitizers.",
    evidence_status: "verified",
    source_ref: "Policy Sec 5.4 - General Exclusions"
  },
];

export const mockGapResult: GapCalculation = {
  total_bill: 184600,
  total_associated: 143000,
  total_non_associated: 38600,
  total_excluded: 6000,
  room_rent_actual_per_day: 7000,
  room_rent_allowed_per_day: 5000,
  proportionate_ratio: 0.7143,
  associated_after_deduction: 99999,
  non_associated_covered: 38600,
  excluded_amount: 6000,
  potential_claim_amount: 138599,
  potential_gap: 46001,
  deductions: [
    {
      item_name: "Room Rent Excess (10 days)",
      original_amount: 70000,
      covered_amount: 50000,
      deduction_amount: 20000,
      reason: "Room rent capped at ₹5,000/day. You opted for ₹7,000/day Deluxe room.",
      category: "associated",
      evidence_ref: "Policy Section 2.1 — Room Rent Sub-limits"
    },
    {
      item_name: "Proportionate Associated Reductions",
      original_amount: 73000,
      covered_amount: 52143,
      deduction_amount: 20857,
      reason: "Associated surgeon, doctor, OT & nursing fees reduced by 28.57% due to room limit breach.",
      category: "associated",
      evidence_ref: "Policy Section 4.2 — Proportionate Expense Clause"
    },
    {
      item_name: "Non-Payable Consumables",
      original_amount: 6000,
      covered_amount: 0,
      deduction_amount: 6000,
      reason: "Gloves, sanitizers, administrative kits excluded by standard IRDAI policy list.",
      category: "excluded",
      evidence_ref: "Policy Section 5.4 — Non-Medical Expenses"
    }
  ],
  line_item_results: mockLineItems
};

export const mockRecoveryScenarios: RecoveryScenario[] = [
  {
    id: "insurance_savings",
    title: "Complete Claim + Liquidity Buffer",
    description: "Submit verified insurance claim for ₹1,38,599 and pay ₹46,001 gap from liquid cash reserves.",
    amount_from_insurance: 138599,
    amount_from_savings: 46001,
    amount_from_funding: 0,
    remaining_buffer: 0,
    monthly_impact: 0,
    payment_pressure: "high",
    recommended: false,
    action: "Leaves emergency buffer exhausted (₹0 remaining). High risk if further expenses occur."
  },
  {
    id: "insurance_funding",
    title: "Insurance + Smart Recovery Financing",
    description: "Submit ₹1,38,599 insurance claim + fund ₹35,000 through low-interest health line of credit, preserving ₹15,800 safety buffer.",
    amount_from_insurance: 138599,
    amount_from_savings: 11001,
    amount_from_funding: 35000,
    remaining_buffer: 15800,
    monthly_impact: 3120,
    payment_pressure: "low",
    recommended: true,
    action: "Safest path: Protects monthly cash flow and retains rainy day reserve.",
    emi_options: [
      { months: 6, emi: 6050 },
      { months: 12, emi: 3120 }
    ]
  },
  {
    id: "direct_payment",
    title: "Instant Paytm Gap Settlement",
    description: "Pay the hospital gap directly via Paytm UPI / Card to facilitate immediate patient discharge.",
    amount_from_insurance: 138599,
    amount_from_savings: 46001,
    amount_from_funding: 0,
    remaining_buffer: 0,
    monthly_impact: 0,
    payment_pressure: "high",
    recommended: false,
    action: "Fastest checkout at hospital billing counter."
  }
];

export const mockFlowPass: FlowPass = {
  case_id: "CASE-SH-LIVE",
  user_preferences: {
    language: "hinglish"
  },
  verified_evidence: [
    {
      document_id: "doc-pol-01",
      field: "policy_sum_insured",
      status: "verified",
      source_ref: "Page 1, Section 1: Coverage Terms"
    },
    {
      document_id: "doc-pol-01",
      field: "room_rent_limit",
      status: "verified",
      source_ref: "Page 2, Section 2.1: ₹5,000/day cap"
    },
    {
      document_id: "doc-bill-01",
      field: "hospital_final_bill",
      status: "verified",
      source_ref: "Page 1: Inpatient Summary"
    },
    {
      document_id: "doc-dis-01",
      field: "stay_duration",
      status: "extracted",
      source_ref: "Page 1: Inpatient Discharge Record"
    }
  ],
  insurance_state: {
    potential_coverage: 138599,
    potential_gap: 46001,
    missing_documents: ["Prescription for Pharmacy", "KYC Verification"],
    claim_readiness: 72,
    exclusions_found: ["Consumables", "PPE Kits"]
  },
  financial_profile: {
    average_inflow: 53700,
    recurring_expenses: 31400,
    existing_obligations: 6500,
    liquidity_buffer: 15800,
    source: "Account Aggregator (Setu Sandbox / Synced CSV)",
    months_analyzed: 6,
    field_sources: {
      average_inflow: "imported",
      recurring_expenses: "imported",
      existing_obligations: "imported",
      liquidity_buffer: "estimated"
    }
  },
  recovery_scenario: {
    scenarios: mockRecoveryScenarios,
    selected_path: "insurance_funding",
    gap_amount: 46001
  },
  funding_context: {
    amount_required: 46001,
    purpose: "Hospitalization Gap Settlement",
    already_verified: [
      { field: "Monthly Inflow", value: "₹53,700", source: "Verified via FlowPass AA" },
      { field: "Fixed Monthly Expense", value: "₹31,400", source: "Verified via FlowPass AA" },
      { field: "Current Obligations", value: "₹6,500 EMI", source: "Verified via FlowPass AA" },
      { field: "Discharge Summary & Hospital Bill", value: "Inpatient Billing Desk", source: "Verified Documents" },
      { field: "KYC & Identity", value: "Verified Identity (PAN / Aadhaar)", source: "Consent Profile" }
    ],
    needs_confirmation: [
      { field: "Repayment Tenure", description: "Select 6 or 12 months recovery timeline", pre_filled: "12 Months (₹3,120/mo)" },
      { field: "Auto-Debit Bank Account", description: "Select verified account for EMI settlement", pre_filled: "Verified Bank Account ending in **4912" }
    ],
    verified_count: 5,
    confirmation_count: 2,
    flowpass_reused: true,
    traditional_fields_required: 18,
    fields_eliminated: 16
  },
  journey_state: "funding_prepared"
};

export const mockDefaultCase: CaseData = {
  case_id: "CASE-SH-LIVE",
  user_id: "user-live",
  type: "medical_emergency",
  status: "analyzed",
  user_input: "Inpatient hospital admission bill inquiry. Policy coverage verification and out-of-pocket gap settlement required.",
  language: "hinglish",
  documents: [
    {
      document_id: "doc-pol-01",
      case_id: "CASE-SH-LIVE",
      type: "policy",
      filename: "Policy_Schedule.pdf",
      status: "parsed",
      created_at: "2024-03-15T10:00:00Z"
    },
    {
      document_id: "doc-bill-01",
      case_id: "CASE-SH-LIVE",
      type: "bill",
      filename: "Inpatient_Final_Bill.pdf",
      status: "parsed",
      created_at: "2024-03-15T10:05:00Z"
    },
    {
      document_id: "doc-dis-01",
      case_id: "CASE-SH-LIVE",
      type: "discharge",
      filename: "Discharge_Summary.pdf",
      status: "parsed",
      created_at: "2024-03-15T10:06:00Z"
    }
  ],
  created_at: "2024-03-15T10:00:00Z",
  updated_at: "2024-03-15T10:12:00Z",
  analysis: {
    insurance_analysis: {
      potential_coverage: 138599,
      potential_gap: 46001,
      missing_documents: ["Doctor Prescription for In-hospital medicines", "Cancelled Cheque for NEFT"],
      claim_readiness: 72,
      line_items: mockLineItems,
      room_rent_analysis: {
        limit_per_day: 5000,
        clause_reference: "Policy Sec 2.1",
        proportionate_clause_exists: true,
        proportionate_clause_reference: "Policy Sec 4.2"
      },
      exclusions_found: ["Consumables", "Sanitization Charge"]
    },
    financial_context: mockFlowPass.financial_profile,
    gap_result: mockGapResult,
    recovery_scenarios: mockRecoveryScenarios,
    flowpass: mockFlowPass,
    journey_state: "funding_prepared"
  }
};
