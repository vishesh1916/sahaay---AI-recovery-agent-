import uuid
from enum import Enum
from pydantic import BaseModel, ConfigDict

class RecoveryPath(str, Enum):
    savings = 'savings'
    loan = 'loan'
    crowdfunding = 'crowdfunding'
    employer_advance = 'employer_advance'

class RecoveryScenario(BaseModel):
    id: uuid.UUID | None = None
    case_id: str
    selected_path: str | None = None
    amount_required: float
    available_cash: float
    modeled_impact: dict

    model_config = ConfigDict(from_attributes=True)

class RecoverySimulationRequest(BaseModel):
    amount: float
    months: int

class RecoverySimulationResponse(BaseModel):
    monthly_installment: float
    total_interest: float
    feasibility_score: float
