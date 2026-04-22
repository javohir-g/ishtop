"""Applications API router."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.orm import joinedload

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import (
    User, UserRole, Application, ApplicationStatus,
    Vacancy, JobSeekerProfile, Chat, Message
)
from sqlalchemy import func
from ..schemas import ApplicationCreate, ApplicationOut

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
async def apply_to_vacancy(
    data: ApplicationCreate,
    current_user: User = Depends(require_role(UserRole.JOB_SEEKER)),
    db: AsyncSession = Depends(get_db),
):
    """Apply to a vacancy (job seekers only)."""
    # Check vacancy exists and is active
    result = await db.execute(select(Vacancy).where(Vacancy.id == data.vacancy_id))
    vacancy = result.scalar_one_or_none()
    if not vacancy or vacancy.status.value != "active":
        raise HTTPException(status_code=404, detail="Vacancy not found or not active")

    # Get job seeker profile
    result = await db.execute(
        select(JobSeekerProfile).where(JobSeekerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=400, detail="Please create a profile first")

    # Check duplicate
    result = await db.execute(
        select(Application).where(
            Application.vacancy_id == data.vacancy_id,
            Application.job_seeker_id == profile.id,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already applied to this vacancy")

    application = Application(
        vacancy_id=data.vacancy_id,
        job_seeker_id=profile.id,
        cover_letter=data.cover_letter,
        status=ApplicationStatus.PENDING,
    )
    db.add(application)
    await db.flush()

    # Create or update Chat
    chat_result = await db.execute(
        select(Chat).where(
            and_(
                Chat.job_seeker_id == profile.id,
                Chat.kindergarten_id == vacancy.kindergarten_id
            )
        )
    )
    chat = chat_result.scalar_one_or_none()

    if not chat:
        chat = Chat(
            job_seeker_id=profile.id,
            kindergarten_id=vacancy.kindergarten_id,
            application_id=application.id
        )
        db.add(chat)
        await db.flush()
    else:
        chat.application_id = application.id

    # Create automatic message
    first_message_text = f"Здравствуйте! Отклик на вакансию '{vacancy.title}'."
    if data.cover_letter:
        first_message_text += f"\n\nСопроводительное письмо:\n{data.cover_letter}"

    msg = Message(
        chat_id=chat.id,
        sender_id=current_user.id,
        content=first_message_text
    )
    db.add(msg)

    # Update chat state
    chat.last_message = first_message_text[:100]
    chat.last_message_at = func.now()
    chat.unread_by_employer += 1

    # Increment applications count
    vacancy.applications_count += 1
    await db.commit()
    await db.refresh(application)
    
    # Reload with vacancy info for response
    result = await db.execute(
        select(Application)
        .where(Application.id == application.id)
        .options(
            joinedload(Application.vacancy).joinedload(Vacancy.kindergarten),
            joinedload(Application.job_seeker)
        )
    )
    return result.scalar_one()


@router.get("/my", response_model=list[ApplicationOut])
async def my_applications(
    current_user: User = Depends(require_role(UserRole.JOB_SEEKER)),
    db: AsyncSession = Depends(get_db),
):
    """Get all applications by current job seeker."""
    result = await db.execute(
        select(JobSeekerProfile).where(JobSeekerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        return []

    result = await db.execute(
        select(Application)
        .where(Application.job_seeker_id == profile.id)
        .options(
            joinedload(Application.vacancy).joinedload(Vacancy.kindergarten),
            joinedload(Application.job_seeker)
        )
        .order_by(Application.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{application_id}", response_model=ApplicationOut)
async def get_application_detail(
    application_id: int,
    current_user: User = Depends(require_role(UserRole.JOB_SEEKER)),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed application info for a specific application (seeker side)."""
    # Get job seeker profile
    result = await db.execute(
        select(JobSeekerProfile).where(JobSeekerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    result = await db.execute(
        select(Application)
        .where(
            and_(
                Application.id == application_id,
                Application.job_seeker_id == profile.id
            )
        )
        .options(
            joinedload(Application.vacancy).joinedload(Vacancy.kindergarten),
            joinedload(Application.job_seeker)
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found or access denied")
    
    return application
