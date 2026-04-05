from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Vacancy, VacancyStatus, JobSeekerProfile, Kindergarten
from ..schemas import PublicStatsOut

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("", response_model=PublicStatsOut)
async def get_public_stats(db: AsyncSession = Depends(get_db)):
    """Get public platform statistics for the landing page."""
    # Active vacancies count
    vacancies_count = await db.scalar(
        select(func.count(Vacancy.id)).where(Vacancy.status == VacancyStatus.ACTIVE)
    )
    
    # Active/Available workers count
    workers_count = await db.scalar(
        select(func.count(JobSeekerProfile.id)).where(JobSeekerProfile.is_available == True)
    )
    
    # Verified kindergartens count (or just total active)
    kindergartens_count = await db.scalar(
        select(func.count(Kindergarten.id)).where(Kindergarten.is_active == True)
    )

    return {
        "vacancies_count": vacancies_count or 0,
        "workers_count": workers_count or 0,
        "kindergartens_count": kindergartens_count or 0
    }
