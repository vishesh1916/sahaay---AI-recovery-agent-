import uuid
from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import mapped_column, Mapped
from database import Base

class Evidence(Base):
    __tablename__ = 'evidence'

    evidence_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey('documents.document_id'), nullable=False)
    page: Mapped[int] = mapped_column(Integer, default=1)
    section: Mapped[str] = mapped_column(String(128), default='General')
    source_text: Mapped[str] = mapped_column(Text, nullable=False)
    field: Mapped[str] = mapped_column(String(128), nullable=False)
    value: Mapped[str] = mapped_column(String(256), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default='extracted')
