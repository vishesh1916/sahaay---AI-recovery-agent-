import uuid
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict

class CaseStatusEnum(str, Enum):
    open = 'open'
    in_progress = 'in_progress'
    resolved = 'resolved'
    closed = 'closed'

class CaseCreate(BaseModel):
    user_id: uuid.UUID
    type: str

class CaseResponse(BaseModel):
    case_id: str
    user_id: uuid.UUID
    type: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
