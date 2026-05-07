from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.blood_request import UrgencyLevel, RequestStatus

# What we RECEIVE when creating a request
class BloodRequestCreate(BaseModel):
    blood_type: str
    units_needed: int = 1
    urgency: UrgencyLevel = UrgencyLevel.MEDIUM
    hospital_name: str
    hospital_address: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    patient_name: str
    contact_number: str
    notes: Optional[str] = None

# What we SEND BACK
class BloodRequestResponse(BaseModel):
    id: int
    patient_id: int
    blood_type: str
    units_needed: int
    urgency: UrgencyLevel
    status: RequestStatus
    hospital_name: str
    hospital_address: str
    city: str
    patient_name: str
    contact_number: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# For updating a request
class BloodRequestUpdate(BaseModel):
    status: Optional[RequestStatus] = None
    notes: Optional[str] = None
    units_needed: Optional[int] = None