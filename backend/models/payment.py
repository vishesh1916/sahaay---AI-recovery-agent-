import uuid
from datetime import datetime
from sqlalchemy import Float, String, DateTime, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.sql import func
from database import Base

class Payment(Base):
    __tablename__ = 'payments'

    transaction_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey('cases.case_id'), nullable=False)
    provider: Mapped[str] = mapped_column(String(32), default='paytm')
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(32), default='pending')
    paytm_order_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    paytm_txn_token: Mapped[str | None] = mapped_column(String(256), nullable=True)
    txn_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
