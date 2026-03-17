"""Applications API router."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.orm import joinedload

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import (
    User, UserRole, Application, ApplicationStatus,
    Vacancy, JobSeekerProfile,
)
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

    # Increment applications count
    vacancy.applications_count += 1
    await db.commit()
    await db.refresh(application)
    
    # Reload with vacancy info for response
    result = await db.execute(
        select(Application)
        .where(Application.id == application.id)
        .options(joinedload(Application.vacancy).joinedload(Vacancy.kindergarten))
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
        .options(joinedload(Application.vacancy).joinedload(Vacancy.kindergarten))
        .order_by(Application.created_at.desc())
    )
    return result.scalars().all()
