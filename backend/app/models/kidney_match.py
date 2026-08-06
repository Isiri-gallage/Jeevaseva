from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class KidneyMatchStatus(str, enum.Enum):
    PENDING_CONTACT = "pending_contact"          # Donor expressed interest, waiting for patient
    CONTACTED = "contacted"                      # Patient accepted, chat is active
    HOSPITAL_COORDINATION = "hospital"          # Both are coordinating with their hospital
    COMPLETED = "completed"                      # Handover is complete
    CANCELLED = "cancelled"                      # Connection was cancelled/withdrawn


class KidneyMatch(Base):
    __tablename__ = "kidney_matches"

    id = Column(Integer, primary_key=True, index=True)

    # Who is offering to donate (links to users.id)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Which request they are responding to
    request_id = Column(Integer, ForeignKey("kidney_requests.id"), nullable=False)

    # Connection status
    status = Column(Enum(KidneyMatchStatus), default=KidneyMatchStatus.PENDING_CONTACT)

    # Message from the donor when expressing interest
    message = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    donor = relationship("User", foreign_keys=[donor_id], backref="kidney_matches")
    request = relationship("KidneyRequest", foreign_keys=[request_id], backref="matches")
