# Database Implementation Prompt
## PostgreSQL Database for Kindergarten Job Search Platform (Telegram WebApp)

---

## 🎯 OBJECTIVE

Implement a production-ready PostgreSQL database for a Telegram WebApp-based job search platform connecting kindergarten staff (job seekers) with kindergarten employers.

---

## 📊 SYSTEM REQUIREMENTS

### Database Server
- **PostgreSQL Version**: 15.x or higher
- **Encoding**: UTF8
- **Collation**: en_US.UTF-8
- **Timezone**: UTC

### Architecture Requirements
- **Multi-tenant**: Kindergartens are isolated tenants
- **Authentication**: Telegram-based (no email/password)
- **Scalability**: Support for 100,000+ users, 10,000+ kindergartens
- **Performance**: Sub-100ms query response time
- **Data Integrity**: ACID compliance, referential integrity

---

## 🗂️ DATABASE SCHEMA

### 1. CREATE DATABASE AND EXTENSIONS

```sql
-- Create database
CREATE DATABASE kindergarten_jobs
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

\c kindergarten_jobs

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram search for full-text
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- For multi-column indexes
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query performance monitoring
```

---

### 2. CREATE ENUM TYPES

```sql
-- User roles
CREATE TYPE user_role AS ENUM (
    'job_seeker',
    'kindergarten_employer',
    'admin'
);

-- Vacancy statuses
CREATE TYPE vacancy_status AS ENUM (
    'draft',
    'active',
    'paused',
    'closed',
    'filled'
);

-- Employment types
CREATE TYPE employment_type AS ENUM (
    'full_time',
    'part_time',
    'contract',
    'internship',
    'temporary'
);

-- Application statuses
CREATE TYPE application_status AS ENUM (
    'pending',
    'viewed',
    'shortlisted',
    'interview_scheduled',
    'rejected',
    'accepted',
    'withdrawn'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
    'application_received',
    'application_viewed',
    'application_status_changed',
    'application_accepted',
    'application_rejected',
    'new_message',
    'vacancy_status_changed',
    'profile_viewed',
    'system'
);

-- Gender
CREATE TYPE gender_type AS ENUM (
    'male',
    'female',
    'other',
    'prefer_not_to_say'
);

-- Message status
CREATE TYPE message_status AS ENUM (
    'sent',
    'delivered',
    'read'
);
```

---

### 3. CREATE TABLES

#### 3.1 Users Table (Core user authentication)

```sql
CREATE TABLE users (
    id                  SERIAL PRIMARY KEY,
    telegram_id         BIGINT UNIQUE NOT NULL,
    username            VARCHAR(255),
    first_name          VARCHAR(255),
    last_name           VARCHAR(255),
    photo_url           TEXT,
    language_code       VARCHAR(10) DEFAULT 'ru' NOT NULL,
    role                user_role NOT NULL,
    is_active           BOOLEAN DEFAULT true NOT NULL,
    is_verified         BOOLEAN DEFAULT false NOT NULL,
    last_login_at       TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_telegram_id_positive CHECK (telegram_id > 0),
    CONSTRAINT chk_language_code_length CHECK (length(language_code) <= 10)
);

-- Indexes
CREATE UNIQUE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role) WHERE is_active = true;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_last_login ON users(last_login_at DESC NULLS LAST);

-- Comments
COMMENT ON TABLE users IS 'Main user authentication table - all users authenticated via Telegram';
COMMENT ON COLUMN users.telegram_id IS 'Unique Telegram user ID from Telegram API';
COMMENT ON COLUMN users.role IS 'User role: job_seeker, kindergarten_employer, or admin';
COMMENT ON COLUMN users.language_code IS 'User interface language preference (ru or uz)';
```

---

#### 3.2 Kindergartens Table (Tenant/Organization)

```sql
CREATE TABLE kindergartens (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) UNIQUE,
    logo_url            TEXT,
    cover_image_url     TEXT,
    
    -- Location
    district            VARCHAR(255) NOT NULL,
    address             TEXT,
    latitude            DECIMAL(10, 8),
    longitude           DECIMAL(11, 8),
    
    -- Contact
    phone               VARCHAR(50),
    email               VARCHAR(255),
    website             VARCHAR(500),
    
    -- Details
    description         TEXT,
    established_year    INTEGER,
    total_staff         INTEGER DEFAULT 0,
    capacity            INTEGER,
    
    -- Status
    is_verified         BOOLEAN DEFAULT false NOT NULL,
    is_active           BOOLEAN DEFAULT true NOT NULL,
    is_premium          BOOLEAN DEFAULT false NOT NULL,
    
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_kindergarten_name_length CHECK (length(name) >= 3),
    CONSTRAINT chk_kindergarten_phone_format CHECK (phone ~ '^\+?[0-9]{7,15}$'),
    CONSTRAINT chk_kindergarten_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT chk_kindergarten_year CHECK (established_year >= 1900 AND established_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    CONSTRAINT chk_kindergarten_staff CHECK (total_staff >= 0),
    CONSTRAINT chk_kindergarten_capacity CHECK (capacity >= 0)
);

-- Indexes
CREATE UNIQUE INDEX idx_kindergartens_slug ON kindergartens(slug);
CREATE INDEX idx_kindergartens_district ON kindergartens(district) WHERE is_active = true;
CREATE INDEX idx_kindergartens_verified ON kindergartens(is_verified, is_active);
CREATE INDEX idx_kindergartens_premium ON kindergartens(is_premium, is_active) WHERE is_premium = true;
CREATE INDEX idx_kindergartens_location ON kindergartens USING gist(point(longitude, latitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_kindergartens_name_trgm ON kindergartens USING gin(name gin_trgm_ops);

-- Comments
COMMENT ON TABLE kindergartens IS 'Kindergarten organizations (tenants) - employers in the system';
COMMENT ON COLUMN kindergartens.slug IS 'URL-friendly unique identifier for public profile';
COMMENT ON COLUMN kindergartens.is_verified IS 'Kindergarten verified by admin (blue checkmark)';
COMMENT ON COLUMN kindergartens.is_premium IS 'Premium subscription for featured listings';
```

