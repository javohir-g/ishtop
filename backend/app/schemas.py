"""Pydantic schemas for API request/response models."""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


# --- Auth ---

class TelegramAuthRequest(BaseModel):
    init_data: str = Field(..., description="Telegram WebApp initData string")
    role: Optional[str] = Field("job_seeker", description="Desired role: job_seeker or kindergarten_employer")

class TelegramLoginWidgetRequest(BaseModel):
    id: int = Field(..., description="Telegram user ID")
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int = Field(..., description="Unix timestamp of auth")
    hash: str = Field(..., description="HMAC hash for validation")
    role: Optional[str] = Field("job_seeker", description="Desired role")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    is_new_user: bool = False


# --- User ---

class UserOut(BaseModel):
    id: int
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Kindergarten ---

class KindergartenCreate(BaseModel):
    name: str
    district: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None

class KindergartenOut(BaseModel):
    id: int
    name: str
    slug: Optional[str] = None
    logo_url: Optional[str] = None
    district: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None
    is_verified: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Job Seeker Profile ---

class JobSeekerProfileCreate(BaseModel):
    full_name: str
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    about_me: Optional[str] = None
    desired_position: Optional[str] = None
    desired_salary_min: Optional[int] = None
    desired_salary_max: Optional[int] = None
    experience_years: int = 0

class JobSeekerProfileOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    photo_url: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    about_me: Optional[str] = None
    desired_position: Optional[str] = None
    desired_salary_min: Optional[int] = None
    desired_salary_max: Optional[int] = None
    experience_years: int
    is_available: bool
    rating: float
    created_at: datetime

    class Config:
        from_attributes = True


# --- Vacancy ---

class VacancyCreate(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    district: Optional[str] = None
    employment_type: str = "full_time"

class VacancyOut(BaseModel):
    id: int
    kindergarten_id: int
    kindergarten: Optional[KindergartenOut] = None
    title: str
    description: str
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    district: Optional[str] = None
    employment_type: str
    status: str
    views_count: int
    applications_count: int
    is_featured: bool
    is_favorite: bool = False
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class VacancyListOut(BaseModel):
    items: List[VacancyOut]
    total: int
    page: int
    per_page: int


# --- Application ---

class ApplicationCreate(BaseModel):
    vacancy_id: int
    cover_letter: Optional[str] = None

class ApplicationOut(BaseModel):
    id: int
    vacancy_id: int
    job_seeker_id: int
    vacancy: Optional[VacancyOut] = None
    cover_letter: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Skill ---

class SkillSchema(BaseModel):
    id: int
    skill_name: str

    class Config:
        from_attributes = True

class SkillCreate(BaseModel):
    skill_name: str


# --- Education ---

class EducationRecordOut(BaseModel):
    id: int
    institution: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    is_current: bool

    class Config:
        from_attributes = True

class EducationRecordCreate(BaseModel):
    institution: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    is_current: bool = False


# --- Experience ---

class ExperienceRecordOut(BaseModel):
    id: int
    position: str
    company_name: str
    start_date: date
    end_date: Optional[date] = None
    is_current: bool
    description: Optional[str] = None

    class Config:
        from_attributes = True

class ExperienceRecordCreate(BaseModel):
    position: str
    company_name: str
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None


# --- Extended Profiles ---

class JobSeekerProfileExtendedOut(JobSeekerProfileOut):
    skills: List[SkillSchema] = []
    education: List[EducationRecordOut] = []
    experience: List[ExperienceRecordOut] = []

class KindergartenEmployerOut(BaseModel):
    id: int
    kindergarten_id: int
    full_name: str
    position: Optional[str] = None
    photo_url: Optional[str] = None
    is_primary_contact: bool

    class Config:
        from_attributes = True

class EmployerProfileOut(BaseModel):
    employer: KindergartenEmployerOut
    kindergarten: Optional[KindergartenOut] = None

class KindergartenUpdate(BaseModel):
    name: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None

class EmployerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    position: Optional[str] = None
    photo_url: Optional[str] = None
    kindergarten: Optional[KindergartenUpdate] = None


# --- Favorites ---

class SavedVacancyOut(BaseModel):
    id: int
    vacancy_id: int
    vacancy: VacancyOut

    class Config:
        from_attributes = True


# --- Chat & Messages ---

class MessageOut(BaseModel):
    id: int
    chat_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str

class ChatOut(BaseModel):
    id: int
    job_seeker_id: int
    kindergarten_id: int
    application_id: Optional[int] = None
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0
    other_party_name: str = ""
    other_party_photo: Optional[str] = None

    class Config:
        from_attributes = True

class PublicStatsOut(BaseModel):
    vacancies_count: int
    workers_count: int
    kindergartens_count: int



# --- Admin ---

class AdminStatsOut(BaseModel):
    total_users: int
    job_seekers: int
    employers: int
    total_vacancies: int
    active_vacancies: int
    total_applications: int
    pending_kindergartens: int

class UserAdminOut(UserOut):
    last_login_at: Optional[datetime] = None
    updated_at: datetime
    telegram_id: int

    class Config:
        from_attributes = True

class KindergartenAdminOut(KindergartenOut):
    updated_at: datetime
    employer_count: int = 0

    class Config:
        from_attributes = True
