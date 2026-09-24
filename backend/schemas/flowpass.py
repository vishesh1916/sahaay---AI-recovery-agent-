from pydantic import BaseModel
from .evidence import EvidenceItem
from .insurance_state import InsuranceAnalysis
from .financial_context import FinancialProfile
from .recovery import RecoveryScenario

class FlowPassSchema(BaseModel):
    user_preferences: dict
    verified_evidence: list[EvidenceItem]
    insurance_state: InsuranceAnalysis | None = None
    financial_profile: FinancialProfile | None = None
    recovery_scenario: RecoveryScenario | None = None
    journey_state: str
