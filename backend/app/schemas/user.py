from pydantic import BaseModel, EmailStr
from typing import Optional

# What we RECEIVE when user registers
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr        # automatically validates email format
    phone: str
    password: str
    blood_type: str
    is_donor: bool = False
    city: Optional[str] = None

# What we RECEIVE when user logs in
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# What we SEND BACK to the user (never send password!)
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

    class Config:
        from_attributes = True  # allows reading from database model

# Token response after login
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"