from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class DonationStatus(str, enum.Enum):
    PENDING = "pending"       # Donor said yes, waiting confirmation
    CONFIRMED = "confirmed"   # Both sides confirmed
    COMPLETED = "completed"   # Donation happened
    CANCELLED = "cancelled"   # Cancelled by either side


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)

    # Who is donating
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Which request they are responding to
    request_id = Column(Integer, ForeignKey("blood_requests.id"), nullable=False)

    # Status of this donation
    status = Column(Enum(DonationStatus), default=DonationStatus.PENDING)

    # Optional message from donor
    message = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    donor = relationship("User", backref="donations")
    blood_request = relationship("BloodRequest", backref="donations")
