# 🗄️ Database Schema Visualization

## Визуальная схема базы данных приложения поиска работы

---

## 📊 ER-Диаграмма (упрощённая)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USERS (Главная таблица)                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ id, phone, email, password_hash, role, first_name, last_name,        │   │
│  │ avatar_url, telegram_id, telegram_username, language                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────┬───────────────────────────────┘
                      │                       │
       ┌──────────────┴──────┐    ┌──────────┴────────────┐
       │ role = 'candidate'  │    │ role = 'employer'     │
       └──────────┬──────────┘    └──────────┬────────────┘
                  │                           │
                  ▼                           ▼
    ┌─────────────────────────┐   ┌─────────────────────────┐
    │  CANDIDATE_PROFILES     │   │  EMPLOYER_PROFILES      │
    ├─────────────────────────┤   ├─────────────────────────┤
    │ id                      │   │ id                      │
    │ user_id (FK)           │   │ user_id (FK)           │
    │ birth_date             │   │ company_id (FK)        │
    │ city_id (FK)           │   │ position_in_company    │
    │ expected_salary_from   │   └────────────┬────────────┘
    │ expected_salary_to     │                │
    └────────┬────────────────┘                │
             │                                 │
             │                                 ▼
             │                    ┌─────────────────────────┐
             │                    │  COMPANIES              │
             │                    ├─────────────────────────┤
             │                    │ id                      │
             │                    │ name                    │
             │                    │ logo_url                │
             │                    │ city_id (FK)           │
             │                    │ owner_user_id (FK)     │
             │                    │ is_verified            │
             │                    └────────────┬────────────┘
             │                                 │
             │                                 │
             │                                 ▼
             │                    ┌─────────────────────────┐
             │                    │  VACANCIES              │
             │                    ├─────────────────────────┤
             │                    │ id                      │
             │                    │ company_id (FK)        │
             │                    │ title                   │
             │                    │ salary_from/to          │
             │      ┌─────────────│ city_id (FK)           │
             │      │             │ category_id (FK)       │
             │      │             │ status                  │
             │      │             └────────────┬────────────┘
             │      │                          │
             ▼      │                          │
    ┌─────────────────────────┐               │
    │  RESUMES                │               │
    ├─────────────────────────┤               │
    │ id                      │               │
    │ candidate_id (FK)      │◄──────────────┤
    │ title                   │               │
    │ salary_expectation      │               │
    │ city_id (FK)           │               │
    │ is_primary              │               │
    └────────┬────────────────┘               │
             │                                 │
             │                                 │
             │         ┌───────────────────────┘
             │         │
             │         │
             ▼         ▼
    ┌─────────────────────────────────────────┐
    │  APPLICATIONS ⭐ (САМАЯ ВАЖНАЯ)        │
    ├─────────────────────────────────────────┤
    │ id                                      │
    │ vacancy_id (FK) ─────────────┐        │
    │ candidate_id (FK) ────────┐   │        │
    │ resume_id (FK) ───────┐   │   │        │
    │ cover_letter          │   │   │        │
    │ status                │   │   │        │
    │                       │   │   │        │
    │ UNIQUE(vacancy_id,    │   │   │        │
    │   candidate_id,       │   │   │        │
    │   resume_id) ◄───��────┴───┴───┘        │
    └─────────────────────────────────────────┘
```

---

## 🔗 Связи таблиц (детально)

### 1️⃣ Пользователи и профили

```
users (1) ──────► (1) candidate_profiles
  │
  └─────────────► (1) employer_profiles ──► (1) companies
```

**Логика:**
- Один пользователь = один профиль (либо соискатель, либо работодатель)
- Один работодатель = одна компания

---

### 2️⃣ Резюме и навыки

```
resumes (1) ──────► (*) resume_skills ──────► (1) skills
  │
  ├─────────────► (*) resume_experiences
  │
  ├─────────────► (*) resume_educations
  │
  └─────────────► (*) resume_languages
```

**Логика:**
- Один соискатель может иметь несколько резюме
- У каждого резюме может быть несколько навыков, опыта работы, образования

---

### 3️⃣ Вакансии и навыки

```
vacancies (1) ──────► (*) vacancy_skills ──────► (1) skills
  │
  └─────────────────► (*) applications