---

#### 3.3 Kindergarten Employers Table (Employer profiles)

```sql
CREATE TABLE kindergarten_employers (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kindergarten_id     INTEGER NOT NULL REFERENCES kindergartens(id) ON DELETE CASCADE,
    
    -- Profile
    full_name           VARCHAR(255) NOT NULL,
    position            VARCHAR(255),
    photo_url           TEXT,
    
    -- Permissions
    can_create_vacancy  BOOLEAN DEFAULT true NOT NULL,
    can_view_applications BOOLEAN DEFAULT true NOT NULL,
    can_message_candidates BOOLEAN DEFAULT true NOT NULL,
    is_primary_contact  BOOLEAN DEFAULT false NOT NULL,
    
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_employer_name_length CHECK (length(full_name) >= 2)
);

-- Indexes
CREATE UNIQUE INDEX idx_kindergarten_employers_user ON kindergarten_employers(user_id);
CREATE INDEX idx_kindergarten_employers_kindergarten ON kindergarten_employers(kindergarten_id);
CREATE INDEX idx_kindergarten_employers_primary ON kindergarten_employers(kindergarten_id, is_primary_contact) WHERE is_primary_contact = true;

-- Comments
COMMENT ON TABLE kindergarten_employers IS 'Employer profiles linked to kindergarten organizations';
COMMENT ON COLUMN kindergarten_employers.is_primary_contact IS 'Main contact person for the kindergarten';
```

---

#### 3.4 Job Seeker Profiles Table

```sql
CREATE TABLE job_seeker_profiles (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal Info
    full_name           VARCHAR(255) NOT NULL,
    photo_url           TEXT,
    birth_date          DATE,
    gender              gender_type,
    
    -- Location
    location            VARCHAR(255),
    district            VARCHAR(255),
    
    -- Professional Info
    about_me            TEXT,
    desired_position    VARCHAR(255),
    desired_salary_min  INTEGER,
    desired_salary_max  INTEGER,
    experience_years    INTEGER DEFAULT 0 NOT NULL,
    
    -- Status
    is_available        BOOLEAN DEFAULT true NOT NULL,
    is_open_to_remote   BOOLEAN DEFAULT false NOT NULL,
    rating              DECIMAL(3,2) DEFAULT 0.0 NOT NULL,
    profile_views       INTEGER DEFAULT 0 NOT NULL,
    
    -- Resume
    resume_url          TEXT,
    video_resume_url    TEXT,
    
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_job_seeker_name_length CHECK (length(full_name) >= 2),
    CONSTRAINT chk_job_seeker_birth_date CHECK (birth_date <= CURRENT_DATE - INTERVAL '16 years'),
    CONSTRAINT chk_job_seeker_salary_min CHECK (desired_salary_min >= 0),
    CONSTRAINT chk_job_seeker_salary_max CHECK (desired_salary_max >= 0),
    CONSTRAINT chk_job_seeker_salary_order CHECK (desired_salary_max >= desired_salary_min OR desired_salary_max IS NULL OR desired_salary_min IS NULL),
    CONSTRAINT chk_job_seeker_experience CHECK (experience_years >= 0 AND experience_years <= 70),
    CONSTRAINT chk_job_seeker_rating CHECK (rating >= 0.0 AND rating <= 5.0),
    CONSTRAINT chk_job_seeker_views CHECK (profile_views >= 0)
);

-- Indexes
CREATE UNIQUE INDEX idx_job_seeker_profiles_user ON job_seeker_profiles(user_id);
CREATE INDEX idx_job_seeker_profiles_district ON job_seeker_profiles(district) WHERE is_available = true;
CREATE INDEX idx_job_seeker_profiles_available ON job_seeker_profiles(is_available, experience_years DESC);
CREATE INDEX idx_job_seeker_profiles_position ON job_seeker_profiles(desired_position) WHERE is_available = true;
CREATE INDEX idx_job_seeker_profiles_salary ON job_seeker_profiles(desired_salary_min, desired_salary_max) WHERE is_available = true;
CREATE INDEX idx_job_seeker_profiles_rating ON job_seeker_profiles(rating DESC, profile_views DESC);
CREATE INDEX idx_job_seeker_profiles_name_trgm ON job_seeker_profiles USING gin(full_name gin_trgm_ops);

-- Comments
COMMENT ON TABLE job_seeker_profiles IS 'Job seeker profiles with professional information';
COMMENT ON COLUMN job_seeker_profiles.rating IS 'Average rating from employers (0.0 to 5.0)';
COMMENT ON COLUMN job_seeker_profiles.is_available IS 'Currently looking for job opportunities';
```

---

#### 3.5 Skills Table

```sql
CREATE TABLE skills (
    id                  SERIAL PRIMARY KEY,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    skill_name          VARCHAR(255) NOT NULL,
    proficiency_level   INTEGER DEFAULT 3,
    years_of_experience INTEGER DEFAULT 0,
    is_verified         BOOLEAN DEFAULT false NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_skill_name_length CHECK (length(skill_name) >= 2),
    CONSTRAINT chk_skill_proficiency CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    CONSTRAINT chk_skill_experience CHECK (years_of_experience >= 0 AND years_of_experience <= 50),
    CONSTRAINT uq_job_seeker_skill UNIQUE (job_seeker_id, skill_name)
);

-- Indexes
CREATE INDEX idx_skills_job_seeker ON skills(job_seeker_id);
CREATE INDEX idx_skills_name ON skills(skill_name);
CREATE INDEX idx_skills_name_trgm ON skills USING gin(skill_name gin_trgm_ops);

-- Comments
COMMENT ON TABLE skills IS 'Job seeker skills and competencies';
COMMENT ON COLUMN skills.proficiency_level IS 'Skill level: 1=Beginner, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Expert';
```

---

#### 3.6 Education Records Table

