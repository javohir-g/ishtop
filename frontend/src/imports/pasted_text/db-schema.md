1. Основная логика

У тебя обычно есть 3 главные роли:

Соискатель

Работодатель

Админ / супер-админ

И главные сущности:

users

candidate_profiles

employer_profiles

companies

vacancies

resumes

applications

favorites

chats / messages

notifications

2. Базовая структура таблиц
users

Общая таблица всех пользователей.

users
- id
- phone
- email
- password_hash
- role                  -- candidate / employer / admin
- first_name
- last_name
- avatar_url
- is_active
- is_verified
- created_at
- updated_at

Зачем:

Это единая точка входа.
Не надо делать отдельные таблицы auth_candidate и auth_employer. Лучше одна auth-таблица + профиль по роли.

candidate_profiles

Профиль соискателя.

candidate_profiles
- id
- user_id               -- FK -> users.id
- birth_date
- gender
- city_id
- address
- about
- education_level
- experience_years
- current_position
- expected_salary_from
- expected_salary_to
- employment_type       -- full-time / part-time / internship
- work_format           -- office / remote / hybrid
- telegram_username
- created_at
- updated_at

employer_profiles

Профиль работодателя.

employer_profiles
- id
- user_id               -- FK -> users.id
- company_id            -- FK -> companies.id
- position_in_company
- created_at
- updated_at

Логика:

Один пользователь-работодатель может быть привязан к компании.

companies

Компании.

companies
- id
- name
- slug
- logo_url
- description
- industry_id
- company_size
- website
- phone
- email
- city_id
- address
- owner_user_id         -- кто создал компанию
- is_verified
- status                -- active / blocked / pending
- created_at
- updated_at

vacancies

Вакансии.

vacancies
- id
- company_id            -- FK -> companies.id
- created_by_user_id    -- FK -> users.id
- title
- slug
- description
- responsibilities
- requirements
- conditions
- salary_from
- salary_to
- currency
- city_id
- employment_type
- work_format
- experience_level
- education_level
- category_id
- status                -- draft / active / archived / closed
- published_at
- expires_at
- views_count
- created_at
- updated_at

resumes

Резюме соискателей.

resumes
- id
- candidate_id          -- FK -> candidate_profiles.id
- title
- about
- specialization_id
- salary_expectation
- currency
- city_id
- work_format
- employment_type
- experience_years
- is_primary
- is_public
- status                -- active / hidden / archived
- created_at
- updated_at

Важно:

Один соискатель может иметь несколько резюме.

3. Детализация навыков и связей
skills

Справочник навыков.

skills
- id
- name
- slug
- created_at

resume_skills

Навыки в резюме.

resume_skills
- id
- resume_id             -- FK -> resumes.id
- skill_id              -- FK -> skills.id
- level                 -- beginner / middle / advanced

vacancy_skills

Навыки для вакансии.

vacancy_skills
- id
- vacancy_id            -- FK -> vacancies.id
- skill_id              -- FK -> skills.id
- is_required

4. Опыт работы и образование
resume_experiences
resume_experiences
- id
- resume_id             -- FK -> resumes.id
- company_name
- position
- description
- start_date
- end_date
- is_current

resume_educations
resume_educations
- id
- resume_id             -- FK -> resumes.id
- institution_name
- degree
- field_of_study
- start_year
- end_year

resume_languages
resume_languages
- id
- resume_id             -- FK -> resumes.id
- language
- level

5. Отклики — самая важная таблица
applications

Отклики на вакансии.

applications
- id
- vacancy_id            -- FK -> vacancies.id
- candidate_id          -- FK -> candidate_profiles.id
- resume_id             -- FK -> resumes.id
- cover_letter
- status                -- pending / viewed / invited / rejected / hired
- applied_at
- updated_at

Очень важно:

Поставь уникальность:

UNIQUE(vacancy_id, candidate_id, resume_id)


Чтобы один и тот же человек не спамил одинаковым откликом.

6. Избранное
favorite_vacancies
favorite_vacancies
- id
- candidate_id
- vacancy_id
- created_at

favorite_resumes

Если работодатели могут сохранять кандидатов.

favorite_resumes
- id
- employer_user_id
- resume_id
- created_at

7. Просмотры
vacancy_views
vacancy_views
- id
- vacancy_id
- user_id               -- nullable, если гость
- ip_address
- user_agent
- viewed_at

