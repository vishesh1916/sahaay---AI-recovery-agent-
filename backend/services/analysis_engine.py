"""Unified Multi-Emergency Analysis Engine for SAHAAY.

Dispatches to:
- MedicalAnalyzer: Health insurance & hospital bill proportionate deductions
- VehicleAnalyzer: Motor insurance parts depreciation, zero-dep, & garage repair gap
- IncomeAnalyzer: Monthly burn rate, runway exhaustion, & emergency bridge deficit
- UnexpectedExpenseAnalyzer: Critical emergency expense vs liquid buffer deficit
"""
from dataclasses import dataclass, field
from typing import Optional
from services.gap_engine import GapEngine, PolicyRules
from schemas.insurance_state import LineItem, LineItemCategory

def safe_line_item_category(raw_val) -> LineItemCategory:
    """Safely map any string or enum into LineItemCategory without crashing."""
    if isinstance(raw_val, LineItemCategory):
        return raw_val
    s = str(raw_val or "").lower().strip()
    if any(k in s for k in ["room", "surg", "doctor", "consult", "ot", "theatre", "nurs", "labor", "labour", "associated"]):
        return LineItemCategory.associated
    elif any(k in s for k in ["exclud", "consum", "admin", "ppe", "cosmetic", "deductible", "discretionary"]):
        return LineItemCategory.excluded
    elif "review" in s:
        return LineItemCategory.needs_review
    return LineItemCategory.non_associated

@dataclass
class StandardAnalysisResult:
    emergency_type: str
    total_amount: float
    covered_amount: float
    gap_amount: float
    readiness_percentage: float
    title: str
    summary: str
    line_items: list[dict]
    deductions: list[dict]
    recovery_scenarios: list[dict]
    metadata: dict = field(default_factory=dict)


