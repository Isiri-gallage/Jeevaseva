from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_admin_user
from app.models.user import User
from app.models.blood_request import BloodRequest, RequestStatus
from app.models.donation import Donation
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get overall platform statistics"""

    total_users = db.query(User).count()
    total_donors = db.query(User).filter(User.is_donor == True).count()
    total_requests = db.query(BloodRequest).count()
    open_requests = db.query(BloodRequest).filter(BloodRequest.status == RequestStatus.OPEN).count()
    total_donations = db.query(Donation).count()

    return {
        "total_users": total_users,
        "total_donors": total_donors,
        "total_requests": total_requests,
        "open_requests": open_requests,
        "total_donations": total_donations,
    }


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all registered users"""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/verify")
def verify_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Verify a user account"""

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    db.commit()

    return {"message": f"{user.full_name} has been verified ✅"}


@router.patch("/users/{user_id}/ban")
def ban_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Ban/disable a user account"""

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot ban an admin user")

    user.is_active = False
    db.commit()

    return {"message": f"{user.full_name} has been banned 🚫"}


@router.patch("/users/{user_id}/unban")
def unban_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Unban a user account"""

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    db.commit()

    return {"message": f"{user.full_name} has been unbanned ✅"}


@router.get("/requests")
def get_all_requests(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all blood requests"""
    return db.query(BloodRequest).order_by(BloodRequest.created_at.desc()).all()


@router.delete("/requests/{request_id}")
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Delete any blood request"""

    request = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    db.delete(request)
    db.commit()

    return {"message": "Blood request deleted ✅"}


@router.patch("/users/{user_id}/make-admin")
def make_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Give admin privileges to a user"""

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_admin = True
    db.commit()

    return {"message": f"{user.full_name} is now an admin 👑"}