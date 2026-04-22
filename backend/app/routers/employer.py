from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List

from ..database import get_db
from ..models import User, UserRole, Vacancy, Application, ApplicationStatus, VacancyStatus, KindergartenEmployer, Kindergarten
from ..schemas import VacancyOut, VacancyCreate, ApplicationOut, EmployerProfileOut, EmployerProfileUpdate
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/employer", tags=["Employer"])

@router.get("/profile", response_model=EmployerProfileOut)
async def get_employer_profile(
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER)),
    db: AsyncSession = Depends(get_db)
):
    """Get employer and kindergarten profile. Auto-creates if missing."""
    result = await db.execute(
        select(KindergartenEmployer)
        .where(KindergartenEmployer.user_id == current_user.id)
        .options(selectinload(KindergartenEmployer.kindergarten))
    )
    employer = result.scalar_one_or_none()
    
    if not employer:
        # Auto-create empty kindergarten and employer link
        new_k = Kindergarten(
            name=f"Детский сад {current_user.first_name or ''}".strip() or "Мой детский сад",
            district="Не указан",
            is_verified=False
        )
        db.add(new_k)
        await db.flush() # Get ID
        
        employer = KindergartenEmployer(
            user_id=current_user.id,
            kindergarten_id=new_k.id,
            full_name=current_user.first_name + " " + (current_user.last_name or "") if current_user.first_name else "Работодатель",
            position="Заведующий",
            photo_url=current_user.photo_url
        )
        db.add(employer)
        await db.commit()
        await db.refresh(employer)
        await db.refresh(new_k)

    return {"employer": employer, "kindergarten": employer.kindergarten}

@router.put("/profile", response_model=EmployerProfileOut)
async def update_employer_profile(
    profile_data: EmployerProfileUpdate,
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER)),
    db: AsyncSession = Depends(get_db)
):
    """Update employer and kindergarten profile."""
    result = await db.execute(
        select(KindergartenEmployer)
        .where(KindergartenEmployer.user_id == current_user.id)
        .options(selectinload(KindergartenEmployer.kindergarten))
    )
    employer = result.scalar_one_or_none()
    
    if not employer:
        # Create kindergarten first
        k_data = profile_data.kindergarten
        new_k = Kindergarten(
            name=k_data.name if k_data and k_data.name else "Мой детский сад",
            district=k_data.district if k_data and k_data.district else "Не указан",
            address=k_data.address if k_data else None,
            phone=k_data.phone if k_data else None,
            email=k_data.email if k_data else None,
            description=k_data.description if k_data else None,
            is_verified=False
        )
        db.add(new_k)
        await db.flush() # Get ID
        
        employer = KindergartenEmployer(
            user_id=current_user.id,
            kindergarten_id=new_k.id,
            full_name=profile_data.full_name or current_user.full_name or "Работодатель",
            position=profile_data.position or "Заведующий",
            photo_url=profile_data.photo_url
        )
        db.add(employer)
    else:
        # Update employer fields
        if profile_data.full_name:
            employer.full_name = profile_data.full_name
        if profile_data.position:
            employer.position = profile_data.position
        if profile_data.photo_url is not None:
            employer.photo_url = profile_data.photo_url
                
        # Update kindergarten fields
        if profile_data.kindergarten and employer.kindergarten:
            k_data = profile_data.kindergarten
            if k_data.name: employer.kindergarten.name = k_data.name
            if k_data.district: employer.kindergarten.district = k_data.district
            if k_data.address is not None: employer.kindergarten.address = k_data.address
            if k_data.phone is not None: employer.kindergarten.phone = k_data.phone
            if k_data.email is not None: employer.kindergarten.email = k_data.email
            if k_data.description is not None: employer.kindergarten.description = k_data.description
                
    await db.commit()
    
    # RELOAD with kindergarten relationship for the response
    final_result = await db.execute(
        select(KindergartenEmployer)
        .where(KindergartenEmployer.user_id == current_user.id)
        .options(selectinload(KindergartenEmployer.kindergarten))
    )
    employer = final_result.scalar_one()
    
    return {"employer": employer, "kindergarten": employer.kindergarten}