class MedicalAnalyzer:
    def __init__(self):
        self.engine = GapEngine()

    def analyze(self, bill_items: list[dict], policy_rules: dict, total_amount: float = 184600.0) -> StandardAnalysisResult:
        # If no custom bill items provided, synthesize proportionate medical items based on total_amount
        if not bill_items:
            scale = total_amount / 184600.0 if total_amount > 0 else 1.0
            items = [
                LineItem(name="Room Rent (10 days)", amount=round(70000 * scale), category=LineItemCategory.associated),
                LineItem(name="Surgeon & OT Charges", amount=round(47000 * scale), category=LineItemCategory.associated),
                LineItem(name="Doctor & Nursing Fees", amount=round(23000 * scale), category=LineItemCategory.associated),
                LineItem(name="Pharmacy & Medicines", amount=round(18600 * scale), category=LineItemCategory.non_associated),
                LineItem(name="Diagnostics & Lab Tests", amount=round(12000 * scale), category=LineItemCategory.non_associated),
                LineItem(name="Surgical Implants", amount=round(8000 * scale), category=LineItemCategory.non_associated),
                LineItem(name="Non-Medical Consumables", amount=round(6000 * scale), category=LineItemCategory.excluded),
            ]
        else:
            items = [
                LineItem(
                    name=i.get("name", "Medical Item"),
                    amount=float(i.get("amount", 0)),
                    category=safe_line_item_category(i.get("category", "associated"))
                )
                for i in bill_items
            ]

        rules = PolicyRules(
            sum_insured=float(policy_rules.get("sum_insured", 500000)),
            room_rent_limit_per_day=float(policy_rules.get("room_rent_limit_per_day", 5000)),
            has_proportionate_clause=bool(policy_rules.get("has_proportionate_clause", True)),
            deductible=float(policy_rules.get("deductible", 0)),
            copay_percentage=float(policy_rules.get("copay_percentage", 0.0)),
            sub_limits=policy_rules.get("sub_limits", {}),
            exclusions=policy_rules.get("exclusions", ["consumables"]),
            waiting_period_conditions=policy_rules.get("waiting_period_conditions", []),
        )

        calc = self.engine.calculate(items, rules, room_rent_days=10)

        line_items_out = []
        for r in calc.line_item_results:
            name = r.get("name") if isinstance(r, dict) else getattr(r, "name")
            amount = r.get("amount") if isinstance(r, dict) else getattr(r, "amount")
            cat = r.get("category") if isinstance(r, dict) else getattr(r, "category")
            if hasattr(cat, "value"):
                cat = cat.value
            covered = r.get("covered", r.get("covered_amount", 0)) if isinstance(r, dict) else getattr(r, "covered_amount", 0)
            deduction = r.get("deduction", 0) if isinstance(r, dict) else getattr(r, "deduction", 0)
            reason = r.get("reason", "") if isinstance(r, dict) else getattr(r, "reason", "")
            line_items_out.append({
                "name": name,
                "amount": amount,
                "category": str(cat),
                "covered_amount": covered,
                "deduction": deduction,
                "reason": reason,
                "evidence_status": "verified" if str(cat) == "non_associated" else "estimated",
                "source_ref": "Policy Sec 4.2 & Hospital Bill",
            })

        deductions_out = []
        for d in calc.deductions:
            item_name = d.get("item_name") if isinstance(d, dict) else getattr(d, "item_name")
            orig_amt = d.get("original_amount") if isinstance(d, dict) else getattr(d, "original_amount")
            cov_amt = d.get("covered_amount") if isinstance(d, dict) else getattr(d, "covered_amount")
            ded_amt = d.get("deduction_amount") if isinstance(d, dict) else getattr(d, "deduction_amount")
            reas = d.get("reason") if isinstance(d, dict) else getattr(d, "reason")
            cat = d.get("category") if isinstance(d, dict) else getattr(d, "category")
            ev_ref = d.get("evidence_ref") if isinstance(d, dict) else getattr(d, "evidence_ref")
            deductions_out.append({
                "item_name": item_name,
                "original_amount": orig_amt,
                "covered_amount": cov_amt,
                "deduction_amount": ded_amt,
                "reason": reas,
                "category": str(cat),
                "evidence_ref": ev_ref,
            })

        scenarios = [
            {
                "id": "insurance_funding",
                "title": "Insurance Claim + Gap Recovery Funding",
                "description": f"Submit verified insurance claim for ₹{calc.potential_claim_amount:,.0f} and fund the remaining ₹{calc.potential_gap:,.0f} gap via low-interest recovery line.",
                "amount_from_insurance": calc.potential_claim_amount,
                "amount_from_savings": round(calc.potential_gap * 0.25),
                "amount_from_funding": round(calc.potential_gap * 0.75),
                "remaining_buffer": 15000,
                "monthly_impact": round(calc.potential_gap / 12),
                "payment_pressure": "low",
                "recommended": True,
                "action": "Protects monthly cash flow and prevents buffer depletion.",
                "emi_options": [{"months": 6, "emi": round(calc.potential_gap / 6)}, {"months": 12, "emi": round(calc.potential_gap / 12)}]
            },
            {
                "id": "direct_payment",
                "title": "Instant Paytm Settlement",
                "description": f"Pay the entire ₹{calc.potential_gap:,.0f} hospital gap directly via Paytm UPI / NetBanking.",
                "amount_from_insurance": calc.potential_claim_amount,
                "amount_from_savings": calc.potential_gap,
                "amount_from_funding": 0,
                "remaining_buffer": 0,
                "monthly_impact": 0,
                "payment_pressure": "high",
                "recommended": False,
                "action": "Immediate discharge payment at hospital counter.",
            }
        ]

        return StandardAnalysisResult(
            emergency_type="medical",
            total_amount=calc.total_bill,
            covered_amount=calc.potential_claim_amount,
            gap_amount=calc.potential_gap,
            readiness_percentage=75.0,
            title="Hospitalization & Health Insurance Analysis",
            summary=f"Total Hospital Bill ₹{calc.total_bill:,.0f}. Eligible claim ₹{calc.potential_claim_amount:,.0f}. Out-of-pocket gap to arrange: ₹{calc.potential_gap:,.0f} (due to room rent limit breach and proportionate reductions).",
            line_items=line_items_out,
            deductions=deductions_out,
            recovery_scenarios=scenarios,
            metadata={"proportionate_ratio": calc.proportionate_ratio}
        )


