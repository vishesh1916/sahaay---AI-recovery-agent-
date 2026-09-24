import uuid
from enum import Enum
from pydantic import BaseModel, ConfigDict

class EvidenceStatusEnum(str, Enum):
    verified = 'verified'
    extracted = 'extracted'
    user_provided = 'user_provided'
    estimated = 'estimated'
    conflicting = 'conflicting'
    needs_review = 'needs_review'
    missing = 'missing'

class EvidenceItem(BaseModel):
    evidence_id: uuid.UUID
    document_id: uuid.UUID
    page: int
    section: str
    source_text: str
    field: str
    value: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class EvidenceMap(BaseModel):
    items: list[EvidenceItem]