```sql
CREATE TABLE education_records (
    id                  SERIAL PRIMARY KEY,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    
    institution         VARCHAR(255) NOT NULL,
    degree              VARCHAR(255),
    field_of_study      VARCHAR(255),
    
    start_year          INTEGER,
    end_year            INTEGER,
    is_current          BOOLEAN DEFAULT false NOT NULL,
    
    description         TEXT,
    gpa                 DECIMAL(4,2),
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_education_institution_length CHECK (length(institution) >= 3),
    CONSTRAINT chk_education_start_year CHECK (start_year >= 1950 AND start_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    CONSTRAINT chk_education_end_year CHECK (end_year >= start_year OR end_year IS NULL),
    CONSTRAINT chk_education_gpa CHECK (gpa >= 0.0 AND gpa <= 5.0)
);

-- Indexes
CREATE INDEX idx_education_records_job_seeker ON education_records(job_seeker_id);
CREATE INDEX idx_education_records_dates ON education_records(start_year DESC, end_year DESC NULLS FIRST);

-- Comments
COMMENT ON TABLE education_records IS 'Educational background of job seekers';
```

---

#### 3.7 Experience Records Table

```sql
CREATE TABLE experience_records (
    id                  SERIAL PRIMARY KEY,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    
    position            VARCHAR(255) NOT NULL,
    company_name        VARCHAR(255) NOT NULL,
    company_location    VARCHAR(255),
    
    start_date          DATE NOT NULL,
    end_date            DATE,
    is_current          BOOLEAN DEFAULT false NOT NULL,
    
    description         TEXT,
    achievements        TEXT,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_experience_position_length CHECK (length(position) >= 2),
    CONSTRAINT chk_experience_company_length CHECK (length(company_name) >= 2),
    CONSTRAINT chk_experience_dates CHECK (end_date >= start_date OR end_date IS NULL),
    CONSTRAINT chk_experience_start_date CHECK (start_date <= CURRENT_DATE)
);

-- Indexes
CREATE INDEX idx_experience_records_job_seeker ON experience_records(job_seeker_id);
CREATE INDEX idx_experience_records_dates ON experience_records(start_date DESC, end_date DESC NULLS FIRST);
CREATE INDEX idx_experience_records_current ON experience_records(job_seeker_id, is_current) WHERE is_current = true;

-- Comments
COMMENT ON TABLE experience_records IS 'Work experience history of job seekers';
```

---

#### 3.8 Vacancies Table (Core job postings)

```sql
CREATE TABLE vacancies (
    id                  SERIAL PRIMARY KEY,
    kindergarten_id     INTEGER NOT NULL REFERENCES kindergartens(id) ON DELETE CASCADE,
    
    -- Job Details
    title               VARCHAR(255) NOT NULL,
    description         TEXT NOT NULL,
    requirements        TEXT,
    responsibilities    TEXT,
    benefits            TEXT,
    
    -- Salary
    salary_min          INTEGER,
    salary_max          INTEGER,
    salary_currency     VARCHAR(3) DEFAULT 'UZS' NOT NULL,
    
    -- Location
    district            VARCHAR(255),
    is_remote_allowed   BOOLEAN DEFAULT false NOT NULL,
    
    -- Employment
    employment_type     employment_type DEFAULT 'full_time' NOT NULL,
    positions_available INTEGER DEFAULT 1 NOT NULL,
    
    -- Status
    status              vacancy_status DEFAULT 'draft' NOT NULL,
    
    -- Visibility
    is_featured         BOOLEAN DEFAULT false NOT NULL,
    is_urgent           BOOLEAN DEFAULT false NOT NULL,
    
    -- Statistics
    views_count         INTEGER DEFAULT 0 NOT NULL,
    applications_count  INTEGER DEFAULT 0 NOT NULL,
    saves_count         INTEGER DEFAULT 0 NOT NULL,
    
    -- Dates
    published_at        TIMESTAMP WITH TIME ZONE,
    expires_at          TIMESTAMP WITH TIME ZONE,
    closed_at           TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_vacancy_title_length CHECK (length(title) >= 5),
    CONSTRAINT chk_vacancy_description_length CHECK (length(description) >= 20),
    CONSTRAINT chk_vacancy_salary_min CHECK (salary_min >= 0),
    CONSTRAINT chk_vacancy_salary_max CHECK (salary_max >= 0),
    CONSTRAINT chk_vacancy_salary_order CHECK (salary_max >= salary_min OR salary_max IS NULL OR salary_min IS NULL),
    CONSTRAINT chk_vacancy_positions CHECK (positions_available > 0),
    CONSTRAINT chk_vacancy_views CHECK (views_count >= 0),
    CONSTRAINT chk_vacancy_applications CHECK (applications_count >= 0),
    CONSTRAINT chk_vacancy_saves CHECK (saves_count >= 0),
    CONSTRAINT chk_vacancy_expires CHECK (expires_at > published_at OR expires_at IS NULL)
);

-- Indexes
CREATE INDEX idx_vacancies_kindergarten ON vacancies(kindergarten_id);
CREATE INDEX idx_vacancies_status ON vacancies(status) WHERE status IN ('active', 'paused');
CREATE INDEX idx_vacancies_district ON vacancies(district) WHERE status = 'active';
CREATE INDEX idx_vacancies_published ON vacancies(published_at DESC NULLS LAST) WHERE status = 'active';
CREATE INDEX idx_vacancies_featured ON vacancies(is_featured, published_at DESC) WHERE is_featured = true AND status = 'active';
CREATE INDEX idx_vacancies_urgent ON vacancies(is_urgent, published_at DESC) WHERE is_urgent = true AND status = 'active';
CREATE INDEX idx_vacancies_expires ON vacancies(expires_at) WHERE expires_at IS NOT NULL AND status = 'active';
CREATE INDEX idx_vacancies_employment ON vacancies(employment_type) WHERE status = 'active';
CREATE INDEX idx_vacancies_salary ON vacancies(salary_min, salary_max) WHERE status = 'active';
CREATE INDEX idx_vacancies_title_trgm ON vacancies USING gin(title gin_trgm_ops);
CREATE INDEX idx_vacancies_search ON vacancies USING gin(to_tsvector('russian', title || ' ' || COALESCE(description, '')));

-- Comments
COMMENT ON TABLE vacancies IS 'Job vacancies posted by kindergartens';
COMMENT ON COLUMN vacancies.is_featured IS 'Featured/TOP listing (premium feature)';
COMMENT ON COLUMN vacancies.is_urgent IS 'Urgent hiring (marked with badge)';
```

