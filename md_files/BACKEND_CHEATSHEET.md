# 🎯 Backend Cheatsheet - Быстрая справка

> Всё самое важное на одной странице

---

## ⚡ Быстрые команды

### Запуск
```bash
# Dev сервер
uvicorn app.main:app --reload

# Production
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### База данных
```bash
# Создать миграцию
alembic revision --autogenerate -m "description"

# Применить
alembic upgrade head

# Откатить
alembic downgrade -1

# Статус
alembic current
```

### Тесты
```bash
# Все тесты
pytest

# С покрытием
pytest --cov=app

# Конкретный файл
pytest tests/test_auth.py
```

---

## 🗄️ Таблицы БД (MVP)

```sql
users               -- Пользователи
candidate_profiles  -- Профили соискателей
employer_profiles   -- Профили работодателей
companies           -- Компании
vacancies           -- Вакансии ⭐
resumes             -- Резюме
applications        -- Отклики ⭐⭐⭐
skills              -- Навыки
cities              -- Города
categories          -- Категории
notifications       -- Уведомления
```

---

## 🔑 Ключевые Foreign Keys

```python
candidate_profiles.user_id → users.id
employer_profiles.user_id → users.id
employer_profiles.company_id → companies.id

vacancies.company_id → companies.id
vacancies.city_id → cities.id
vacancies.category_id → categories.id

resumes.candidate_id → candidate_profiles.id

applications.vacancy_id → vacancies.id
applications.candidate_id → candidate_profiles.id
applications.resume_id → resumes.id
```

---

## 📊 Важные Constraints

```sql
-- Один отклик на вакансию
UNIQUE(vacancy_id, candidate_id, resume_id)

-- Один в избранное
UNIQUE(candidate_id, vacancy_id)

-- Валидная роль
CHECK (role IN ('candidate', 'employer', 'admin'))

-- Валидный статус вакансии
CHECK (status IN ('draft', 'active', 'archived', 'closed'))

-- Валидный статус отклика
CHECK (status IN ('pending', 'viewed', 'invited', 'rejected', 'hired'))
```

---

## 🔌 API Endpoints (шпаргалка)

### Auth
```
POST /auth/telegram      → Вход через Telegram
GET  /auth/me            → Текущий пользователь
```

### Vacancies (Candidate)
```
GET  /vacancies          → Список (фильтры: city_id, category_id, salary_from)
GET  /vacancies/:id      → Детали
POST /vacancies/:id/view → Отметить просмотр
```

### Applications (Candidate)
```
GET  /applications       → Мои отклики
POST /applications       → Откликнуться
```

### Profile (Candidate)
```
GET   /profile           → Мой профиль
PATCH /profile           → Обновить
POST  /profile/avatar    → Загрузить аватар
```

### Favorites
```
GET    /favorites        → Список
POST   /favorites        → Добавить
DELETE /favorites/:id    → Убрать
```

### Vacancies (Employer)
```
GET    /employer/vacancies     → Мои вакансии
POST   /employer/vacancies     → Создать
PATCH  /employer/vacancies/:id → Обновить
DELETE /employer/vacancies/:id → Удалить
```

### Applications (Employer)
```
GET   /employer/applications          → Все отклики
GET   /employer/vacancies/:id/applications → На конкретную вакансию
PATCH /employer/applications/:id/status    → Изменить статус
```

---

## 🔐 Аутентификация

### Хеширование паролей
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])

# Хешировать
hashed = pwd_context.hash("password")

# Проверить
is_valid = pwd_context.verify("password", hashed)
```

### JWT токены
```python
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

# Создать
def create_token(user_id: str):
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Проверить
def verify_token(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload.get("sub")
```

### Telegram auth
```python
import hashlib
import hmac

def verify_telegram_auth(init_data: str, bot_token: str):
    # Парсить данные
    parsed = parse_qs(init_data)
    hash_value = parsed.get('hash', [''])[0]
    
    # Создать строку для проверки
    data_check = '\n'.join([
        f"{k}={v[0]}" 
        for k, v in sorted(parsed.items()) 
        if k != 'hash'
    ])
    
    # Проверить подпись
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    calculated_hash = hmac.new(
        secret_key,
        data_check.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return calculated_hash == hash_value
```

---

## 📝 Pydantic Schemas (примеры)

### Vacancy
```python
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class VacancyCreate(BaseModel):
    title: str
    description: Optional[str]
    salary_from: Optional[int]
    salary_to: Optional[int]
    city_id: UUID
    category_id: UUID
    employment_type: str
    work_format: str

class VacancyResponse(BaseModel):
    id: UUID
    title: str
    salary_from: int
    salary_to: int
    company_name: str
    city_name: str
    category_name: str
    views_count: int
    applications_count: int
```

### Application
```python
class ApplicationCreate(BaseModel):
    vacancy_id: UUID
    resume_id: UUID
    cover_letter: Optional[str]

class ApplicationResponse(BaseModel):
    id: UUID
    vacancy_id: UUID
    status: str
    applied_at: datetime
```

---

## 🔍 Фильтры для GET /vacancies

