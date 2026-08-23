import logging
from typing import Dict, List, Optional, Tuple

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
)
from pydantic import ValidationError
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db, SessionLocal
from app.core.dependencies import get_current_user
from app.core.security import (
    create_ws_ticket,
    decode_ws_ticket,
    WS_TICKET_EXPIRE_SECONDS,
)
from app.models.chat import ChatMessage
from app.models.donation import Donation
from app.models.kidney_match import KidneyMatch
from app.models.user import User
from app.schemas.chat import (
    ChatMessageResponse,
    ChatMessageSend,
    UnreadSummary,
    WsTicketResponse,
)
from app.socket.connection_manager import manager

router = APIRouter()
logger = logging.getLogger(__name__)

# WebSocket close codes (the 4000-4999 range is reserved for application use)
WS_CLOSE_UNAUTHORIZED = 4001
WS_CLOSE_FORBIDDEN = 4003


class ConversationError(Exception):
    """The conversation does not exist, or this user is not part of it."""

    def __init__(self, code: str, detail: str):
        self.code = code
        self.detail = detail
        super().__init__(detail)


def _participants(
    db: Session,
    donation_id: Optional[int],
    kidney_match_id: Optional[int],
) -> Tuple[int, int]:
    """Return (donor_id, patient_id) for a blood donation or kidney match."""
    if (donation_id is None) == (kidney_match_id is None):
        raise ConversationError(
            "invalid_target",
            "Provide exactly one of donation_id or kidney_match_id",
        )

    if donation_id is not None:
        donation = db.query(Donation).filter(Donation.id == donation_id).first()
        if donation is None or donation.blood_request is None:
            raise ConversationError("not_found", "Donation not found")
        return donation.donor_id, donation.blood_request.patient_id

    match = db.query(KidneyMatch).filter(KidneyMatch.id == kidney_match_id).first()
    if match is None or match.request is None:
        raise ConversationError("not_found", "Kidney connection not found")
    return match.donor_id, match.request.patient_id


def resolve_counterparty(
    db: Session,
    user_id: int,
    donation_id: Optional[int] = None,
    kidney_match_id: Optional[int] = None,
) -> int:
    """
    Verify `user_id` belongs to this conversation and return the other party's id.

    This is the single authorization gate for chat. The recipient is derived from
    the conversation rather than trusted from the client, so a caller can neither
    read a thread they are not in nor deliver a message to an arbitrary user.
    """
    donor_id, patient_id = _participants(db, donation_id, kidney_match_id)

    if user_id == donor_id:
        return patient_id
    if user_id == patient_id:
        return donor_id

    raise ConversationError("forbidden", "Not authorized for this conversation")


def _as_http_error(exc: ConversationError) -> HTTPException:
    status_code = {"not_found": 404, "forbidden": 403}.get(exc.code, 400)
    return HTTPException(status_code=status_code, detail=exc.detail)


# ─── WebSocket ticket ──────────────────────────────────────

@router.post(
    "/ws-ticket",
    response_model=WsTicketResponse,
    summary="Issue a WebSocket ticket",
    description=(
        "Browsers cannot send an Authorization header on a WebSocket handshake. "
        "Exchange your access token for a short-lived, WebSocket-only ticket and "
        "pass it as the `ticket` query parameter when opening the socket."
    ),
)
def issue_ws_ticket(current_user: User = Depends(get_current_user)):
    return WsTicketResponse(
        ticket=create_ws_ticket(current_user.email),
        expires_in=WS_TICKET_EXPIRE_SECONDS,
    )


