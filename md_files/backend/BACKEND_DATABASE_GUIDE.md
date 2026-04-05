# Полный гайд по Backend и базе данных

## 📋 Содержание
1. [Общая архитектура](#общая-архитектура)
2. [Технологический стек](#технологический-стек)
3. [Структура базы данных](#структура-базы-данных)
4. [MVP таблицы (Обязательные для запуска)](#mvp-таблицы)
5. [Детальные схемы таблиц](#детальные-схемы-таблиц)
6. [Важные индексы](#важные-индексы)
7. [Связи между таблицами](#связи-между-таблицами)
8. [API Endpoints](#api-endpoints)
9. [Миграции](#миграции)
10. [Бизнес-логика и валидация](#бизнес-логика-и-валидация)

---

## Общая архитектура

### Роли пользователей
```
├── Соискатель (candidate)
├── Работодатель (employer) 
└── Админ (admin)
```

### Главные сущности
```
users                  → Общая таблица всех пользователей
candidate_profiles     → Профиль соискателя
employer_profiles      → Профиль работодателя
companies              → Компании (детские сады)
vacancies              → Вакансии
resumes                → Резюме соискателей
applications           → Отклики на вакансии
chats/messages         → Чаты и сообщения
notifications          → Уведомления
```

---

## Технологический стек

### Рекомендуемый стек
- **База данных**: PostgreSQL 14+
- **ORM**: SQLAlchemy / SQLModel
- **Миграции**: Alembic
- **Backend**: FastAPI (Python 3.10+)
- **Валидация**: Pydantic v2
- **ID формат**: UUID (для безопасности и масштабируемости)

### Обязательные пакеты Python
```python
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
alembic==1.13.1
pydantic==2.6.0
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
```

---

## Структура базы данных

### Принципы проектирования

✅ **Правильно:**
- Одна таблица `users` для авторизации
- Отдельные таблицы для профилей (`candidate_profiles`, `employer_profiles`)
- Нормализация данных
- Использование справочников для городов, категорий, навыков

❌ **Неправильно:**
- Создавать отдельные таблицы `auth_candidate`, `auth_employer`
- Хранить все данные в одной огромной таблице `users`
- Дублировать названия городов/компаний текстом

---

## MVP таблицы

### Обязательно для первого запуска (MVP)

```sql
-- Основные таблицы
1. users                    -- Авторизация
2. candidate_profiles       -- Профили соискателей
3. employer_profiles        -- Профили работодателей
4. companies                -- Компании (детские сады)
5. vacancies                -- Вакансии
6. resumes                  -- Резюме
7. applications             -- Отклики

-- Навыки
8. skills                   -- Справочник навыков
9. resume_skills            -- Навыки в резюме
10. vacancy_skills          -- Требуемые навыки для вакансии

-- Справочники
11. cities                  -- Города
12. categories              -- Категории вакансий

-- Система
13. notifications           -- Уведомления
```

### Желательно добавить позже

```sql
14. resume_experiences      -- Опыт работы
15. resume_educations       -- Образование
16. favorite_vacancies      -- Сохраненные вакансии
17. chats                   -- Чаты
18. messages                -- Сообщения
```

### На будущее (после MVP)

```sql
19. payments                -- Платежи
20. subscriptions           -- Подписки работодателей
21. moderation_logs         -- Логи модерации
22. analytics tables        -- Аналитика
```

---

## Детальные схемы таблиц

### 1. users (Основная таблица пользователей)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('candidate', 'employer', 'admin')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    telegram_id BIGINT UNIQUE,                    -- ID пользователя Telegram
    telegram_username VARCHAR(100),               -- Username в Telegram
    language VARCHAR(5) DEFAULT 'ru',             -- 'ru' или 'uz'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);
```

**Зачем:**
- Единая точка входа для всех пользователей
- `role` определяет, какой профиль создавать
- `telegram_id` для интеграции с Telegram WebApp

---

### 2. candidate_profiles (Профиль соискателя)

```sql
CREATE TABLE candidate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    city_id UUID REFERENCES cities(id),
    address TEXT,
    about TEXT,                                   -- О себе
    education_level VARCHAR(50),                  -- Уровень образования
    experience_years INTEGER DEFAULT 0,           -- Лет опыта
    current_position VARCHAR(200),                -- Текущая должность
    expected_salary_from INTEGER,                 -- В сумах
    expected_salary_to INTEGER,                   -- В сумах
    employment_type VARCHAR(20)[],                -- ['full-time', 'part-time']
    work_format VARCHAR(20)[],                    -- ['office', 'remote', 'hybrid']
    telegram_username VARCHAR(100),               -- Telegram для связи
    phone_visible BOOLEAN DEFAULT false,          -- Показывать телефон
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_candidate_profiles_user_id ON candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_city_id ON candidate_profiles(city_id);
```

---

### 3. employer_profiles (Профиль работодателя)

```sql
CREATE TABLE employer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    position_in_company VARCHAR(200),             -- Должность в компании
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_employer_profiles_user_id ON employer_profiles(user_id);
CREATE INDEX idx_employer_profiles_company_id ON employer_profiles(company_id);
```

**Логика:**
- Один работодатель = один профиль = одна компания
- Для детских садов это просто и понятно

---

### 4. companies (Компании - детские сады)

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,                     -- URL-friendly имя
    logo_url TEXT,
    description TEXT,                             -- Описание
    industry_id UUID REFERENCES industries(id),   -- Сфера деятельности
    company_size VARCHAR(50),                     -- 'small', 'medium', 'large'
    website VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    city_id UUID REFERENCES cities(id),
    address TEXT,
    
    -- Дополнительные поля для детских садов
    capacity INTEGER,                             -- Вместимость (детей)
    groups_count INTEGER,                         -- Количество групп
    working_hours VARCHAR(100),                   -- График работы
    year_founded INTEGER,                         -- Год основания
    
    owner_user_id UUID REFERENCES users(id),      -- Кто создал компанию
    is_verified BOOLEAN DEFAULT false,            -- Верифицирован
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'blocked', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_companies_city_id ON companies(city_id);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_owner_user_id ON companies(owner_user_id);
```

---

### 5. vacancies (Вакансии)

```sql
CREATE TABLE vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,                             -- Описание вакансии
    responsibilities TEXT,                        -- Обязанности
    requirements TEXT,                            -- Требования
    conditions TEXT,                              -- Условия работы
    
    salary_from INTEGER,                          -- В сумах
    salary_to INTEGER,                            -- В сумах
    currency VARCHAR(3) DEFAULT 'UZS',
    
    city_id UUID REFERENCES cities(id),
    employment_type VARCHAR(20),                  -- 'full-time', 'part-time', 'internship'
    work_format VARCHAR(20),                      -- 'office', 'remote', 'hybrid'
    experience_level VARCHAR(50),                 -- 'junior', 'middle', 'senior', 'lead'
    education_level VARCHAR(50),                  -- Требуемое образование
    
    category_id UUID REFERENCES categories(id),
    
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'closed')),
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,          -- Дата окончания
    
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_vacancies_company_id ON vacancies(company_id);
CREATE INDEX idx_vacancies_status ON vacancies(status);
CREATE INDEX idx_vacancies_category_city_status ON vacancies(category_id, city_id, status);
CREATE INDEX idx_vacancies_published_at ON vacancies(published_at DESC);
```

---

### 6. resumes (Резюме)

```sql
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,                  -- Желаемая должность
    about TEXT,                                   -- О себе
    specialization_id UUID REFERENCES specializations(id),
    
    salary_expectation INTEGER,                   -- Желаемая зарплата в сумах
    currency VARCHAR(3) DEFAULT 'UZS',
    
    city_id UUID REFERENCES cities(id),
    work_format VARCHAR(20),                      -- 'office', 'remote', 'hybrid'
    employment_type VARCHAR(20),                  -- 'full-time', 'part-time'
    experience_years INTEGER DEFAULT 0,
    
    is_primary BOOLEAN DEFAULT false,             -- Основное резюме
    is_public BOOLEAN DEFAULT true,               -- Видно работодателям
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'archived')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_resumes_candidate_id ON resumes(candidate_id);
CREATE INDEX idx_resumes_status ON resumes(status);
CREATE INDEX idx_resumes_city_id ON resumes(city_id);
```

**Важно:** Один соискатель может иметь несколько резюме!

---

### 7. applications (Отклики) ⚠️ САМАЯ ВАЖНАЯ ТАБЛИЦА

```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    
    cover_letter TEXT,                            -- Сопроводительное письмо
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'viewed', 'invited', 'rejected', 'hired')
    ),
    
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- КРИТИЧЕСКИ ВАЖНО: один человек не может дважды откликнуться
    CONSTRAINT unique_application UNIQUE (vacancy_id, candidate_id, resume_id)
);

-- Индексы
CREATE INDEX idx_applications_vacancy_id ON applications(vacancy_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);
```

**⚠️ Критическая бизнес-логика:**
- `UNIQUE(vacancy_id, candidate_id, resume_id)` предотвращает спам
- Один человек не может отправить один и тот же отклик дважды

---

### 8-10. Навыки (Skills)

```sql
-- Справочник навыков
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    category VARCHAR(50),                         -- 'soft', 'hard', 'language'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Навыки в резюме
CREATE TABLE resume_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    
    CONSTRAINT unique_resume_skill UNIQUE (resume_id, skill_id)
);

-- Требуемые навыки для вакансии
CREATE TABLE vacancy_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,            -- Обязательный навык
    
    CONSTRAINT unique_vacancy_skill UNIQUE (vacancy_id, skill_id)
);

-- Индексы
CREATE INDEX idx_resume_skills_resume_id ON resume_skills(resume_id);
CREATE INDEX idx_vacancy_skills_vacancy_id ON vacancy_skills(vacancy_id);
```

---

### 11. cities (Города)

```sql
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_uz VARCHAR(100),                         -- Название на узбекском
    name_ru VARCHAR(100),                         -- Название на русском
    region VARCHAR(100),                          -- Область/регион
    country VARCHAR(2) DEFAULT 'UZ',              -- ISO код страны
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Предзаполненные города Узбекистана
INSERT INTO cities (name_ru, name_uz, region, country) VALUES
    ('Ташкент', 'Toshkent', 'Ташкент', 'UZ'),
    ('Самарканд', 'Samarqand', 'Самаркандская область', 'UZ'),
    ('Бухара', 'Buxoro', 'Бухарская область', 'UZ'),
    ('Андижан', 'Andijon', 'Андижанская область', 'UZ'),
    ('Наманган', 'Namangan', 'Наманганская область', 'UZ'),
    ('Фергана', 'Farg''ona', 'Ферганская область', 'UZ');
```

---

### 12. categories (Категории вакансий)

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_uz VARCHAR(100),
    name_ru VARCHAR(100),
    parent_id UUID REFERENCES categories(id),     -- Для подкатегорий
    slug VARCHAR(100) UNIQUE,
    icon VARCHAR(100),                            -- Название иконки
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Предзаполненные категории для детских садов
INSERT INTO categories (name_ru, name_uz, slug) VALUES
    ('Воспитатель', 'Tarbiyachi', 'kindergarten-teacher'),
    ('Методист', 'Metodist', 'methodist'),
    ('Музыкальный руководитель', 'Musiqa rahbari', 'music-director'),
    ('Медсестра', 'Hamshira', 'nurse'),
    ('Повар', 'Oshpaz', 'cook'),
    ('Нянечка', 'Enaga', 'nanny'),
    ('Психолог', 'Psixolog', 'psychologist');
```

---

### 13. notifications (Уведомления)

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL,                    -- 'application_status', 'new_message', etc.
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data_json JSONB,                              -- Дополнительные данные
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

### 14-15. Опыт работы и образование

```sql
-- Опыт работы
CREATE TABLE resume_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(200) NOT NULL,
    description TEXT,
    
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,             -- Работаю сейчас
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Образование
CREATE TABLE resume_educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    
    institution_name VARCHAR(255) NOT NULL,
    degree VARCHAR(100),                          -- Степень
    field_of_study VARCHAR(200),                  -- Специальность
    
    start_year INTEGER,
    end_year INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_resume_experiences_resume_id ON resume_experiences(resume_id);
CREATE INDEX idx_resume_educations_resume_id ON resume_educations(resume_id);
```

---

### 16. favorite_vacancies (Сохраненные вакансии)

```sql
CREATE TABLE favorite_vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_favorite UNIQUE (candidate_id, vacancy_id)
);

-- Индексы
CREATE INDEX idx_favorite_vacancies_candidate_id ON favorite_vacancies(candidate_id);
```

---

### 17-18. Чаты и сообщения

```sql
-- Чаты
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Участники чата
CREATE TABLE chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_participant UNIQUE (chat_id, user_id)
);

-- Сообщения
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES users(id),
    
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
    content TEXT,
    file_url TEXT,
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_messages_chat_id_created_at ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender_user_id ON messages(sender_user_id);
```

---

## Важные индексы

### Критические индексы для производительности

```sql
-- Users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- Vacancies (самая нагруженная таблица)
CREATE INDEX idx_vacancies_status ON vacancies(status);
CREATE INDEX idx_vacancies_company_id_status ON vacancies(company_id, status);
CREATE INDEX idx_vacancies_category_city_status ON vacancies(category_id, city_id, status);
CREATE INDEX idx_vacancies_published_at ON vacancies(published_at DESC);

-- Applications
CREATE INDEX idx_applications_vacancy_id_status ON applications(vacancy_id, status);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);

-- Messages
CREATE INDEX idx_messages_chat_id_created_at ON messages(chat_id, created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);
```

---

## Связи между таблицами

### ER-диаграмма (упрощенная)

```
User (users)
 ├── CandidateProfile (candidate_profiles)
 │    ├── Resumes (resumes)
 │    │    ├── ResumeSkills (resume_skills → skills)
 │    │    ├── ResumeExperiences (resume_experiences)
 │    │    └── ResumeEducations (resume_educations)
 │    │
 │    ├── Applications (applications)
 │    └── FavoriteVacancies (favorite_vacancies)
 │
 └── EmployerProfile (employer_profiles)
      └── Company (companies)
           └── Vacancies (vacancies)
                ├── VacancySkills (vacancy_skills → skills)
                └── Applications (applications)
                     └── Resume (resumes)

User → ChatParticipants → Chat → Messages
User → Notifications
```

---

## API Endpoints

### Структура API для фронтенда

#### Аутентификация
```
POST   /api/v1/auth/register          # Регистрация через Telegram
POST   /api/v1/auth/login              # Вход (phone + password)
POST   /api/v1/auth/telegram           # Аутентификация через Telegram WebApp
POST   /api/v1/auth/refresh            # Обновление токена
GET    /api/v1/auth/me                 # Текущий пользователь
```

#### Пользователи
```
GET    /api/v1/users/me                # Мой профиль
PATCH  /api/v1/users/me                # Обновить профиль
POST   /api/v1/users/avatar            # Загрузить аватар
```

#### Профиль соискателя
```
GET    /api/v1/candidate/profile       # Получить профиль
PATCH  /api/v1/candidate/profile       # Обновить профиль
```

#### Резюме
```
GET    /api/v1/resumes                 # Список моих резюме
POST   /api/v1/resumes                 # Создать резюме
GET    /api/v1/resumes/:id             # Получить резюме
PATCH  /api/v1/resumes/:id             # Обновить резюме
DELETE /api/v1/resumes/:id             # Удалить резюме

POST   /api/v1/resumes/:id/skills      # Добавить навык
DELETE /api/v1/resumes/:id/skills/:skill_id

POST   /api/v1/resumes/:id/experience  # Добавить опыт
PATCH  /api/v1/resumes/:id/experience/:exp_id
DELETE /api/v1/resumes/:id/experience/:exp_id
```

#### Вакансии (для соискателей)
```
GET    /api/v1/vacancies               # Список вакансий (с фильтрами)
GET    /api/v1/vacancies/:id           # Детали вакансии
POST   /api/v1/vacancies/:id/view      # Отметить просмотр
```

**Фильтры для GET /api/v1/vacancies:**
```
?city_id=uuid
&category_id=uuid
&salary_from=5000000
&salary_to=10000000
&employment_type=full-time
&work_format=office
&search=воспитатель
&page=1
&limit=20
```

#### Отклики (для соискателей)
```
GET    /api/v1/applications            # Мои отклики
POST   /api/v1/applications            # Откликнуться на вакансию
GET    /api/v1/applications/:id        # Детали отклика
```

#### Избранное
```
GET    /api/v1/favorites               # Сохраненные вакансии
POST   /api/v1/favorites               # Добавить в избранное
DELETE /api/v1/favorites/:vacancy_id   # Убрать из избранного
```

#### Профиль работодателя
```
GET    /api/v1/employer/profile        # Получить профиль
PATCH  /api/v1/employer/profile        # Обновить профиль
```

#### Компания
```
GET    /api/v1/employer/company        # Моя компания
POST   /api/v1/employer/company        # Создать компанию
PATCH  /api/v1/employer/company        # Обновить компанию
POST   /api/v1/employer/company/logo   # З��грузить логотип
```

#### Вакансии (для работодателей)
```
GET    /api/v1/employer/vacancies      # Мои вакансии
POST   /api/v1/employer/vacancies      # Создать вакансию
GET    /api/v1/employer/vacancies/:id  # Детали вакансии
PATCH  /api/v1/employer/vacancies/:id  # Обновить вакансию
DELETE /api/v1/employer/vacancies/:id  # Удалить вакансию

PATCH  /api/v1/employer/vacancies/:id/status  # Изменить статус (active/archived)
```

#### Отклики (для работодателей)
```
GET    /api/v1/employer/applications           # Все отклики на мои вакансии
GET    /api/v1/employer/vacancies/:id/applications  # Отклики на конкретную вакансию
PATCH  /api/v1/employer/applications/:id/status     # Изменить статус отклика
```

#### Чаты и сообщения
```
GET    /api/v1/chats                   # Список чатов
GET    /api/v1/chats/:id               # Сообщения чата
POST   /api/v1/chats/:id/messages      # Отправить сообщение
PATCH  /api/v1/chats/:id/read          # Отметить как прочитанное
```

#### Уведомления
```
GET    /api/v1/notifications           # Список уведомлений
PATCH  /api/v1/notifications/:id/read  # Отметить как прочитанное
PATCH  /api/v1/notifications/read-all  # Отметить все как прочитанные
```

#### Справочники
```
GET    /api/v1/cities                  # Список городов
GET    /api/v1/categories              # Категории вакансий
GET    /api/v1/skills                  # Список навыков
```

---

## Миграции

### Порядок создания миграций с Alembic

```bash
# 1. Инициализация Alembic
alembic init alembic

# 2. Создание миграций в правильном порядке
alembic revision -m "create_users_table"
alembic revision -m "create_cities_and_categories"
alembic revision -m "create_candidate_profiles"
alembic revision -m "create_employer_profiles_and_companies"
alembic revision -m "create_vacancies"
alembic revision -m "create_resumes"
alembic revision -m "create_skills_tables"
alembic revision -m "create_applications"
alembic revision -m "create_favorites"
alembic revision -m "create_chats_and_messages"
alembic revision -m "create_notifications"

# 3. Применить миграции
alembic upgrade head
```

### Пример миграции (users)

```python
"""create_users_table

Revision ID: 001
Revises: 
Create Date: 2026-03-14
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('phone', sa.String(20), nullable=False, unique=True),
        sa.Column('email', sa.String(255), unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('first_name', sa.String(100)),
        sa.Column('last_name', sa.String(100)),
        sa.Column('avatar_url', sa.Text()),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('is_verified', sa.Boolean(), server_default='false'),
        sa.Column('telegram_id', sa.BigInteger(), unique=True),
        sa.Column('telegram_username', sa.String(100)),
        sa.Column('language', sa.String(5), server_default='ru'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("role IN ('candidate', 'employer', 'admin')", name='check_user_role')
    )
    
    # Индексы
    op.create_index('idx_users_phone', 'users', ['phone'])
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_telegram_id', 'users', ['telegram_id'])

def downgrade():
    op.drop_table('users')
```

---

## Бизнес-логика и валидация

### Критические правила бизнес-логики

#### 1. Регистрация пользователя
```python
# При регистрации:
1. Создать запись в users
2. В зависимости от role:
   - Если candidate → создать candidate_profile
   - Если employer → создать employer_profile
```

#### 2. Отклик на вакансию
```python
# Валидация перед созданием application:
- Проверить, что вакансия active
- Проверить, что не существует отклика с этой комбинацией (vacancy_id, candidate_id, resume_id)
- Проверить, что resume принадлежит этому candidate
- Увеличить vacancies.applications_count
```

#### 3. Изменение статуса отклика
```python
# При изменении статуса application:
- Создать notification для соискателя
- Если статус = 'invited' → создать chat
```

#### 4. Создание вакансии
```python
# При создании vacancy:
- Проверить, что company принадлежит этому работодателю
- Установить created_by_user_id = текущий user_id
- Установить status = 'draft' по умолчанию
```

#### 5. Публикация вакансии
```python
# При изменении status с 'draft' на 'active':
- Установить published_at = NOW()
- Установить expires_at = NOW() + 30 дней (настраиваемо)
```

#### 6. Просмотр вакансии
```python
# При просмотре вакансии:
- Увеличить vacancies.views_count
- Опционально: создать запись в vacancy_views для аналитики
```

### Pydantic схемы для валидации

```python
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# Регистрация
class UserRegister(BaseModel):
    phone: str
    password: str
    role: str  # 'candidate' or 'employer'
    first_name: Optional[str]
    last_name: Optional[str]
    telegram_id: Optional[int]
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ['candidate', 'employer']:
            raise ValueError('Role must be candidate or employer')
        return v

# Создание вакансии
class VacancyCreate(BaseModel):
    title: str
    description: Optional[str]
    responsibilities: Optional[str]
    requirements: Optional[str]
    salary_from: Optional[int]
    salary_to: Optional[int]
    city_id: UUID
    category_id: UUID
    employment_type: str
    work_format: str
    
    @validator('salary_from', 'salary_to')
    def validate_salary(cls, v):
        if v is not None and v < 0:
            raise ValueError('Salary cannot be negative')
        return v

# Отклик на вакансию
class ApplicationCreate(BaseModel):
    vacancy_id: UUID
    resume_id: UUID
    cover_letter: Optional[str]
```

---

## Дополнительные рекомендации

### Безопасность

1. **Хеширование паролей**: Используйте `bcrypt` через `passlib`
2. **JWT токены**: Access token (15 мин) + Refresh token (30 дней)
3. **Rate limiting**: Ограничение запросов (например, 100 req/min)
4. **CORS**: Настроить для Telegram WebApp домена

### Оптимизация

1. **Кеширование**: Redis для часто запрашиваемых данных (города, категории)
2. **Пагинация**: Всегда использовать `LIMIT` и `OFFSET`
3. **Select specific fields**: Не делать `SELECT *`, выбирать только нужные поля
4. **Connection pooling**: Настроить пул соединений SQLAlchemy

### Мониторинг

1. **Логирование**: Использовать `structlog` или `loguru`
2. **Метрики**: Prometheus + Grafana
3. **Error tracking**: Sentry

---

## Чеклист для запуска

### Backend Setup

- [ ] Установить PostgreSQL 14+
- [ ] Создать базу данных
- [ ] Установить Python 3.10+
- [ ] Установить зависимости из requirements.txt
- [ ] Настроить переменные окружения (.env)
- [ ] Запустить Alembic миграции
- [ ] Заполнить справочники (города, категории, навыки)
- [ ] Настроить CORS для Telegram WebApp
- [ ] Запустить сервер FastAPI
- [ ] Протестировать основные endpoints

### Frontend Integration

- [ ] Настроить API client (axios/fetch)
- [ ] Реализовать аутентификацию через Telegram
- [ ] Подключить все страницы к API
- [ ] Обработать состояния загрузки
- [ ] Обработать ошибки API
- [ ] Добавить оптимистичные обновления UI

---

## Примеры SQL запросов

### Получить активные вакансии с фильтрами

```sql
SELECT 
    v.*,
    c.name as company_name,
    c.logo_url as company_logo,
    city.name_ru as city_name,
    cat.name_ru as category_name,
    COUNT(a.id) as applications_count
FROM vacancies v
LEFT JOIN companies c ON v.company_id = c.id
LEFT JOIN cities city ON v.city_id = city.id
LEFT JOIN categories cat ON v.category_id = cat.id
LEFT JOIN applications a ON v.id = a.vacancy_id
WHERE v.status = 'active'
    AND v.published_at <= NOW()
    AND (v.expires_at IS NULL OR v.expires_at > NOW())
    AND (v.city_id = $1 OR $1 IS NULL)
    AND (v.category_id = $2 OR $2 IS NULL)
    AND (v.salary_from >= $3 OR $3 IS NULL)
GROUP BY v.id, c.id, city.id, cat.id
ORDER BY v.published_at DESC
LIMIT $4 OFFSET $5;
```

### Получить отклики соискателя со всеми данными

```sql
SELECT 
    a.*,
    v.title as vacancy_title,
    v.salary_from,
    v.salary_to,
    c.name as company_name,
    c.logo_url as company_logo,
    city.name_ru as city_name
FROM applications a
JOIN resumes r ON a.resume_id = r.id
JOIN vacancies v ON a.vacancy_id = v.id
JOIN companies c ON v.company_id = c.id
LEFT JOIN cities city ON v.city_id = city.id
WHERE r.candidate_id = $1
ORDER BY a.applied_at DESC;
```

### Получить отклики работодателя на его вакансии

```sql
SELECT 
    a.*,
    v.title as vacancy_title,
    u.first_name,
    u.last_name,
    u.avatar_url,
    r.title as resume_title,
    r.experience_years,
    cp.expected_salary_from,
    cp.expected_salary_to
FROM applications a
JOIN vacancies v ON a.vacancy_id = v.id
JOIN resumes r ON a.resume_id = r.id
JOIN candidate_profiles cp ON r.candidate_id = cp.id
JOIN users u ON cp.user_id = u.id
WHERE v.company_id IN (
    SELECT company_id FROM employer_profiles WHERE user_id = $1
)
ORDER BY a.applied_at DESC;
```

---

## Контакты и поддержка

Для вопросов по интеграции бэкенда обращайтесь к:
- Документации FastAPI: https://fastapi.tiangolo.com
- Документации SQLAlchemy: https://docs.sqlalchemy.org
- Документации Alembic: https://alembic.sqlalchemy.org

---

**Версия документа:** 1.0  
**Дата создания:** 14 марта 2026  
**Последнее обновление:** 14 марта 2026
