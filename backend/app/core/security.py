from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# This tells passlib to use bcrypt for hashing passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Browsers cannot attach an Authorization header to a WebSocket handshake, so the
# client first exchanges its access token for one of these short-lived tickets and
# passes that in the query string instead. Even if the URL ends up in a proxy or
# access log, the ticket is useless within a minute and cannot call the REST API.
WS_TICKET_EXPIRE_SECONDS = 60

SCOPE_ACCESS = "access"
SCOPE_WS = "ws"


def hash_password(password: str) -> str:
    """Convert plain password to hashed version"""
    # Example: "password123" -> "$2b$12$randomhashstring..."
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if entered password matches the stored hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token for the user"""
    to_encode = data.copy()

    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": datetime.now(timezone.utc) + expires_delta,
        "scope": SCOPE_ACCESS,
    })

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )


def decode_token(token: str):
    """Read and verify a JWT. Returns the payload, or None if invalid/expired."""
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
    except JWTError:
        return None


def create_ws_ticket(email: str) -> str:
    """Mint a short-lived, WebSocket-only ticket for an already-authenticated user."""
    return jwt.encode(
        {
            "sub": email,
            "scope": SCOPE_WS,
            "exp": datetime.now(timezone.utc) + timedelta(seconds=WS_TICKET_EXPIRE_SECONDS),
        },
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_ws_ticket(ticket: str):
    """Verify a WebSocket ticket. A normal access token is deliberately rejected."""
    payload = decode_token(ticket)
    if payload is None or payload.get("scope") != SCOPE_WS:
        return None
    return payload
