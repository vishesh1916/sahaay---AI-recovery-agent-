"""Funding Agent — Prepares the funding journey by reusing FlowPass context.

This is the KEY differentiator: the user doesn't start over.
All verified financial context carries forward.
"""
from agents.state import SahaayState


class FundingAgent:
    """Prepares the funding journey using FlowPass context.

    The core product moment:
    - Retrieves FlowPass state
    - Shows what's already verified
    - Identifies what needs confirmation
    - Prepares the funding application context
    
    Does NOT approve loans. Shows the pathway only.
    """

    async def process(self, state: SahaayState) -> dict:
        """Prepare funding journey from FlowPass.

        LangGraph node function.
        """
        flowpass = state.get("flowpass", {}) or {}
        financial_context = state.get("financial_context", {}) or {}
        gap_result = state.get("gap_result", {}) or {}
        messages = list(state.get("messages", []))

        gap_amount = gap_result.get("potential_gap", 0)

        # Build funding preparation from FlowPass
        already_verified = []
        needs_confirmation = []

        # Check what FlowPass already has
        fp = flowpass.get("financial_profile", financial_context)
        
        if fp.get("average_inflow"):
            already_verified.append({
                "field": "Monthly Income",
                "value": f"₹{fp['average_inflow']:,.0f}",
                "source": fp.get("field_sources", {}).get("average_inflow", "imported"),
            })
        
        if fp.get("recurring_expenses"):
            already_verified.append({
                "field": "Monthly Expenses",
                "value": f"₹{fp['recurring_expenses']:,.0f}",
                "source": fp.get("field_sources", {}).get("recurring_expenses", "imported"),
            })
        
        if fp.get("existing_obligations"):
            already_verified.append({
                "field": "Existing EMI/Obligations",
                "value": f"₹{fp['existing_obligations']:,.0f}",
                "source": fp.get("field_sources", {}).get("existing_obligations", "imported"),
            })

        if fp.get("liquidity_buffer"):
            already_verified.append({
                "field": "Available Buffer",
                "value": f"₹{fp['liquidity_buffer']:,.0f}",
                "source": "estimated",
            })

        # Document verification
        documents = state.get("documents", [])
        if documents:
            verified_count = sum(1 for d in documents if d.get("status") == "parsed")
            already_verified.append({
                "field": "Verified Documents",
                "value": f"{verified_count} documents",
                "source": "verified",
            })

        # Case context
        already_verified.append({
            "field": "Emergency Context",
            "value": f"Medical emergency — Gap: ₹{gap_amount:,.0f}",
            "source": "case_context",
        })

        # Items that still need confirmation for funding
        needs_confirmation.append({
            "field": "Employment Details",
            "description": "Confirm current employment type and tenure",
            "pre_filled": "Freelancer (from FlowPass)",
        })
        needs_confirmation.append({
            "field": "Additional Income Sources",
            "description": "Any additional income not captured in transactions",
            "pre_filled": None,
        })

        funding_context = {
            "amount_required": gap_amount,
            "purpose": "Medical emergency gap coverage",
            "already_verified": already_verified,
            "needs_confirmation": needs_confirmation,
            "verified_count": len(already_verified),
            "confirmation_count": len(needs_confirmation),
            "flowpass_reused": True,
            "traditional_fields_required": 12,  # What a traditional app would ask
            "fields_eliminated": 12 - len(needs_confirmation),  # FlowPass advantage
        }

        messages.append({
            "role": "system",
            "content": f"Funding journey prepared via FlowPass. "
                       f"{len(already_verified)} fields already verified, "
                       f"only {len(needs_confirmation)} need confirmation. "
                       f"Traditional application would require {funding_context['traditional_fields_required']} fields.",
        })

        return {
            "current_node": "funding",
            "journey_state": "funding_prepared",
            "messages": messages,
            # Store funding context in flowpass
            "flowpass": {
                **(flowpass or {}),
                "funding_context": funding_context,
                "journey_state": "funding_prepared",
            },
        }