class VehicleAnalyzer:
    def analyze(self, repair_items: list[dict], policy_info: dict, total_amount: float = 85000.0) -> StandardAnalysisResult:
        is_zero_dep = bool(policy_info.get("is_zero_dep", False))
        compulsory_deductible = float(policy_info.get("deductible", 1500.0))
        scale = total_amount / 85000.0 if total_amount > 0 else 1.0

        if repair_items and len(repair_items) > 0:
            raw_parts = []
            for item in repair_items:
                name = item.get("name", "Repair Component")
                amt = float(item.get("amount", 0.0))
                name_lower = name.lower()
                
                if "labor" in name_lower or "paint" in name_lower or "service" in name_lower or "dent" in name_lower:
                    p_type = "labor"
                    dep = 0.0
                elif "glass" in name_lower or "windshield" in name_lower:
                    p_type = "glass"
                    dep = 0.0
                elif "bumper" in name_lower or "plastic" in name_lower or "nylon" in name_lower or "rubber" in name_lower:
                    p_type = "plastic"
                    dep = 0.0 if is_zero_dep else 0.50
                elif "fiber" in name_lower:
                    p_type = "fiber"
                    dep = 0.0 if is_zero_dep else 0.30
                elif "oil" in name_lower or "coolant" in name_lower or "nut" in name_lower or "bolt" in name_lower or "consumable" in name_lower:
                    p_type = "consumable"
                    dep = 1.0
                else:
                    p_type = "metal"
                    dep = 0.0 if is_zero_dep else 0.25
                
                raw_parts.append({
                    "name": name,
                    "amount": amt,
                    "type": p_type,
                    "dep_rate": dep
                })
        else:
            raw_parts = [
                {"name": "Front Bumper & Grille (Plastic/Rubber)", "amount": round(16000 * scale), "type": "plastic", "dep_rate": 0.0 if is_zero_dep else 0.50},
                {"name": "Right Fender & Bonnet (Sheet Metal)", "amount": round(24000 * scale), "type": "metal", "dep_rate": 0.0 if is_zero_dep else 0.25},
                {"name": "Windshield Glass", "amount": round(11000 * scale), "type": "glass", "dep_rate": 0.0},
                {"name": "Headlight & Indicator Assembly (Fiberglass)", "amount": round(12000 * scale), "type": "fiber", "dep_rate": 0.0 if is_zero_dep else 0.30},
                {"name": "Garage Labor, Denting & Painting", "amount": round(16000 * scale), "type": "labor", "dep_rate": 0.0},
                {"name": "Consumables (Engine Oil, Fasteners, Sealant)", "amount": round(6000 * scale), "type": "consumable", "dep_rate": 1.0},
            ]

        total_bill = sum(p["amount"] for p in raw_parts) if raw_parts else total_amount
        line_items_out = []
        deductions_out = []
        total_covered = 0.0
        total_depreciation = 0.0

        for p in raw_parts:
            dep_amt = round(p["amount"] * p["dep_rate"])
            cov_amt = p["amount"] - dep_amt
            total_covered += cov_amt
            total_depreciation += dep_amt

            line_items_out.append({
                "name": p["name"],
                "amount": p["amount"],
                "category": "associated" if dep_amt > 0 else "non_associated",
                "covered_amount": cov_amt,
                "deduction": dep_amt,
                "reason": "Depreciation applied per IRDAI motor tariff schedule" if dep_amt > 0 else "Fully covered",
                "evidence_status": "verified",
                "source_ref": "Motor Policy Section 3 & Garage Estimate",
            })

            if dep_amt > 0:
                deductions_out.append({
                    "item_name": f"{p['name']} Depreciation ({int(p['dep_rate']*100)}%)",
                    "original_amount": p["amount"],
                    "covered_amount": cov_amt,
                    "deduction_amount": dep_amt,
                    "reason": f"Standard {int(p['dep_rate']*100)}% depreciation on {p['type']} parts (zero-dep not active)",
                    "category": "depreciation",
                    "evidence_ref": "IRDAI Motor Tariff Schedule",
                })

        # Apply compulsory excess
        net_claim = max(total_covered - compulsory_deductible, 0.0)
        deductions_out.append({
            "item_name": "Compulsory Policy Excess / Deductible",
            "original_amount": compulsory_deductible,
            "covered_amount": 0,
            "deduction_amount": compulsory_deductible,
            "reason": "Standard compulsory deductible payable by policyholder for every claim",
            "category": "deductible",
            "evidence_ref": "Motor Policy Schedule Clause 1",
        })

        gap_amount = total_bill - net_claim

        scenarios = [
            {
                "id": "garage_bridge",
                "title": "Garage Repair Bridge Financing",
                "description": f"Settle ₹{net_claim:,.0f} with insurer and fund the remaining ₹{gap_amount:,.0f} parts depreciation gap over 6-12 months.",
                "amount_from_insurance": net_claim,
                "amount_from_savings": round(gap_amount * 0.20),
                "amount_from_funding": round(gap_amount * 0.80),
                "remaining_buffer": 14000,
                "monthly_impact": round(gap_amount / 6),
                "payment_pressure": "low",
                "recommended": True,
                "action": "Immediate release of vehicle from workshop counter.",
                "emi_options": [{"months": 3, "emi": round(gap_amount / 3)}, {"months": 6, "emi": round(gap_amount / 6)}]
            },
            {
                "id": "direct_garage_payment",
                "title": "Paytm Workshop Payment",
                "description": f"Pay ₹{gap_amount:,.0f} directly to the authorized service workshop via Paytm UPI.",
                "amount_from_insurance": net_claim,
                "amount_from_savings": gap_amount,
                "amount_from_funding": 0,
                "remaining_buffer": 0,
                "monthly_impact": 0,
                "payment_pressure": "high",
                "recommended": False,
                "action": "Instant vehicle delivery gate-pass authorization.",
            }
        ]

        return StandardAnalysisResult(
            emergency_type="vehicle",
            total_amount=total_bill,
            covered_amount=net_claim,
            gap_amount=gap_amount,
            readiness_percentage=80.0,
            title="Vehicle Collision & Garage Repair Analysis",
            summary=f"Workshop Repair Estimate ₹{total_bill:,.0f}. Insurance surveyor approved ₹{net_claim:,.0f}. Out-of-pocket gap to settle at garage: ₹{gap_amount:,.0f} (due to parts depreciation & compulsory deductible).",
            line_items=line_items_out,
            deductions=deductions_out,
            recovery_scenarios=scenarios,
            metadata={"is_zero_dep": is_zero_dep, "deductible": compulsory_deductible}
        )


