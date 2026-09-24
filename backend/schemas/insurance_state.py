from enum import Enum
from pydantic import BaseModel, ConfigDict

class LineItemCategory(str, Enum):
    associated = 'associated'
    non_associated = 'non_associated'
    excluded = 'excluded'
    needs_review = 'needs_review'

class LineItem(BaseModel):
    name: str
    amount: float
    category: LineItemCategory
    reason: str | None = None

class CoverageResult(BaseModel):
    covered_amount: float
    gap_amount: float
    reason: str

class InsuranceAnalysis(BaseModel):
    potential_coverage: float
    potential_gap: float
    missing_documents: dict
    claim_readiness: float
    policy_flags: dict
    line_items: list[LineItem]

    model_config = ConfigDict(from_attributes=True)