# ─── WebSocket endpoint ────────────────────────────────────

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    ticket: Optional[str] = Query(default=None),
):
    """Real-time chat socket. Authenticate with `?ticket=<ws-ticket>`."""
    if not ticket:
        await websocket.close(code=WS_CLOSE_UNAUTHORIZED)
        return

    payload = decode_ws_ticket(ticket)
    if payload is None:
        logger.warning("WebSocket rejected: invalid or expired ticket")
        await websocket.close(code=WS_CLOSE_UNAUTHORIZED)
        return

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == payload.get("sub")).first()
        if user is None or not user.is_active:
            logger.warning("WebSocket rejected: unknown or disabled account")
            await websocket.close(code=WS_CLOSE_UNAUTHORIZED)
            return
        user_id = user.id
        # Captured now so every outgoing message can carry it without a lookup
        # per message. The socket is short-lived relative to a name change.
        user_name = user.full_name
    finally:
        db.close()

    await manager.connect(websocket, user_id)
    logger.info("WebSocket connected for user %s", user_id)

    try:
        while True:
            raw = await websocket.receive_json()

            try:
                inbound = ChatMessageSend.model_validate(raw)
            except ValidationError:
                await websocket.send_json({
                    "error": "invalid_payload",
                    "detail": "Expected { message, and one of donation_id | kidney_match_id }",
                })
                continue

            db = SessionLocal()
            try:
                # Authorize before touching anything. The receiver comes from the
                # conversation, never from the payload.
                try:
                    receiver_id = resolve_counterparty(
                        db,
                        user_id,
                        donation_id=inbound.donation_id,
                        kidney_match_id=inbound.kidney_match_id,
                    )
                except ConversationError as exc:
                    logger.warning(
                        "Blocked chat send by user %s (%s): %s",
                        user_id, exc.code, exc.detail,
                    )
                    await websocket.send_json({"error": exc.code, "detail": exc.detail})
                    continue

                chat_message = ChatMessage(
                    sender_id=user_id,
                    receiver_id=receiver_id,
                    donation_id=inbound.donation_id,
                    kidney_match_id=inbound.kidney_match_id,
                    message=inbound.message,
                )
                db.add(chat_message)
                db.commit()
                db.refresh(chat_message)

                message_data = {
                    "id": chat_message.id,
                    "sender_id": user_id,
                    # Included so the recipient can show "New message from
                    # Nimal" without a second request just to resolve a name.
                    "sender_name": user_name,
                    "receiver_id": receiver_id,
                    "donation_id": inbound.donation_id,
                    "kidney_match_id": inbound.kidney_match_id,
                    "message": chat_message.message,
                    "is_read": False,
                    "created_at": chat_message.created_at.isoformat(),
                }
            finally:
                db.close()

            delivered = await manager.send_personal_message(message_data, receiver_id)
            await websocket.send_json({**message_data, "delivered": delivered})

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        logger.info("WebSocket disconnected for user %s", user_id)


# ─── Chat history ──────────────────────────────────────────

@router.get(
    "/history/kidney/{match_id}",
    response_model=List[ChatMessageResponse],
    summary="Kidney match chat history",
)
def get_kidney_chat_history(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        resolve_counterparty(db, current_user.id, kidney_match_id=match_id)
    except ConversationError as exc:
        raise _as_http_error(exc)

    return _history(db, current_user.id, ChatMessage.kidney_match_id == match_id)


@router.get(
    "/history/{donation_id}",
    response_model=List[ChatMessageResponse],
    summary="Blood donation chat history",
)
def get_chat_history(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        resolve_counterparty(db, current_user.id, donation_id=donation_id)
    except ConversationError as exc:
        raise _as_http_error(exc)

    return _history(db, current_user.id, ChatMessage.donation_id == donation_id)


def _history(db: Session, user_id: int, thread_filter):
    """Fetch a thread and mark the caller's inbound messages as read."""
    messages = (
        db.query(ChatMessage)
        .filter(thread_filter)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    db.query(ChatMessage).filter(
        thread_filter,
        ChatMessage.receiver_id == user_id,
        ChatMessage.is_read.is_(False),
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()

    return messages


@router.get("/unread", response_model=UnreadSummary, summary="Unread messages, grouped")
def get_unread_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Unread totals plus a per-conversation breakdown.

    Grouping happens in SQL rather than by loading every message and counting in
    Python — this stays a single indexed aggregate no matter how many messages
    the user has.

    Conversation keys are "kidney:<id>" and "donation:<id>" so the client can use
    one flat map instead of tracking two id spaces that can collide.
    """
    rows = (
        db.query(
            ChatMessage.kidney_match_id,
            ChatMessage.donation_id,
            func.count(ChatMessage.id).label("unread"),
        )
        .filter(
            ChatMessage.receiver_id == current_user.id,
            ChatMessage.is_read.is_(False),
        )
        .group_by(ChatMessage.kidney_match_id, ChatMessage.donation_id)
        .all()
    )

    by_conversation: Dict[str, int] = {}
    for kidney_match_id, donation_id, unread in rows:
        if kidney_match_id is not None:
            by_conversation[f"kidney:{kidney_match_id}"] = unread
        elif donation_id is not None:
            by_conversation[f"donation:{donation_id}"] = unread

    return UnreadSummary(
        total=sum(by_conversation.values()),
        by_conversation=by_conversation,
    )


@router.get(
    "/unread-count",
    summary="Unread message count",
    deprecated=True,
    description="Superseded by GET /chat/unread, which also returns a per-conversation breakdown.",
)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.receiver_id == current_user.id,
            ChatMessage.is_read.is_(False),
        )
        .count()
    )
    return {"unread_messages": count}


@router.get("/online-users", summary="Currently connected users")
def get_online_users(current_user: User = Depends(get_current_user)):
    return {"online_users": manager.get_online_users()}
