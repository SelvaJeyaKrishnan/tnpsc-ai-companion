import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "tnpsc-ai-companion-super-secret-key-production-grade-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

security_bearer = HTTPBearer(auto_error=False)
security_bearer_required = HTTPBearer(auto_error=True)


def hash_password(password: str) -> str:
    """Secure PBKDF2-HMAC-SHA256 password hashing with 200,000 rounds and random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        200_000
    )
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    """Verify password against stored salt and PBKDF2 hash safely against timing attacks."""
    if not hashed_password or "$" not in hashed_password:
        return False
    try:
        salt, key_hex = hashed_password.split("$", 1)
        expected_key = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            200_000
        )
        return secrets.compare_digest(expected_key.hex(), key_hex)
    except Exception:
        return False


def create_access_token(user_id: int, username: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)

    to_encode = {
        "sub": str(user_id),
        "username": username,
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def require_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    """
    Strict authentication dependency.
    Requires a valid JWT Bearer token; raises 401 Unauthorized if missing, malformed, or expired.
    """
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required for this protected endpoint",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = int(user_id_str)
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User associated with token not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_optional_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Optional authentication dependency for public endpoints (such as public AI doubts or public syllabus).
    - If valid Bearer token provided: returns authenticated User.
    - If invalid/expired token provided: raises 401 Unauthorized.
    - If no token provided: returns None (guest).
    """
    if auth and auth.credentials:
        return require_current_user(auth, db)
    return None


def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    """
    Strict user authentication dependency.
    In production (APP_ENV=production):
      - Strictly requires a valid JWT Bearer token.
      - Never falls back to any demo or seed user.
    In development/testing environments (APP_ENV!=production):
      - If a Bearer token is provided, validates it strictly.
      - If no Bearer token is provided, provides fallback only in non-production environments.
    """
    app_env = os.getenv("APP_ENV", "development").lower()

    if auth and auth.credentials:
        return require_current_user(auth, db)

    # In production, missing credentials MUST raise 401 Unauthorized
    if app_env == "production":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required for this protected endpoint",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fallback only for non-production development environments when no token is passed
    user = db.query(User).filter(User.username == "karthik").first()
    if not user:
        from app.seed_data import init_seed_data
        user = init_seed_data(db)
    return user