resume_views
resume_views
- id
- resume_id
- employer_user_id
- viewed_at

8. Чаты

Если у тебя будет чат между работодателем и соискателем:

chats
chats
- id
- application_id        -- FK -> applications.id, nullable
- created_at

chat_participants
chat_participants
- id
- chat_id
- user_id
- joined_at

messages
messages
- id
- chat_id
- sender_user_id
- message_type          -- text / file / system
- content
- file_url
- is_read
- created_at

9. Уведомления
notifications
notifications
- id
- user_id
- type                  -- application_status / new_message / vacancy_approved ...
- title
- body
- data_json
- is_read
- created_at

10. География и справочники

Чтобы не хранить текст везде руками, лучше делать справочники.

cities
cities
- id
- name
- region
- country

categories

Категории вакансий.

categories
- id
- name
- parent_id             -- nullable

industries
industries
- id
- name

specializations
specializations
- id
- category_id
- name

11. Файлы
files
files
- id
- user_id
- file_type             -- avatar / resume_pdf / company_logo / certificate
- file_url
- original_name
- mime_type
- size
- created_at

12. Админская часть
moderation_logs
moderation_logs
- id
- admin_user_id
- entity_type           -- vacancy / company / resume / user
- entity_id
- action                -- approved / rejected / blocked / edited
- comment
- created_at

reports

Жалобы.

reports
- id
- reporter_user_id
- entity_type
- entity_id
- reason
- comment
- status
- created_at

13. Если делать SaaS или монетизацию

Если работодатели платят за размещение:

tariffs
tariffs
- id
- name
- price
- currency
- duration_days
- max_active_vacancies
- can_view_contacts
- can_boost_vacancies
- created_at

company_subscriptions
company_subscriptions
- id
- company_id
- tariff_id
- start_date
- end_date
- status
- created_at

payments
payments
- id
- company_id
- subscription_id
- amount
- currency
- provider
- provider_transaction_id
- status
- paid_at
- created_at

14. Как это связать между собой

Простая связь такая:

users → основная учетная запись

candidate_profiles → профиль соискателя

employer_profiles → профиль работодателя

companies → компания

vacancies → принадлежат компании

resumes → принадлежат соискателю

applications → связь между вакансией и резюме

messages/chats → общение после отклика

notifications → события в системе

15. Что нужно для MVP обязательно

Для первого запуска тебе не надо делать 50 таблиц.
Достаточно вот этого набора:

Обязательно:

users

candidate_profiles

employer_profiles

companies

vacancies

resumes

applications

skills

resume_skills

vacancy_skills

cities

categories

notifications

Желательно:

resume_experiences

resume_educations

favorite_vacancies

chats

messages

Потом:

payments

subscriptions

moderation_logs

analytics tables

16. Как бы я советовал спроектировать именно тебе

Так как ты работаешь с FastAPI, я бы советовал:

PostgreSQL как основную БД

SQLAlchemy / SQLModel

Alembic для миграций

UUID как id, если хочешь современную архитектуру

created_at, updated_at почти в каждой таблице

enums для статусов

индексы на часто используемые поля

17. Какие индексы обязательно нужны

Например:

users(email)

users(phone)

vacancies(company_id, status)

vacancies(category_id, city_id, status)

resumes(candidate_id, status)

applications(vacancy_id, candidate_id)

messages(chat_id, created_at)

notifications(user_id, is_read)

Иначе потом поиск и списки будут тормозить.

18. Очень упрощенная ER-логика
User
 ├── CandidateProfile
 │    └── Resumes
 │         ├── ResumeSkills
 │         ├── ResumeExperiences
 │         └── ResumeEducations
 │
 └── EmployerProfile
      └── Company
           └── Vacancies
                ├── VacancySkills
                └── Applications
                     └── Resume

19. Практический совет

Не делай одну огромную таблицу users со всеми полями:

опыт

компания

зарплата

описание фирмы

стаж

график

Это ошибка.

Лучше:

auth отдельно

профиль кандидата отдельно

профиль работодателя отдельно

вакансии отдельно

резюме отдельно

Так база будет чистой и масштабируемой.

20. Самый адекватный вариант для старта

Если совсем по делу, то для проекта типа hh я бы начал с такой схемы:

users
candidate_profiles
employer_profiles
companies
vacancies
resumes
resume_experiences
resume_educations
skills
resume_skills
vacancy_skills
applications
favorite_vacancies
notifications
cities
categories