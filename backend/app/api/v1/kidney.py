from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.kidney_request import KidneyRequest, KidneyRequestStatus
from app.models.kidney_donor import KidneyDonor
from app.models.kidney_match import KidneyMatch, KidneyMatchStatus
from app.schemas.kidney import (
    KidneyRequestCreate, KidneyRequestResponse, KidneyRequestUpdate,
    KidneyDonorCreate, KidneyDonorResponse,
    KidneyMatchCreate, KidneyMatchResponse, KidneyMatchUpdate, KidneyMatchDetailResponse
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
        KidneyDonor.is_available.is_(True)
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


# ─── Kidney Matches ─────────────────────────────────────────

@router.post("/matches/respond", response_model=KidneyMatchResponse, status_code=201)
def express_interest_in_kidney(
    data: KidneyMatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Donor expresses interest in a kidney request, creating a connection"""
    # Check if request exists
    request = db.query(KidneyRequest).filter(
        KidneyRequest.id == data.request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Kidney request not found")

    # Prevent patients from responding to their own request
    if request.patient_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot respond to your own kidney request"
        )

    # Check if registered as a kidney donor
    donor_profile = db.query(KidneyDonor).filter(
        KidneyDonor.user_id == current_user.id
    ).first()

    if not donor_profile:
        raise HTTPException(
            status_code=400,
            detail="You must be registered as a kidney donor to express interest"
        )

    # Prevent duplicate connections
    existing = db.query(KidneyMatch).filter(
        KidneyMatch.donor_id == current_user.id,
        KidneyMatch.request_id == data.request_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already expressed interest in this request"
        )

    # Create connection
    match = KidneyMatch(
        donor_id=current_user.id,
        request_id=data.request_id,
        message=data.message,
        status=KidneyMatchStatus.PENDING_CONTACT
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


def _serialize_match(db: Session, match: KidneyMatch) -> dict:
    """
    Flatten a match together with its patient and donor details.

    A donor can respond to a request before completing a donor-registry profile,
    so each donor field prefers the profile and falls back to the user account.
    """
    donor_profile = db.query(KidneyDonor).filter(
        KidneyDonor.user_id == match.donor_id
    ).first()
    donor_user = db.query(User).filter(User.id == match.donor_id).first()

    def donor_field(profile_attr: str, user_attr: str, fallback: str = "Unknown") -> str:
        if donor_profile and getattr(donor_profile, profile_attr, None):
            return getattr(donor_profile, profile_attr)
        if donor_user and getattr(donor_user, user_attr, None):
            return getattr(donor_user, user_attr)
        return fallback

    return {
        "id": match.id,
        "donor_id": match.donor_id,
        "request_id": match.request_id,
        "status": match.status,
        "message": match.message,
        "created_at": match.created_at,
        "updated_at": match.updated_at,

        "patient_name": match.request.patient_name,
        "patient_id": match.request.patient_id,
        "patient_blood_type": match.request.blood_type,
        "hospital_name": match.request.hospital_name,
        "hospital_city": match.request.hospital_city,
        "patient_contact": match.request.contact_number,

        "donor_name": donor_field("full_name", "full_name", "Unknown Donor"),
        "donor_blood_type": donor_field("blood_type", "blood_type"),
        "donor_city": donor_field("city", "city"),
        "donor_contact": donor_field("contact_number", "phone"),
    }


@router.get("/matches/my", response_model=List[KidneyMatchDetailResponse])
def get_my_kidney_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all matches connected to current user (as donor or as patient)"""
    matches = db.query(KidneyMatch).join(KidneyRequest).filter(
        (KidneyMatch.donor_id == current_user.id) | (KidneyRequest.patient_id == current_user.id)
    ).order_by(KidneyMatch.created_at.desc()).all()

    return [_serialize_match(db, m) for m in matches]


@router.get("/matches/{match_id}", response_model=KidneyMatchDetailResponse)
def get_kidney_match_details(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get full details of a specific kidney connection"""
    m = db.query(KidneyMatch).filter(KidneyMatch.id == match_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")

    # Authorize: user must be donor or patient
    if m.donor_id != current_user.id and m.request.patient_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to view this match"
        )

    return _serialize_match(db, m)


@router.patch("/matches/{match_id}/status", response_model=KidneyMatchResponse)
def update_kidney_match_status(
    match_id: int,
    data: KidneyMatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Progress connection state or cancel it"""
    m = db.query(KidneyMatch).filter(KidneyMatch.id == match_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")

    # Authorize: user must be donor or patient
    if m.donor_id != current_user.id and m.request.patient_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to update this match"
        )

    m.status = data.status
    db.commit()
    db.refresh(m)
    return m
