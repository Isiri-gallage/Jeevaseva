from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ChatMessageCreate(BaseModel):
    receiver_id: int
    donation_id: int
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    donation_id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True