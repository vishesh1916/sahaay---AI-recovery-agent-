from pydantic import BaseModel

class DeductionDetail(BaseModel):
    reason: str
    amount: float
    is_contestable: bool

class GapBreakdown(BaseModel):
    total_billed: float
    total_approved: float
    deductions: list[DeductionDetail]

class GapCalculation(BaseModel):
    total_gap: float
    breakdown: GapBreakdown