---

#### 3.9 Applications Table (Job applications)

```sql
CREATE TABLE applications (
    id                  SERIAL PRIMARY KEY,
    vacancy_id          INTEGER NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    
    -- Application Content
    cover_letter        TEXT,
    resume_url          TEXT,
    
    -- Status
    status              application_status DEFAULT 'pending' NOT NULL,
    
    -- Employer Notes
    employer_notes      TEXT,
    employer_rating     INTEGER,
    
    -- Timeline
    viewed_at           TIMESTAMP WITH TIME ZONE,
    responded_at        TIMESTAMP WITH TIME ZONE,
    interview_date      TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_application_rating CHECK (employer_rating >= 1 AND employer_rating <= 5),
    CONSTRAINT uq_application_vacancy_seeker UNIQUE (vacancy_id, job_seeker_id)
);

-- Indexes
CREATE INDEX idx_applications_vacancy ON applications(vacancy_id, status);
CREATE INDEX idx_applications_job_seeker ON applications(job_seeker_id, status);
CREATE INDEX idx_applications_status ON applications(status, created_at DESC);
CREATE INDEX idx_applications_created ON applications(created_at DESC);
CREATE INDEX idx_applications_pending ON applications(vacancy_id, status) WHERE status = 'pending';
CREATE INDEX idx_applications_viewed_at ON applications(viewed_at DESC NULLS LAST);

-- Comments
COMMENT ON TABLE applications IS 'Job applications from seekers to vacancies';
COMMENT ON COLUMN applications.employer_rating IS 'Employer rating of candidate after interview (1-5 stars)';
```

---

#### 3.10 Saved Vacancies Table (Bookmarks)

```sql
CREATE TABLE saved_vacancies (
    id                  SERIAL PRIMARY KEY,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    vacancy_id          INTEGER NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT uq_saved_vacancy_seeker UNIQUE (job_seeker_id, vacancy_id)
);

-- Indexes
CREATE INDEX idx_saved_vacancies_job_seeker ON saved_vacancies(job_seeker_id, created_at DESC);
CREATE INDEX idx_saved_vacancies_vacancy ON saved_vacancies(vacancy_id);

-- Comments
COMMENT ON TABLE saved_vacancies IS 'Bookmarked/saved vacancies by job seekers';
```

---

#### 3.11 Chats Table (Message threads)

```sql
CREATE TABLE chats (
    id                  SERIAL PRIMARY KEY,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    kindergarten_id     INTEGER NOT NULL REFERENCES kindergartens(id) ON DELETE CASCADE,
    application_id      INTEGER REFERENCES applications(id) ON DELETE SET NULL,
    
    -- Last Message Cache
    last_message_content TEXT,
    last_message_at     TIMESTAMP WITH TIME ZONE,
    last_message_sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Unread Counts
    unread_by_seeker    INTEGER DEFAULT 0 NOT NULL,
    unread_by_employer  INTEGER DEFAULT 0 NOT NULL,
    
    -- Status
    is_archived_by_seeker   BOOLEAN DEFAULT false NOT NULL,
    is_archived_by_employer BOOLEAN DEFAULT false NOT NULL,
    is_blocked          BOOLEAN DEFAULT false NOT NULL,
    
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_chat_unread_seeker CHECK (unread_by_seeker >= 0),
    CONSTRAINT chk_chat_unread_employer CHECK (unread_by_employer >= 0),
    CONSTRAINT uq_chat_participants UNIQUE (job_seeker_id, kindergarten_id)
);

-- Indexes
CREATE INDEX idx_chats_job_seeker ON chats(job_seeker_id, last_message_at DESC NULLS LAST);
CREATE INDEX idx_chats_kindergarten ON chats(kindergarten_id, last_message_at DESC NULLS LAST);
CREATE INDEX idx_chats_last_message ON chats(last_message_at DESC NULLS LAST);
CREATE INDEX idx_chats_unread_seeker ON chats(job_seeker_id, unread_by_seeker) WHERE unread_by_seeker > 0;
CREATE INDEX idx_chats_unread_employer ON chats(kindergarten_id, unread_by_employer) WHERE unread_by_employer > 0;
CREATE INDEX idx_chats_application ON chats(application_id) WHERE application_id IS NOT NULL;

-- Comments
COMMENT ON TABLE chats IS 'Message threads between job seekers and kindergartens';
COMMENT ON COLUMN chats.last_message_content IS 'Cached last message for list view';
```

---

#### 3.12 Messages Table (Individual messages)

```sql
CREATE TABLE messages (
    id                  SERIAL PRIMARY KEY,
    chat_id             INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    content             TEXT NOT NULL,
    content_type        VARCHAR(50) DEFAULT 'text' NOT NULL,
    attachment_url      TEXT,
    
    -- Status
    status              message_status DEFAULT 'sent' NOT NULL,
    is_read             BOOLEAN DEFAULT false NOT NULL,
    read_at             TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    is_deleted          BOOLEAN DEFAULT false NOT NULL,
    deleted_at          TIMESTAMP WITH TIME ZONE,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_message_content_length CHECK (length(content) >= 1 AND length(content) <= 5000),
    CONSTRAINT chk_message_content_type CHECK (content_type IN ('text', 'image', 'file', 'voice', 'video'))
);

-- Indexes
CREATE INDEX idx_messages_chat ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(chat_id, is_read) WHERE is_read = false;
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Partitioning suggestion for large scale
-- Consider partitioning by created_at (monthly) if message volume exceeds 10M+

-- Comments
COMMENT ON TABLE messages IS 'Individual messages in chat threads';
COMMENT ON COLUMN messages.content_type IS 'Message type: text, image, file, voice, video';
```

---

#### 3.13 Notifications Table

