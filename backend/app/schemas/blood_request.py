from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.blood_request import UrgencyLevel, RequestStatus
from app.schemas.validators import (
    MAX_PLACE_LENGTH,
    clean_optional_text,
    clean_text,
    validate_blood_type,
    validate_phone,
    validate_units,
)

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

    @field_validator("blood_type")
    @classmethod
    def _blood(cls, v: str) -> str:
        return validate_blood_type(v)

    @field_validator("units_needed")
    @classmethod
    def _units(cls, v: int) -> int:
        return validate_units(v)

    @field_validator("patient_name")
    @classmethod
    def _name(cls, v: str) -> str:
        return clean_text(v, "Patient name")

    @field_validator("hospital_name")
    @classmethod
    def _hospital(cls, v: str) -> str:
        return clean_text(v, "Hospital name", maximum=MAX_PLACE_LENGTH)

    @field_validator("hospital_address")
    @classmethod
    def _address(cls, v: str) -> str:
        return clean_text(v, "Hospital address", maximum=200)

    @field_validator("city")
    @classmethod
    def _city(cls, v: str) -> str:
        return clean_text(v, "City", maximum=MAX_PLACE_LENGTH)

    @field_validator("contact_number")
    @classmethod
    def _phone(cls, v: str) -> str:
        return validate_phone(v)

    @field_validator("notes")
    @classmethod
    def _notes(cls, v: Optional[str]) -> Optional[str]:
        return clean_optional_text(v, "Notes")

    # Coordinates are optional, but an out-of-range pair would place the
    # request somewhere impossible on any future map view.
    @field_validator("latitude")
    @classmethod
    def _lat(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not -90 <= v <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def _lon(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not -180 <= v <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return v


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

    model_config = ConfigDict(from_attributes=True)


# For updating a request


class BloodRequestUpdate(BaseModel):
    status: Optional[RequestStatus] = None
    notes: Optional[str] = None
    units_needed: Optional[int] = None

    @field_validator("units_needed")
    @classmethod
    def _units(cls, v: Optional[int]) -> Optional[int]:
        return validate_units(v) if v is not None else v

    @field_validator("notes")
    @classmethod
    def _notes(cls, v: Optional[str]) -> Optional[str]:
        return clean_optional_text(v, "Notes")
