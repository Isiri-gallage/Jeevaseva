from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class KidneyRequestStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"
    FULFILLED = "fulfilled"

class BloodType(str, enum.Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"

class KidneyRequest(Base):
    __tablename__ = "kidney_requests"

    id = Column(Integer, primary_key=True, index=True)

    # Who made the request
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Patient details
    patient_name = Column(String, nullable=False)
    patient_age = Column(Integer, nullable=False)
    blood_type = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)

    # Medical details
    hospital_name = Column(String, nullable=False)
    hospital_city = Column(String, nullable=False)
    medical_details = Column(Text, nullable=True)
    dialysis_duration = Column(String, nullable=True)

    # Status
    status = Column(Enum(KidneyRequestStatus), default=KidneyRequestStatus.OPEN)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    patient = relationship("User", backref="kidney_requests")