```

**Логика:**
- У вакансии может быть указано несколько требуемых навыков
- На вакансию может быть много откликов

---

### 4️⃣ Отклики (главная бизнес-логика)

```
┌──────────────────────────────────────────────┐
│           APPLICATIONS                       │
├──────────────────────────────────────────────┤
│                                              │
│  vacancy_id ──────► VACANCIES               │
│       │                                      │
│       └──► company_id ──► COMPANIES         │
│                                              │
│  candidate_id ──► CANDIDATE_PROFILES        │
│       │                                      │
│       └──► user_id ──► USERS                │
│                                              │
│  resume_id ──────► RESUMES                  │
│                                              │
└──────────────────────────────────────────────┘
```

---

### 5️⃣ Избранное

```
candidate_profiles (1) ──► (*) favorite_vacancies ──► (1) vacancies
```

**Логика:**
- Соискатель может добавить много вакансий в избранное

---

### 6️⃣ Чаты и сообщения

```
applications (1) ──────► (1) chats
                           │
                           ├──► (*) chat_participants ──► users
                           │
                           └──► (*) messages
                                     │
                                     └──► sender_user_id ──► users
```

**Логика:**
- Отклик может создать чат
- В чате участвуют соискатель и работодатель
- Сообщения привязаны к чату и автору

---

## 📐 Таблицы по группам

### 🔐 Аутентификация
```
users
  ├── candidate_profiles
  └── employer_profiles
```

### 🏢 Работодатели
```
companies
  └── vacancies
        └── vacancy_skills
```

### 👤 Соискатели
```
resumes
  ├── resume_skills
  ├── resume_experiences
  ├── resume_educations
  └── resume_languages
```

### 💼 Вакансии и отклики
```
vacancies
  ├── applications ⭐
  └── favorite_vacancies
```

### 💬 Коммуникация
```
chats
  ├── chat_participants
  └── messages

notifications
```

### 📚 Справочники
```
cities
categories
skills
industries
specializations
```

---

## 🔑 Критические ограничения (Constraints)

### 1. Уникальность отклика
```sql
-- В таблице applications
CONSTRAINT unique_application 
  UNIQUE (vacancy_id, candidate_id, resume_id)
```
**Зачем:** Один человек не может дважды откликнуться на одну вакансию с одним резюме

### 2. Уникальность избранного
```sql
-- В таблице favorite_vacancies
CONSTRAINT unique_favorite 
  UNIQUE (candidate_id, vacancy_id)
```
**Зачем:** Нельзя дважды добавить одну вакансию в избранное

### 3. Уникальность навыка в резюме
```sql
-- В таблице resume_skills
CONSTRAINT unique_resume_skill 
  UNIQUE (resume_id, skill_id)
```
**Зачем:** Один навык нельзя добавить дважды к одному резюме

### 4. Проверка роли
```sql
-- В таблице users
CONSTRAINT check_user_role 
  CHECK (role IN ('candidate', 'employer', 'admin'))
```
**Зачем:** Роль может быть только одной из трёх

### 5. Проверка статуса вакансии
```sql
-- В таблице vacancies
CONSTRAINT check_vacancy_status 
  CHECK (status IN ('draft', 'active', 'archived', 'closed'))
```
**Зачем:** Статус может быть только валидным

---

## 📊 Индексы для производительности

### Критические индексы

```sql
-- USERS (часто ищем по phone/email/telegram_id)
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- VACANCIES (самые частые запросы)
CREATE INDEX idx_vacancies_status ON vacancies(status);
CREATE INDEX idx_vacancies_company_status ON vacancies(company_id, status);
CREATE INDEX idx_vacancies_category_city_status 
  ON vacancies(category_id, city_id, status);
CREATE INDEX idx_vacancies_published_at ON vacancies(published_at DESC);

-- APPLICATIONS (критичны для работодателей)
CREATE INDEX idx_applications_vacancy_id ON applications(vacancy_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);

-- MESSAGES (для чатов)
CREATE INDEX idx_messages_chat_id_created_at 
  ON messages(chat_id, created_at DESC);

-- NOTIFICATIONS (для ленты уведомлений)
CREATE INDEX idx_notifications_user_is_read 
  ON notifications(user_id, is_read);
