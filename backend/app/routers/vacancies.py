"""Vacancies API router."""
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.orm import selectinload, joinedload

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import (
    User, UserRole, Vacancy, VacancyStatus, EmploymentType,
    KindergartenEmployer, Application, SavedVacancy,
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
    db: AsyncSession = Depends(get_db),
):
    """List active vacancies with filtering and pagination."""
    query = select(Vacancy).where(Vacancy.status == VacancyStatus.ACTIVE).options(joinedload(Vacancy.kindergarten))

    if district:
        query = query.where(Vacancy.district == district)
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

    return VacancyListOut(items=vacancies, total=total, page=page, per_page=per_page)


@router.get("/{vacancy_id}", response_model=VacancyOut)
async def get_vacancy(vacancy_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single vacancy by ID."""
    result = await db.execute(
        select(Vacancy)
        .where(Vacancy.id == vacancy_id)
        .options(joinedload(Vacancy.kindergarten))
    )
    vacancy = result.scalar_one_or_none()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")

    # Increment views
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
