# 🚀 Quick Start: Backend для приложения поиска работы

## За 5 минут: Минимальный MVP

### 1️⃣ Установка (2 минуты)

```bash
# Создать виртуальное окружение
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows

# Установить зависимости
pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary pydantic python-jose passlib bcrypt
```

### 2️⃣ Создать БД (1 минута)

```bash
# В PostgreSQL
createdb job_search_app

# Или через SQL
psql -U postgres
CREATE DATABASE job_search_app;
```

### 3️⃣ Структура проекта (30 секунд)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI приложение
│   ├── database.py          # Подключение к БД
│   ├── models.py            # SQLAlchemy модели
│   ├── schemas.py           # Pydantic схемы
│   ├── crud.py              # Операции с БД
│   └── routers/
│       ├── auth.py
│       ├── vacancies.py
│       ├── applications.py
│       └── profile.py
├── alembic/                 # Миграции
├── .env                     # Переменные окружения
└── requirements.txt
```

### 4️⃣ Минимальный код (1.5 минуты)

**`.env`**
```env
DATABASE_URL=postgresql://postgres:password@localhost/job_search_app
SECRET_KEY=your-secret-key-change-this-in-production
```

**`app/main.py`**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Job Search API")

# CORS для Telegram WebApp
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Job Search API v1.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

**Запуск:**
```bash
uvicorn app.main:app --reload
```

✅ Backend готов! Откройте http://localhost:8000/docs

---

## Следующие шаги (по порядку)

### Шаг 1: Создать модели БД (15 минут)

См. полный файл `/BACKEND_DATABASE_GUIDE.md` раздел "Детальные схемы таблиц"

**Минимум для MVP:**
1. `users` - пользователи
2. `candidate_profiles` - профили соискателей
3. `employer_profiles` - профили работодателей
4. `companies` - компании
5. `vacancies` - вакансии
6. `resumes` - резюме
7. `applications` - отклики
8. `cities` - города
9. `categories` - категории

### Шаг 2: Настроить Alembic (5 минут)

```bash
# Инициализация
alembic init alembic

# Редактировать alembic.ini - указать DATABASE_URL

# Создать миграцию
alembic revision --autogenerate -m "initial tables"

# Применить
alembic upgrade head
```

### Шаг 3: Создать API endpoints (30 минут)

**Приоритет 1 (Критически важные):**
- `POST /auth/telegram` - авторизация через Telegram
- `GET /vacancies` - список вакансий
- `GET /vacancies/:id` - детали вакансии
- `POST /applications` - откликнуться на вакансию
- `GET /applications` - мои отклики

**Приоритет 2 (Важные):**
- `GET /profile` - профиль
- `PATCH /profile` - обновить профиль
- `GET /favorites` - сохраненные
- `POST /favorites` - добавить в сохраненное

**Приоритет 3 (Потом):**
- Чаты
- Уведомления
- Аналитика

---

## Telegram WebApp интеграция

### Авторизация через Telegram

```python
from fastapi import APIRouter, Depends, HTTPException
import hashlib
import hmac
from urllib.parse import parse_qs

router = APIRouter(prefix="/auth", tags=["auth"])

def verify_telegram_auth(init_data: str, bot_token: str) -> dict:
    """Проверка данных от Telegram WebApp"""
    try:
        parsed_data = parse_qs(init_data)
        hash_value = parsed_data.get('hash', [''])[0]
        
        # Создать строку для проверки
        data_check_string = '\n'.join([
            f"{k}={v[0]}" for k, v in sorted(parsed_data.items()) 
            if k != 'hash'
        ])
        
        # Проверить подпись
        secret_key = hashlib.sha256(bot_token.encode()).digest()
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if calculated_hash != hash_value:
            raise ValueError("Invalid hash")
        
        # Вернуть данные пользователя
        import json
        user_data = json.loads(parsed_data.get('user', ['{}'])[0])
        return user_data
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Telegram auth")

@router.post("/telegram")
async def telegram_auth(init_data: str):
    """Авторизация через Telegram WebApp"""
    user_data = verify_telegram_auth(init_data, "YOUR_BOT_TOKEN")
    
    # Найти или создать пользователя
    # user = find_or_create_user(user_data)
    
    # Создать JWT токен
    # token = create_access_token(user.id)
    
    return {
        "access_token": "token",
        "token_type": "bearer",
        "user": user_data
    }
```

---

## Частые вопросы (FAQ)

### ❓ Как хранить пароли?
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Хешировать
hashed = pwd_context.hash("password123")

# Проверить
is_valid = pwd_context.verify("password123", hashed)
```

### ❓ Как создать JWT токен?
```python
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def create_access_token(user_id: str):
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### ❓ Как добавить фильтры в GET /vacancies?
```python
from typing import Optional
from fastapi import Query

@router.get("/vacancies")
async def get_vacancies(
    city_id: Optional[str] = None,
    category_id: Optional[str] = None,
    salary_from: Optional[int] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100)
):
    # Построить запрос с фильтрами
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
    
    return {"items": vacancies, "page": page, "limit": limit}
```

### ❓ Как предотвратить дубли откликов?
```sql
-- В таблице applications
CONSTRAINT unique_application UNIQUE (vacancy_id, candidate_id, resume_id)
```

```python
# В коде FastAPI
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

## Тестирование API

### Через curl

```bash
# Получить вакансии
curl http://localhost:8000/api/v1/vacancies

# С фильтрами
curl "http://localhost:8000/api/v1/vacancies?city_id=123&salary_from=5000000"

# Создать отклик (с авторизацией)
curl -X POST http://localhost:8000/api/v1/applications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vacancy_id": "123", "resume_id": "456", "cover_letter": "Hello"}'
```

### Через Postman/Insomnia

1. Импортировать OpenAPI схему: http://localhost:8000/openapi.json
2. Все endpoints автоматически добавятся

---

## Production Checklist

### Перед деплоем

- [ ] Сменить `SECRET_KEY` на случайный
- [ ] Настроить CORS (убрать `allow_origins=["*"]`)
- [ ] Добавить rate limiting
- [ ] Настроить логирование
- [ ] Добавить Sentry для мониторинга ошибок
- [ ] Настроить HTTPS
- [ ] Настроить PostgreSQL connection pool
- [ ] Добавить health check endpoint
- [ ] Настроить backup базы данных
- [ ] Протестировать все endpoints

### Деплой на сервер

```bash
# Через systemd service
sudo nano /etc/systemd/system/jobsearch-api.service

[Unit]
Description=Job Search API
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/jobsearch-api
ExecStart=/var/www/jobsearch-api/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable jobsearch-api
sudo systemctl start jobsearch-api
```

### Nginx конфигурация

```nginx
server {
    listen 80;
    server_name api.yourapp.uz;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Полезные ссылки

- 📚 [Полный гайд по БД](/BACKEND_DATABASE_GUIDE.md)
- 📖 [FastAPI документация](https://fastapi.tiangolo.com)
- 🗄️ [SQLAlchemy документация](https://docs.sqlalchemy.org)
- 🔐 [JWT авторизация](https://fastapi.tiangolo.com/tutorial/security/)
- 📱 [Telegram WebApp API](https://core.telegram.org/bots/webapps)

---

**Время на полный MVP:** ~4 часа  
**Минимальный функционал:** Регистрация, просмотр вакансий, отклики  

**Готово к работе!** 🚀