```python
@router.get("/vacancies")
async def get_vacancies(
    city_id: Optional[UUID] = None,
    category_id: Optional[UUID] = None,
    salary_from: Optional[int] = None,
    salary_to: Optional[int] = None,
    employment_type: Optional[str] = None,
    work_format: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100)
):
    query = db.query(Vacancy).filter(Vacancy.status == "active")
    
    if city_id:
        query = query.filter(Vacancy.city_id == city_id)
    if category_id:
        query = query.filter(Vacancy.category_id == category_id)
    if salary_from:
        query = query.filter(Vacancy.salary_from >= salary_from)
    if search:
        query = query.filter(Vacancy.title.ilike(f"%{search}%"))
    
    offset = (page - 1) * limit
    vacancies = query.offset(offset).limit(limit).all()
    
    return {"items": vacancies, "page": page}
```

---

## 📊 SQL Запросы (часто используемые)

### Вакансии с компаниями
```sql
SELECT 
    v.*,
    c.name as company_name,
    c.logo_url,
    city.name_ru as city_name
FROM vacancies v
JOIN companies c ON v.company_id = c.id
JOIN cities city ON v.city_id = city.id
WHERE v.status = 'active'
ORDER BY v.published_at DESC;
```

### Отклики соискателя
```sql
SELECT 
    a.*,
    v.title,
    c.name as company_name
FROM applications a
JOIN resumes r ON a.resume_id = r.id
JOIN vacancies v ON a.vacancy_id = v.id
JOIN companies c ON v.company_id = c.id
WHERE r.candidate_id = ?
ORDER BY a.applied_at DESC;
```

### Отклики работодателя
```sql
SELECT 
    a.*,
    v.title,
    u.first_name,
    u.last_name
FROM applications a
JOIN vacancies v ON a.vacancy_id = v.id
JOIN resumes r ON a.resume_id = r.id
JOIN candidate_profiles cp ON r.candidate_id = cp.id
JOIN users u ON cp.user_id = u.id
WHERE v.company_id = ?
ORDER BY a.applied_at DESC;
```

---

## 🚨 Обработка ошибок

### FastAPI HTTPException
```python
from fastapi import HTTPException

# Not Found
raise HTTPException(status_code=404, detail="Vacancy not found")

# Unauthorized
raise HTTPException(status_code=401, detail="Invalid token")

# Forbidden
raise HTTPException(status_code=403, detail="Access denied")

# Bad Request
raise HTTPException(status_code=400, detail="Already applied")

# Server Error
raise HTTPException(status_code=500, detail="Server error")
```

### Try-except
```python
from sqlalchemy.exc import IntegrityError

try:
    db.add(application)
    db.commit()
except IntegrityError:
    raise HTTPException(
        status_code=400,
        detail="You have already applied to this vacancy"
    )
```

---

## 🔧 Environment Variables

```bash
# .env файл
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-super-secret-key-change-in-production
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ENVIRONMENT=development  # development | production
DEBUG=True
CORS_ORIGINS=*

# В production:
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=https://yourapp.uz,https://t.me
```

---

## 📦 Dependencies (requirements.txt)

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
alembic==1.13.1
pydantic==2.6.0
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
python-dotenv==1.0.0
```

---

## 🎯 Критические индексы

```sql
-- Users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- Vacancies
CREATE INDEX idx_vacancies_status ON vacancies(status);
CREATE INDEX idx_vacancies_category_city_status 
  ON vacancies(category_id, city_id, status);

-- Applications
CREATE INDEX idx_applications_vacancy_id ON applications(vacancy_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);

-- Messages
CREATE INDEX idx_messages_chat_id_created_at 
  ON messages(chat_id, created_at DESC);
```

---

## 🐛 Debugging

### Логирование
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Vacancy created")
logger.warning("User not found")
logger.error("Database connection failed")
```

### SQL запросы
```python
# Показать SQL запросы
import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

### Profiling
```python
import time

start = time.time()
# ... код ...
print(f"Execution time: {time.time() - start}s")
```

---

## 🚀 Production Checklist

- [ ] SECRET_KEY изменён
- [ ] DEBUG=False
- [ ] CORS настроен правильно
- [ ] HTTPS включён
- [ ] Rate limiting добавлен
- [ ] Логирование настроено
- [ ] Monitoring (Sentry) подключён
- [ ] Backup БД настроен
- [ ] Health check endpoint работает
- [ ] Все индексы созданы
- [ ] Тесты проходят

---

## 🔗 Полезные ссылки

- 📚 [Полная документация](BACKEND_DATABASE_GUIDE.md)
- ⚡ [Быстрый старт](QUICK_START_BACKEND.md)
- 🔗 [Frontend интеграция](FRONTEND_BACKEND_INTEGRATION.md)
- 📊 [Схема БД](DATABASE_SCHEMA_VISUAL.md)

---

## 💡 Pro Tips

1. **Всегда используйте транзакции** для связанных операций
2. **Добавляйте индексы** на часто запрашиваемые поля
3. **Валидируйте данные** через Pydantic
4. **Кешируйте справочники** (города, категории)
5. **Используйте async/await** для I/O операций
6. **Логируйте всё** важное
7. **Тестируйте** каждый endpoint
8. **Документируйте** API через docstrings

---

**Версия:** 1.0  
**Дата:** 14 марта 2026  
**Статус:** ✅ Ready to Use

💪 **Удачи в разработке!**