```sql
CREATE TABLE notifications (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Data
    type                notification_type NOT NULL,
    title               VARCHAR(255) NOT NULL,
    content             TEXT NOT NULL,
    
    -- Related Entity
    related_entity_type VARCHAR(50),
    related_entity_id   INTEGER,
    
    -- Action URL
    action_url          TEXT,
    
    -- Status
    is_read             BOOLEAN DEFAULT false NOT NULL,
    read_at             TIMESTAMP WITH TIME ZONE,
    
    -- Delivery
    is_sent_telegram    BOOLEAN DEFAULT false NOT NULL,
    sent_telegram_at    TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at          TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT chk_notification_title_length CHECK (length(title) >= 1),
    CONSTRAINT chk_notification_related_type CHECK (
        related_entity_type IS NULL OR 
        related_entity_type IN ('application', 'vacancy', 'message', 'profile', 'chat')
    )
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type, created_at DESC);
CREATE INDEX idx_notifications_related ON notifications(related_entity_type, related_entity_id);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Comments
COMMENT ON TABLE notifications IS 'User notifications for various system events';
COMMENT ON COLUMN notifications.related_entity_type IS 'Type of related entity: application, vacancy, message, etc.';
```

---

#### 3.14 Contact Forms Table (Public landing submissions)

```sql
CREATE TABLE contact_forms (
    id                  SERIAL PRIMARY KEY,
    
    -- Contact Info
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255),
    phone               VARCHAR(50),
    
    -- Message
    subject             VARCHAR(255),
    message             TEXT NOT NULL,
    
    -- Metadata
    ip_address          INET,
    user_agent          TEXT,
    referrer            TEXT,
    
    -- Status
    is_processed        BOOLEAN DEFAULT false NOT NULL,
    processed_at        TIMESTAMP WITH TIME ZONE,
    processed_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    admin_notes         TEXT,
    
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_contact_name_length CHECK (length(name) >= 2),
    CONSTRAINT chk_contact_message_length CHECK (length(message) >= 10),
    CONSTRAINT chk_contact_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_contact_forms_processed ON contact_forms(is_processed, created_at DESC);
CREATE INDEX idx_contact_forms_created ON contact_forms(created_at DESC);
CREATE INDEX idx_contact_forms_ip ON contact_forms(ip_address, created_at DESC);

-- Comments
COMMENT ON TABLE contact_forms IS 'Contact form submissions from public landing page';
```

---

#### 3.15 Profile Views Table (Track who viewed whom)

```sql
CREATE TABLE profile_views (
    id                  SERIAL PRIMARY KEY,
    job_seeker_id       INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    viewer_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kindergarten_id     INTEGER REFERENCES kindergartens(id) ON DELETE CASCADE,
    
    -- Metadata
    viewed_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address          INET,
    
    -- Constraints
    CONSTRAINT chk_profile_view_not_self CHECK (
        viewer_id NOT IN (
            SELECT user_id FROM job_seeker_profiles WHERE id = job_seeker_id
        )
    )
);

-- Indexes
CREATE INDEX idx_profile_views_job_seeker ON profile_views(job_seeker_id, viewed_at DESC);
CREATE INDEX idx_profile_views_viewer ON profile_views(viewer_id, viewed_at DESC);
CREATE INDEX idx_profile_views_kindergarten ON profile_views(kindergarten_id, viewed_at DESC);
CREATE INDEX idx_profile_views_recent ON profile_views(viewed_at DESC);

-- Comments
COMMENT ON TABLE profile_views IS 'Track employer views of job seeker profiles';
```

---

#### 3.16 Audit Log Table (Track important changes)

```sql
CREATE TABLE audit_logs (
    id                  BIGSERIAL PRIMARY KEY,
    
    -- Actor
    user_id             INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action
    action              VARCHAR(100) NOT NULL,
    entity_type         VARCHAR(50) NOT NULL,
    entity_id           INTEGER NOT NULL,
    
    -- Changes
    old_values          JSONB,
    new_values          JSONB,
    
    -- Metadata
    ip_address          INET,
    user_agent          TEXT,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Consider partitioning by created_at (monthly) for large scale

-- Comments
COMMENT ON TABLE audit_logs IS 'Audit trail of important system changes';
```

---

### 4. CREATE FUNCTIONS AND TRIGGERS

#### 4.1 Updated At Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_kindergartens_updated_at
    BEFORE UPDATE ON kindergartens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_kindergarten_employers_updated_at
    BEFORE UPDATE ON kindergarten_employers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_job_seeker_profiles_updated_at
    BEFORE UPDATE ON job_seeker_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_education_records_updated_at
    BEFORE UPDATE ON education_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_experience_records_updated_at
    BEFORE UPDATE ON experience_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vacancies_updated_at
    BEFORE UPDATE ON vacancies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

#### 4.2 Update Application Count Trigger

```sql
CREATE OR REPLACE FUNCTION update_vacancy_applications_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE vacancies 
        SET applications_count = applications_count + 1 
        WHERE id = NEW.vacancy_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE vacancies 
        SET applications_count = GREATEST(0, applications_count - 1)
        WHERE id = OLD.vacancy_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vacancy_applications_count
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_vacancy_applications_count();
```

---

#### 4.3 Update Saved Vacancies Count Trigger

```sql
CREATE OR REPLACE FUNCTION update_vacancy_saves_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE vacancies 
        SET saves_count = saves_count + 1 
        WHERE id = NEW.vacancy_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE vacancies 
        SET saves_count = GREATEST(0, saves_count - 1)
        WHERE id = OLD.vacancy_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vacancy_saves_count
    AFTER INSERT OR DELETE ON saved_vacancies
    FOR EACH ROW
    EXECUTE FUNCTION update_vacancy_saves_count();
```

---

#### 4.4 Update Chat Last Message Trigger

```sql
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
DECLARE
    v_sender_role user_role;
BEGIN
    -- Get sender role
    SELECT u.role INTO v_sender_role
    FROM users u
    WHERE u.id = NEW.sender_id;
    
    -- Update chat
    UPDATE chats
    SET 
        last_message_content = NEW.content,
        last_message_at = NEW.created_at,
        last_message_sender_id = NEW.sender_id,
        unread_by_seeker = CASE 
            WHEN v_sender_role = 'kindergarten_employer' THEN unread_by_seeker + 1
            ELSE unread_by_seeker
        END,
        unread_by_employer = CASE 
            WHEN v_sender_role = 'job_seeker' THEN unread_by_employer + 1
            ELSE unread_by_employer
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.chat_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chat_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_last_message();
```

