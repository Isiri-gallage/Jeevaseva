from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.kidney_request import KidneyRequestStatus

# Kidney Request Schemas
class KidneyRequestCreate(BaseModel):
    patient_name: str
    patient_age: int
    blood_type: str
    contact_number: str
    hospital_name: str
    hospital_city: str
    medical_details: Optional[str] = None
    dialysis_duration: Optional[str] = None

class KidneyRequestResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    patient_age: int
    blood_type: str
    contact_number: str
    hospital_name: str
    hospital_city: str
    medical_details: Optional[str]
    dialysis_duration: Optional[str]
    status: KidneyRequestStatus
    created_at: datetime

    class Config:
        from_attributes = True

class KidneyRequestUpdate(BaseModel):
    status: Optional[KidneyRequestStatus] = None
    medical_details: Optional[str] = None

# Kidney Donor Schemas
class KidneyDonorCreate(BaseModel):
    full_name: str
    age: int
    blood_type: str
    contact_number: str
    city: str
    medical_conditions: Optional[str] = None
    reason_to_donate: Optional[str] = None

class KidneyDonorResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    age: int
    blood_type: str
    contact_number: str
    city: str
    medical_conditions: Optional[str]
    reason_to_donate: Optional[str]
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True