from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import AppException
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    payload = decode_token(token)
    if not payload:
        raise AppException(status_code=401, detail="Invalid or expired token")

    if payload.get("type") != "access":
        raise AppException(status_code=401, detail="Token type must be 'access'")

    user_id = payload.get("sub")
    if not user_id:
        raise AppException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise AppException(status_code=401, detail="User not found")

    if not user.is_active:
        raise AppException(status_code=401, detail="User is inactive")

    return user