---

#### 4.5 Auto-expire Vacancies Function

```sql
CREATE OR REPLACE FUNCTION auto_expire_vacancies()
RETURNS void AS $$
BEGIN
    UPDATE vacancies
    SET 
        status = 'closed',
        closed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        status = 'active' 
        AND expires_at IS NOT NULL 
        AND expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Schedule this function to run daily via cron job or pg_cron extension
```

---

### 5. CREATE VIEWS (Useful pre-aggregated queries)

#### 5.1 Active Vacancies View

```sql
CREATE OR REPLACE VIEW active_vacancies AS
SELECT 
    v.*,
    k.name AS kindergarten_name,
    k.logo_url AS kindergarten_logo,
    k.district AS kindergarten_district,
    k.is_verified AS kindergarten_verified,
    k.is_premium AS kindergarten_premium
FROM vacancies v
INNER JOIN kindergartens k ON v.kindergarten_id = k.id
WHERE 
    v.status = 'active'
    AND k.is_active = true
    AND (v.expires_at IS NULL OR v.expires_at > CURRENT_TIMESTAMP);

COMMENT ON VIEW active_vacancies IS 'Active vacancies with kindergarten details';
```

---

#### 5.2 Available Candidates View

```sql
CREATE OR REPLACE VIEW available_candidates AS
SELECT 
    jsp.*,
    u.telegram_id,
    u.username,
    u.first_name,
    u.last_name,
    COALESCE(
        (SELECT json_agg(skill_name) 
         FROM skills s 
         WHERE s.job_seeker_id = jsp.id),
        '[]'::json
    ) AS skills,
    (SELECT COUNT(*) 
     FROM experience_records er 
     WHERE er.job_seeker_id = jsp.id
    ) AS experience_count,
    (SELECT COUNT(*) 
     FROM education_records ed 
     WHERE ed.job_seeker_id = jsp.id
    ) AS education_count
FROM job_seeker_profiles jsp
INNER JOIN users u ON jsp.user_id = u.id
WHERE 
    jsp.is_available = true
    AND u.is_active = true;

COMMENT ON VIEW available_candidates IS 'Available job seekers with aggregated data';
```

---

### 6. SEED DATA (Example data for development/testing)

```sql
-- Insert sample users
INSERT INTO users (telegram_id, username, first_name, last_name, role, language_code) VALUES
(111111111, 'anna_educator', 'Анна', 'Петрова', 'job_seeker', 'ru'),
(222222222, 'maria_educator', 'Мария', 'Иванова', 'job_seeker', 'ru'),
(333333333, 'elena_educator', 'Елена', 'Смирнова', 'job_seeker', 'ru'),
(444444444, 'director_solnyshko', 'Ольга', 'Козлова', 'kindergarten_employer', 'ru'),
(555555555, 'director_raduga', 'Татьяна', 'Новикова', 'kindergarten_employer', 'ru');

-- Insert sample kindergartens
INSERT INTO kindergartens (name, slug, district, address, phone, email, description, is_verified, is_active) VALUES
('Детский сад «Солнышко»', 'solnyshko', 'Центральный район', 'ул. Пушкина, 15', '+998901234567', 'info@solnyshko.uz', 'Современный детский сад с квалифицированными специалистами', true, true),
('Образовательный центр «Радуга»', 'raduga', 'Северный район', 'ул. Навои, 42', '+998901234568', 'info@raduga.uz', 'Частный образовательный центр', true, true),
('Детский сад №15', 'ds-15', 'Южный район', 'ул. Абая, 8', '+998901234569', 'ds15@edu.uz', 'Государственный детский сад', false, true);

-- Insert kindergarten employers
INSERT INTO kindergarten_employers (user_id, kindergarten_id, full_name, position, is_primary_contact) VALUES
((SELECT id FROM users WHERE telegram_id = 444444444), 1, 'Ольга Козлова', 'Директор', true),
((SELECT id FROM users WHERE telegram_id = 555555555), 2, 'Татьяна Новикова', 'Директор', true);

-- Insert job seeker profiles
INSERT INTO job_seeker_profiles (
    user_id, full_name, birth_date, district, about_me, 
    desired_position, desired_salary_min, desired_salary_max, 
    experience_years, is_available, rating
) VALUES
(
    (SELECT id FROM users WHERE telegram_id = 111111111),
    'Анна Петрова',
    '1995-05-15',
    'Центральный район',
    'Опытный воспитатель с высшим педагогическим образованием',
    'Воспитатель',
    6000000,
    7000000,
    5,
    true,
    4.9
),
(
    (SELECT id FROM users WHERE telegram_id = 222222222),
    'Мария Иванова',
    '1988-08-20',
    'Центральный район',
    'Методист дошкольного образования',
    'Методист',
    7000000,
    9000000,
    8,
    true,
    5.0
),
(
    (SELECT id FROM users WHERE telegram_id = 333333333),
    'Елена Смирнова',
    '1992-03-10',
    'Северный район',
    'Музыкальный руководитель',
    'Музыкальный руководитель',
    5000000,
    6500000,
    3,
    true,
    4.8
);

-- Insert skills
INSERT INTO skills (job_seeker_id, skill_name, proficiency_level) VALUES
(1, 'Дошкольная педагогика', 5),
(1, 'Монтессори', 4),
(1, 'Английский язык', 3),
(2, 'Методология', 5),
(2, 'ФГОС', 5),
(2, 'Управление', 4),
(3, 'Вокал', 5),
(3, 'Музыкальная терапия', 4),
(3, 'Фортепиано', 5);

-- Insert education records
INSERT INTO education_records (job_seeker_id, institution, degree, field_of_study, start_year, end_year) VALUES
(1, 'Ташкентский педагогический университет', 'Бакалавр', 'Дошкольное образование', 2013, 2017),
(2, 'Ташкентский государственный педагогический университет', 'Магистр', 'Методика дошкольного образования', 2006, 2010),
(3, 'Ташкентская консерватория', 'Бакалавр', 'Музыкальная педагогика', 2010, 2014);

-- Insert experience records
INSERT INTO experience_records (job_seeker_id, position, company_name, start_date, end_date, is_current, description) VALUES
(1, 'Воспитатель', 'Детский сад №15', '2017-09-01', '2022-06-30', false, 'Работа с детьми 3-4 лет'),
(1, 'Воспитатель', 'Частный детский сад «Умка»', '2022-09-01', NULL, true, 'Работа в группе раннего развития'),
(2, 'Методист', 'Центр развития «Кругозор»', '2010-09-01', NULL, true, 'Разработка учебных программ'),
(3, 'Музыкальный руководитель', 'Детский сад №8', '2014-09-01', '2023-06-30', false, 'Проведение музыкальных занятий');

-- Insert vacancies
INSERT INTO vacancies (
    kindergarten_id, title, description, requirements, responsibilities,
    salary_min, salary_max, district, employment_type, status, 
    is_featured, views_count, applications_count, published_at
) VALUES
(
    1,
    'Воспитатель младшей группы',
    'Требуется воспитатель для работы с детьми 3-4 лет',
    'Высшее педагогическое образование, опыт работы от 2 лет',
    'Проведение занятий, присмотр за детьми, взаимодействие с родителями',
    6000000,
    7000000,
    'Центральный район',
    'full_time',
    'active',
    false,
    247,
    12,
    CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
    2,
    'Методист дошкольного образования',
    'Ищем опытного методиста для образовательного центра',
    'Высшее педагогическое образование, опыт работы методистом от 3 лет',
    'Разработка учебных программ, контроль качества образования',
    7000000,
    8500000,
    'Северный район',
    'full_time',
    'active',
    true,
    189,
    8,
    CURRENT_TIMESTAMP - INTERVAL '1 day'
),
(
    1,
    'Музыкальный руководитель',
    'Требуется музыкальный руководитель',
    'Музыкальное образование, опыт работы с детьми',
    'Проведение музыкальных занятий, подготовка к утренникам',
    5000000,
    6500000,
    'Центральный район',
    'part_time',
    'paused',
    false,
    134,
    5,
    CURRENT_TIMESTAMP - INTERVAL '5 days'
);

-- Insert applications
INSERT INTO applications (vacancy_id, job_seeker_id, cover_letter, status, created_at) VALUES
(1, 1, 'Здравствуйте! Я хотела бы устроиться воспитателем...', 'pending', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 2, 'Добрый день! Имею большой опыт работы методистом...', 'viewed', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 3, 'Здравствуйте! Интересует позиция воспитателя...', 'shortlisted', CURRENT_TIMESTAMP - INTERVAL '3 days');

-- Update viewed_at for viewed applications
UPDATE applications SET viewed_at = CURRENT_TIMESTAMP - INTERVAL '1 day' WHERE status = 'viewed';
```

