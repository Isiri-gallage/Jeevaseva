from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

# Rules live in one module so every schema enforces the same thing. These are
# re-exported because existing code imports them from here.
from app.schemas.validators import (  # noqa: F401
    MAX_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH,
    VALID_BLOOD_TYPES,
    validate_blood_type,
    validate_password_strength,
    validate_phone,
)


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
        return validate_blood_type(v)

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
    # Was missing, so the profile page read `undefined` and rendered every
    # signed-in user as "Suspended" — a state that cannot exist, since login
    # rejects inactive accounts with 403 before a token is ever issued.
    is_active: bool

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
        return validate_blood_type(v) if v else v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
