from pydantic import BaseModel, EmailStr, validator
from typing import Optional
import re

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    blood_type: str
    is_donor: bool = False
    city: Optional[str] = None

    @validator('full_name')
    def name_must_be_valid(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Full name must be at least 2 characters')
        if len(v.strip()) > 100:
            raise ValueError('Full name must be less than 100 characters')
        return v.strip()

    @validator('password')
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if len(v) > 72:
            raise ValueError('Password must be less than 72 characters')
        return v

    @validator('phone')
    def phone_must_be_valid(cls, v):
        cleaned = re.sub(r'\s+', '', v)
        if not re.match(r'^[0-9]{10}$', cleaned):
            raise ValueError('Phone must be 10 digits')
        return cleaned

    @validator('blood_type')
    def blood_type_must_be_valid(cls, v):
        valid = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        if v not in valid:
            raise ValueError(f'Blood type must be one of {valid}')
        return v

    @validator('city')
    def city_must_be_valid(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('City must be at least 2 characters')
        return v.strip() if v else v


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @validator('password')
    def password_not_empty(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Password cannot be empty')
        return v


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

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    blood_type: Optional[str] = None

    @validator('full_name')
    def name_must_be_valid(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Full name must be at least 2 characters')
        return v.strip() if v else v

    @validator('phone')
    def phone_must_be_valid(cls, v):
        if v:
            cleaned = re.sub(r'\s+', '', v)
            if not re.match(r'^[0-9]{10}$', cleaned):
                raise ValueError('Phone must be 10 digits')
            return cleaned
        return v

    @validator('blood_type')
    def blood_type_must_be_valid(cls, v):
        if v:
            valid = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
            if v not in valid:
                raise ValueError(f'Blood type must be one of {valid}')
        return v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None