```

---

## 🎯 Частые запросы

### 1. Получить активные вакансии с фильтрами

```
SELECT FROM vacancies
JOIN companies
JOIN cities
WHERE status = 'active'
  AND city_id = ?
  AND category_id = ?
  AND salary_from >= ?
ORDER BY published_at DESC
```

**Используемые индексы:**
- `idx_vacancies_category_city_status`
- `idx_vacancies_published_at`

---

### 2. Получить отклики соискателя

```
SELECT FROM applications
JOIN vacancies
JOIN companies
WHERE candidate_id = ?
ORDER BY applied_at DESC
```

**Используемые индексы:**
- `idx_applications_candidate_id`

---

### 3. Получить отклики на вакансии работодателя

```
SELECT FROM applications
JOIN vacancies
JOIN resumes
JOIN candidate_profiles
WHERE vacancies.company_id = ?
ORDER BY applied_at DESC
```

**Используемые индексы:**
- `idx_applications_vacancy_id`
- `idx_vacancies_company_status`

---

## 🔢 Размеры таблиц (прогноз)

### Для 10,000 пользователей

| Таблица | Примерное количество записей | Размер |
|---------|------------------------------|--------|
| `users` | 10,000 | 5 MB |
| `candidate_profiles` | 7,000 | 3 MB |
| `employer_profiles` | 3,000 | 1 MB |
| `companies` | 3,000 | 2 MB |
| `vacancies` | 15,000 | 30 MB |
| `resumes` | 10,000 | 20 MB |
| `applications` | 50,000 | 15 MB |
| `messages` | 100,000 | 50 MB |
| `notifications` | 150,000 | 30 MB |

**Общий размер БД:** ~200 MB

---

## 🔐 Безопасность данных

### Чувствительные данные

```
users
  ├── password_hash ✅ (хешировать bcrypt)
  ├── phone ⚠️ (не показывать всем)
  └── email ⚠️ (не показывать всем)

candidate_profiles
  ├── phone_visible 🔒 (настройка приватности)
  └── telegram_username ⚠️ (только после отклика)
```

### Правила доступа

- ❌ Соискатель не может видеть личные данные других соискателей
- ✅ Работодатель может видеть данные только после отклика
- ✅ Админ видит всё

---

## 📈 Статусы и их переходы

### Статусы вакансий

```
draft ──────► active ──────► archived
  │                             ▲
  └─────────────────────────────┘
                 ▼
               closed
```

### Статусы откликов

```
pending ──► viewed ──► invited ──► hired ✅
   │          │
   │          └────► rejected ❌
   │
   └────────────► rejected ❌
```

### Статусы резюме

```
active ──────► hidden ──────► archived
  ▲               │
  └───────────────┘
```

---

## 🚀 Оптимизация для масштабирования

### При росте до 100,000+ пользователей:

1. **Партиционирование**
```sql
-- Партиционирование applications по дате
CREATE TABLE applications_2026_03 PARTITION OF applications
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

2. **Материализованные представления**
```sql
-- Для быстрой статистики
CREATE MATERIALIZED VIEW vacancy_stats AS
  SELECT 
    v.id,
    COUNT(a.id) as applications_count,
    COUNT(f.id) as favorites_count
  FROM vacancies v
  LEFT JOIN applications a ON v.id = a.vacancy_id
  LEFT JOIN favorite_vacancies f ON v.id = f.vacancy_id
  GROUP BY v.id;
```

3. **Read Replicas**
- Master для записи
- Replicas для чтения (поиск вакансий, профили)

---

## 📊 Схема в цифрах

- **Всего таблиц:** 18+
- **Foreign Keys:** 25+
- **Индексов:** 20+
- **Constraints:** 15+
- **Triggers:** 5+ (для обновления счётчиков)

---

## ✅ Проверочный список

Перед запуском в production убедитесь:

- [ ] Все таблицы созданы
- [ ] Индексы настроены
- [ ] Foreign Keys на месте
- [ ] Constraints работают
- [ ] Триггеры для счётчиков созданы
- [ ] Справочники заполнены (города, категории)
- [ ] Backup настроен
- [ ] Мониторинг включён

---

**Схема обновлена:** 14 марта 2026  
**Версия:** 1.0  
**Статус:** ✅ Ready for Implementation
