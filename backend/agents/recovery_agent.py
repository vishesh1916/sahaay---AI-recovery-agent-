"""Recovery Agent — Builds recovery scenarios based on gap and financial context.

Uses the fast model for scenario generation.
"""
import json
from groq import AsyncGroq
from config import settings
from agents.state import SahaayState


class RecoveryAgent:
    """Generates recovery scenarios combining gap amount with financial context.

    Creates actionable paths the user can choose from:
    1. Complete insurance claim + use savings
    2. Insurance claim + partial funding
    3. Full funding/financing
    4. Direct payment
    """

    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "openai/gpt-oss-20b"

    async def process(self, state: SahaayState) -> dict:
        """Generate recovery scenarios.

        LangGraph node function.
        """
        gap_result = state.get("gap_result", {}) or {}
        financial_context = state.get("financial_context", {}) or {}
        messages = list(state.get("messages", []))

        gap_amount = gap_result.get("potential_gap", 36657)
        claim_amount = gap_result.get("potential_claim_amount", 147943)
        total_bill = gap_result.get("total_bill", 184600)

        inflow = financial_context.get("average_inflow", 53700)
        expenses = financial_context.get("recurring_expenses", 31400)
        obligations = financial_context.get("existing_obligations", 6500)
        buffer = financial_context.get("liquidity_buffer", 15800)

        # Build scenarios deterministically
        scenarios = self._build_scenarios(
            gap_amount, claim_amount, total_bill, buffer, inflow, expenses, obligations
        )

        # Build FlowPass
        flowpass = self._build_flowpass(state, scenarios)

        messages.append({
            "role": "system",
            "content": f"Recovery plan generated. {len(scenarios)} scenarios available. "
                       f"Gap: ₹{gap_amount:,.0f}, Buffer: ₹{buffer:,.0f}.",
        })

        return {
            "current_node": "recovery_plan",
            "recovery_scenarios": scenarios,
            "flowpass": flowpass,
            "messages": messages,
        }

    def _build_scenarios(
        self, gap: float, claim: float, total_bill: float,
        buffer: float, inflow: float, expenses: float, obligations: float,
    ) -> list[dict]:
        """Build recovery scenarios based on financial situation."""
        monthly_surplus = inflow - expenses - obligations
        scenarios = []

        # Scenario 1: Insurance + savings
        if buffer >= gap:
            remaining_buffer = buffer - gap
            scenarios.append({
                "id": "insurance_savings",
                "title": "Complete Insurance Journey + Use Savings",
                "description": f"Submit insurance claim for ₹{claim:,.0f} and use ₹{gap:,.0f} from your savings buffer.",
                "amount_from_insurance": claim,
                "amount_from_savings": gap,
                "amount_from_funding": 0,
                "remaining_buffer": remaining_buffer,
                "monthly_impact": 0,
                "payment_pressure": "low" if remaining_buffer > monthly_surplus else "medium",
                "recommended": True,
                "action": "Complete insurance claim submission and pay gap from savings.",
            })
        else:
            shortfall = gap - buffer
            scenarios.append({
                "id": "insurance_partial_savings",
                "title": "Insurance + Partial Savings + Funding",
                "description": f"Submit claim for ₹{claim:,.0f}, use ₹{buffer:,.0f} from savings, and arrange ₹{shortfall:,.0f}.",
                "amount_from_insurance": claim,
                "amount_from_savings": buffer,
                "amount_from_funding": shortfall,
                "remaining_buffer": 0,
                "monthly_impact": shortfall / 6,  # 6-month EMI estimate
                "payment_pressure": "high",
                "recommended": False,
                "action": "Complete insurance claim, use available savings, explore funding for remainder.",
            })

        # Scenario 2: Full funding for gap
        emi_6month = gap / 6
        emi_12month = gap / 12
        new_total_obligations = obligations + emi_12month
        scenarios.append({
            "id": "insurance_funding",
            "title": "Insurance + Full Funding for Gap",
            "description": f"Submit claim for ₹{claim:,.0f} and get funding for the full gap of ₹{gap:,.0f}.",
            "amount_from_insurance": claim,
            "amount_from_savings": 0,
            "amount_from_funding": gap,
            "remaining_buffer": buffer,
            "monthly_impact": emi_12month,
            "payment_pressure": "medium" if new_total_obligations < inflow * 0.4 else "high",
            "recommended": buffer < gap,
            "emi_options": [
                {"months": 6, "emi": round(emi_6month, 2)},
                {"months": 12, "emi": round(emi_12month, 2)},
            ],
            "action": "Complete insurance claim and explore funding options for the gap amount.",
        })

        # Scenario 3: Direct payment
        scenarios.append({
            "id": "direct_payment",
            "title": "Make Direct Payment",
            "description": f"Pay the gap amount of ₹{gap:,.0f} directly.",
            "amount_from_insurance": claim,
            "amount_from_savings": gap,
            "amount_from_funding": 0,
            "remaining_buffer": max(buffer - gap, 0),
            "monthly_impact": 0,
            "payment_pressure": "high" if gap > buffer else "low",
            "recommended": False,
            "action": "Pay the gap amount immediately via payment gateway.",
        })

        return scenarios

    def _build_flowpass(self, state: SahaayState, scenarios: list[dict]) -> dict:
        """Build the complete FlowPass state."""
        financial_context = state.get("financial_context", {}) or {}
        insurance_analysis = state.get("insurance_analysis", {}) or {}
        gap_result = state.get("gap_result", {}) or {}
        evidence = state.get("evidence", [])

        return {
            "case_id": state.get("case_id", ""),
            "user_preferences": {
                "language": state.get("language", "english"),
            },
            "verified_evidence": [
                {
                    "document_id": e.get("document_id", ""),
                    "field": e.get("field", ""),
                    "status": e.get("status", "extracted"),
                    "source_ref": f"Page {e.get('page', 1)}, {e.get('section', '')}",
                }
                for e in evidence[:20]  # Limit for FlowPass
            ],
            "insurance_state": {
                "potential_coverage": insurance_analysis.get("potential_coverage", 0),
                "potential_gap": insurance_analysis.get("potential_gap", 0),
                "missing_documents": insurance_analysis.get("missing_documents", []),
                "claim_readiness": insurance_analysis.get("claim_readiness", 0),
                "exclusions_found": insurance_analysis.get("exclusions_found", []),
            },
            "financial_profile": {
                "average_inflow": financial_context.get("average_inflow", 0),
                "recurring_expenses": financial_context.get("recurring_expenses", 0),
                "existing_obligations": financial_context.get("existing_obligations", 0),
                "liquidity_buffer": financial_context.get("liquidity_buffer", 0),
                "source": financial_context.get("source", "unknown"),
                "field_sources": financial_context.get("field_sources", {}),
            },
            "recovery_scenario": {
                "scenarios": scenarios,
                "selected_path": None,
                "gap_amount": gap_result.get("potential_gap", 0),
            },
            "journey_state": "recovery_planned",
        }

    async def simulate(self, gap_amount: float, financial_context: dict) -> dict:
        """Run a recovery simulation for a specific amount.

        Used by the recovery simulator slider.
        """
        inflow = financial_context.get("average_inflow", 53700)
        expenses = financial_context.get("recurring_expenses", 31400)
        obligations = financial_context.get("existing_obligations", 6500)
        buffer = financial_context.get("liquidity_buffer", 15800)

        remaining_buffer = max(buffer - gap_amount, 0)
        monthly_surplus = inflow - expenses - obligations
        emi_12month = gap_amount / 12
        new_obligations = obligations + emi_12month
        payment_pressure = new_obligations / inflow if inflow > 0 else 1.0

        return {
            "gap_amount": gap_amount,
            "current_buffer": buffer,
            "remaining_buffer": remaining_buffer,
            "monthly_surplus": monthly_surplus,
            "modeled_emi": round(emi_12month, 2),
            "new_total_obligations": round(new_obligations, 2),
            "payment_pressure_ratio": round(payment_pressure, 4),
            "payment_pressure_label": (
                "low" if payment_pressure < 0.3
                else "medium" if payment_pressure < 0.5
                else "high"
            ),
            "can_absorb": gap_amount <= buffer,
            "months_to_recover": round(gap_amount / max(monthly_surplus, 1), 1),
        }
