from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    # Who sent it
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Who receives it
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Which donation/request this chat is about (for blood donation)
    donation_id = Column(Integer, ForeignKey("donations.id"), nullable=True)

    # Which kidney connection this chat is about (for kidney donation)
    kidney_match_id = Column(Integer, ForeignKey("kidney_matches.id"), nullable=True)

    # The actual message
    message = Column(String, nullable=False)

    # Has receiver read it?
    is_read = Column(Boolean, default=False)

    # When was it sent
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
    donation = relationship("Donation", backref="chat_messages")
    kidney_match = relationship("KidneyMatch", backref="chat_messages")