@router.get("/vacancies", response_model=List[VacancyOut])
async def get_my_vacancies(
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER)),
    db: AsyncSession = Depends(get_db)
):
    """List all vacancies for the current employer's kindergarten."""
    result = await db.execute(
        select(KindergartenEmployer.kindergarten_id)
        .where(KindergartenEmployer.user_id == current_user.id)
    )
    kindergarten_id = result.scalar_one_or_none()
    if not kindergarten_id:
        raise HTTPException(status_code=404, detail="Kindergarten not found")
        
    v_result = await db.execute(
        select(Vacancy)
        .where(Vacancy.kindergarten_id == kindergarten_id)
        .options(selectinload(Vacancy.kindergarten))
    )
    return v_result.scalars().all()

@router.post("/vacancies", response_model=VacancyOut, status_code=status.HTTP_201_CREATED)
async def create_vacancy(
    vacancy_data: VacancyCreate,
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER)),
    db: AsyncSession = Depends(get_db)
):
    """Create a new vacancy."""
    result = await db.execute(
        select(KindergartenEmployer.kindergarten_id)
        .where(KindergartenEmployer.user_id == current_user.id)
    )
    kindergarten_id = result.scalar_one_or_none()
    if not kindergarten_id:
        raise HTTPException(status_code=404, detail="Kindergarten not found")
    
    new_vacancy = Vacancy(
        kindergarten_id=kindergarten_id, 
        **vacancy_data.model_dump(),
        status=VacancyStatus.ACTIVE,
        published_at=func.now()
    )
    db.add(new_vacancy)
    await db.commit()
    
    # Reload with kindergarten relationship for the response schema
    result = await db.execute(
        select(Vacancy)
        .where(Vacancy.id == new_vacancy.id)
        .options(selectinload(Vacancy.kindergarten))
    )
    return result.scalar_one()

@router.get("/vacancies/{vacancy_id}", response_model=VacancyOut)
async def get_my_vacancy(
    vacancy_id: int,
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER)),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific vacancy belonging to the employer's kindergarten."""
    result = await db.execute(
        select(Vacancy)
        .join(Kindergarten, Vacancy.kindergarten_id == Kindergarten.id)
        .join(KindergartenEmployer, Kindergarten.id == KindergartenEmployer.kindergarten_id)
        .where(
            and_(
                Vacancy.id == vacancy_id,
                KindergartenEmployer.user_id == current_user.id
            )
        )
        .options(selectinload(Vacancy.kindergarten))
    )
    vacancy = result.scalar_one_or_none()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found or access denied")
    return vacancy

@router.put("/vacancies/{vacancy_id}", response_model=VacancyOut)
async def update_my_vacancy(
    vacancy_id: int,
    vacancy_data: dict, # Using dict to allow partial updates (or create a specific schema)
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER)),
    db: AsyncSession = Depends(get_db)
):
    """Update a vacancy belonging to the employer's kindergarten."""
    result = await db.execute(
        select(Vacancy)
        .join(Kindergarten, Vacancy.kindergarten_id == Kindergarten.id)
        .join(KindergartenEmployer, Kindergarten.id == KindergartenEmployer.kindergarten_id)
        .where(
            and_(
                Vacancy.id == vacancy_id,
                KindergartenEmployer.user_id == current_user.id
            )
        )
    )
    vacancy = result.scalar_one_or_none()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found or access denied")
    
    for key, value in vacancy_data.items():
        if hasattr(vacancy, key):
            setattr(vacancy, key, value)
    
    # Special handling for status if is_active is passed (legacy from my frontend logic)
    if "is_active" in vacancy_data:
        vacancy.status = VacancyStatus.ACTIVE if vacancy_data["is_active"] else VacancyStatus.PAUSED

    await db.commit()
    
    # Reload with kindergarten relationship for the response schema
    result = await db.execute(
        select(Vacancy)
        .where(Vacancy.id == vacancy_id)
        .options(selectinload(Vacancy.kindergarten))
    )
    return result.scalar_one()