---

## 📈 PERFORMANCE OPTIMIZATION STRATEGY

### Indexing Strategy

1. **Primary Keys**: Automatically indexed
2. **Foreign Keys**: Indexed for JOIN performance
3. **Status Fields**: Partial indexes for active records only
4. **Timestamps**: Descending indexes for recent-first queries
5. **Full-Text Search**: GIN indexes for text search
6. **Trigram Search**: GIN indexes for fuzzy matching
7. **Geospatial**: GiST indexes for location-based queries
8. **Composite Indexes**: For common multi-column WHERE clauses

### Query Optimization

```sql
-- Example: Optimized vacancy search with filters
EXPLAIN ANALYZE
SELECT v.*, k.name, k.logo_url, k.is_verified
FROM vacancies v
INNER JOIN kindergartens k ON v.kindergarten_id = k.id
WHERE 
    v.status = 'active'
    AND k.is_active = true
    AND v.district = 'Центральный район'
    AND v.salary_min >= 6000000
    AND v.salary_max <= 8000000
ORDER BY v.published_at DESC
LIMIT 20 OFFSET 0;

-- Should use indexes:
-- - idx_vacancies_status
-- - idx_vacancies_district
-- - idx_vacancies_salary
```

### Partitioning Strategy

For high-volume tables, consider range partitioning:

```sql
-- Example: Partition messages by month
CREATE TABLE messages_partitioned (
    LIKE messages INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE messages_2026_01 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE messages_2026_02 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Create partitions automatically for upcoming months
```

---

## 🔒 ROW-LEVEL SECURITY (Optional but Recommended)

```sql
-- Enable RLS
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;

-- Policy: Employers can only see their own vacancies
CREATE POLICY employer_own_vacancies ON vacancies
    FOR ALL
    TO authenticated_user
    USING (
        kindergarten_id IN (
            SELECT kindergarten_id 
            FROM kindergarten_employers 
            WHERE user_id = current_user_id()
        )
    );

-- Policy: Job seekers can see all active vacancies
CREATE POLICY job_seeker_see_active_vacancies ON vacancies
    FOR SELECT
    TO authenticated_user
    USING (status = 'active');
```

---

## 🔄 ALEMBIC MIGRATION STRATEGY

### Directory Structure
```
alembic/
├── versions/
│   ├── 001_initial_schema.py
│   ├── 002_add_profile_views.py
│   └── 003_add_audit_logs.py
├── env.py
├── script.py.mako
└── alembic.ini
```

### Naming Convention
```
{revision}_{description}.py

Example:
20260303_001_create_users_table.py
20260303_002_add_kindergartens.py
```

### Migration Template
```python
"""Add profile views table

Revision ID: 20260303_002
Revises: 20260303_001
Create Date: 2026-03-03 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '20260303_002'
down_revision = '20260303_001'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'profile_views',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_seeker_id', sa.Integer(), nullable=False),
        sa.Column('viewer_id', sa.Integer(), nullable=False),
        sa.Column('viewed_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['job_seeker_id'], ['job_seeker_profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['viewer_id'], ['users.id'], ondelete='CASCADE'),
    )
    
    op.create_index('idx_profile_views_job_seeker', 'profile_views', ['job_seeker_id', 'viewed_at'])
    op.create_index('idx_profile_views_viewer', 'profile_views', ['viewer_id', 'viewed_at'])

def downgrade():
    op.drop_index('idx_profile_views_viewer')
    op.drop_index('idx_profile_views_job_seeker')
    op.drop_table('profile_views')
```

