from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.blood_request import BloodRequest, RequestStatus
from app.schemas.blood_request import BloodRequestCreate, BloodRequestResponse, BloodRequestUpdate
from app.services.blood_service import is_valid_blood_type, get_compatible_donors

router = APIRouter()

@router.post("/", response_model=BloodRequestResponse, status_code=201)
def create_blood_request(
    request_data: BloodRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new blood request"""

    # Validate blood type
    if not is_valid_blood_type(request_data.blood_type):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid blood type. Valid types: A+, A-, B+, B-, AB+, AB-, O+, O-"
        )

    # Create the request
    new_request = BloodRequest(
        patient_id=current_user.id,
        blood_type=request_data.blood_type,
        units_needed=request_data.units_needed,
        urgency=request_data.urgency,
        hospital_name=request_data.hospital_name,
        hospital_address=request_data.hospital_address,
        city=request_data.city,
        latitude=request_data.latitude,
        longitude=request_data.longitude,
        patient_name=request_data.patient_name,
        contact_number=request_data.contact_number,
        notes=request_data.notes
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


@router.get("/", response_model=List[BloodRequestResponse])
def get_all_requests(
    city: str = None,
    blood_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all open blood requests, optionally filter by city or blood type"""

    query = db.query(BloodRequest).filter(
        BloodRequest.status == RequestStatus.OPEN
    )

    # Filter by city if provided
    if city:
        query = query.filter(BloodRequest.city == city)

    # Filter by blood type compatibility if provided
    if blood_type:
        compatible_types = get_compatible_donors(blood_type)
        query = query.filter(BloodRequest.blood_type.in_(compatible_types))

    # Show most urgent and newest first
    requests = query.order_by(
        BloodRequest.urgency.desc(),
        BloodRequest.created_at.desc()
    ).all()

    return requests


@router.get("/my-requests", response_model=List[BloodRequestResponse])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all blood requests made by the current user"""

    requests = db.query(BloodRequest).filter(
        BloodRequest.patient_id == current_user.id
    ).order_by(BloodRequest.created_at.desc()).all()

    return requests


@router.get("/{request_id}", response_model=BloodRequestResponse)
def get_request_by_id(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific blood request by ID"""

    request = db.query(BloodRequest).filter(
        BloodRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Blood request not found")

    return request


@router.patch("/{request_id}", response_model=BloodRequestResponse)
def update_request(
    request_id: int,
    update_data: BloodRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a blood request (only the owner can update)"""

    request = db.query(BloodRequest).filter(
        BloodRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Blood request not found")

    # Only the owner can update
    if request.patient_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own requests"
        )

    # Update only provided fields
    if update_data.status is not None:
        request.status = update_data.status
    if update_data.notes is not None:
        request.notes = update_data.notes
    if update_data.units_needed is not None:
        request.units_needed = update_data.units_needed

    db.commit()
    db.refresh(request)

    return request


@router.delete("/{request_id}", status_code=204)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel/delete a blood request"""

    request = db.query(BloodRequest).filter(
        BloodRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Blood request not found")

    if request.patient_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own requests"
        )

    db.delete(request)
    db.commit()