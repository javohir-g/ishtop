from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import User, UserRole, Kindergarten, Vacancy, Application, KindergartenEmployer
from ..schemas import AdminStatsOut, UserAdminOut, KindergartenAdminOut, UserOut, KindergartenOut, VacancyOut
from ..auth import require_role

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats", response_model=AdminStatsOut)
async def get_platform_stats(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get global platform statistics."""
    # User counts
    total_users = await db.scalar(select(func.count(User.id)))
    job_seekers = await db.scalar(select(func.count(User.id)).where(User.role == UserRole.JOB_SEEKER))
    employers = await db.scalar(select(func.count(User.id)).where(User.role == UserRole.KINDERGARTEN_EMPLOYER))
    
    # Vacancy counts
    total_vacancies = await db.scalar(select(func.count(Vacancy.id)))
    active_vacancies = await db.scalar(select(func.count(Vacancy.id)).where(Vacancy.status == "active"))
    
    # Application counts
    total_applications = await db.scalar(select(func.count(Application.id)))
    
    # Pending moderations
    pending_kindergartens = await db.scalar(select(func.count(Kindergarten.id)).where(Kindergarten.is_verified == False))

    return {
        "total_users": total_users or 0,
        "job_seekers": job_seekers or 0,
        "employers": employers or 0,
        "total_vacancies": total_vacancies or 0,
        "active_vacancies": active_vacancies or 0,
        "total_applications": total_applications or 0,
        "pending_kindergartens": pending_kindergartens or 0
    }

@router.get("/users", response_model=List[UserAdminOut])
async def list_users_admin(
    role: Optional[UserRole] = None,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """List all users with recruitment details."""
    query = select(User).order_by(User.created_at.desc())
    if role:
        query = query.where(User.role == role)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/users/{user_id}/status")
async def update_user_status_admin(
    user_id: int,
    is_active: bool,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Activate/Deactivate user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = is_active
    await db.commit()
    return {"status": "success", "user_id": user_id, "is_active": is_active}

@router.get("/kindergartens", response_model=List[KindergartenAdminOut])
async def list_kindergartens_admin(
    verified: Optional[bool] = None,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """List all kindergartens for moderation."""
    query = select(Kindergarten).order_by(Kindergarten.created_at.desc())
    if verified is not None:
        query = query.where(Kindergarten.is_verified == verified)
    
    result = await db.execute(query)
    kindergartens = result.scalars().all()
    
    # Enrich with employer count
    enriched = []
    for k in kindergartens:
        emp_count = await db.scalar(select(func.count(KindergartenEmployer.id)).where(KindergartenEmployer.kindergarten_id == k.id))
        k_dict = k.__dict__.copy()
        k_dict["employer_count"] = emp_count
        enriched.append(k_dict)
        
    return enriched

@router.post("/kindergartens/{k_id}/verify")
async def verify_kindergarten_admin(
    k_id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Verify a kindergarten organization."""
    result = await db.execute(select(Kindergarten).where(Kindergarten.id == k_id))
    k = result.scalar_one_or_none()
    if not k:
        raise HTTPException(status_code=404, detail="Kindergarten not found")
    
    k.is_verified = True
    await db.commit()
    return {"status": "verified", "kindergarten_id": k_id}

@router.get("/vacancies/moderation", response_model=List[VacancyOut])
async def list_vacancies_moderation(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """List vacancies for moderation (e.g. inactive or recently created)."""
    # For now, just return all active vacancies as an example
    result = await db.execute(select(Vacancy).order_by(Vacancy.created_at.desc()))
    return result.scalars().all()