@router.delete("/vacancies/{vacancy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_vacancy(
    vacancy_id: int,
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER)),
    db: AsyncSession = Depends(get_db)
):
    """Delete a vacancy belonging to the employer's kindergarten."""
    result = await db.execute(
        select(Vacancy)
        .join(Kindergarten, Vacancy.kindergarten_id == Kindergarten.id)
        .join(KindergartenEmployer, Kindergarten.id == KindergartenEmployer.kindergarten_id)
        .where(
            and_(
                Vacancy.id == vacancy_id,
                KindergartenEmployer.user_id == current_user.id
            )
        )
    )
    vacancy = result.scalar_one_or_none()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found or access denied")
    
    await db.delete(vacancy)
    await db.commit()
    return None

@router.get("/applications", response_model=List[ApplicationOut])
async def get_incoming_applications(
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER)),
    db: AsyncSession = Depends(get_db)
):
    """Get all applications received by the current employer's kindergarten."""
    result = await db.execute(
        select(KindergartenEmployer.kindergarten_id)
        .where(KindergartenEmployer.user_id == current_user.id)
    )
    kindergarten_id = result.scalar_one_or_none()
    
    apps_result = await db.execute(
        select(Application)
        .join(Vacancy)
        .where(Vacancy.kindergarten_id == kindergarten_id)
        .options(
            selectinload(Application.job_seeker),
            selectinload(Application.vacancy).selectinload(Vacancy.kindergarten)
        )
    )
    return apps_result.scalars().all()

@router.get("/applications/{application_id}", response_model=ApplicationOut)
async def get_application_detail(
    application_id: int,
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER)),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed application info for a specific application."""
    result = await db.execute(
        select(Application)
        .join(Vacancy)
        .join(Kindergarten, Vacancy.kindergarten_id == Kindergarten.id)
        .join(KindergartenEmployer, Kindergarten.id == KindergartenEmployer.kindergarten_id)
        .where(
            and_(
                Application.id == application_id,
                KindergartenEmployer.user_id == current_user.id
            )
        )
        .options(
            selectinload(Application.job_seeker),
            selectinload(Application.vacancy).selectinload(Vacancy.kindergarten)
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found or access denied")
    return application

@router.patch("/applications/{application_id}/status", response_model=ApplicationOut)
async def update_application_status(
    application_id: int,
    new_status: ApplicationStatus,
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER)),
    db: AsyncSession = Depends(get_db)
):
    """Accept/Reject or change status of an application."""
    # Verify the application belongs to this employer's kindergarten
    result = await db.execute(
        select(Application)
        .join(Vacancy)
        .join(Kindergarten, Vacancy.kindergarten_id == Kindergarten.id)
        .join(KindergartenEmployer, Kindergarten.id == KindergartenEmployer.kindergarten_id)
        .where(
            and_(
                Application.id == application_id,
                KindergartenEmployer.user_id == current_user.id
            )
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found or access denied")
    
    application.status = new_status
    if new_status == ApplicationStatus.VIEWED and not application.viewed_at:
        application.viewed_at = func.now()
    
    await db.commit()
    
    # Reload with relationships for the response schema
    result = await db.execute(
        select(Application)
        .where(Application.id == application_id)
        .options(
            selectinload(Application.job_seeker),
            selectinload(Application.vacancy).selectinload(Vacancy.kindergarten)
        )
    )
    return result.scalar_one()

@router.get("/statistics")
async def get_employer_stats(
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER)),
    db: AsyncSession = Depends(get_db)
):
    """Return basic statistics for the employer."""
    result = await db.execute(
        select(KindergartenEmployer.kindergarten_id)
        .where(KindergartenEmployer.user_id == current_user.id)
    )
    kindergarten_id = result.scalar_one_or_none()
    
    # Count vacancies
    v_count = await db.scalar(select(func.count(Vacancy.id)).where(Vacancy.kindergarten_id == kindergarten_id))
    # Count applications
    a_count = await db.scalar(
        select(func.count(Application.id))
        .join(Vacancy)
        .where(Vacancy.kindergarten_id == kindergarten_id)
    )
    # Total Views
    views_total = await db.scalar(
        select(func.sum(Vacancy.views_count))
        .where(Vacancy.kindergarten_id == kindergarten_id)
    ) or 0
    
    return {
        "vacancies_total": v_count,
        "applications_total": a_count,
        "views_total": views_total,
        "active_vacancies": await db.scalar(select(func.count(Vacancy.id)).where(and_(Vacancy.kindergarten_id == kindergarten_id, Vacancy.status == VacancyStatus.ACTIVE)))
    }
