import uuid
from datetime import datetime
from sqlalchemy import Float, String, DateTime, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.sql import func
from database import Base

class FinancialContext(Base):
    __tablename__ = 'financial_context'

    context_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey('cases.case_id'), unique=True, nullable=False)
    average_inflow: Mapped[float] = mapped_column(Float, default=50000.0)
    recurring_expenses: Mapped[float] = mapped_column(Float, default=30000.0)
    existing_obligations: Mapped[float] = mapped_column(Float, default=5000.0)
    liquidity_buffer: Mapped[float] = mapped_column(Float, default=15000.0)
    source: Mapped[str] = mapped_column(String(256), default='Account Aggregator / User Profile')
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
