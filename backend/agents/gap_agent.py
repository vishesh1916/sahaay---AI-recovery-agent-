"""Gap Agent — Deterministic financial gap calculation.

This agent is a thin wrapper around the deterministic GapEngine service.
The LLM is NOT used for any math. Only the rules engine calculates.
"""
import json
from agents.state import SahaayState
from services.gap_engine import GapEngine, PolicyRules
from schemas.insurance_state import LineItem, LineItemCategory


class GapAgent:
    """Calculates the potential financial gap using deterministic rules.

    CRITICAL: No LLM math. The GapEngine is purely deterministic.
    The agent only prepares inputs and formats outputs.
    """

    def __init__(self):
        self.engine = GapEngine()

    async def process(self, state: SahaayState) -> dict:
        """Calculate the financial gap.

        LangGraph node function.
        """
        insurance_analysis = state.get("insurance_analysis", {}) or {}
        messages = list(state.get("messages", []))

        raw_line_items = insurance_analysis.get("line_items", [])
        policy_rules_data = insurance_analysis.get("policy_rules", {})
        discharge_info = insurance_analysis.get("discharge_info", {})

        if not raw_line_items:
            # Use mock data for demo
            raw_line_items = [
                {"name": "Room Rent", "amount": 70000, "category": "associated"},
                {"name": "Surgeon Fees", "amount": 35000, "category": "associated"},
                {"name": "Doctor Fees", "amount": 15000, "category": "associated"},
                {"name": "OT Charges", "amount": 12000, "category": "associated"},
                {"name": "Nursing Charges", "amount": 8000, "category": "associated"},
                {"name": "Pharmacy", "amount": 18600, "category": "non_associated"},
                {"name": "Diagnostics", "amount": 12000, "category": "non_associated"},
                {"name": "Implants", "amount": 8000, "category": "non_associated"},
                {"name": "Consumables", "amount": 6000, "category": "excluded"},
            ]

        if not policy_rules_data:
            policy_rules_data = {
                "sum_insured": 500000,
                "room_rent_limit_per_day": 5000,
                "has_proportionate_clause": True,
                "deductible": 0,
                "copay_percentage": 0.0,
                "sub_limits": {},
                "exclusions": ["consumables"],
            }

        # Convert to typed objects
        line_items = []
        for item in raw_line_items:
            category_str = item.get("category", "needs_review")
            try:
                category = LineItemCategory(category_str)
            except ValueError:
                category = LineItemCategory.needs_review

            line_items.append(LineItem(
                name=item.get("name", "Unknown"),
                amount=float(item.get("amount", 0)),
                category=category,
                reason=item.get("reason"),
            ))

        policy_rules = PolicyRules(
            sum_insured=float(policy_rules_data.get("sum_insured", 500000)),
            room_rent_limit_per_day=float(policy_rules_data.get("room_rent_limit_per_day", 5000)),
            has_proportionate_clause=bool(policy_rules_data.get("has_proportionate_clause", True)),
            deductible=float(policy_rules_data.get("deductible", 0)),
            copay_percentage=float(policy_rules_data.get("copay_percentage", 0)),
            sub_limits=policy_rules_data.get("sub_limits", {}),
            exclusions=policy_rules_data.get("exclusions", []),
            waiting_period_conditions=policy_rules_data.get("waiting_period_conditions", []),
        )

        # Get hospitalization days
        days = int(discharge_info.get("days_hospitalized", 10)) if discharge_info else 10

        # Run deterministic calculation
        result = self.engine.calculate(line_items, policy_rules, days)

        # Build gap result dict
        gap_result = {
            "total_bill": result.total_bill,
            "total_associated": result.total_associated,
            "total_non_associated": result.total_non_associated,
            "total_excluded": result.total_excluded,
            "room_rent_actual_per_day": result.room_rent_actual_per_day,
            "room_rent_allowed_per_day": result.room_rent_allowed_per_day,
            "proportionate_ratio": result.proportionate_ratio,
            "associated_after_deduction": result.associated_after_deduction,
            "non_associated_covered": result.non_associated_covered,
            "excluded_amount": result.excluded_amount,
            "subtotal_before_caps": result.subtotal_before_caps,
            "sum_insured_cap_applied": result.sum_insured_cap_applied,
            "deductible_applied": result.deductible_applied,
            "copay_applied": result.copay_applied,
            "potential_claim_amount": result.potential_claim_amount,
            "potential_gap": result.potential_gap,
            "deductions": [
                {
                    "item_name": d.item_name,
                    "original_amount": d.original_amount,
                    "covered_amount": d.covered_amount,
                    "deduction_amount": d.deduction_amount,
                    "reason": d.reason,
                    "category": d.category,
                    "evidence_ref": d.evidence_ref,
                }
                for d in result.deductions
            ],
            "line_item_results": result.line_item_results,
        }

        # Update insurance analysis
        insurance_analysis["potential_coverage"] = result.potential_claim_amount
        insurance_analysis["potential_gap"] = result.potential_gap

        messages.append({
            "role": "system",
            "content": f"Gap calculation complete (DETERMINISTIC). "
                       f"Total bill: ₹{result.total_bill:,.0f}. "
                       f"Potential coverage: ₹{result.potential_claim_amount:,.0f}. "
                       f"Potential gap: ₹{result.potential_gap:,.0f}. "
                       f"Proportionate ratio: {result.proportionate_ratio:.1%}.",
        })

        return {
            "current_node": "find_gap",
            "gap_result": gap_result,
            "insurance_analysis": insurance_analysis,
            "messages": messages,
        }
