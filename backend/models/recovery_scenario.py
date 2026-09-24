import uuid
from sqlalchemy import Float, String, ForeignKey, JSON
from sqlalchemy.orm import mapped_column, Mapped
from database import Base

class RecoveryScenario(Base):
    __tablename__ = 'recovery_scenario'

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey('cases.case_id'), nullable=False)
    selected_path: Mapped[str | None] = mapped_column(String(64), nullable=True)
    amount_required: Mapped[float] = mapped_column(Float, default=0.0)
    available_cash: Mapped[float] = mapped_column(Float, default=0.0)
    modeled_impact: Mapped[dict] = mapped_column(JSON, default=dict)
