import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.sql import func
from database import Base

class AuditLog(Base):
    __tablename__ = 'audit_logs'

    log_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey('cases.case_id'), nullable=False)
    actor: Mapped[str] = mapped_column(String(64), default='system')
    action: Mapped[str] = mapped_column(String(64), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
