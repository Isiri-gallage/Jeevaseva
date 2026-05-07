from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"  # this becomes the table name in database

    # Every user gets a unique ID automatically
    id = Column(Integer, primary_key=True, index=True)

    # Basic info
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Blood donor specific info
    blood_type = Column(String, nullable=False)  # A+, B-, O+, AB+ etc
    is_donor = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)

    # Location (for finding nearby donors)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    city = Column(String, nullable=True)

    # Account info
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)

    # Timestamps (automatically set)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())