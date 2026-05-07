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

    # Which donation/request this chat is about
    donation_id = Column(Integer, ForeignKey("donations.id"), nullable=False)

    # The actual message
    message = Column(String, nullable=False)

    # Has receiver read it?
    is_read = Column(Boolean, default=False)

    # When was it sent
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])