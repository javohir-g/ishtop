from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from typing import List

from ..database import get_db
from ..models import User, UserRole, JobSeekerProfile, SavedVacancy, Vacancy
from ..schemas import SavedVacancyOut, VacancyOut
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("", response_model=List[SavedVacancyOut])
async def get_my_favorites(
    current_user: User = Depends(require_role(UserRole.JOB_SEEKER)),
    db: AsyncSession = Depends(get_db)
):
    """Get all saved vacancies for the current job seeker."""
    result = await db.execute(select(JobSeekerProfile.id).where(JobSeekerProfile.user_id == current_user.id))
    profile_id = result.scalar_one_or_none()
    if not profile_id:
        raise HTTPException(status_code=404, detail="Job seeker profile not found")
        
        favs_result = await db.execute(
        select(SavedVacancy)
        .where(SavedVacancy.job_seeker_id == profile_id)
        .options(selectinload(SavedVacancy.vacancy).joinedload(Vacancy.kindergarten))
    )
    return favs_result.scalars().all()

@router.post("", response_model=SavedVacancyOut, status_code=status.HTTP_201_CREATED)
async def add_to_favorites(
    vacancy_id: int,
    current_user: User = Depends(require_role(UserRole.JOB_SEEKER)),
    db: AsyncSession = Depends(get_db)
):
    """Save a vacancy to favorites."""
    # Get profile
    result = await db.execute(select(JobSeekerProfile.id).where(JobSeekerProfile.user_id == current_user.id))
    profile_id = result.scalar_one_or_none()
    if not profile_id:
        raise HTTPException(status_code=404, detail="Job seeker profile not found")
    
    # Check if vacancy exists
    v_result = await db.execute(select(Vacancy).where(Vacancy.id == vacancy_id))
    if not v_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Vacancy not found")
    
    # Check if existing
    existing = await db.execute(
        select(SavedVacancy).where(
            and_(SavedVacancy.job_seeker_id == profile_id, SavedVacancy.vacancy_id == vacancy_id)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Vacancy already in favorites")
    
    new_fav = SavedVacancy(job_seeker_id=profile_id, vacancy_id=vacancy_id)
    db.add(new_fav)
    await db.commit()
    await db.refresh(new_fav)
    
    # Reload with vacancy info for response
    result_with_v = await db.execute(
        select(SavedVacancy)
        .where(SavedVacancy.id == new_fav.id)
        .options(selectinload(SavedVacancy.vacancy).joinedload(Vacancy.kindergarten))
    )
    return result_with_v.scalar_one()

@router.delete("/{vacancy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_favorites(
    vacancy_id: int,
    current_user: User = Depends(require_role(UserRole.JOB_SEEKER)),
    db: AsyncSession = Depends(get_db)
):
    """Remove a vacancy from favorites."""
    result = await db.execute(select(JobSeekerProfile.id).where(JobSeekerProfile.user_id == current_user.id))
    profile_id = result.scalar_one_or_none()
    
    stmt = delete(SavedVacancy).where(
        and_(SavedVacancy.job_seeker_id == profile_id, SavedVacancy.vacancy_id == vacancy_id)
    )
    await db.execute(stmt)
    await db.commit()
    return None
