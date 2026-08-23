from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.kidney_request import KidneyRequestStatus
from app.models.kidney_match import KidneyMatchStatus
from app.schemas.validators import (
    MAX_PLACE_LENGTH,
    clean_optional_text,
    clean_text,
    validate_blood_type,
    validate_donor_age,
    validate_patient_age,
    validate_phone,
)

# ─── Kidney requests ───────────────────────────────────────


class KidneyRequestCreate(BaseModel):
    patient_name: str
    patient_age: int
    blood_type: str
    contact_number: str
    hospital_name: str
    hospital_city: str
    medical_details: Optional[str] = None
    dialysis_duration: Optional[str] = None

    @field_validator("patient_name")
    @classmethod
    def _name(cls, v: str) -> str:
        return clean_text(v, "Patient name")

    @field_validator("patient_age")
    @classmethod
    def _age(cls, v: int) -> int:
        return validate_patient_age(v)

    @field_validator("blood_type")
    @classmethod
    def _blood(cls, v: str) -> str:
        return validate_blood_type(v)

    @field_validator("contact_number")
    @classmethod
    def _phone(cls, v: str) -> str:
        return validate_phone(v)

    @field_validator("hospital_name")
    @classmethod
    def _hospital(cls, v: str) -> str:
        return clean_text(v, "Hospital name", maximum=MAX_PLACE_LENGTH)

    @field_validator("hospital_city")
    @classmethod
    def _city(cls, v: str) -> str:
        return clean_text(v, "Hospital city", maximum=MAX_PLACE_LENGTH)

    @field_validator("medical_details")
    @classmethod
    def _details(cls, v: Optional[str]) -> Optional[str]:
        return clean_optional_text(v, "Medical details")

    @field_validator("dialysis_duration")
    @classmethod
    def _dialysis(cls, v: Optional[str]) -> Optional[str]:
        return clean_optional_text(v, "Dialysis duration", maximum=100)


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

    @field_validator("medical_details")
    @classmethod
    def _details(cls, v: Optional[str]) -> Optional[str]:
        return clean_optional_text(v, "Medical details")


# ─── Kidney donors ─────────────────────────────────────────


class KidneyDonorCreate(BaseModel):
    full_name: str
    age: int
    blood_type: str
    contact_number: str
    city: str
    medical_conditions: Optional[str] = None
    reason_to_donate: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def _name(cls, v: str) -> str:
        return clean_text(v, "Full name")

    @field_validator("age")
    @classmethod
    def _age(cls, v: int) -> int:
        return validate_donor_age(v)

    @field_validator("blood_type")
    @classmethod
    def _blood(cls, v: str) -> str:
        return validate_blood_type(v)

    @field_validator("contact_number")
    @classmethod
    def _phone(cls, v: str) -> str:
        return validate_phone(v)

    @field_validator("city")
    @classmethod
    def _city(cls, v: str) -> str:
        return clean_text(v, "City", maximum=MAX_PLACE_LENGTH)

    @field_validator("medical_conditions")
    @classmethod
    def _conditions(cls, v: Optional[str]) -> Optional[str]:
        return clean_optional_text(v, "Medical conditions")

    @field_validator("reason_to_donate")
    @classmethod
    def _reason(cls, v: Optional[str]) -> Optional[str]:
        return clean_optional_text(v, "Reason to donate")


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


# ─── Kidney matches ────────────────────────────────────────


class KidneyMatchCreate(BaseModel):
    request_id: int
    message: Optional[str] = None

    @field_validator("request_id")
    @classmethod
    def _request_id(cls, v: int) -> int:
        # A non-positive id can never match a row; rejecting here turns a
        # confusing 404 into a clear validation error.
        if v < 1:
            raise ValueError("request_id must be a positive integer")
        return v

    @field_validator("message")
    @classmethod
    def _message(cls, v: Optional[str]) -> Optional[str]:
        return clean_optional_text(v, "Message", maximum=1000)


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
    """A match joined with both parties' details, for the connections view."""
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
