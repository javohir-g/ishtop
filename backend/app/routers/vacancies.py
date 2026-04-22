"""Vacancies API router."""
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy import select, func, and_, update
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.orm import selectinload, joinedload

from ..auth import get_current_user, require_role, get_optional_user
from ..database import get_db
from ..models import (
    User, UserRole, Vacancy, VacancyStatus, EmploymentType,
    KindergartenEmployer, Application, SavedVacancy, JobSeekerProfile
)
from ..schemas import VacancyCreate, VacancyOut, VacancyListOut

router = APIRouter(prefix="/vacancies", tags=["Vacancies"])


@router.get("", response_model=VacancyListOut)
async def list_vacancies(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    district: Optional[str] = None,
    employment_type: Optional[str] = None,
    search: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_new: Optional[bool] = None,
    salary_min: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """List active vacancies with filtering and pagination."""
    query = select(Vacancy).where(Vacancy.status == VacancyStatus.ACTIVE).options(joinedload(Vacancy.kindergarten))

    if district:
        query = query.where(Vacancy.district == district)
    if is_featured is not None:
        query = query.where(Vacancy.is_featured == is_featured)
    if is_new is not None:
        query = query.where(Vacancy.is_new == is_new)
    if salary_min:
        query = query.where(Vacancy.salary_min >= salary_min)
    if employment_type:
        try:
            et = EmploymentType(employment_type)
            query = query.where(Vacancy.employment_type == et)
        except ValueError:
            pass
    if search:
        query = query.where(
            Vacancy.title.ilike(f"%{search}%") | Vacancy.description.ilike(f"%{search}%")
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate
    query = query.offset((page - 1) * per_page).limit(per_page).order_by(Vacancy.created_at.desc())
    result = await db.execute(query)
    vacancies = result.scalars().all()

    # Populate is_favorite if user is a job seeker
    if current_user and current_user.role == UserRole.JOB_SEEKER:
        # Get seeker profile
        profile_res = await db.execute(select(JobSeekerProfile.id).where(JobSeekerProfile.user_id == current_user.id))
        profile_id = profile_res.scalar()
        
        if profile_id:
            # Get favorite IDs for this user
            fav_res = await db.execute(
                select(SavedVacancy.vacancy_id).where(SavedVacancy.job_seeker_id == profile_id)
            )
            fav_ids = set(fav_res.scalars().all())
            for v in vacancies:
                v.is_favorite = v.id in fav_ids

    return VacancyListOut(items=vacancies, total=total, page=page, per_page=per_page)

@router.get("/{vacancy_id}", response_model=VacancyOut)
async def get_vacancy(
    vacancy_id: int, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Get a single vacancy by ID."""
    result = await db.execute(
        select(Vacancy)
        .where(Vacancy.id == vacancy_id)
        .options(joinedload(Vacancy.kindergarten))
    )
    vacancy = result.scalar_one_or_none()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")

    # Check is_favorite
    if current_user and current_user.role == UserRole.JOB_SEEKER:
        profile_res = await db.execute(select(JobSeekerProfile.id).where(JobSeekerProfile.user_id == current_user.id))
        profile_id = profile_res.scalar()
        if profile_id:
            fav_res = await db.execute(
                select(SavedVacancy.id).where(
                    and_(SavedVacancy.job_seeker_id == profile_id, SavedVacancy.vacancy_id == vacancy_id)
                )
            )
            vacancy.is_favorite = fav_res.scalar() is not None

    # Increment views (not using background_tasks yet to ensure session stability)
    vacancy.views_count += 1
    await db.commit()
    return vacancy


@router.post("", response_model=VacancyOut, status_code=status.HTTP_201_CREATED)
async def create_vacancy(
    data: VacancyCreate,
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER, UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Create a new vacancy (employer/admin only)."""
    # Get employer's kindergarten
    result = await db.execute(
        select(KindergartenEmployer).where(KindergartenEmployer.user_id == current_user.id)
    )
    employer = result.scalar_one_or_none()
    if not employer:
        raise HTTPException(status_code=403, detail="No kindergarten association found")

    try:
        et = EmploymentType(data.employment_type)
    except ValueError:
        et = EmploymentType.FULL_TIME

    vacancy = Vacancy(
        kindergarten_id=employer.kindergarten_id,
        title=data.title,
        description=data.description,
        requirements=data.requirements,
        responsibilities=data.responsibilities,
        salary_min=data.salary_min,
        salary_max=data.salary_max,
        district=data.district,
        employment_type=et,
        status=VacancyStatus.ACTIVE,
        published_at=datetime.now(timezone.utc),
    )
    db.add(vacancy)
    await db.commit()
    await db.refresh(vacancy)
    return vacancy
