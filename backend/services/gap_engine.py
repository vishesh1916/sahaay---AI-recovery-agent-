"""Deterministic Financial Gap Engine for Indian Health Insurance.

This engine calculates the potential financial gap between a hospital bill
and insurance coverage. It implements Indian health insurance rules including:
- Room rent limits and proportionate deduction
- Associated vs non-associated expense classification
- Policy sub-limits and exclusions
- Deductible/copayment rules

CRITICAL: All calculations are deterministic. The LLM interprets documents;
this engine does the math. No LLM should ever compute financial figures.
"""
from dataclasses import dataclass
from schemas.insurance_state import LineItem, LineItemCategory

@dataclass
class PolicyRules:
    """Rules extracted from the insurance policy."""
    sum_insured: float
    room_rent_limit_per_day: float  # e.g., 5000
    has_proportionate_clause: bool  # Whether proportionate deduction applies
    deductible: float  # Co-payment or deductible amount
    copay_percentage: float  # e.g., 0.1 for 10% copay
    sub_limits: dict  # e.g., {"icu": 10000, "ambulance": 2000}
    exclusions: list[str]  # List of excluded items/conditions
    waiting_period_conditions: list[str]  # Conditions under waiting period

@dataclass
class DeductionDetail:
    """Details of a specific deduction in the gap calculation."""
    item_name: str
    original_amount: float
    covered_amount: float
    deduction_amount: float
    reason: str
    category: str
    evidence_ref: str  # e.g., "Policy Section 4.2"

@dataclass
class GapResult:
    """Complete result of the gap calculation."""
    total_bill: float
    total_associated: float
    total_non_associated: float
    total_excluded: float
    
    room_rent_actual_per_day: float
    room_rent_allowed_per_day: float
    proportionate_ratio: float
    
    associated_after_deduction: float
    non_associated_covered: float
    excluded_amount: float
    
    subtotal_before_caps: float
    sum_insured_cap_applied: bool
    deductible_applied: float
    copay_applied: float
    
    potential_claim_amount: float
    potential_gap: float
    
    deductions: list[DeductionDetail]
    line_item_results: list[dict]

