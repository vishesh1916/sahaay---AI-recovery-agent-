import uuid
from pydantic import BaseModel, ConfigDict
from enum import Enum

class FinancialSource(str, Enum):
    bank_statement = 'bank_statement'
    user_input = 'user_input'
    estimated = 'estimated'

class FinancialProfile(BaseModel):
    context_id: uuid.UUID | None = None
    case_id: str
    average_inflow: float
    recurring_expenses: float
    existing_obligations: float
    liquidity_buffer: float
    source: str

    model_config = ConfigDict(from_attributes=True)
