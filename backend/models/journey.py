import uuid
from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import mapped_column, Mapped
from database import Base

class Journey(Base):
    __tablename__ = 'journeys'

    journey_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey('cases.case_id'), nullable=False)
    type: Mapped[str] = mapped_column(String(32), default='medical')
    state: Mapped[str] = mapped_column(String(32), default='intake')
    next_action: Mapped[str] = mapped_column(String(64), default='analyze')
    status: Mapped[str] = mapped_column(String(32), default='active')
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
