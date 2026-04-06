from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List

from ..database import get_db
from ..models import User, UserRole, JobSeekerProfile, Skill, EducationRecord, ExperienceRecord, KindergartenEmployer, Kindergarten
from ..schemas import (
    JobSeekerProfileOut, JobSeekerProfileCreate, JobSeekerProfileExtendedOut,
    SkillSchema, SkillCreate,
    EducationRecordOut, EducationRecordCreate,
    ExperienceRecordOut, ExperienceRecordCreate,
    EmployerProfileOut
)
from ..auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profiles"])

@router.get("", response_model=JobSeekerProfileExtendedOut | EmployerProfileOut)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's profile based on their role."""
    if current_user.role == UserRole.JOB_SEEKER:
        result = await db.execute(
            select(JobSeekerProfile)
            .where(JobSeekerProfile.user_id == current_user.id)
            .options(
                selectinload(JobSeekerProfile.skills),
                selectinload(JobSeekerProfile.education),
                selectinload(JobSeekerProfile.experience)
            )
        )
        profile = result.scalar_one_or_none()
        
        if not profile:
            # Auto-create basic profile to avoid 404
            profile = JobSeekerProfile(
                user_id=current_user.id, 
                full_name=current_user.first_name or current_user.username or "User",
                experience_years=0
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
            # Re-fetch to ensure relations are initialized
            return await get_my_profile(current_user, db)
            
        return profile
    
    elif current_user.role == UserRole.KINDERGARTEN_EMPLOYER:
        result = await db.execute(
            select(KindergartenEmployer)
            .where(KindergartenEmployer.user_id == current_user.id)
            .options(selectinload(KindergartenEmployer.kindergarten))
        )
        employer = result.scalar_one_or_none()
        if not employer:
            raise HTTPException(status_code=404, detail="Employer profile not found")
        return {"employer": employer, "kindergarten": employer.kindergarten}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid user role for profile")

@router.put("", response_model=JobSeekerProfileOut)
async def update_job_seeker_profile(
    profile_data: JobSeekerProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update job seeker profile."""
    if current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code= status.HTTP_403_FORBIDDEN, detail="Only job seekers can update this profile type")
    
    result = await db.execute(select(JobSeekerProfile).where(JobSeekerProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    
    if not profile:
        profile = JobSeekerProfile(user_id=current_user.id, **profile_data.model_dump())
        db.add(profile)
    else:
        for key, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(profile, key, value)
    
    await db.commit()
    await db.refresh(profile)
    return profile

# --- Skills ---

@router.post("/skills", response_model=SkillSchema)
async def add_skill(
    skill_data: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a skill to job seeker profile."""
    if current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail="Only job seekers can add skills")
    
    result = await db.execute(select(JobSeekerProfile).where(JobSeekerProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    new_skill = Skill(job_seeker_id=profile.id, skill_name=skill_data.skill_name)
    db.add(new_skill)
    try:
        await db.commit()
        await db.refresh(new_skill)
        return new_skill
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Skill already exists or invalid data")

@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a skill."""
    resultItem = await db.execute(
        select(Skill).join(JobSeekerProfile).where(
            Skill.id == skill_id, 
            JobSeekerProfile.user_id == current_user.id
        )
    )
    skill = resultItem.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found or not owned by you")
    
    await db.delete(skill)
    await db.commit()
    return None

# --- Education & Experience (Minimal support for completeness) ---

@router.post("/education", response_model=EducationRecordOut)
async def add_education(
    edu_data: EducationRecordCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(JobSeekerProfile).where(JobSeekerProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    
    new_edu = EducationRecord(job_seeker_id=profile.id, **edu_data.model_dump())
    db.add(new_edu)
    await db.commit()
    await db.refresh(new_edu)
    return new_edu

@router.post("/experience", response_model=ExperienceRecordOut)
async def add_experience(
    exp_data: ExperienceRecordCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(JobSeekerProfile).where(JobSeekerProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    
    new_exp = ExperienceRecord(job_seeker_id=profile.id, **exp_data.model_dump())
    db.add(new_exp)
    await db.commit()
    await db.refresh(new_exp)
    return new_exp