class IncomeAnalyzer:
    def analyze(self, shock_info: dict, user_financials: dict, total_amount: float = 120000.0) -> StandardAnalysisResult:
        monthly_inflow = float(user_financials.get("average_inflow", 53700.0))
        monthly_expenses = float(user_financials.get("recurring_expenses", 31400.0))
        existing_obligations = float(user_financials.get("existing_obligations", 6500.0))
        buffer = float(user_financials.get("liquidity_buffer", 15800.0))

        monthly_burn = monthly_expenses + existing_obligations
        runway_months = round(buffer / monthly_burn, 1) if monthly_burn > 0 else 0.5
        target_shock = total_amount if total_amount > 0 else monthly_inflow * 2.5
        three_month_burn = monthly_burn * 3.0
        survival_gap = max(three_month_burn - buffer, 0.0)

        line_items = [
            {"name": "Monthly Rental & Housing", "amount": round(monthly_expenses * 0.55), "category": "associated", "covered_amount": 0, "deduction": round(monthly_expenses * 0.55), "reason": "Fixed non-negotiable living baseline", "evidence_status": "verified", "source_ref": "Bank Statements"},
            {"name": "Food, Utilities & Groceries", "amount": round(monthly_expenses * 0.45), "category": "associated", "covered_amount": 0, "deduction": round(monthly_expenses * 0.45), "reason": "Essential survival expenses", "evidence_status": "verified", "source_ref": "Bank Statements"},
            {"name": "Ongoing Loan / Consumer EMIs", "amount": existing_obligations, "category": "associated", "covered_amount": 0, "deduction": existing_obligations, "reason": "Contractual debt obligation (Credit score risk)", "evidence_status": "verified", "source_ref": "Credit Bureau / Bank"},
            {"name": "Liquid Emergency Reserve", "amount": buffer, "category": "non_associated", "covered_amount": buffer, "deduction": 0, "reason": "Currently available unencumbered cash", "evidence_status": "verified", "source_ref": "Savings Account"},
        ]

        deductions = [
            {"item_name": "3-Month Survival Baseline Deficit", "original_amount": three_month_burn, "covered_amount": buffer, "deduction_amount": survival_gap, "reason": f"Current cash buffer (₹{buffer:,.0f}) provides only {runway_months} months of survival runway", "category": "deficit", "evidence_ref": "Cash-Flow Analysis"},
            {"item_name": "Active EMI Default Risk", "original_amount": existing_obligations * 3, "covered_amount": 0, "deduction_amount": existing_obligations * 3, "reason": "Missed EMI penalties and credit bureau downgrade", "category": "obligation", "evidence_ref": "Loan Schedule"},
        ]

        scenarios = [
            {
                "id": "income_bridge",
                "title": "Emergency Income Bridge & EMI Moratorium",
                "description": f"Secure a ₹{survival_gap:,.0f} income bridge facility with flexible 12-month low-interest repayment to protect your home and prevent loan default.",
                "amount_from_insurance": 0,
                "amount_from_savings": buffer,
                "amount_from_funding": survival_gap,
                "remaining_buffer": 5000,
                "monthly_impact": round(survival_gap / 12),
                "payment_pressure": "low",
                "recommended": True,
                "action": "Stabilizes essential cash-flow while securing new client contracts.",
                "emi_options": [{"months": 6, "emi": round(survival_gap / 6)}, {"months": 12, "emi": round(survival_gap / 12)}]
            },
            {
                "id": "buffer_exhaustion",
                "title": "Direct Buffer Depletion",
                "description": f"Exhaust all ₹{buffer:,.0f} cash reserves and defer non-essential living expenses.",
                "amount_from_insurance": 0,
                "amount_from_savings": buffer,
                "amount_from_funding": 0,
                "remaining_buffer": 0,
                "monthly_impact": 0,
                "payment_pressure": "high",
                "recommended": False,
                "action": "High risk: Leaves ₹0 buffer for rent or emergency healthcare.",
            }
        ]

        return StandardAnalysisResult(
            emergency_type="income",
            total_amount=target_shock,
            covered_amount=buffer,
            gap_amount=survival_gap,
            readiness_percentage=70.0,
            title="Income Disruption & Cash-Flow Shock Analysis",
            summary=f"Total Income Shock: ₹{target_shock:,.0f}. Available cash runway: {runway_months} months. Critical 3-month survival gap to arrange: ₹{survival_gap:,.0f} to protect fixed obligations and shelter.",
            line_items=line_items,
            deductions=deductions,
            recovery_scenarios=scenarios,
            metadata={"runway_months": runway_months, "monthly_burn": monthly_burn}
        )


