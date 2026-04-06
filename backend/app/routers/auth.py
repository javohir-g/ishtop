"""Authentication API router."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import (
    create_access_token,
    get_current_user,
    validate_telegram_init_data,
    validate_telegram_login_widget,
)
from ..database import get_db
from ..models import User, UserRole
from ..schemas import TelegramAuthRequest, TelegramLoginWidgetRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/telegram", response_model=TokenResponse)
async def telegram_auth(
    request: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate via Telegram WebApp initData.
    Creates user if not exists, returns JWT token.
    """
    tg_user = validate_telegram_init_data(request.init_data)
    if tg_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram initData",
        )

    telegram_id = tg_user.get("id")
    if not telegram_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Telegram user ID",
        )

    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()

    is_new_user = False
    if user is None:
        role_str = request.role or "job_seeker"
        try:
            role = UserRole(role_str)
        except ValueError:
            role = UserRole.JOB_SEEKER

        user = User(
            telegram_id=telegram_id,
            username=tg_user.get("username"),
            first_name=tg_user.get("first_name"),
            last_name=tg_user.get("last_name"),
            photo_url=tg_user.get("photo_url"),
            language_code=tg_user.get("language_code", "ru"),
            role=role,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        is_new_user = True
    else:
        user.last_login_at = datetime.now(timezone.utc)
        user.username = tg_user.get("username", user.username)
        user.first_name = tg_user.get("first_name", user.first_name)
        user.last_name = tg_user.get("last_name", user.last_name)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        role=user.role.value,
        is_new_user=is_new_user,
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info."""
    return current_user


@router.post("/telegram-widget", response_model=TokenResponse)
async def telegram_widget_auth(
    request: TelegramLoginWidgetRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate via Telegram Login Widget (browser).
    Validates the hash from the widget callback, creates user if needed.
    """
    widget_data = request.model_dump()
    role_value = widget_data.pop("role", "job_seeker")
    
    tg_user = validate_telegram_login_widget(widget_data)
    if tg_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram Login Widget data",
        )

    telegram_id = tg_user["id"]
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()

    is_new_user = False
    if user is None:
        try:
            role = UserRole(role_value)
        except ValueError:
            role = UserRole.JOB_SEEKER

        user = User(
            telegram_id=telegram_id,
            username=tg_user.get("username"),
            first_name=tg_user.get("first_name"),
            last_name=tg_user.get("last_name"),
            photo_url=tg_user.get("photo_url"),
            language_code="ru",
            role=role,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        is_new_user = True
    else:
        user.last_login_at = datetime.now(timezone.utc)
        user.username = tg_user.get("username", user.username)
        user.first_name = tg_user.get("first_name", user.first_name)
        user.last_name = tg_user.get("last_name", user.last_name)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        role=user.role.value,
        is_new_user=is_new_user,
    )


# dev-token removed for production security