class GapEngine:
    """Deterministic gap calculation engine.
    
    Flow:
    1. Separate line items by category (associated / non-associated / excluded)
    2. Calculate room rent ratio (actual vs. allowed per day)
    3. Apply proportionate deduction to associated expenses ONLY
    4. Non-associated expenses covered at full amount
    5. Excluded items get zero coverage
    6. Sum covered amounts
    7. Apply sum-insured cap
    8. Apply deductible/copay if any
    9. Calculate gap = total_bill - potential_claim
    """
    
    def calculate(
        self,
        line_items: list[LineItem],
        policy_rules: PolicyRules,
        room_rent_days: int,
    ) -> GapResult:
        """Calculate the potential financial gap.
        
        Args:
            line_items: Classified hospital bill line items
            policy_rules: Rules extracted from the insurance policy
            room_rent_days: Number of days of hospitalization
            
        Returns:
            GapResult with complete breakdown
        """
        # Step 1: Separate by category
        associated = [i for i in line_items if i.category == LineItemCategory.associated]
        non_associated = [i for i in line_items if i.category == LineItemCategory.non_associated]
        excluded = [i for i in line_items if i.category == LineItemCategory.excluded]
        needs_review = [i for i in line_items if i.category == LineItemCategory.needs_review]
        
        total_associated = sum(i.amount for i in associated)
        total_non_associated = sum(i.amount for i in non_associated)
        total_excluded = sum(i.amount for i in excluded)
        total_needs_review = sum(i.amount for i in needs_review)
        total_bill = total_associated + total_non_associated + total_excluded + total_needs_review
        
        # Step 2: Room rent analysis
        room_rent_item = next((i for i in associated if "room" in i.name.lower()), None)
        room_rent_total = room_rent_item.amount if room_rent_item else 0
        room_rent_actual_per_day = room_rent_total / max(room_rent_days, 1)
        room_rent_allowed_per_day = policy_rules.room_rent_limit_per_day
        
        # Step 3: Calculate proportionate ratio
        if (policy_rules.has_proportionate_clause 
            and room_rent_actual_per_day > room_rent_allowed_per_day
            and room_rent_actual_per_day > 0):
            proportionate_ratio = room_rent_allowed_per_day / room_rent_actual_per_day
        else:
            proportionate_ratio = 1.0
        
        # Step 4: Apply deductions per item
        deductions = []
        line_item_results = []
        
        # Process associated expenses
        associated_covered = 0.0
        for item in associated:
            if "room" in item.name.lower():
                # Room rent: cap at allowed amount
                covered = min(item.amount, room_rent_allowed_per_day * room_rent_days)
                deduction = item.amount - covered
                reason = (f"Room rent capped at ₹{room_rent_allowed_per_day:,.0f}/day × {room_rent_days} days = ₹{covered:,.0f}" 
                         if deduction > 0 else "Room rent within policy limits")
                evidence = "Policy → Room Rent Limit Clause"
            else:
                # Other associated: apply proportionate deduction
                covered = item.amount * proportionate_ratio
                deduction = item.amount - covered
                reason = (f"Proportionate deduction applied ({proportionate_ratio:.1%} ratio due to room rent exceeding limit)"
                         if deduction > 0 else "No proportionate deduction needed")
                evidence = "Policy → Proportionate Deduction Clause (Section 4.2)"
            
            associated_covered += covered
            
            if deduction > 0:
                deductions.append(DeductionDetail(
                    item_name=item.name,
                    original_amount=item.amount,
                    covered_amount=covered,
                    deduction_amount=deduction,
                    reason=reason,
                    category="associated",
                    evidence_ref=evidence,
                ))
            
            line_item_results.append({
                "name": item.name,
                "amount": item.amount,
                "category": "associated",
                "covered": round(covered, 2),
                "deduction": round(deduction, 2),
                "reason": reason,
            })
        
        # Process non-associated expenses (covered at full, up to sum insured)
        non_associated_covered = 0.0
        for item in non_associated:
            # Check sub-limits
            sub_limit_key = item.name.lower().strip()
            sub_limit = policy_rules.sub_limits.get(sub_limit_key, None)
            
            if sub_limit is not None:
                covered = min(item.amount, sub_limit)
                deduction = item.amount - covered
                reason = f"Sub-limit of ₹{sub_limit:,.0f} applied"
                evidence = "Policy → Sub-limits Section"
            else:
                covered = item.amount
                deduction = 0.0
                reason = "Non-associated expense: covered at full amount"
                evidence = "Policy → Coverage Terms"
            
            non_associated_covered += covered
            
            if deduction > 0:
                deductions.append(DeductionDetail(
                    item_name=item.name,
                    original_amount=item.amount,
                    covered_amount=covered,
                    deduction_amount=deduction,
                    reason=reason,
                    category="non_associated",
                    evidence_ref=evidence,
                ))
            
            line_item_results.append({
                "name": item.name,
                "amount": item.amount,
                "category": "non_associated",
                "covered": round(covered, 2),
                "deduction": round(deduction, 2),
                "reason": reason,
            })
        
        # Process excluded items (zero coverage)
        for item in excluded:
            deductions.append(DeductionDetail(
                item_name=item.name,
                original_amount=item.amount,
                covered_amount=0.0,
                deduction_amount=item.amount,
                reason=f"Excluded from coverage per policy terms",
                category="excluded",
                evidence_ref="Policy → Exclusions List",
            ))
            line_item_results.append({
                "name": item.name,
                "amount": item.amount,
                "category": "excluded",
                "covered": 0.0,
                "deduction": item.amount,
                "reason": "Excluded from coverage",
            })
        
        # Process needs_review items (treat as covered for estimation, flag for review)
        needs_review_covered = 0.0
        for item in needs_review:
            covered = item.amount * proportionate_ratio  # Conservative estimate
            deduction = item.amount - covered
            needs_review_covered += covered
            line_item_results.append({
                "name": item.name,
                "amount": item.amount,
                "category": "needs_review",
                "covered": round(covered, 2),
                "deduction": round(deduction, 2),
                "reason": "Classification pending review — estimated with proportionate ratio",
            })
        
        # Step 5: Subtotal
        subtotal = associated_covered + non_associated_covered + needs_review_covered
        
        # Step 6: Cap at sum insured
        sum_insured_cap_applied = subtotal > policy_rules.sum_insured
        if sum_insured_cap_applied:
            cap_deduction = subtotal - policy_rules.sum_insured
            deductions.append(DeductionDetail(
                item_name="Sum Insured Cap",
                original_amount=subtotal,
                covered_amount=policy_rules.sum_insured,
                deduction_amount=cap_deduction,
                reason=f"Total exceeds sum insured of ₹{policy_rules.sum_insured:,.0f}",
                category="cap",
                evidence_ref="Policy → Sum Insured",
            ))
            subtotal = policy_rules.sum_insured
        
        # Step 7: Apply deductible
        deductible_applied = min(policy_rules.deductible, subtotal)
        if deductible_applied > 0:
            subtotal -= deductible_applied
            deductions.append(DeductionDetail(
                item_name="Deductible",
                original_amount=deductible_applied,
                covered_amount=0.0,
                deduction_amount=deductible_applied,
                reason=f"Policy deductible of ₹{policy_rules.deductible:,.0f}",
                category="deductible",
                evidence_ref="Policy → Deductible Clause",
            ))
        
        # Step 8: Apply copay
        copay_applied = subtotal * policy_rules.copay_percentage
        if copay_applied > 0:
            subtotal -= copay_applied
            deductions.append(DeductionDetail(
                item_name="Copayment",
                original_amount=copay_applied,
                covered_amount=0.0,
                deduction_amount=copay_applied,
                reason=f"Copayment of {policy_rules.copay_percentage:.0%}",
                category="copay",
                evidence_ref="Policy → Copayment Clause",
            ))
        
        potential_claim = max(subtotal, 0)
        potential_gap = total_bill - potential_claim
        
        return GapResult(
            total_bill=round(total_bill, 2),
            total_associated=round(total_associated, 2),
            total_non_associated=round(total_non_associated, 2),
            total_excluded=round(total_excluded, 2),
            room_rent_actual_per_day=round(room_rent_actual_per_day, 2),
            room_rent_allowed_per_day=round(room_rent_allowed_per_day, 2),
            proportionate_ratio=round(proportionate_ratio, 4),
            associated_after_deduction=round(associated_covered, 2),
            non_associated_covered=round(non_associated_covered, 2),
            excluded_amount=round(total_excluded, 2),
            subtotal_before_caps=round(associated_covered + non_associated_covered + needs_review_covered, 2),
            sum_insured_cap_applied=sum_insured_cap_applied,
            deductible_applied=round(deductible_applied, 2),
            copay_applied=round(copay_applied, 2),
            potential_claim_amount=round(potential_claim, 2),
            potential_gap=round(potential_gap, 2),
            deductions=deductions,
            line_item_results=line_item_results,
        )
