import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, String, DateTime, Float
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = 'users'

    user_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(32), default='email')
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    paytm_wallet_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    paytm_upi_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    paytm_credit_limit: Mapped[float] = mapped_column(Float, default=50000.0)
    language: Mapped[str] = mapped_column(String, default='hinglish')
    consent_health: Mapped[bool] = mapped_column(Boolean, default=True)
    consent_financial: Mapped[bool] = mapped_column(Boolean, default=True)
    consent_payment: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

