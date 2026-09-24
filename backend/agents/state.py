from typing import TypedDict

class SahaayState(TypedDict):
    case_id: str
    user_id: str
    current_node: str
    user_input: str
    documents: list[dict]
    evidence: list[dict]
    insurance_analysis: dict | None
    financial_context: dict | None
    gap_result: dict | None
    recovery_scenarios: list[dict]
    flowpass: dict | None
    journey_state: str
    messages: list
    escalation: dict | None
    language: str
