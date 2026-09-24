import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.sql import func
from database import Base

class Case(Base):
    __tablename__ = 'cases'

    case_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey('users.user_id'), nullable=True)
    emergency_type: Mapped[str] = mapped_column(String(32), default='medical')
    type: Mapped[str] = mapped_column(String(32), default='medical')
    status: Mapped[str] = mapped_column(String(32), default='created')
    user_input: Mapped[str] = mapped_column(Text, nullable=True)
    language: Mapped[str] = mapped_column(String(16), default='hinglish')
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