class UnexpectedExpenseAnalyzer:
    def analyze(self, expense_info: dict, user_financials: dict, total_amount: float = 65000.0) -> StandardAnalysisResult:
        buffer = float(user_financials.get("liquidity_buffer", 15800.0))
        target_amount = total_amount if total_amount > 0 else 65000.0

        # Protect at least 40% of buffer for safety cushion
        safe_cash_to_use = min(buffer * 0.60, target_amount)
        funding_gap = max(target_amount - safe_cash_to_use, 0.0)

        line_items = [
            {"name": "Critical Emergency Outflow / Invoice", "amount": target_amount, "category": "associated", "covered_amount": safe_cash_to_use, "deduction": funding_gap, "reason": "Unplanned urgent non-discretionary expenditure", "evidence_status": "verified", "source_ref": "Vendor Quotation / Invoice"},
            {"name": "Safe Cash Buffer Allocation", "amount": safe_cash_to_use, "category": "non_associated", "covered_amount": safe_cash_to_use, "deduction": 0, "reason": "Immediate cash paid from liquid reserves without exhausting safety cushion", "evidence_status": "verified", "source_ref": "Liquid Savings"},
            {"name": "Retained Emergency Cushion", "amount": buffer - safe_cash_to_use, "category": "non_associated", "covered_amount": buffer - safe_cash_to_use, "deduction": 0, "reason": "Retained reserve to prevent cash-flow insolvency", "evidence_status": "verified", "source_ref": "FlowPass Profile"},
        ]

        deductions = [
            {"item_name": "Unfunded Critical Expense Gap", "original_amount": target_amount, "covered_amount": safe_cash_to_use, "deduction_amount": funding_gap, "reason": f"Allocating all cash would leave ₹0 buffer. Recommended gap to fund: ₹{funding_gap:,.0f}", "category": "shortfall", "evidence_ref": "Buffer Stress Analysis"}
        ]

        scenarios = [
            {
                "id": "split_micro_fund",
                "title": "Split Settlement (Partial Buffer + Micro Recovery Line)",
                "description": f"Pay ₹{safe_cash_to_use:,.0f} from savings and fund the remaining ₹{funding_gap:,.0f} over 6 months to keep your emergency buffer intact.",
                "amount_from_insurance": 0,
                "amount_from_savings": safe_cash_to_use,
                "amount_from_funding": funding_gap,
                "remaining_buffer": buffer - safe_cash_to_use,
                "monthly_impact": round(funding_gap / 6),
                "payment_pressure": "low",
                "recommended": True,
                "action": "Best balance of cash deployment and safety retention.",
                "emi_options": [{"months": 3, "emi": round(funding_gap / 3)}, {"months": 6, "emi": round(funding_gap / 6)}]
            },
            {
                "id": "direct_vendor_payment",
                "title": "Pay Full Outflow via Paytm",
                "description": f"Pay the entire ₹{target_amount:,.0f} invoice immediately via Paytm UPI.",
                "amount_from_insurance": 0,
                "amount_from_savings": target_amount,
                "amount_from_funding": 0,
                "remaining_buffer": max(buffer - target_amount, 0),
                "monthly_impact": 0,
                "payment_pressure": "high",
                "recommended": False,
                "action": "Immediate vendor settlement.",
            }
        ]

        return StandardAnalysisResult(
            emergency_type="unexpected",
            total_amount=target_amount,
            covered_amount=safe_cash_to_use,
            gap_amount=funding_gap,
            readiness_percentage=85.0,
            title="Unexpected Critical Expense Analysis",
            summary=f"Emergency Expense: ₹{target_amount:,.0f}. Safe cash deployment from buffer: ₹{safe_cash_to_use:,.0f}. Critical funding gap to arrange: ₹{funding_gap:,.0f} (retains ₹{buffer - safe_cash_to_use:,.0f} reserve).",
            line_items=line_items,
            deductions=deductions,
            recovery_scenarios=scenarios,
            metadata={"safe_cash_used": safe_cash_to_use}
        )


class AnalysisEngine:
    def __init__(self):
        self.medical = MedicalAnalyzer()
        self.vehicle = VehicleAnalyzer()
        self.income = IncomeAnalyzer()
        self.unexpected = UnexpectedExpenseAnalyzer()

    def run_analysis(
        self,
        emergency_type: str,
        total_amount: float,
        line_items: list[dict] = None,
        policy_data: dict = None,
        financial_profile: dict = None
    ) -> StandardAnalysisResult:
        emergency_type = (emergency_type or "medical").lower()
        line_items = line_items or []
        policy_data = policy_data or {}
        financial_profile = financial_profile or {}

        if emergency_type == "vehicle":
            return self.vehicle.analyze(line_items, policy_data, total_amount)
        elif emergency_type == "income":
            return self.income.analyze({}, financial_profile, total_amount)
        elif emergency_type == "unexpected":
            return self.unexpected.analyze({}, financial_profile, total_amount)
        else:
            return self.medical.analyze(line_items, policy_data, total_amount)
