from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.blood_request import BloodRequest, RequestStatus
from app.models.donation import Donation, DonationStatus
from app.schemas.donation import DonationCreate, DonationResponse, DonationUpdate
from app.services.blood_service import get_compatible_donors

router = APIRouter()

@router.post("/respond", response_model=DonationResponse, status_code=201)
def respond_to_request(
    donation_data: DonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Donor responds to a blood request"""

    # Check if user is a registered donor
    if not current_user.is_donor:
        raise HTTPException(
            status_code=400,
            detail="You must be registered as a donor to respond"
        )

    # Check if request exists
    request = db.query(BloodRequest).filter(
        BloodRequest.id == donation_data.request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Blood request not found")

    # Check if request is still open
    if request.status != RequestStatus.OPEN:
        raise HTTPException(
            status_code=400,
            detail="This blood request is no longer open"
        )

    # Check if donor's blood type is compatible
    compatible_types = get_compatible_donors(request.blood_type)
    if current_user.blood_type not in compatible_types:
        raise HTTPException(
            status_code=400,
            detail=f"Your blood type {current_user.blood_type} is not compatible with {request.blood_type}"
        )

    # Check if donor already responded to this request
    existing = db.query(Donation).filter(
        Donation.donor_id == current_user.id,
        Donation.request_id == donation_data.request_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already responded to this request"
        )

    # Create donation record
    donation = Donation(
        donor_id=current_user.id,
        request_id=donation_data.request_id,
        message=donation_data.message
    )

    db.add(donation)
    db.commit()
    db.refresh(donation)

    return donation


@router.get("/my-donations", response_model=List[DonationResponse])
def get_my_donations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all donations made by current donor"""

    donations = db.query(Donation).filter(
        Donation.donor_id == current_user.id
    ).order_by(Donation.created_at.desc()).all()

    return donations


@router.get("/matching-requests", response_model=List)
def get_matching_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all blood requests that match donor's blood type"""

    if not current_user.is_donor:
        raise HTTPException(
            status_code=400,
            detail="You must be registered as a donor"
        )

    # Get all blood types this donor can donate to
    # O+ donor can donate to O+ and AB+ patients
    can_donate_to = []
    for patient_type, compatible_donors in {
        "A+":  ["A+", "A-", "O+", "O-"],
        "A-":  ["A-", "O-"],
        "B+":  ["B+", "B-", "O+", "O-"],
        "B-":  ["B-", "O-"],
        "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        "AB-": ["A-", "B-", "AB-", "O-"],
        "O+":  ["O+", "O-"],
        "O-":  ["O-"],
    }.items():
        if current_user.blood_type in compatible_donors:
            can_donate_to.append(patient_type)

    # Find open requests needing those blood types
    requests = db.query(BloodRequest).filter(
        BloodRequest.status == RequestStatus.OPEN,
        BloodRequest.blood_type.in_(can_donate_to)
    ).order_by(BloodRequest.created_at.desc()).all()

    return requests


@router.patch("/update-availability")
def update_availability(
    is_available: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Donor can toggle their availability on/off"""

    current_user.is_available = is_available
    db.commit()

    status = "available" if is_available else "unavailable"
    return {"message": f"You are now {status} for donations ✅"}


@router.patch("/donations/{donation_id}", response_model=DonationResponse)
def update_donation_status(
    donation_id: int,
    update_data: DonationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update donation status (confirm, complete or cancel)"""

    donation = db.query(Donation).filter(
        Donation.id == donation_id
    ).first()

    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    # Only donor or patient can update
    request = db.query(BloodRequest).filter(
        BloodRequest.id == donation.request_id
    ).first()

    if donation.donor_id != current_user.id and request.patient_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to update this donation"
        )

    donation.status = update_data.status
    db.commit()
    db.refresh(donation)

    return donation