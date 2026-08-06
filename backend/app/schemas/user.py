import re
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

VALID_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

# bcrypt silently truncates anything past 72 bytes, so reject longer inputs
# rather than accept a password whose tail is ignored.
MAX_PASSWORD_LENGTH = 72
MIN_PASSWORD_LENGTH = 8


def validate_password_strength(value: str) -> str:
    if len(value) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    if len(value) > MAX_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at most {MAX_PASSWORD_LENGTH} characters")
    if not re.search(r"[A-Za-z]", value):
        raise ValueError("Password must contain at least one letter")
    if not re.search(r"[0-9]", value):
        raise ValueError("Password must contain at least one number")
    return value


def validate_phone(value: str) -> str:
    cleaned = re.sub(r"[\s-]+", "", value)
    if not re.match(r"^[0-9]{10}$", cleaned):
        raise ValueError("Phone must be 10 digits")
    return cleaned


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    blood_type: str
    is_donor: bool = False
    city: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def name_must_be_valid(cls, v: str) -> str:
        name = v.strip()
        if len(name) < 2:
            raise ValueError("Full name must be at least 2 characters")
        if len(name) > 100:
            raise ValueError("Full name must be less than 100 characters")
        return name

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, v: str) -> str:
        return validate_password_strength(v)

    @field_validator("phone")
    @classmethod
    def phone_must_be_valid(cls, v: str) -> str:
        return validate_phone(v)

    @field_validator("blood_type")
    @classmethod
    def blood_type_must_be_valid(cls, v: str) -> str:
        if v not in VALID_BLOOD_TYPES:
            raise ValueError(f"Blood type must be one of {VALID_BLOOD_TYPES}")
        return v

    @field_validator("city")
    @classmethod
    def city_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        city = v.strip()
        if len(city) < 2:
            raise ValueError("City must be at least 2 characters")
        return city


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Password cannot be empty")
        return v


class PasswordChange(BaseModel):
    """Sent in the request body so passwords never appear in a URL or access log."""
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def new_password_must_be_strong(cls, v: str) -> str:
        return validate_password_strength(v)


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    blood_type: str
    is_donor: bool
    is_available: bool
    city: Optional[str]
    is_verified: bool
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    blood_type: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def name_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        name = v.strip()
        if len(name) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return name

    @field_validator("phone")
    @classmethod
    def phone_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        return validate_phone(v) if v else v

    @field_validator("city")
    @classmethod
    def city_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else v

    @field_validator("blood_type")
    @classmethod
    def blood_type_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        if v and v not in VALID_BLOOD_TYPES:
            raise ValueError(f"Blood type must be one of {VALID_BLOOD_TYPES}")
        return v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
