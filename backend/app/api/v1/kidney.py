from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.kidney_request import KidneyRequest, KidneyRequestStatus
from app.models.kidney_donor import KidneyDonor
from app.schemas.kidney import (
    KidneyRequestCreate, KidneyRequestResponse, KidneyRequestUpdate,
    KidneyDonorCreate, KidneyDonorResponse
)

router = APIRouter()

# ─── Kidney Requests ───────────────────────────────────────

@router.post("/requests", response_model=KidneyRequestResponse, status_code=201)
def create_kidney_request(
    data: KidneyRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Patient creates a kidney request"""
    request = KidneyRequest(
        patient_id=current_user.id,
        **data.dict()
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


@router.get("/requests", response_model=List[KidneyRequestResponse])
def get_all_kidney_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all open kidney requests"""
    return db.query(KidneyRequest).filter(
        KidneyRequest.status == KidneyRequestStatus.OPEN
    ).order_by(KidneyRequest.created_at.desc()).all()


@router.get("/requests/my", response_model=List[KidneyRequestResponse])
def get_my_kidney_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's kidney requests"""
    return db.query(KidneyRequest).filter(
        KidneyRequest.patient_id == current_user.id
    ).order_by(KidneyRequest.created_at.desc()).all()


@router.patch("/requests/{request_id}", response_model=KidneyRequestResponse)
def update_kidney_request(
    request_id: int,
    data: KidneyRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a kidney request"""
    request = db.query(KidneyRequest).filter(
        KidneyRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if data.status:
        request.status = data.status
    if data.medical_details:
        request.medical_details = data.medical_details

    db.commit()
    db.refresh(request)
    return request


@router.delete("/requests/{request_id}")
def delete_kidney_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a kidney request"""
    request = db.query(KidneyRequest).filter(
        KidneyRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(request)
    db.commit()
    return {"message": "Request deleted"}


# ─── Kidney Donors ─────────────────────────────────────────

@router.post("/donors/register", response_model=KidneyDonorResponse, status_code=201)
def register_kidney_donor(
    data: KidneyDonorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register as a willing kidney donor"""

    # Check if already registered
    existing = db.query(KidneyDonor).filter(
        KidneyDonor.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You are already registered as a kidney donor"
        )

    donor = KidneyDonor(
        user_id=current_user.id,
        **data.dict()
    )
    db.add(donor)
    db.commit()
    db.refresh(donor)
    return donor


@router.get("/donors", response_model=List[KidneyDonorResponse])
def get_all_kidney_donors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all available kidney donors"""
    return db.query(KidneyDonor).filter(
        KidneyDonor.is_available == True
    ).order_by(KidneyDonor.created_at.desc()).all()


@router.get("/donors/my", response_model=KidneyDonorResponse)
def get_my_kidney_donor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's kidney donor profile"""
    donor = db.query(KidneyDonor).filter(
        KidneyDonor.user_id == current_user.id
    ).first()

    if not donor:
        raise HTTPException(
            status_code=404,
            detail="You are not registered as a kidney donor"
        )
    return donor


@router.patch("/donors/availability")
def update_kidney_donor_availability(
    is_available: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle kidney donor availability"""
    donor = db.query(KidneyDonor).filter(
        KidneyDonor.user_id == current_user.id
    ).first()

    if not donor:
        raise HTTPException(status_code=404, detail="Donor profile not found")

    donor.is_available = is_available
    db.commit()

    status = "available" if is_available else "unavailable"
    return {"message": f"You are now {status} as a kidney donor"}