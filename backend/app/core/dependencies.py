from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User

# Change to HTTPBearer - this gives a simple token input in Swagger
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get the currently logged in user from their token"""

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Get token from credentials
    token = credentials.credentials

    # Decode the token
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    # Get user email from token
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    # Find user in database
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user