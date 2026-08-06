from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.donation import DonationStatus

# What we RECEIVE when donor responds


class DonationCreate(BaseModel):
    request_id: int
    message: Optional[str] = None

# What we SEND BACK


class DonationResponse(BaseModel):
    id: int
    donor_id: int
    request_id: int
    status: DonationStatus
    message: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# For updating donation status


class DonationUpdate(BaseModel):
    status: DonationStatus
