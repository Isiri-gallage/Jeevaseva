from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db, SessionLocal
from app.core.dependencies import get_current_user
from app.core.security import decode_token
from app.models.user import User
from app.models.chat import ChatMessage
from app.models.donation import Donation
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse
from app.socket.connection_manager import manager

router = APIRouter()

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket connection endpoint"""

    # Verify the user's token
    payload = decode_token(token)
    if not payload:
        await websocket.close(code=4001)
        return

    # Get user from database
    db = SessionLocal()
    try:
        email = payload.get("sub")
        user = db.query(User).filter(User.email == email).first()

        if not user:
            await websocket.close(code=4001)
            return

        user_id = user.id
    finally:
        db.close()

    # Connect the user
    await manager.connect(websocket, user_id)

    try:
        # Keep listening for messages
        while True:
            # Wait for a message from this user
            data = await websocket.receive_json()

            receiver_id = data.get("receiver_id")
            donation_id = data.get("donation_id")
            message_text = data.get("message")

            if not all([receiver_id, donation_id, message_text]):
                await websocket.send_json({"error": "Missing fields"})
                continue

            # Save message to database
            db = SessionLocal()
            try:
                chat_message = ChatMessage(
                    sender_id=user_id,
                    receiver_id=receiver_id,
                    donation_id=donation_id,
                    message=message_text
                )
                db.add(chat_message)
                db.commit()
                db.refresh(chat_message)

                # Prepare message to send
                message_data = {
                    "id": chat_message.id,
                    "sender_id": user_id,
                    "receiver_id": receiver_id,
                    "donation_id": donation_id,
                    "message": message_text,
                    "created_at": str(chat_message.created_at)
                }

                # Send to receiver if online
                receiver_online = await manager.send_personal_message(
                    message_data, receiver_id
                )

                # Send confirmation back to sender
                message_data["delivered"] = receiver_online
                await websocket.send_json(message_data)

            finally:
                db.close()

    except WebSocketDisconnect:
        manager.disconnect(user_id)


@router.get("/history/{donation_id}", response_model=List[ChatMessageResponse])
def get_chat_history(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chat history for a specific donation"""

    # Verify user is part of this donation
    donation = db.query(Donation).filter(
        Donation.id == donation_id
    ).first()

    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    # Only donor or patient can see the chat
    if donation.donor_id != current_user.id and donation.blood_request.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get all messages for this donation
    messages = db.query(ChatMessage).filter(
        ChatMessage.donation_id == donation_id
    ).order_by(ChatMessage.created_at.asc()).all()

    # Mark messages as read
    db.query(ChatMessage).filter(
        ChatMessage.donation_id == donation_id,
        ChatMessage.receiver_id == current_user.id,
        ChatMessage.is_read == False
    ).update({"is_read": True})
    db.commit()

    return messages


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get count of unread messages"""

    count = db.query(ChatMessage).filter(
        ChatMessage.receiver_id == current_user.id,
        ChatMessage.is_read == False
    ).count()

    return {"unread_messages": count}


@router.get("/online-users")
def get_online_users(current_user: User = Depends(get_current_user)):
    """Get list of currently online users"""
    return {"online_users": manager.get_online_users()}