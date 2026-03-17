from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List, Optional

from ..database import get_db
from ..models import User, UserRole, JobSeekerProfile, Skill, EducationRecord, ExperienceRecord, Application, ApplicationStatus
from ..schemas import JobSeekerProfileOut, JobSeekerProfileExtendedOut
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/workers", tags=["Workers"])

@router.get("", response_model=List[JobSeekerProfileOut])
async def search_workers(
    position: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    min_experience: int = Query(0),
    min_rating: float = Query(0.0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER, UserRole.ADMIN))
):
    """Search for candidates (workers). Available for employers and admins."""
    query = select(JobSeekerProfile).where(JobSeekerProfile.is_available == True)
    
    if position:
        query = query.where(JobSeekerProfile.desired_position.ilike(f"%{position}%"))
    if district:
        query = query.where(JobSeekerProfile.district == district)
    if min_experience > 0:
        query = query.where(JobSeekerProfile.experience_years >= min_experience)
    if min_rating > 0:
        query = query.where(JobSeekerProfile.rating >= min_rating)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{worker_id}", response_model=JobSeekerProfileExtendedOut)
async def get_worker_detail(
    worker_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER, UserRole.ADMIN))
):
    """Get detailed worker profile."""
    result = await db.execute(
        select(JobSeekerProfile)
        .where(JobSeekerProfile.id == worker_id)
        .options(
            selectinload(JobSeekerProfile.skills),
            selectinload(JobSeekerProfile.education),
            selectinload(JobSeekerProfile.experience)
        )
    )
    worker = result.scalar_one_or_none()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker

@router.post("/{worker_id}/invite", status_code=status.HTTP_201_CREATED)
async def invite_worker(
    worker_id: int,
    vacancy_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.KINDERGARTEN_EMPLOYER))
):
    """Invite a worker to apply for a vacancy (creates an application in 'invited' state if the model supported it, 
    but for now we'll just create a pending application or a notification). 
    Actually, let's create an Application with a specific status if possible, 
    or just return success for now if 'invited' status is not in models.py.
    
    Looking at models.py, ApplicationStatus has: PENDING, VIEWED, SHORTLISTED, etc.
    We'll use PENDING for now.
    """
    # Verify worker exists
    worker_result = await db.execute(select(JobSeekerProfile).where(JobSeekerProfile.id == worker_id))
    if not worker_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Check if application already exists
    existing = await db.execute(
        select(Application).where(
            and_(Application.vacancy_id == vacancy_id, Application.job_seeker_id == worker_id)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Application already exists for this worker and vacancy")
    
    # Create invitation (Application)
    new_app = Application(
        vacancy_id=vacancy_id,
        job_seeker_id=worker_id,
        status=ApplicationStatus.PENDING,
        notes="Invited by employer"
    )
    db.add(new_app)
    await db.commit()
    return {"message": "Worker successfully invited"}
