import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class UserCreate(BaseModel):
    name: str
    language: str = 'english'

class ConsentUpdate(BaseModel):
    consent_health: bool | None = None
    consent_financial: bool | None = None
    consent_payment: bool | None = None

class UserResponse(BaseModel):
    user_id: uuid.UUID
    name: str
    language: str
    consent_health: bool
    consent_financial: bool
    consent_payment: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
