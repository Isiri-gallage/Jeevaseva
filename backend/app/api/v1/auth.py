from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta
import logging

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.core.rate_limit import (
    limiter,
    LOGIN_RATE_LIMIT,
    REGISTER_RATE_LIMIT,
    PASSWORD_CHANGE_RATE_LIMIT,
)
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    Token,
    UserUpdate,
    PasswordChange,
)
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# ─── Register ──────────────────────────────────────────────


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
    summary="Register a new user",
    description="Create a new user account with blood type and optional donor registration."
)
@limiter.limit(REGISTER_RATE_LIMIT)
def register(
    request: Request,
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    # Check if email already exists
    existing_email = db.query(User).filter(
        User.email == user_data.email
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if phone already exists
    existing_phone = db.query(User).filter(
        User.phone == user_data.phone
    ).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )

    # Create new user
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
        hashed_password=hash_password(user_data.password),
        blood_type=user_data.blood_type,
        is_donor=user_data.is_donor,
        city=user_data.city
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(f"New user registered: {new_user.email}")

    return new_user


# ─── Login ─────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=Token,
    summary="Login user",
    description="Authenticate with email and password. Returns JWT access token."
)
@limiter.limit(LOGIN_RATE_LIMIT)
def login(
    request: Request,
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    # Find user by email
    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    # Validate credentials
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled. Please contact support."
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    logger.info(f"User logged in: {user.email}")

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ─── Get Current User ──────────────────────────────────────

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Returns the profile of the currently authenticated user."
)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


# ─── Update Profile ────────────────────────────────────────

@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update profile",
    description="Update the current user's profile information."
)
def update_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check phone uniqueness if updating
    if update_data.phone:
        existing = db.query(User).filter(
            User.phone == update_data.phone,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already in use"
            )

    # Update fields
    if update_data.full_name:
        current_user.full_name = update_data.full_name
    if update_data.phone:
        current_user.phone = update_data.phone
    if update_data.city is not None:
        current_user.city = update_data.city
    if update_data.blood_type:
        current_user.blood_type = update_data.blood_type

    db.commit()
    db.refresh(current_user)

    logger.info(f"User profile updated: {current_user.email}")

    return current_user


# ─── Change Password ───────────────────────────────────────

@router.post(
    "/change-password",
    summary="Change password",
    description="Change the current user's password."
)
@limiter.limit(PASSWORD_CHANGE_RATE_LIMIT)
def change_password(
    request: Request,
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify current password
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Strength rules live on the PasswordChange schema; only the
    # "must actually be a change" rule needs the current password here.
    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )

    # Update password
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()

    logger.info(f"Password changed for: {current_user.email}")

    return {"message": "Password changed successfully ✅"}
