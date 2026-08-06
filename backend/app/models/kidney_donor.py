from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class KidneyDonor(Base):
    __tablename__ = "kidney_donors"

    id = Column(Integer, primary_key=True, index=True)

    # Who registered
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Donor details
    full_name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    blood_type = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)
    city = Column(String, nullable=False)

    # Medical info
    medical_conditions = Column(Text, nullable=True)
    reason_to_donate = Column(Text, nullable=True)

    # Availability
    is_available = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", backref="kidney_donor_profile")
