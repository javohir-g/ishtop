from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, BigInteger, Boolean, DateTime, Date, 
    Text, ForeignKey, Numeric, Enum as SAEnum, Table, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from .base import Base

# --- Enums ---

class UserRole(str, PyEnum):
    JOB_SEEKER = "job_seeker"
    KINDERGARTEN_EMPLOYER = "kindergarten_employer"
    ADMIN = "admin"

class VacancyStatus(str, PyEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"
    FILLED = "filled"

class EmploymentType(str, PyEnum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    TEMPORARY = "temporary"

class ApplicationStatus(str, PyEnum):
    PENDING = "pending"
    VIEWED = "viewed"
    SHORTLISTED = "shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    REJECTED = "rejected"
    ACCEPTED = "accepted"
    WITHDRAWN = "withdrawn"

class NotificationType(str, PyEnum):
    APPLICATION_RECEIVED = "application_received"
    APPLICATION_VIEWED = "application_viewed"
    APPLICATION_STATUS_CHANGED = "application_status_changed"
    APPLICATION_ACCEPTED = "application_accepted"
    APPLICATION_REJECTED = "application_rejected"
    NEW_MESSAGE = "new_message"
    VACANCY_STATUS_CHANGED = "vacancy_status_changed"
    PROFILE_VIEWED = "profile_viewed"
    SYSTEM = "system"

class GenderType(str, PyEnum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class MessageStatus(str, PyEnum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"

# --- Models ---

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    username: Mapped[Optional[str]] = mapped_column(String(255))
    first_name: Mapped[Optional[str]] = mapped_column(String(255))
    last_name: Mapped[Optional[str]] = mapped_column(String(255))
    photo_url: Mapped[Optional[str]] = mapped_column(Text)
    language_code: Mapped[str] = mapped_column(String(10), default="ru", nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole, native_enum=False), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    job_seeker_profile = relationship("JobSeekerProfile", back_populates="user", uselist=False)
    employer_profile = relationship("KindergartenEmployer", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    sent_messages = relationship("Message", back_populates="sender")

class Kindergarten(Base):
    __tablename__ = "kindergartens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[Optional[str]] = mapped_column(String(255), unique=True)
    logo_url: Mapped[Optional[str]] = mapped_column(Text)
    district: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    address: Mapped[Optional[str]] = mapped_column(Text)
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vacancies = relationship("Vacancy", back_populates="kindergarten")
    employers = relationship("KindergartenEmployer", back_populates="kindergarten")
    chats = relationship("Chat", back_populates="kindergarten")

class KindergartenEmployer(Base):
    __tablename__ = "kindergarten_employers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    kindergarten_id: Mapped[int] = mapped_column(Integer, ForeignKey("kindergartens.id", ondelete="CASCADE"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[Optional[str]] = mapped_column(String(255))
    photo_url: Mapped[Optional[str]] = mapped_column(Text)
    is_primary_contact: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="employer_profile")
    kindergarten = relationship("Kindergarten", back_populates="employers")

class JobSeekerProfile(Base):
    __tablename__ = "job_seeker_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    photo_url: Mapped[Optional[str]] = mapped_column(Text)
    birth_date: Mapped[Optional[date]] = mapped_column(Date)
    gender: Mapped[Optional[GenderType]] = mapped_column(SAEnum(GenderType, native_enum=False))
    location: Mapped[Optional[str]] = mapped_column(String(255))
    district: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    address: Mapped[Optional[str]] = mapped_column(Text)
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    about_me: Mapped[Optional[str]] = mapped_column(Text)
    desired_position: Mapped[Optional[str]] = mapped_column(String(255))
    desired_salary_min: Mapped[Optional[int]] = mapped_column(Integer)
    desired_salary_max: Mapped[Optional[int]] = mapped_column(Integer)
    experience_years: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    has_medical_book: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    medical_book_expires_at: Mapped[Optional[date]] = mapped_column(Date)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    rating: Mapped[float] = mapped_column(Numeric(3, 2), default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="job_seeker_profile")
    skills = relationship("Skill", back_populates="job_seeker")
    education = relationship("EducationRecord", back_populates="job_seeker")
    experience = relationship("ExperienceRecord", back_populates="job_seeker")
    languages = relationship("LanguageRecord", back_populates="job_seeker")
    certificates = relationship("CertificateRecord", back_populates="job_seeker")
    applications = relationship("Application", back_populates="job_seeker")
    saved_vacancies = relationship("SavedVacancy", back_populates="job_seeker")
    chats = relationship("Chat", back_populates="job_seeker")

class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_seeker_id: Mapped[int] = mapped_column(Integer, ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeekerProfile", back_populates="skills")
    __table_args__ = (UniqueConstraint('job_seeker_id', 'skill_name', name='uq_job_seeker_skill'),)

class EducationRecord(Base):
    __tablename__ = "education_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_seeker_id: Mapped[int] = mapped_column(Integer, ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False)
    institution: Mapped[str] = mapped_column(String(255), nullable=False)
    degree: Mapped[Optional[str]] = mapped_column(String(255))
    field_of_study: Mapped[Optional[str]] = mapped_column(String(255))
    start_year: Mapped[Optional[int]] = mapped_column(Integer)
    end_year: Mapped[Optional[int]] = mapped_column(Integer)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeekerProfile", back_populates="education")

class ExperienceRecord(Base):
    __tablename__ = "experience_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_seeker_id: Mapped[int] = mapped_column(Integer, ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False)
    position: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeekerProfile", back_populates="experience")

class LanguageRecord(Base):
    __tablename__ = "language_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_seeker_id: Mapped[int] = mapped_column(Integer, ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False)
    language_name: Mapped[str] = mapped_column(String(100), nullable=False)
    level: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. A1, B2, Native
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeekerProfile", back_populates="languages")

class CertificateRecord(Base):
    __tablename__ = "certificate_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_seeker_id: Mapped[int] = mapped_column(Integer, ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    organization: Mapped[str] = mapped_column(String(255), nullable=False)
    issue_date: Mapped[Optional[date]] = mapped_column(Date)
    expiration_date: Mapped[Optional[date]] = mapped_column(Date)
    credential_url: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeekerProfile", back_populates="certificates")

class Vacancy(Base):
    __tablename__ = "vacancies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kindergarten_id: Mapped[int] = mapped_column(Integer, ForeignKey("kindergartens.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    requirements: Mapped[Optional[str]] = mapped_column(Text)
    responsibilities: Mapped[Optional[str]] = mapped_column(Text)
    salary_min: Mapped[Optional[int]] = mapped_column(Integer)
    salary_max: Mapped[Optional[int]] = mapped_column(Integer)
    district: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    employment_type: Mapped[EmploymentType] = mapped_column(SAEnum(EmploymentType, native_enum=False), default=EmploymentType.FULL_TIME)
    status: Mapped[VacancyStatus] = mapped_column(SAEnum(VacancyStatus, native_enum=False), default=VacancyStatus.ACTIVE)
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    applications_count: Mapped[int] = mapped_column(Integer, default=0)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_new: Mapped[bool] = mapped_column(Boolean, default=False)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    kindergarten = relationship("Kindergarten", back_populates="vacancies")
    applications = relationship("Application", back_populates="vacancy")
    saved_by = relationship("SavedVacancy", back_populates="vacancy")

class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vacancy_id: Mapped[int] = mapped_column(Integer, ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False)
    job_seeker_id: Mapped[int] = mapped_column(Integer, ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False)
    cover_letter: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[ApplicationStatus] = mapped_column(SAEnum(ApplicationStatus, native_enum=False), default=ApplicationStatus.PENDING)
    viewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    responded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vacancy = relationship("Vacancy", back_populates="applications")
    job_seeker = relationship("JobSeekerProfile", back_populates="applications")
    chat = relationship("Chat", back_populates="application", uselist=False)
    __table_args__ = (UniqueConstraint('vacancy_id', 'job_seeker_id', name='uq_application_vacancy_seeker'),)

class SavedVacancy(Base):
    __tablename__ = "saved_vacancies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_seeker_id: Mapped[int] = mapped_column(Integer, ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False)
    vacancy_id: Mapped[int] = mapped_column(Integer, ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeekerProfile", back_populates="saved_vacancies")
    vacancy = relationship("Vacancy", back_populates="saved_by")
    __table_args__ = (UniqueConstraint('job_seeker_id', 'vacancy_id', name='uq_saved_vacancy_seeker'),)

class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_seeker_id: Mapped[int] = mapped_column(Integer, ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False)
    kindergarten_id: Mapped[int] = mapped_column(Integer, ForeignKey("kindergartens.id", ondelete="CASCADE"), nullable=False)
    application_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("applications.id", ondelete="SET NULL"))
    last_message: Mapped[Optional[str]] = mapped_column(Text)
    last_message_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    unread_by_seeker: Mapped[int] = mapped_column(Integer, default=0)
    unread_by_employer: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    job_seeker = relationship("JobSeekerProfile", back_populates="chats")
    kindergarten = relationship("Kindergarten", back_populates="chats")
    application = relationship("Application", back_populates="chat")
    messages = relationship("Message", back_populates="chat")
    __table_args__ = (UniqueConstraint('job_seeker_id', 'kindergarten_id', name='uq_chat_participants'),)

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chat_id: Mapped[int] = mapped_column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    sender_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    chat = relationship("Chat", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages")

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[NotificationType] = mapped_column(SAEnum(NotificationType, native_enum=False), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    related_id: Mapped[Optional[int]] = mapped_column(Integer) # application_id, message_id, etc.
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")

class ContactForm(Base):
    __tablename__ = "contact_forms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    user_agent: Mapped[Optional[str]] = mapped_column(Text)
    is_processed: Mapped[bool] = mapped_column(Boolean, default=False)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

# Indexes
Index('idx_users_role', User.role)
Index('idx_kindergartens_district', Kindergarten.district)
Index('idx_vacancies_status', Vacancy.status)
Index('idx_applications_status', Application.status)
Index('idx_notifications_user', Notification.user_id)
Index('idx_messages_chat', Message.chat_id)
