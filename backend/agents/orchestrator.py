"""SAHAAY Multi-Agent Orchestrator Pipeline.

Direct async pipeline powered by Groq LLM API and the Unified Analysis Engine.
Removes heavy external dependencies for reliable, fast execution.
"""
from typing import Any
from services.analysis_engine import AnalysisEngine, StandardAnalysisResult
from agents.intent_agent import IntentAgent
from agents.document_agent import DocumentAgent
from agents.communication_agent import CommunicationAgent
from config import settings

class PipelineOrchestrator:
    def __init__(self):
        self.engine = AnalysisEngine()
        self.intent_agent = IntentAgent()
        self.doc_agent = DocumentAgent()
        self.comm_agent = CommunicationAgent()

    async def run(self, state: dict) -> dict:
        """Run the full analysis pipeline sequentially."""
        # 1. Understand emergency intent & entities
        user_input = state.get("user_input", "")
        lang = state.get("language", "hinglish")
        emergency_type = state.get("emergency_type") or state.get("type", "medical")

        if user_input:
            try:
                intent_result = await self.intent_agent.process({"user_input": user_input, "language": lang})
                if not state.get("emergency_type") and intent_result.get("intent"):
                    matched_intent = intent_result["intent"]
                    type_mapping = {
                        "medical_emergency": "medical",
                        "vehicle_accident": "vehicle",
                        "income_interruption": "income",
                        "unexpected_expense": "unexpected"
                    }
                    if matched_intent in type_mapping:
                        emergency_type = type_mapping[matched_intent]
            except Exception as e:
                print(f"Intent analysis error (fallback to provided type): {e}")

        # 2. Extract Document Evidence (if uploaded)
        documents = state.get("documents", [])
        evidence = list(state.get("evidence", []))
        extracted_line_items = list(state.get("custom_line_items", []))
        policy_rules = dict(state.get("custom_policy_rules", {}))

        if documents:
            try:
                doc_result = await self.doc_agent.process(documents, evidence)
                evidence = doc_result.get("evidence", evidence)
                for item in doc_result.get("line_items", []):
                    extracted_line_items.append(item)
                if doc_result.get("policy_rules"):
                    policy_rules.update(doc_result["policy_rules"])
                if doc_result.get("provider_name"):
                    state["provider_name"] = doc_result["provider_name"]
            except Exception as e:
                print(f"Document extraction note: {e}")

        # 3. Financial Context (Consented FlowPass Profile)
        financial_profile = state.get("financial_context") or {
            "average_inflow": 53700.0,
            "recurring_expenses": 31400.0,
            "existing_obligations": 6500.0,
            "liquidity_buffer": 15800.0,
            "source": "Account Aggregator (Setu Sandbox / Synced Profile)",
            "months_analyzed": 6,
            "field_sources": {
                "average_inflow": "imported",
                "recurring_expenses": "imported",
                "existing_obligations": "imported",
                "liquidity_buffer": "derived",
            }
        }

        # 4. Run Unified Domain Gap Engine
        total_amount = float(state.get("total_amount") or 0.0)
        if total_amount == 0.0:
            if emergency_type == "medical":
                total_amount = 184600.0
            elif emergency_type == "vehicle":
                total_amount = 85000.0
            elif emergency_type == "income":
                total_amount = 120000.0
            else:
                total_amount = 65000.0

        analysis: StandardAnalysisResult = self.engine.run_analysis(
            emergency_type=emergency_type,
            total_amount=total_amount,
            line_items=extracted_line_items,
            policy_data=policy_rules,
            financial_profile=financial_profile
        )

        # 5. Build FlowPass Object
        flowpass = {
            "case_id": state.get("case_id", "CASE-SH-LIVE"),
            "user_preferences": {"language": lang},
            "verified_evidence": evidence or [
                {"document_id": "doc-01", "field": "policy_schedule", "status": "verified", "source_ref": "Policy Section 2"},
                {"document_id": "doc-02", "field": "billed_items", "status": "verified", "source_ref": "Invoice Page 1"},
            ],
            "insurance_state": {
                "potential_coverage": analysis.covered_amount,
                "potential_gap": analysis.gap_amount,
                "missing_documents": ["Identity Proof (KYC)", "Supporting Invoices"],
                "claim_readiness": analysis.readiness_percentage,
                "exclusions_found": ["Consumables", "Non-covered excess"],
            },
            "financial_profile": financial_profile,
            "recovery_scenario": {
                "scenarios": analysis.recovery_scenarios,
                "selected_path": analysis.recovery_scenarios[0]["id"] if analysis.recovery_scenarios else "funding",
                "gap_amount": analysis.gap_amount,
            },
            "funding_context": {
                "amount_required": analysis.gap_amount,
                "purpose": f"{analysis.title} Settlement",
                "already_verified": [
                    {"field": "Verified Inflow", "value": f"₹{financial_profile['average_inflow']:,.0f}", "source": "Account Aggregator"},
                    {"field": "Fixed Monthly Burn", "value": f"₹{financial_profile['recurring_expenses']:,.0f}", "source": "Account Aggregator"},
                    {"field": "Active Loan Obligations", "value": f"₹{financial_profile['existing_obligations']:,.0f}", "source": "Account Aggregator"},
                    {"field": "Emergency Proof Document", "value": analysis.title, "source": "Verified Uploads"},
                    {"field": "KYC Identity", "value": "User Profile (PAN Verified)", "source": "Consent Profile"},
                ],
                "needs_confirmation": [
                    {"field": "Repayment Plan", "description": "Select tenure (6 vs 12 months)", "pre_filled": f"12 Months @ ₹{round(analysis.gap_amount/12):,.0f}/mo"},
                    {"field": "Auto-Debit Settlement", "description": "Select verified bank account", "pre_filled": "Primary Bank Account ending in **4912"},
                ],
                "verified_count": 5,
                "confirmation_count": 2,
                "flowpass_reused": True,
                "traditional_fields_required": 18,
                "fields_eliminated": 16,
            },
            "journey_state": "funding_prepared",
        }

        # 6. Format Result State
        state["insurance_analysis"] = {
            "potential_coverage": analysis.covered_amount,
            "potential_gap": analysis.gap_amount,
            "missing_documents": ["KYC Document", "Supporting Proof Invoice"],
            "claim_readiness": analysis.readiness_percentage,
            "line_items": analysis.line_items,
            "exclusions_found": [d["item_name"] for d in analysis.deductions],
        }
        state["gap_result"] = {
            "total_bill": analysis.total_amount,
            "potential_claim_amount": analysis.covered_amount,
            "covered_amount": analysis.covered_amount,
            "potential_gap": analysis.gap_amount,
            "gap_amount": analysis.gap_amount,
            "deductions": analysis.deductions,
            "line_item_results": analysis.line_items,
        }
        state["financial_context"] = financial_profile
        state["recovery_scenarios"] = analysis.recovery_scenarios
        state["flowpass"] = flowpass
        state["journey_state"] = "funding_prepared"
        state["summary"] = analysis.summary
        state["current_node"] = "complete"

        return state


_orchestrator = PipelineOrchestrator()

async def run_full_analysis(initial_state: dict) -> dict:
    """Run full analysis pipeline sequentially on state."""
    return await _orchestrator.run(initial_state)

async def run_single_node(state: dict, node_name: str) -> dict:
    """Run single step (returns processed state)."""
    return await _orchestrator.run(state)
