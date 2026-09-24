import uuid
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict

class PaymentStateEnum(str, Enum):
    pending = 'pending'
    success = 'success'
    failed = 'failed'

class PaymentCreate(BaseModel):
    case_id: str
    amount: float

class PaymentResponse(BaseModel):
    transaction_id: uuid.UUID
    case_id: str
    provider: str
    amount: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