---

## 📊 MONITORING & MAINTENANCE

### Essential Queries for Monitoring

```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- Find slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Check for missing indexes (foreign keys without indexes)
SELECT
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = tc.table_name
        AND indexdef LIKE '%' || kcu.column_name || '%'
    );
```

### Maintenance Scripts

```sql
-- Vacuum and analyze all tables
VACUUM ANALYZE;

-- Reindex all indexes
REINDEX DATABASE kindergarten_jobs;

-- Update statistics
ANALYZE;
```

---

## 🚀 PRODUCTION DEPLOYMENT CHECKLIST

### Database Configuration

```ini
# postgresql.conf optimizations

# Memory
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 1GB

# Connections
max_connections = 200

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9
max_wal_size = 4GB

# Query Planning
random_page_cost = 1.1  # For SSD
effective_io_concurrency = 200

# Logging
log_min_duration_statement = 1000  # Log queries > 1s
log_connections = on
log_disconnections = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

### Security Configuration

```sql
-- Create application user (not superuser)
CREATE USER app_user WITH PASSWORD 'strong_password_here';

-- Grant necessary privileges only
GRANT CONNECT ON DATABASE kindergarten_jobs TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'another_strong_password';
GRANT CONNECT ON DATABASE kindergarten_jobs TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;
```

### Backup Strategy

```bash
# Daily full backup
pg_dump -h localhost -U postgres -d kindergarten_jobs -F c -f /backups/kindergarten_jobs_$(date +%Y%m%d).dump

# Point-in-time recovery (enable WAL archiving)
# In postgresql.conf:
# archive_mode = on
# archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'
```

### Automated Maintenance

```sql
-- Install pg_cron extension
CREATE EXTENSION pg_cron;

-- Schedule daily vacuum
SELECT cron.schedule('vacuum-daily', '0 2 * * *', 'VACUUM ANALYZE;');

-- Schedule expire vacancies check
SELECT cron.schedule('expire-vacancies', '0 * * * *', 'SELECT auto_expire_vacancies();');
```

---

## 📝 NAMING CONVENTIONS

### Tables
- Lowercase with underscores: `job_seeker_profiles`
- Plural nouns: `users`, `vacancies`
- Junction tables: `entity1_entity2` (e.g., `saved_vacancies`)

### Columns
- Lowercase with underscores: `created_at`, `is_active`
- Boolean columns: prefix with `is_` or `has_`
- Timestamps: suffix with `_at` (e.g., `created_at`, `updated_at`)
- Foreign keys: `{table_name}_id` (e.g., `user_id`, `vacancy_id`)

### Indexes
- Format: `idx_{table}_{columns}` (e.g., `idx_users_telegram_id`)
- Unique indexes: `uq_{table}_{columns}` (e.g., `uq_application_vacancy_seeker`)

### Constraints
- Check: `chk_{table}_{description}` (e.g., `chk_vacancy_salary_min`)
- Unique: `uq_{table}_{columns}` (e.g., `uq_chat_participants`)
- Foreign key: `fk_{table}_{referenced_table}` (auto-generated by PostgreSQL)

### Triggers
- Format: `trigger_{table}_{action}` (e.g., `trigger_users_updated_at`)

---

## ✅ VALIDATION & TESTING

### Data Integrity Tests

```sql
-- Test 1: No orphaned records
SELECT 'Orphaned applications' AS test, COUNT(*) AS count
FROM applications a
LEFT JOIN vacancies v ON a.vacancy_id = v.id
WHERE v.id IS NULL
UNION ALL
SELECT 'Orphaned messages', COUNT(*)
FROM messages m
LEFT JOIN chats c ON m.chat_id = c.id
WHERE c.id IS NULL;

-- Test 2: Salary constraints
SELECT 'Invalid salary ranges' AS test, COUNT(*) AS count
FROM vacancies
WHERE salary_max < salary_min;

-- Test 3: Date constraints
SELECT 'Invalid experience dates' AS test, COUNT(*) AS count
FROM experience_records
WHERE end_date < start_date;

-- Test 4: Unread count accuracy
SELECT 'Chat unread count mismatch' AS test, COUNT(*) AS count
FROM chats c
WHERE c.unread_by_seeker != (
    SELECT COUNT(*)
    FROM messages m
    WHERE m.chat_id = c.id 
    AND m.is_read = false
    AND m.sender_id IN (
        SELECT u.id FROM users u
        INNER JOIN kindergarten_employers ke ON u.id = ke.user_id
        WHERE ke.kindergarten_id = c.kindergarten_id
    )
);
```

---

## 🎯 SUMMARY

This database implementation provides:

✅ **14 core tables** with full CRUD support  
✅ **6 enum types** for data consistency  
✅ **50+ indexes** for query optimization  
✅ **Triggers** for automatic data maintenance  
✅ **Views** for common aggregated queries  
✅ **Row-level security** strategy (optional)  
✅ **Partitioning** strategy for scalability  
✅ **Audit logging** for compliance  
✅ **Full-text search** capability  
✅ **Geospatial** support for location queries  
✅ **Multi-tenant** architecture with proper isolation  
✅ **Production-ready** configuration and monitoring  

### Next Steps

1. Review and approve schema
2. Run initial migration with Alembic
3. Load seed data for testing
4. Implement application-layer ORM (SQLAlchemy)
5. Write integration tests
6. Perform load testing
7. Set up monitoring and alerts
8. Configure automated backups
9. Document API database interactions
10. Deploy to production

---

**Questions for clarification:**
- Do you need full-text search in multiple languages (Russian + Uzbek)?
- Should we implement soft deletes for all tables or hard deletes?
- What is the expected data retention policy for messages and notifications?
- Do you need database-level encryption for sensitive fields?
- Should we implement database-level rate limiting?

---

**This prompt is ready to be used for full database implementation!**
