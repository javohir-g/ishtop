# Backend Technical Specification
## Job Search Platform for Kindergarten Staff (Telegram WebApp)

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Specification](#api-specification)
5. [Authentication & Authorization](#authentication--authorization)
6. [Project Structure](#project-structure)
7. [Security & Performance](#security--performance)
8. [Deployment Strategy](#deployment-strategy)

---

## 1. SYSTEM OVERVIEW

### System Type
**Telegram WebApp** - Job search platform connecting kindergarten staff (job seekers) with kindergarten employers.

### Key Features
- **Dual Role System**: Job Seekers and Kindergarten Employers
- **Public Landing**: Marketing pages, vacancy listings (no auth required)
- **Private App**: Full functionality via Telegram WebApp only
- **Multi-tenant**: Each kindergarten is an isolated tenant
- **Bilingual**: Russian and Uzbek interface support

### Technology Stack
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0 (async)
- **Validation**: Pydantic v2
- **Authentication**: Telegram initData validation + JWT
- **Caching**: Redis
- **Task Queue**: Celery + Redis
- **File Storage**: S3-compatible (MinIO/AWS S3)
- **Containerization**: Docker + Docker Compose

---

## 2. ARCHITECTURE

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    TELEGRAM BOT GATEWAY                      │
│                  (Handles WebApp Launches)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Public API   │  │  App API     │  │   Admin API  │      │
│  │ /api/public  │  │  /api/app    │  │   /api/admin │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Authentication Middleware                   │   │
│  │  - Telegram initData validation                       │   │
│  │  - JWT token management                               │   │
│  │  - Role-based access control                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │    Redis     │  │   S3/MinIO   │      │
│  │  (Main DB)   │  │   (Cache)    │  │   (Files)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Multi-Tenant Strategy

**Tenant Identification:**
- Each kindergarten is a tenant
- Job seekers are NOT tenants (they interact with multiple tenants)
- Tenant isolation via `kindergarten_id` foreign key on all tenant-specific data

**Data Isolation Rules:**
- Vacancies belong to kindergartens (tenant-isolated)
- Applications link job seekers to vacancies (cross-tenant)
- Messages between job seeker and kindergarten (cross-tenant)
- Kindergarten employers can only see their own data
- Job seekers can see all public data across all tenants

---

## 3. DATABASE SCHEMA

### 3.1 Entity Relationship Diagram (Text Format)

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│   User       │────1:1──│ JobSeekerProfile │         │ Kindergarten │
│              │         │                  │         │  (Tenant)    │
│ telegram_id  │         │   full_name      │         │   name       │
│ username     │         │   photo_url      │         │   logo_url   │
│ role         │         │   birth_date     │         │   district   │
│ language     │         │   location       │         │   address    │
│ created_at   │         │   about_me       │         │   phone      │
└──────────────┘         │   desired_salary │         │   verified   │
       │                 │   experience_yrs │         └──────────────┘
       │                 └──────────────────┘                │
       │                         │                           │
       │                         │                           │
       │                    ┌────────────┐                   │
       │                    │   Skill    │                   │
       │                    └────────────┘                   │
       │                         │                           │
       │                  ┌──────────────────┐               │
       │                  │EducationRecord   │               │
       │                  └──────────────────┘               │
       │                         │                           │
       │                  ┌──────────────────┐               │
       │                  │ExperienceRecord  │               │
       │                  └──────────────────┘               │
       │                                                     │
       │                                                     │
       └──────────1:1────────┐                              │
                              │                              │
                    ┌─────────────────────┐                 │
                    │KindergartenEmployer │──────1:1────────┘
                    │                     │
                    │   position          │
                    │   full_name         │
                    └─────────────────────┘
                              │
                              │
                              │ 1:N
                              ▼
                        ┌──────────┐
                        │ Vacancy  │◄──────────┐
                        │          │           │
                        │ title    │           │
                        │ salary   │           │
                        │ status   │           │
                        └──────────┘           │
                              │                │
                              │ 1:N            │
                              ▼                │
                      ┌────────────────┐       │
                      │  Application   │       │
                      │                │       │
                      │  job_seeker_id │       │
                      │  vacancy_id    │       │
                      │  status        │       │
                      │  cover_letter  │       │
                      └────────────────┘       │
                                               │
                                               │
┌──────────────┐                               │
│ SavedVacancy │───────────────────────────────┘
│              │
│ job_seeker_id│
│ vacancy_id   │
└──────────────┘


┌──────────┐         ┌───────────┐         ┌──────────┐
│   Chat   │────1:N──│  Message  │         │Notification│
│          │         │           │         │            │
│ sender   │         │ chat_id   │         │ user_id    │
│ receiver │         │ content   │         │ type       │
│ last_msg │         │ timestamp │         │ read       │
└──────────┘         └───────────┘         └──────────┘
```

### 3.2 Database Tables

#### **users** (Main user table)
```sql
CREATE TABLE users (
    id                  SERIAL PRIMARY KEY,
    telegram_id         BIGINT UNIQUE NOT NULL,
    username            VARCHAR(255),
    first_name          VARCHAR(255),
    last_name           VARCHAR(255),
    language_code       VARCHAR(10) DEFAULT 'ru',
    role                VARCHAR(50) NOT NULL, -- 'job_seeker' or 'kindergarten_employer'
    is_active           BOOLEAN DEFAULT true,
    last_login          TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);
```

#### **kindergartens** (Tenant table)
```sql
CREATE TABLE kindergartens (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    logo_url            TEXT,
    district            VARCHAR(255) NOT NULL,
    address             TEXT,
    phone               VARCHAR(50),
    email               VARCHAR(255),
    description         TEXT,
    verified            BOOLEAN DEFAULT false,
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kindergartens_district ON kindergartens(district);
CREATE INDEX idx_kindergartens_verified ON kindergartens(verified);
```

#### **kindergarten_employers** (Employer profiles)
```sql
CREATE TABLE kindergarten_employers (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kindergarten_id     INTEGER NOT NULL REFERENCES kindergartens(id) ON DELETE CASCADE,
    position            VARCHAR(255), -- e.g., "Директор", "HR менеджер"
    full_name           VARCHAR(255) NOT NULL,
    photo_url           TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kindergarten_employers_user ON kindergarten_employers(user_id);
CREATE INDEX idx_kindergarten_employers_kindergarten ON kindergarten_employers(kindergarten_id);
```

#### **job_seeker_profiles** (Job seeker profiles)
```sql
CREATE TABLE job_seeker_profiles (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name           VARCHAR(255) NOT NULL,
    photo_url           TEXT,
    birth_date          DATE,
    gender              VARCHAR(20), -- 'male', 'female', 'other'
    location            VARCHAR(255),
    district            VARCHAR(255),
    about_me            TEXT,
    desired_position    VARCHAR(255),
    desired_salary_min  INTEGER,
    desired_salary_max  INTEGER,
    experience_years    INTEGER DEFAULT 0,
    is_available        BOOLEAN DEFAULT true,
    rating              DECIMAL(3,2) DEFAULT 0.0,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_job_seeker_profiles_user ON job_seeker_profiles(user_id);
CREATE INDEX idx_job_seeker_profiles_district ON job_seeker_profiles(district);
CREATE INDEX idx_job_seeker_profiles_available ON job_seeker_profiles(is_available);
```

#### **skills** (Job seeker skills)
```sql
CREATE TABLE skills (
    id                  SERIAL PRIMARY KEY,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    skill_name          VARCHAR(255) NOT NULL,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skills_job_seeker ON skills(job_seeker_id);
CREATE INDEX idx_skills_name ON skills(skill_name);
```

#### **education_records** (Education history)
```sql
CREATE TABLE education_records (
    id                  SERIAL PRIMARY KEY,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    institution         VARCHAR(255) NOT NULL,
    degree              VARCHAR(255),
    field_of_study      VARCHAR(255),
    start_year          INTEGER,
    end_year            INTEGER,
    is_current          BOOLEAN DEFAULT false,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_education_records_job_seeker ON education_records(job_seeker_id);
```

#### **experience_records** (Work experience)
```sql
CREATE TABLE experience_records (
    id                  SERIAL PRIMARY KEY,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    position            VARCHAR(255) NOT NULL,
    company_name        VARCHAR(255) NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE,
    is_current          BOOLEAN DEFAULT false,
    description         TEXT,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_experience_records_job_seeker ON experience_records(job_seeker_id);
```

#### **vacancies** (Job vacancies)
```sql
CREATE TYPE vacancy_status AS ENUM ('active', 'paused', 'closed', 'filled');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');

CREATE TABLE vacancies (
    id                  SERIAL PRIMARY KEY,
    kindergarten_id     INTEGER NOT NULL REFERENCES kindergartens(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    description         TEXT NOT NULL,
    requirements        TEXT,
    responsibilities    TEXT,
    salary_min          INTEGER,
    salary_max          INTEGER,
    district            VARCHAR(255),
    employment_type     employment_type DEFAULT 'full_time',
    status              vacancy_status DEFAULT 'active',
    views_count         INTEGER DEFAULT 0,
    applications_count  INTEGER DEFAULT 0,
    is_featured         BOOLEAN DEFAULT false, -- "TOP" badge
    is_new              BOOLEAN DEFAULT false, -- "NEW" badge
    published_at        TIMESTAMP,
    expires_at          TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vacancies_kindergarten ON vacancies(kindergarten_id);
CREATE INDEX idx_vacancies_status ON vacancies(status);
CREATE INDEX idx_vacancies_district ON vacancies(district);
CREATE INDEX idx_vacancies_published ON vacancies(published_at);
CREATE INDEX idx_vacancies_featured ON vacancies(is_featured);
```

#### **applications** (Job applications)
```sql
CREATE TYPE application_status AS ENUM ('pending', 'viewed', 'shortlisted', 'rejected', 'accepted', 'withdrawn');

CREATE TABLE applications (
    id                  SERIAL PRIMARY KEY,
    vacancy_id          INTEGER NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    cover_letter        TEXT,
    status              application_status DEFAULT 'pending',
    viewed_at           TIMESTAMP,
    responded_at        TIMESTAMP,
    notes               TEXT, -- Internal notes by employer
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(vacancy_id, job_seeker_id) -- One application per vacancy per job seeker
);

CREATE INDEX idx_applications_vacancy ON applications(vacancy_id);
CREATE INDEX idx_applications_job_seeker ON applications(job_seeker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created ON applications(created_at DESC);
```

#### **saved_vacancies** (Bookmarked vacancies)
```sql
CREATE TABLE saved_vacancies (
    id                  SERIAL PRIMARY KEY,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    vacancy_id          INTEGER NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    created_at          TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(job_seeker_id, vacancy_id)
);

CREATE INDEX idx_saved_vacancies_job_seeker ON saved_vacancies(job_seeker_id);
CREATE INDEX idx_saved_vacancies_vacancy ON saved_vacancies(vacancy_id);
```

#### **chats** (Message threads)
```sql
CREATE TABLE chats (
    id                  SERIAL PRIMARY KEY,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    kindergarten_id     INTEGER NOT NULL REFERENCES kindergartens(id) ON DELETE CASCADE,
    application_id      INTEGER REFERENCES applications(id) ON DELETE SET NULL,
    last_message        TEXT,
    last_message_at     TIMESTAMP,
    unread_by_seeker    INTEGER DEFAULT 0,
    unread_by_employer  INTEGER DEFAULT 0,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(job_seeker_id, kindergarten_id)
);

CREATE INDEX idx_chats_job_seeker ON chats(job_seeker_id);
CREATE INDEX idx_chats_kindergarten ON chats(kindergarten_id);
CREATE INDEX idx_chats_last_message ON chats(last_message_at DESC);
```

#### **messages** (Individual messages)
```sql
CREATE TABLE messages (
    id                  SERIAL PRIMARY KEY,
    chat_id             INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    is_read             BOOLEAN DEFAULT false,
    read_at             TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

#### **notifications** (User notifications)
```sql
CREATE TYPE notification_type AS ENUM (
    'application_received', 
    'application_viewed', 
    'application_accepted', 
    'application_rejected',
    'new_message',
    'vacancy_status_changed'
);

CREATE TABLE notifications (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                notification_type NOT NULL,
    title               VARCHAR(255) NOT NULL,
    content             TEXT NOT NULL,
    related_id          INTEGER, -- ID of related entity (application_id, message_id, etc.)
    is_read             BOOLEAN DEFAULT false,
    read_at             TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### **contact_forms** (Public landing contact forms)
```sql
CREATE TABLE contact_forms (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255),
    phone               VARCHAR(50),
    message             TEXT NOT NULL,
    ip_address          VARCHAR(45),
    user_agent          TEXT,
    is_processed        BOOLEAN DEFAULT false,
    processed_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contact_forms_processed ON contact_forms(is_processed);
CREATE INDEX idx_contact_forms_created ON contact_forms(created_at DESC);
```

---

## 4. API SPECIFICATION

### 4.1 Public API Endpoints (No Auth Required)

**Base Path:** `/api/public`

#### **Vacancies**

```
GET /api/public/vacancies
Description: Get list of active vacancies (public landing page)
Query Params:
  - district: string (optional)
  - position: string (optional)
  - salary_min: integer (optional)
  - salary_max: integer (optional)
  - page: integer (default: 1)
  - limit: integer (default: 20)
Response: 200
{
  "data": [
    {
      "id": 1,
      "title": "Воспитатель младшей группы",
      "kindergarten": {
        "id": 1,
        "name": "Детский сад «Солнышко»",
        "logo_url": "https://...",
        "district": "Центральный район",
        "verified": true
      },
      "salary_min": 6000000,
      "salary_max": 7000000,
      "district": "Центральный район",
      "employment_type": "full_time",
      "is_featured": false,
      "is_new": true,
      "published_at": "2026-03-01T10:00:00Z",
      "views_count": 247
    }
  ],
  "total": 156,
  "page": 1,
  "pages": 8
}
```

```
GET /api/public/vacancies/{id}
Description: Get vacancy details
Response: 200
{
  "id": 1,
  "title": "Воспитатель младшей группы",
  "description": "...",
  "requirements": "...",
  "responsibilities": "...",
  "salary_min": 6000000,
  "salary_max": 7000000,
  "district": "Центральный район",
  "employment_type": "full_time",
  "status": "active",
  "kindergarten": {
    "id": 1,
    "name": "Детский сад «Солнышко»",
    "logo_url": "https://...",
    "district": "Центральный район",
    "address": "...",
    "phone": "...",
    "verified": true
  },
  "published_at": "2026-03-01T10:00:00Z",
  "views_count": 247,
  "applications_count": 12,
  "created_at": "2026-03-01T10:00:00Z"
}
```

#### **Contact Forms**

```
POST /api/public/contact
Description: Submit contact form from landing page
Rate Limit: 5 requests per hour per IP
Request Body:
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+998901234567",
  "message": "Здравствуйте, хочу разместить вакансию"
}
Response: 201
{
  "id": 123,
  "message": "Спасибо! Мы свяжемся с вами в ближайшее время."
}
```

### 4.2 App API Endpoints (Telegram Auth Required)

**Base Path:** `/api/app`

#### **Authentication**

```
POST /api/app/auth/telegram
Description: Authenticate user via Telegram initData
Request Body:
{
  "init_data": "query_id=...&user=%7B%22id%22...&auth_date=...&hash=..."
}
Response: 200
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "telegram_id": 123456789,
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "job_seeker",
    "language_code": "ru"
  }
}
```

```
POST /api/app/auth/refresh
Description: Refresh JWT token
Headers: Authorization: Bearer {token}
Response: 200
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "token_type": "bearer"
}
```

#### **User Management**

```
GET /api/app/users/me
Description: Get current user profile
Role: Any authenticated user
Response: 200
{
  "id": 1,
  "telegram_id": 123456789,
  "username": "john_doe",
  "role": "job_seeker",
  "language_code": "ru",
  "created_at": "2026-01-15T10:00:00Z"
}
```

```
PATCH /api/app/users/me/language
Description: Update user language preference
Request Body:
{
  "language_code": "uz"
}
Response: 200
{
  "language_code": "uz"
}
```

#### **Job Seeker Profile**

```
GET /api/app/job-seekers/profile
Description: Get job seeker's own profile
Role: job_seeker
Response: 200
{
  "id": 1,
  "full_name": "Анна Петрова",
  "photo_url": "https://...",
  "birth_date": "1995-05-15",
  "location": "Ташкент",
  "district": "Центральный район",
  "about_me": "Опытный воспитатель...",
  "desired_position": "Воспитатель",
  "desired_salary_min": 6000000,
  "desired_salary_max": 7000000,
  "experience_years": 5,
  "is_available": true,
  "rating": 4.9,
  "skills": ["Дошкольная педагогика", "Монтессори", "Английский язык"],
  "education": [
    {
      "id": 1,
      "institution": "Ташкентский педагогический университет",
      "degree": "Бакалавр",
      "field_of_study": "Дошкольное образование",
      "start_year": 2013,
      "end_year": 2017
    }
  ],
  "experience": [
    {
      "id": 1,
      "position": "Воспитатель",
      "company_name": "Детский сад №15",
      "start_date": "2017-09-01",
      "end_date": "2022-06-30",
      "is_current": false,
      "description": "Работа с детьми 3-4 лет"
    }
  ]
}
```

```
PUT /api/app/job-seekers/profile
Description: Update job seeker profile
Role: job_seeker
Request Body:
{
  "full_name": "Анна Петрова",
  "birth_date": "1995-05-15",
  "location": "Ташкент",
  "district": "Центральный район",
  "about_me": "Опытный воспитатель...",
  "desired_position": "Воспитатель",
  "desired_salary_min": 6000000,
  "desired_salary_max": 7000000,
  "is_available": true
}
Response: 200
{
  "id": 1,
  "full_name": "Анна Петрова",
  ...
}
```

```
POST /api/app/job-seekers/profile/photo
Description: Upload profile photo
Role: job_seeker
Request: multipart/form-data with 'file' field
Response: 200
{
  "photo_url": "https://..."
}
```

```
POST /api/app/job-seekers/profile/skills
Description: Add skill
Role: job_seeker
Request Body:
{
  "skill_name": "Английский язык"
}
Response: 201
{
  "id": 5,
  "skill_name": "Английский язык"
}
```

```
DELETE /api/app/job-seekers/profile/skills/{id}
Description: Remove skill
Role: job_seeker
Response: 204
```

```
POST /api/app/job-seekers/profile/education
Description: Add education record
Role: job_seeker
Request Body:
{
  "institution": "Ташкентский педагогический университет",
  "degree": "Бакалавр",
  "field_of_study": "Дошкольное образование",
  "start_year": 2013,
  "end_year": 2017,
  "is_current": false
}
Response: 201
{
  "id": 1,
  "institution": "Ташкентский педагогический университет",
  ...
}
```

```
PUT /api/app/job-seekers/profile/education/{id}
Description: Update education record
Role: job_seeker
Response: 200
```

```
DELETE /api/app/job-seekers/profile/education/{id}
Description: Delete education record
Role: job_seeker
Response: 204
```

```
POST /api/app/job-seekers/profile/experience
Description: Add experience record
Role: job_seeker
Request Body:
{
  "position": "Воспитатель",
  "company_name": "Детский сад №15",
  "start_date": "2017-09-01",
  "end_date": "2022-06-30",
  "is_current": false,
  "description": "Работа с детьми 3-4 лет"
}
Response: 201
```

```
PUT /api/app/job-seekers/profile/experience/{id}
Description: Update experience record
Role: job_seeker
Response: 200
```

```
DELETE /api/app/job-seekers/profile/experience/{id}
Description: Delete experience record
Role: job_seeker
Response: 204
```

#### **Kindergarten Employer Profile**

```
GET /api/app/kindergarten/profile
Description: Get kindergarten employer profile and kindergarten details
Role: kindergarten_employer
Response: 200
{
  "employer": {
    "id": 1,
    "full_name": "Мария Иванова",
    "position": "Директор",
    "photo_url": "https://..."
  },
  "kindergarten": {
    "id": 1,
    "name": "Детский сад «Солнышко»",
    "logo_url": "https://...",
    "district": "Центральный район",
    "address": "ул. Пушкина, 15",
    "phone": "+998901234567",
    "email": "info@solnyshko.uz",
    "description": "Современный детский сад...",
    "verified": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

```
PUT /api/app/kindergarten/profile
Description: Update kindergarten profile
Role: kindergarten_employer
Request Body:
{
  "name": "Детский сад «Солнышко»",
  "district": "Центральный район",
  "address": "ул. Пушкина, 15",
  "phone": "+998901234567",
  "email": "info@solnyshko.uz",
  "description": "Современный детский сад..."
}
Response: 200
```

```
POST /api/app/kindergarten/profile/logo
Description: Upload kindergarten logo
Role: kindergarten_employer
Request: multipart/form-data with 'file' field
Response: 200
{
  "logo_url": "https://..."
}
```

#### **Vacancies (Job Seeker View)**

```
GET /api/app/vacancies
Description: Get vacancies for job seeker (with auth context)
Role: job_seeker
Query Params:
  - search: string (optional)
  - district: string (optional)
  - employment_type: string (optional)
  - salary_min: integer (optional)
  - salary_max: integer (optional)
  - page: integer (default: 1)
  - limit: integer (default: 20)
Response: 200
{
  "data": [
    {
      "id": 1,
      "title": "Воспитатель младшей группы",
      "kindergarten": {...},
      "salary_min": 6000000,
      "salary_max": 7000000,
      "district": "Центральный район",
      "is_saved": true, // Based on current user
      "has_applied": false, // Based on current user
      "published_at": "2026-03-01T10:00:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "pages": 8
}
```

```
GET /api/app/vacancies/{id}
Description: Get vacancy details (with auth context)
Role: job_seeker
Response: 200
{
  "id": 1,
  "title": "Воспитатель младшей группы",
  "description": "...",
  "requirements": "...",
  "kindergarten": {...},
  "is_saved": true,
  "has_applied": false,
  "application": null, // or application object if exists
  ...
}
```

#### **Saved Vacancies**

```
GET /api/app/saved-vacancies
Description: Get user's saved vacancies
Role: job_seeker
Query Params:
  - page: integer (default: 1)
  - limit: integer (default: 20)
Response: 200
{
  "data": [
    {
      "id": 1,
      "vacancy": {...},
      "saved_at": "2026-03-01T10:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "pages": 1
}
```

```
POST /api/app/saved-vacancies
Description: Save/bookmark a vacancy
Role: job_seeker
Request Body:
{
  "vacancy_id": 1
}
Response: 201
{
  "id": 1,
  "vacancy_id": 1,
  "saved_at": "2026-03-01T10:00:00Z"
}
```

```
DELETE /api/app/saved-vacancies/{vacancy_id}
Description: Remove saved vacancy
Role: job_seeker
Response: 204
```

#### **Applications (Job Seeker View)**

```
GET /api/app/applications
Description: Get job seeker's applications
Role: job_seeker
Query Params:
  - status: string (optional) - 'pending', 'viewed', 'shortlisted', 'rejected', 'accepted'
  - page: integer (default: 1)
  - limit: integer (default: 20)
Response: 200
{
  "data": [
    {
      "id": 1,
      "vacancy": {
        "id": 1,
        "title": "Воспитатель младшей группы",
        "kindergarten": {...}
      },
      "cover_letter": "Здравствуйте...",
      "status": "viewed",
      "created_at": "2026-02-28T10:00:00Z",
      "viewed_at": "2026-02-28T14:30:00Z",
      "responded_at": null
    }
  ],
  "total": 8,
  "page": 1,
  "pages": 1
}
```

```
GET /api/app/applications/{id}
Description: Get application details
Role: job_seeker (owner only)
Response: 200
{
  "id": 1,
  "vacancy": {...},
  "cover_letter": "Здравствуйте...",
  "status": "viewed",
  "created_at": "2026-02-28T10:00:00Z",
  "viewed_at": "2026-02-28T14:30:00Z",
  "responded_at": null
}
```

```
POST /api/app/applications
Description: Submit application to vacancy
Role: job_seeker
Request Body:
{
  "vacancy_id": 1,
  "cover_letter": "Здравствуйте, я хотела бы..."
}
Response: 201
{
  "id": 1,
  "vacancy_id": 1,
  "status": "pending",
  "created_at": "2026-03-01T10:00:00Z"
}
```

```
PATCH /api/app/applications/{id}/withdraw
Description: Withdraw application
Role: job_seeker (owner only)
Response: 200
{
  "id": 1,
  "status": "withdrawn",
  "updated_at": "2026-03-02T10:00:00Z"
}
```

#### **Vacancies (Employer View)**

```
GET /api/app/kindergarten/vacancies
Description: Get kindergarten's own vacancies
Role: kindergarten_employer
Query Params:
  - status: string (optional) - 'active', 'paused', 'closed', 'filled'
  - page: integer (default: 1)
  - limit: integer (default: 20)
Response: 200
{
  "data": [
    {
      "id": 1,
      "title": "Воспитатель младшей группы",
      "salary_min": 6000000,
      "salary_max": 7000000,
      "district": "Центральный район",
      "status": "active",
      "views_count": 247,
      "applications_count": 12,
      "published_at": "2026-03-01T10:00:00Z",
      "created_at": "2026-03-01T10:00:00Z"
    }
  ],
  "total": 4,
  "page": 1,
  "pages": 1
}
```

```
GET /api/app/kindergarten/vacancies/{id}
Description: Get vacancy details (employer view with analytics)
Role: kindergarten_employer (own vacancy only)
Response: 200
{
  "id": 1,
  "title": "Воспитатель младшей группы",
  "description": "...",
  "requirements": "...",
  "responsibilities": "...",
  "salary_min": 6000000,
  "salary_max": 7000000,
  "district": "Центральный район",
  "employment_type": "full_time",
  "status": "active",
  "views_count": 247,
  "applications_count": 12,
  "published_at": "2026-03-01T10:00:00Z",
  "expires_at": "2026-04-01T10:00:00Z",
  "created_at": "2026-03-01T10:00:00Z"
}
```

```
POST /api/app/kindergarten/vacancies
Description: Create new vacancy
Role: kindergarten_employer
Request Body:
{
  "title": "Воспитатель младшей группы",
  "description": "Требуется воспитатель...",
  "requirements": "Высшее педагогическое образование...",
  "responsibilities": "Проведение занятий...",
  "salary_min": 6000000,
  "salary_max": 7000000,
  "district": "Центральный район",
  "employment_type": "full_time",
  "expires_at": "2026-04-01T10:00:00Z"
}
Response: 201
{
  "id": 1,
  "title": "Воспитатель младшей группы",
  "status": "active",
  "published_at": "2026-03-01T10:00:00Z",
  ...
}
```

```
PUT /api/app/kindergarten/vacancies/{id}
Description: Update vacancy
Role: kindergarten_employer (own vacancy only)
Request Body: Same as POST
Response: 200
```

```
PATCH /api/app/kindergarten/vacancies/{id}/status
Description: Change vacancy status
Role: kindergarten_employer (own vacancy only)
Request Body:
{
  "status": "paused" // or 'active', 'closed', 'filled'
}
Response: 200
{
  "id": 1,
  "status": "paused",
  "updated_at": "2026-03-02T10:00:00Z"
}
```

```
DELETE /api/app/kindergarten/vacancies/{id}
Description: Delete vacancy (soft delete - set status to 'closed')
Role: kindergarten_employer (own vacancy only)
Response: 204
```

#### **Applications (Employer View)**

```
GET /api/app/kindergarten/applications
Description: Get applications to kindergarten's vacancies
Role: kindergarten_employer
Query Params:
  - vacancy_id: integer (optional)
  - status: string (optional)
  - page: integer (default: 1)
  - limit: integer (default: 20)
Response: 200
{
  "data": [
    {
      "id": 1,
      "vacancy": {
        "id": 1,
        "title": "Воспитатель младшей группы"
      },
      "candidate": {
        "id": 1,
        "full_name": "Анна Петрова",
        "photo_url": "https://...",
        "desired_position": "Воспитатель",
        "experience_years": 5,
        "desired_salary_min": 6000000,
        "rating": 4.9
      },
      "cover_letter": "Здравствуйте...",
      "status": "pending",
      "created_at": "2026-02-28T10:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "pages": 1
}
```

```
GET /api/app/kindergarten/applications/{id}
Description: Get application details with full candidate profile
Role: kindergarten_employer (own kindergarten only)
Response: 200
{
  "id": 1,
  "vacancy": {...},
  "candidate": {
    "id": 1,
    "full_name": "Анна Петрова",
    "photo_url": "https://...",
    "about_me": "...",
    "experience_years": 5,
    "rating": 4.9,
    "skills": [...],
    "education": [...],
    "experience": [...]
  },
  "cover_letter": "Здравствуйте...",
  "status": "pending",
  "notes": null,
  "created_at": "2026-02-28T10:00:00Z",
  "viewed_at": null
}
```

```
PATCH /api/app/kindergarten/applications/{id}/status
Description: Update application status
Role: kindergarten_employer (own kindergarten only)
Request Body:
{
  "status": "shortlisted", // or 'viewed', 'accepted', 'rejected'
  "notes": "Хороший кандидат, пригласить на собеседование"
}
Response: 200
{
  "id": 1,
  "status": "shortlisted",
  "notes": "Хороший кандидат...",
  "updated_at": "2026-03-01T10:00:00Z"
}
```

```
PATCH /api/app/kindergarten/applications/{id}/view
Description: Mark application as viewed
Role: kindergarten_employer (own kindergarten only)
Response: 200
{
  "id": 1,
  "viewed_at": "2026-03-01T10:00:00Z"
}
```

#### **Messages/Chats**

```
GET /api/app/chats
Description: Get user's chat list
Role: Any authenticated user
Response: 200
{
  "data": [
    {
      "id": 1,
      "participant": {
        "name": "Детский сад «Солнышко»",
        "photo_url": "https://...",
        "type": "kindergarten"
      },
      "last_message": "Здравствуйте, мы рассмотрели...",
      "last_message_at": "2026-03-01T15:30:00Z",
      "unread_count": 2,
      "created_at": "2026-02-28T10:00:00Z"
    }
  ]
}
```

```
GET /api/app/chats/{id}
Description: Get chat details
Role: Any authenticated user (participant only)
Response: 200
{
  "id": 1,
  "participant": {
    "name": "Детский сад «Солнышко»",
    "photo_url": "https://...",
    "type": "kindergarten"
  },
  "application_id": 1,
  "created_at": "2026-02-28T10:00:00Z"
}
```

```
GET /api/app/chats/{id}/messages
Description: Get messages in chat
Role: Any authenticated user (participant only)
Query Params:
  - before: timestamp (optional) - for pagination
  - limit: integer (default: 50)
Response: 200
{
  "data": [
    {
      "id": 1,
      "sender": {
        "id": 1,
        "name": "Анна Петрова",
        "type": "job_seeker"
      },
      "content": "Здравствуйте, хотела уточнить...",
      "is_read": true,
      "created_at": "2026-03-01T15:30:00Z"
    }
  ],
  "has_more": false
}
```

```
POST /api/app/chats/{id}/messages
Description: Send message in chat
Role: Any authenticated user (participant only)
Request Body:
{
  "content": "Здравствуйте, хотела уточнить..."
}
Response: 201
{
  "id": 1,
  "content": "Здравствуйте...",
  "created_at": "2026-03-01T15:30:00Z"
}
```

```
PATCH /api/app/chats/{id}/read
Description: Mark all messages in chat as read
Role: Any authenticated user (participant only)
Response: 200
{
  "unread_count": 0
}
```

#### **Notifications**

```
GET /api/app/notifications
Description: Get user notifications
Role: Any authenticated user
Query Params:
  - is_read: boolean (optional)
  - page: integer (default: 1)
  - limit: integer (default: 20)
Response: 200
{
  "data": [
    {
      "id": 1,
      "type": "application_viewed",
      "title": "Отклик просмотрен",
      "content": "Ваш отклик на вакансию 'Воспитатель' просмотрен работодателем",
      "related_id": 1,
      "is_read": false,
      "created_at": "2026-03-01T10:00:00Z"
    }
  ],
  "total": 15,
  "unread_count": 5,
  "page": 1,
  "pages": 1
}
```

```
PATCH /api/app/notifications/{id}/read
Description: Mark notification as read
Role: Any authenticated user (owner only)
Response: 200
{
  "id": 1,
  "is_read": true,
  "read_at": "2026-03-01T11:00:00Z"
}
```

```
PATCH /api/app/notifications/read-all
Description: Mark all notifications as read
Role: Any authenticated user
Response: 200
{
  "updated_count": 5
}
```

#### **Search (Employer - Find Candidates)**

```
GET /api/app/kindergarten/candidates
Description: Search for job seekers (candidates)
Role: kindergarten_employer
Query Params:
  - search: string (optional) - name or skills
  - position: string (optional)
  - district: string (optional)
  - experience_min: integer (optional)
  - salary_max: integer (optional)
  - is_available: boolean (optional)
  - page: integer (default: 1)
  - limit: integer (default: 20)
Response: 200
{
  "data": [
    {
      "id": 1,
      "full_name": "Анна Петрова",
      "photo_url": "https://...",
      "desired_position": "Воспитатель",
      "experience_years": 5,
      "location": "Центральный район",
      "desired_salary_min": 6000000,
      "desired_salary_max": 7000000,
      "rating": 4.9,
      "skills": ["Дошкольная педагогика", "Монтессори"],
      "is_available": true
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 3
}
```

```
GET /api/app/kindergarten/candidates/{id}
Description: View candidate profile
Role: kindergarten_employer
Response: 200
{
  "id": 1,
  "full_name": "Анна Петрова",
  "photo_url": "https://...",
  "about_me": "...",
  "experience_years": 5,
  "rating": 4.9,
  "skills": [...],
  "education": [...],
  "experience": [...],
  "has_invited": false // If employer has sent invitation
}
```

---

## 5. AUTHENTICATION & AUTHORIZATION

### 5.1 Telegram WebApp Authentication

#### **Flow:**

1. **User opens WebApp in Telegram**
   - Telegram sends `initData` string containing user info and hash
   
2. **Frontend sends initData to backend**
   ```
   POST /api/app/auth/telegram
   Body: { "init_data": "..." }
   ```

3. **Backend validates Telegram initData:**
   ```python
   import hmac
   import hashlib
   from urllib.parse import parse_qs
   
   def verify_telegram_webapp_data(init_data: str, bot_token: str) -> dict:
       """
       Verify Telegram WebApp initData according to official docs
       https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
       """
       try:
           parsed_data = parse_qs(init_data)
           hash_value = parsed_data.get('hash', [None])[0]
           
           if not hash_value:
               raise ValueError("No hash in initData")
           
           # Remove hash from data
           data_check_string = '\n'.join(
               f"{k}={v[0]}" for k, v in sorted(parsed_data.items()) if k != 'hash'
           )
           
           # Generate secret key
           secret_key = hmac.new(
               key=b"WebAppData",
               msg=bot_token.encode(),
               digestmod=hashlib.sha256
           ).digest()
           
           # Calculate hash
           calculated_hash = hmac.new(
               key=secret_key,
               msg=data_check_string.encode(),
               digestmod=hashlib.sha256
           ).hexdigest()
           
           # Verify hash
           if calculated_hash != hash_value:
               raise ValueError("Invalid hash")
           
           # Check auth_date (data should not be older than 1 hour)
           auth_date = int(parsed_data.get('auth_date', [0])[0])
           current_time = int(time.time())
           if current_time - auth_date > 3600:
               raise ValueError("Data is too old")
           
           # Parse user data
           import json
           user_data = json.loads(parsed_data.get('user', ['{}'])[0])
           
           return user_data
           
       except Exception as e:
           raise ValueError(f"Telegram data validation failed: {str(e)}")
   ```

4. **Create or update user in database:**
   ```python
   async def get_or_create_user(telegram_user: dict) -> User:
       user = await db.get_user_by_telegram_id(telegram_user['id'])
       
       if not user:
           user = await db.create_user(
               telegram_id=telegram_user['id'],
               username=telegram_user.get('username'),
               first_name=telegram_user.get('first_name'),
               last_name=telegram_user.get('last_name'),
               language_code=telegram_user.get('language_code', 'ru'),
               role='job_seeker'  # Default role, can be changed later
           )
       else:
           # Update user info if changed
           await db.update_user(
               user_id=user.id,
               username=telegram_user.get('username'),
               first_name=telegram_user.get('first_name'),
               last_name=telegram_user.get('last_name'),
               last_login=datetime.now()
           )
       
       return user
   ```

5. **Issue JWT token:**
   ```python
   from jose import jwt
   from datetime import datetime, timedelta
   
   def create_access_token(user_id: int, role: str) -> str:
       payload = {
           "user_id": user_id,
           "role": role,
           "exp": datetime.utcnow() + timedelta(days=30)
       }
       token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
       return token
   ```

6. **Return token to frontend**
   ```json
   {
     "access_token": "eyJhbGc...",
     "token_type": "bearer",
     "user": {...}
   }
   ```

### 5.2 Authentication Middleware

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Validate JWT token and return current user
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id: int = payload.get("user_id")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        user = await db.get_user_by_id(user_id)
        if user is None or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        return user
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


async def get_current_job_seeker(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Require user to be a job seeker
    """
    if current_user.role != "job_seeker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Job seeker role required."
        )
    return current_user


async def get_current_employer(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> tuple[User, KindergartenEmployer]:
    """
    Require user to be a kindergarten employer
    """
    if current_user.role != "kindergarten_employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employer role required."
        )
    
    employer = await db.get_employer_by_user_id(current_user.id)
    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found"
        )
    
    return current_user, employer
```

### 5.3 Role-Permission Matrix

| Endpoint                                  | Job Seeker | Employer | Public |
|-------------------------------------------|------------|----------|--------|
| GET /api/public/vacancies                 | ✅         | ✅       | ✅     |
| GET /api/public/vacancies/{id}            | ✅         | ✅       | ✅     |
| POST /api/public/contact                  | ✅         | ✅       | ✅     |
| POST /api/app/auth/telegram               | ✅         | ✅       | ❌     |
| GET /api/app/vacancies                    | ✅         | ❌       | ❌     |
| GET /api/app/saved-vacancies              | ✅         | ❌       | ❌     |
| POST /api/app/saved-vacancies             | ✅         | ❌       | ❌     |
| GET /api/app/applications                 | ✅         | ❌       | ❌     |
| POST /api/app/applications                | ✅         | ❌       | ❌     |
| GET /api/app/job-seekers/profile          | ✅         | ❌       | ❌     |
| PUT /api/app/job-seekers/profile          | ✅         | ❌       | ❌     |
| GET /api/app/kindergarten/profile         | ❌         | ✅       | ❌     |
| PUT /api/app/kindergarten/profile         | ❌         | ✅       | ❌     |
| GET /api/app/kindergarten/vacancies       | ❌         | ✅       | ❌     |
| POST /api/app/kindergarten/vacancies      | ❌         | ✅       | ❌     |
| GET /api/app/kindergarten/applications    | ❌         | ✅       | ❌     |
| GET /api/app/kindergarten/candidates      | ❌         | ✅       | ❌     |
| GET /api/app/chats                        | ✅         | ✅       | ❌     |
| POST /api/app/chats/{id}/messages         | ✅         | ✅       | ❌     |
| GET /api/app/notifications                | ✅         | ✅       | ❌     |

---

## 6. PROJECT STRUCTURE

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI app initialization
│   ├── config.py                    # Configuration (env variables)
│   │
│   ├── api/                         # API endpoints
│   │   ├── __init__.py
│   │   ├── public/                  # Public endpoints (no auth)
│   │   │   ├── __init__.py
│   │   │   ├── vacancies.py
│   │   │   └── contact.py
│   │   │
│   │   └── app/                     # Private endpoints (auth required)
│   │       ├── __init__.py
│   │       ├── auth.py              # Authentication
│   │       ├── users.py             # User management
│   │       ├── job_seekers.py       # Job seeker endpoints
│   │       ├── kindergarten.py      # Employer endpoints
│   │       ├── vacancies.py         # Vacancy endpoints
│   │       ├── applications.py      # Application endpoints
│   │       ├── chats.py             # Chat/messaging endpoints
│   │       └── notifications.py     # Notification endpoints
│   │
│   ├── models/                      # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── kindergarten.py
│   │   ├── job_seeker.py
│   │   ├── vacancy.py
│   │   ├── application.py
│   │   ├── chat.py
│   │   └── notification.py
│   │
│   ├── schemas/                     # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── kindergarten.py
│   │   ├── job_seeker.py
│   │   ├── vacancy.py
│   │   ├── application.py
│   │   ├── chat.py
│   │   └── notification.py
│   │
│   ├── services/                    # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── vacancy_service.py
│   │   ├── application_service.py
│   │   ├── chat_service.py
│   │   ├── notification_service.py
│   │   └── file_service.py          # File upload/storage
│   │
│   ├── repositories/                # Data access layer
│   │   ├── __init__.py
│   │   ├── user_repository.py
│   │   ├── kindergarten_repository.py
│   │   ├── job_seeker_repository.py
│   │   ├── vacancy_repository.py
│   │   ├── application_repository.py
│   │   └── chat_repository.py
│   │
│   ├── core/                        # Core functionality
│   │   ├── __init__.py
│   │   ├── database.py              # Database connection
│   │   ├── security.py              # JWT, password hashing
│   │   ├── telegram.py              # Telegram validation
│   │   └── cache.py                 # Redis cache
│   │
│   ├── dependencies/                # FastAPI dependencies
│   │   ├── __init__.py
│   │   ├── auth.py                  # Authentication dependencies
│   │   ├── database.py              # Database session
│   │   └── permissions.py           # Permission checks
│   │
│   ├── middleware/                  # Custom middleware
│   │   ├── __init__.py
│   │   ├── rate_limit.py            # Rate limiting
│   │   ├── logging.py               # Request logging
│   │   └── cors.py                  # CORS configuration
│   │
│   └── utils/                       # Utility functions
│       ├── __init__.py
│       ├── validators.py
│       ├── helpers.py
│       └── exceptions.py            # Custom exceptions
│
├── alembic/                         # Database migrations
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
│
├── tests/                           # Test suite
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_vacancies.py
│   └── test_applications.py
│
├── docker/                          # Docker configurations
│   ├── Dockerfile
│   ├── Dockerfile.worker            # For Celery workers
│   └── nginx.conf
│
├── .env.example                     # Environment variables template
├── .gitignore
├── docker-compose.yml               # Docker Compose configuration
├── requirements.txt                 # Python dependencies
└── README.md                        # Project documentation
```

---

## 7. SECURITY & PERFORMANCE

### 7.1 Rate Limiting

**Public Endpoints:**
- General: 100 requests per minute per IP
- Contact form: 5 requests per hour per IP
- Vacancy listing: 60 requests per minute per IP

**Private Endpoints:**
- General: 1000 requests per minute per user
- Message sending: 30 requests per minute per user
- Application submission: 10 requests per hour per user

**Implementation:**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/public/contact")
@limiter.limit("5/hour")
async def submit_contact_form(
    request: Request,
    form: ContactFormCreate
):
    ...
```

### 7.2 Input Validation

**Pydantic Models:**
```python
from pydantic import BaseModel, EmailStr, Field, validator

class VacancyCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=20, max_length=5000)
    salary_min: int = Field(..., ge=0, le=1000000000)
    salary_max: int = Field(..., ge=0, le=1000000000)
    
    @validator('salary_max')
    def salary_max_must_be_greater(cls, v, values):
        if 'salary_min' in values and v < values['salary_min']:
            raise ValueError('salary_max must be greater than salary_min')
        return v
```

### 7.3 Database Query Optimization

**Indexes:**
- Add indexes on frequently queried columns (telegram_id, status, created_at, etc.)
- Use composite indexes for multi-column queries
- Add indexes on foreign keys

**N+1 Problem Prevention:**
```python
from sqlalchemy.orm import selectinload, joinedload

# Load related data in single query
result = await db.execute(
    select(Vacancy)
    .options(joinedload(Vacancy.kindergarten))
    .where(Vacancy.status == 'active')
)
```

**Pagination:**
```python
async def get_vacancies_paginated(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20
) -> tuple[list[Vacancy], int]:
    offset = (page - 1) * limit
    
    # Get total count
    count_query = select(func.count()).select_from(Vacancy)
    total = await db.scalar(count_query)
    
    # Get paginated data
    query = select(Vacancy).offset(offset).limit(limit)
    result = await db.execute(query)
    vacancies = result.scalars().all()
    
    return vacancies, total
```

### 7.4 Caching Strategy

**Redis Caching:**

1. **Public vacancy listings** - Cache for 5 minutes
2. **Vacancy details** - Cache for 10 minutes
3. **User profile** - Cache for 30 minutes
4. **Kindergarten profile** - Cache for 1 hour

```python
import redis.asyncio as redis
import json

class CacheService:
    def __init__(self):
        self.redis = redis.from_url("redis://localhost:6379")
    
    async def get(self, key: str):
        value = await self.redis.get(key)
        return json.loads(value) if value else None
    
    async def set(self, key: str, value: any, expire: int = 300):
        await self.redis.setex(
            key,
            expire,
            json.dumps(value, default=str)
        )
    
    async def delete(self, key: str):
        await self.redis.delete(key)

# Usage
@app.get("/api/public/vacancies")
async def get_vacancies(cache: CacheService = Depends(get_cache)):
    cache_key = "public:vacancies:active"
    
    # Try cache first
    cached = await cache.get(cache_key)
    if cached:
        return cached
    
    # Query database
    vacancies = await vacancy_service.get_active_vacancies()
    
    # Store in cache
    await cache.set(cache_key, vacancies, expire=300)
    
    return vacancies
```

### 7.5 Background Tasks (Celery)

**Use Cases:**
- Send notifications after application status change
- Update vacancy statistics (views, applications count)
- Send daily digest emails
- Clean up expired vacancies

```python
from celery import Celery

celery_app = Celery('worker', broker='redis://localhost:6379/0')

@celery_app.task
def send_application_notification(application_id: int):
    """
    Send notification to employer when new application is received
    """
    application = get_application(application_id)
    notification = create_notification(
        user_id=application.vacancy.kindergarten.employer.user_id,
        type='application_received',
        title='Новый отклик',
        content=f'Получен новый отклик на вакансию "{application.vacancy.title}"',
        related_id=application_id
    )
    save_notification(notification)

# Trigger from API
@app.post("/api/app/applications")
async def create_application(...):
    application = await application_service.create(...)
    
    # Schedule background task
    send_application_notification.delay(application.id)
    
    return application
```

### 7.6 Logging Strategy

```python
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Log important events
logger.info(f"User {user.telegram_id} authenticated successfully")
logger.warning(f"Failed authentication attempt from IP {ip_address}")
logger.error(f"Database error: {str(e)}", exc_info=True)
```

---

## 8. DEPLOYMENT STRATEGY

### 8.1 Docker Compose Configuration

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kindergarten_jobs
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # FastAPI Backend
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:${DB_PASSWORD}@postgres:5432/kindergarten_jobs
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./app:/app/app
      - upload_files:/app/uploads

  # Celery Worker
  celery_worker:
    build:
      context: .
      dockerfile: docker/Dockerfile.worker
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:${DB_PASSWORD}@postgres:5432/kindergarten_jobs
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - redis
      - postgres
    volumes:
      - ./app:/app/app

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
  upload_files:
```

### 8.2 Environment Variables (.env)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/kindergarten_jobs

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-here-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200  # 30 days

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token-here

# File Storage
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=kindergarten-jobs
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# CORS
CORS_ORIGINS=https://your-frontend-domain.com,https://t.me

# Rate Limiting
RATE_LIMIT_ENABLED=true

# Logging
LOG_LEVEL=INFO
```

### 8.3 Production Deployment Checklist

**Security:**
- [ ] Change all default passwords
- [ ] Use strong SECRET_KEY (min 32 random characters)
- [ ] Enable HTTPS/TLS with valid SSL certificates
- [ ] Configure CORS properly (whitelist only trusted domains)
- [ ] Enable rate limiting on all endpoints
- [ ] Set up firewall rules (only expose necessary ports)
- [ ] Use environment variables for all sensitive data
- [ ] Enable database connection pooling
- [ ] Set up automated backups for PostgreSQL

**Performance:**
- [ ] Enable Redis caching
- [ ] Configure connection pooling (SQLAlchemy)
- [ ] Add database indexes
- [ ] Enable Gzip compression in Nginx
- [ ] Configure CDN for static files
- [ ] Set up Celery workers for background tasks

**Monitoring:**
- [ ] Set up application logging (centralized)
- [ ] Configure error tracking (Sentry)
- [ ] Set up performance monitoring (New Relic, DataDog)
- [ ] Configure database query monitoring
- [ ] Set up uptime monitoring
- [ ] Configure alerts for critical errors

**Infrastructure:**
- [ ] Use managed PostgreSQL (RDS, Cloud SQL)
- [ ] Use managed Redis (ElastiCache, MemoryStore)
- [ ] Deploy backend with auto-scaling (K8s, ECS)
- [ ] Set up load balancer
- [ ] Configure health checks
- [ ] Set up CI/CD pipeline

### 8.4 Recommended Production Stack

**Cloud Provider:** AWS / Google Cloud / DigitalOcean

**Architecture:**
```
┌─────────────┐
│  Cloudflare │ (CDN + DDoS Protection)
│   / nginx   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Load Balancer│
└──────┬──────┘
       │
       ├───────┬───────┬───────┐
       ▼       ▼       ▼       ▼
    [API]   [API]   [API]   [Worker]
    Instance Instance Instance (Celery)
       │       │       │       │
       └───────┴───────┴───────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
┌─────────────┐      ┌─────────────┐
│ PostgreSQL  │      │   Redis     │
│  (Managed)  │      │  (Managed)  │
└─────────────┘      └─────────────┘
       │
       ▼
┌─────────────┐
│     S3      │
│ (File Store)│
└─────────────┘
```

---

## 9. ADDITIONAL CONSIDERATIONS

### 9.1 Data Privacy & GDPR Compliance

- Store only necessary user data from Telegram
- Implement data export functionality
- Implement data deletion functionality
- Add privacy policy and terms of service
- Log all data access and modifications

### 9.2 Localization (i18n)

- Support Russian and Uzbek languages
- Store user language preference
- Return localized error messages
- Localize notification content

### 9.3 Analytics

**Track:**
- Vacancy views
- Application conversion rates
- User engagement metrics
- Search queries
- Popular districts/positions

### 9.4 Future Enhancements

- **Payment Integration**: Premium listings for employers
- **Video Resumes**: Allow job seekers to upload video introductions
- **Interview Scheduling**: Built-in calendar for scheduling interviews
- **Document Upload**: Support for certificates, diplomas
- **Push Notifications**: Via Telegram Bot API
- **Advanced Search**: AI-powered candidate matching
- **Referral System**: Reward users for referring others

---

## 10. SUMMARY

This backend specification provides a complete production-ready architecture for a Telegram WebApp-based job search platform connecting kindergarten staff with employers.

**Key Features:**
✅ Dual role system (Job Seekers & Employers)  
✅ Telegram authentication (no email/password)  
✅ Multi-tenant architecture (data isolation per kindergarten)  
✅ Real-time messaging between candidates and employers  
✅ Application tracking with status workflows  
✅ Advanced search and filtering  
✅ Notification system  
✅ File upload (photos, resumes)  
✅ Public landing page (SEO-friendly)  
✅ Rate limiting & security  
✅ Caching & performance optimization  
✅ Background tasks for async operations  
✅ Production-ready deployment strategy  

**Tech Stack:**
- FastAPI + PostgreSQL + Redis
- SQLAlchemy (async) + Pydantic v2
- Telegram WebApp authentication
- JWT for session management
- Docker + Docker Compose
- Celery for background tasks
- S3 for file storage

**Next Steps:**
1. Review and approve this specification
2. Set up development environment
3. Initialize project structure
4. Create database migrations (Alembic)
5. Implement authentication layer
6. Implement core business logic
7. Write comprehensive tests
8. Set up CI/CD pipeline
9. Deploy to staging environment
10. Security audit
11. Load testing
12. Production deployment

---

**Questions or clarifications needed:**
- Do you need payment integration for premium listings?
- Should we implement video call functionality for interviews?
- Any specific compliance requirements (GDPR, local regulations)?
- Expected scale (concurrent users, data volume)?
