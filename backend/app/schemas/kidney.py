from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.kidney_request import KidneyRequestStatus
from app.models.kidney_match import KidneyMatchStatus

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

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


# Kidney Match Schemas


class KidneyMatchCreate(BaseModel):
    request_id: int
    message: Optional[str] = None


class KidneyMatchUpdate(BaseModel):
    status: KidneyMatchStatus


class KidneyMatchResponse(BaseModel):
    id: int
    donor_id: int
    request_id: int
    status: KidneyMatchStatus
    message: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class KidneyMatchDetailResponse(BaseModel):
    id: int
    donor_id: int
    request_id: int
    status: KidneyMatchStatus
    message: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    # Enriched details
    patient_name: str
    patient_id: int
    patient_blood_type: str
    hospital_name: str
    hospital_city: str
    patient_contact: str

    donor_name: str
    donor_blood_type: str
    donor_city: str
    donor_contact: str

    model_config = ConfigDict(from_attributes=True)
