from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

# Urgency levels
class UrgencyLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# Request status
class RequestStatus(str, enum.Enum):
    OPEN = "open"
    FULFILLED = "fulfilled"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(Integer, primary_key=True, index=True)

    # Who made the request
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Blood details
    blood_type = Column(String, nullable=False)
    units_needed = Column(Integer, default=1)

    # Urgency and status
    urgency = Column(Enum(UrgencyLevel), default=UrgencyLevel.MEDIUM)
    status = Column(Enum(RequestStatus), default=RequestStatus.OPEN)

    # Hospital details
    hospital_name = Column(String, nullable=False)
    hospital_address = Column(String, nullable=False)
    city = Column(String, nullable=False)

    # Location for nearby search
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Additional info
    patient_name = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)
    notes = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Relationship - connect to User model
    patient = relationship("User", backref="blood_requests")
    