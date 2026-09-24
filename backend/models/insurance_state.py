import uuid
from sqlalchemy import Float, String, ForeignKey, JSON
from sqlalchemy.orm import mapped_column, Mapped
from database import Base

class InsuranceState(Base):
    __tablename__ = 'insurance_state'

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey('cases.case_id'), unique=True, nullable=False)
    potential_coverage: Mapped[float] = mapped_column(Float, default=0.0)
    potential_gap: Mapped[float] = mapped_column(Float, default=0.0)
    missing_documents: Mapped[dict] = mapped_column(JSON, default=list)
    claim_readiness: Mapped[float] = mapped_column(Float, default=0.0)
    policy_flags: Mapped[dict] = mapped_column(JSON, default=dict)
    line_items: Mapped[dict] = mapped_column(JSON, default=list)
