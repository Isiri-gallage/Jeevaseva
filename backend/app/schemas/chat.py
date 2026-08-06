from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ChatMessageSend(BaseModel):
    """
    Inbound WebSocket payload.

    Note there is no `receiver_id`: the server derives the recipient from the
    conversation, so a client cannot address a user it has no relationship with.
    """
    donation_id: Optional[int] = None
    kidney_match_id: Optional[int] = None
    message: str = Field(min_length=1, max_length=2000)

    @model_validator(mode="after")
    def exactly_one_conversation(self):
        if (self.donation_id is None) == (self.kidney_match_id is None):
            raise ValueError("Provide exactly one of donation_id or kidney_match_id")
        return self


class ChatMessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    donation_id: Optional[int] = None
    kidney_match_id: Optional[int] = None
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WsTicketResponse(BaseModel):
    """Short-lived credential used to open a chat WebSocket."""
    ticket: str
    expires_in: int
