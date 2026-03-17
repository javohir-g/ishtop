"""
Authentication module: Telegram WebApp initData validation + JWT tokens.
"""
import hashlib
import hmac
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import parse_qs, unquote

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from loguru import logger
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .database import get_db
from .models import User, UserRole

security = HTTPBearer()


# --- Telegram initData Validation ---

def validate_telegram_init_data(init_data: str) -> Optional[dict]:
    """
    Validates Telegram WebApp initData.
    Returns parsed user data if valid, None otherwise.
    See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    """
    try:
        parsed = parse_qs(init_data)
        
        received_hash = parsed.get("hash", [None])[0]
        if not received_hash:
            return None

        # Build data-check-string (sorted key=value pairs, excluding hash)
        data_pairs = []
        for key, values in parsed.items():
            if key == "hash":
                continue
            data_pairs.append(f"{key}={unquote(values[0])}")
        data_pairs.sort()
        data_check_string = "\n".join(data_pairs)

        # Compute HMAC-SHA256
        secret_key = hmac.new(
            b"WebAppData", settings.TELEGRAM_BOT_TOKEN.encode(), hashlib.sha256
        ).digest()
        computed_hash = hmac.new(
            secret_key, data_check_string.encode(), hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(computed_hash, received_hash):
            return None

        # Check auth_date (reject if older than 24 hours)
        auth_date = int(parsed.get("auth_date", [0])[0])
        if time.time() - auth_date > 86400:
            return None

        # Parse user JSON
        user_data_str = parsed.get("user", [None])[0]
        if not user_data_str:
            return None
        
        return json.loads(unquote(user_data_str))

    except Exception:
        return None


def validate_telegram_login_widget(data: dict) -> Optional[dict]:
    """
    Validates Telegram Login Widget callback data (browser auth).
    The widget sends: id, first_name, last_name, username, photo_url, auth_date, hash
    See: https://core.telegram.org/widgets/login#checking-authorization
    """
    try:
        received_hash = data.get("hash")
        if not received_hash:
            return None

        # Build check string (sorted key=value, excluding hash)
        check_pairs = []
        for key in sorted(data.keys()):
            if key == "hash":
                continue
            check_pairs.append(f"{key}={data[key]}")
        check_string = "\n".join(check_pairs)

        # For Login Widget: secret_key = SHA256(bot_token)
        secret_key = hashlib.sha256(settings.TELEGRAM_BOT_TOKEN.encode()).digest()
        computed_hash = hmac.new(
            secret_key, check_string.encode(), hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(computed_hash, received_hash):
            return None

        # Check auth_date (reject if older than 24 hours)
        auth_date = int(data.get("auth_date", 0))
        if time.time() - auth_date > 86400:
            return None

        return {
            "id": int(data["id"]),
            "first_name": data.get("first_name"),
            "last_name": data.get("last_name"),
            "username": data.get("username"),
            "photo_url": data.get("photo_url"),
        }

    except Exception:
        return None


# --- JWT Token Management ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency: extract and validate JWT, return current User."""
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            logger.error("JWT payload missing 'sub'")
            raise credentials_exception
    except JWTError as e:
        logger.error(f"JWT Decode Error: {e}")
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        logger.error(f"User not found for id: {user_id}")
        raise credentials_exception
    if not user.is_active:
        logger.error(f"User {user_id} is inactive")
        raise credentials_exception
    return user


# --- Role-based Access ---

def require_role(*roles: UserRole):
    """Dependency factory: require user to have one of the specified roles."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return role_checker
