"""Financial Context Agent — Builds FlowPass financial profile.

Uses the fast model (Llama 3.1 8B) for financial data interpretation.
Reads from Account Aggregator adapter (synthetic CSV for MVP).
"""
import json
from agents.state import SahaayState
from services.aa_adapter import SyntheticTransactionsAdapter


class FinancialContextAgent:
    """Builds the FlowPass financial profile from transaction data.

    Sources: Account Aggregator (synthetic CSV for MVP), user input, or estimation.
    Labels each field with its source for transparency.
    """

    def __init__(self):
        self.aa_adapter = SyntheticTransactionsAdapter()

    async def process(self, state: SahaayState) -> dict:
        """Build financial context from available data.

        LangGraph node function.
        """
        messages = list(state.get("messages", []))
        user_id = state.get("user_id", "demo_user")

        # If real user financial context is already attached to state, prioritize it
        existing_context = state.get("financial_context")
        if existing_context and isinstance(existing_context, dict) and existing_context.get("average_inflow"):
            messages.append({
                "role": "system",
                "content": f"User-verified financial context loaded. "
                           f"Inflow: ₹{existing_context.get('average_inflow', 0):,.0f}, "
                           f"Expenses: ₹{existing_context.get('recurring_expenses', 0):,.0f}, "
                           f"Obligations: ₹{existing_context.get('existing_obligations', 0):,.0f}, "
                           f"Buffer: ₹{existing_context.get('liquidity_buffer', 0):,.0f}."
            })
            return {
                "current_node": "build_context",
                "financial_context": existing_context,
                "messages": messages,
            }

        try:
            summary = await self.aa_adapter.compute_financial_summary(user_id)
            financial_context = {
                "average_inflow": summary.average_inflow,
                "recurring_expenses": summary.recurring_expenses,
                "existing_obligations": summary.existing_obligations,
                "liquidity_buffer": summary.liquidity_buffer,
                "source": summary.source,
                "months_analyzed": summary.months_analyzed,
                "income_entries": summary.income_entries,
                "expense_categories": summary.expense_categories,
                "field_sources": {
                    "average_inflow": "imported",
                    "recurring_expenses": "imported",
                    "existing_obligations": "imported",
                    "liquidity_buffer": "estimated",
                },
            }
        except Exception:
            # Standard financial profile fallback
            financial_context = {
                "average_inflow": 53700,
                "recurring_expenses": 31400,
                "existing_obligations": 6500,
                "liquidity_buffer": 15800,
                "source": "estimated",
                "months_analyzed": 6,
                "income_entries": [],
                "expense_categories": {},
                "field_sources": {
                    "average_inflow": "simulated",
                    "recurring_expenses": "simulated",
                    "existing_obligations": "simulated",
                    "liquidity_buffer": "estimated",
                },
            }

        messages.append({
            "role": "system",
            "content": f"Financial context built. "
                       f"Monthly inflow: ₹{financial_context['average_inflow']:,.0f}, "
                       f"Expenses: ₹{financial_context['recurring_expenses']:,.0f}, "
                       f"Obligations: ₹{financial_context['existing_obligations']:,.0f}, "
                       f"Buffer: ₹{financial_context['liquidity_buffer']:,.0f}.",
        })

        return {
            "current_node": "build_context",
            "financial_context": financial_context,
            "messages": messages,
        }
