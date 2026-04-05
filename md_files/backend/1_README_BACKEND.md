# 🚀 Job Search App - Backend Documentation

> Полная документация backend системы для Telegram WebApp приложения поиска работы в детских садах Узбекистана

---

## 📚 Навигация по документации

| Документ | Описание | Для кого | Время чтения |
|----------|----------|----------|--------------|
| **[2_BACKEND_DOCS_INDEX.md](2_BACKEND_DOCS_INDEX.md)** | 📖 Главный индекс всей документации | Все | 5 мин |
| **[3_QUICK_START_BACKEND.md](3_QUICK_START_BACKEND.md)** | ⚡ Запуск за 5 минут | Backend Dev | 10 мин |
| **[4_BACKEND_DATABASE_GUIDE.md](4_BACKEND_DATABASE_GUIDE.md)** | 🗄️ Полный гайд по БД (1000+ строк) | Backend Dev, DBA | 30 мин |
| **[5_FRONTEND_BACKEND_INTEGRATION.md](5_FRONTEND_BACKEND_INTEGRATION.md)** | 🔗 Интеграция Frontend с API | Frontend Dev | 15 мин |
| **[6_DATABASE_SCHEMA_VISUAL.md](6_DATABASE_SCHEMA_VISUAL.md)** | 📊 Визуальная схема БД | Все | 10 мин |

---

## ⚡ Быстрый старт (60 секунд)

```bash
# 1. Клонировать и установить зависимости
git clone <repo>
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary

# 2. Создать БД
createdb job_search_app

# 3. Запустить сервер
uvicorn app.main:app --reload

# ✅ Готово! Откройте http://localhost:8000/docs
```

**Подробнее:** [3_QUICK_START_BACKEND.md](3_QUICK_START_BACKEND.md)

---

## 🎯 Что это за проект?

### Описание
Telegram WebApp для поиска работы в детских садах Узбекистана. Соединяет соискателей (воспитатели, няни, повара) с работодателями (детские сады).

### Ключевые особенности
- 🔐 Авторизация через Telegram
- 💼 Поиск вакансий с фильтрами
- 📝 Отклики на вакансии
- 💬 Чаты между соискателями и работодателями
- ⭐ Избранные вакансии
- 🔔 Уведомления в реальном времени
- 🌐 Двуязычность (Русский/Узбекский)
- 💰 Валюта: Узбекский сум (UZS)

---

## 🗄️ База данных (кратко)

### MVP таблицы (13 обязательных)

```sql
1.  users                  -- Пользователи
2.  candidate_profiles     -- Профили соискателей
3.  employer_profiles      -- Профили работодателей
4.  companies              -- Компании (детские сады)
5.  vacancies              -- Вакансии
6.  resumes                -- Резюме
7.  applications           -- Отклики ⭐
8.  skills                 -- Справочник навыков
9.  resume_skills          -- Навыки в резюме
10. vacancy_skills         -- Требуемые навыки
11. cities                 -- Города
12. categories             -- Категории вакансий
13. notifications          -- Уведомления
```

**Детальная схема:** [6_DATABASE_SCHEMA_VISUAL.md](6_DATABASE_SCHEMA_VISUAL.md)

---

## 🔌 API Endpoints (основные)

### Аутентификация
```
POST   /api/v1/auth/telegram      # Вход через Telegram
GET    /api/v1/auth/me             # Текущий пользователь
```

### Вакансии
```
GET    /api/v1/vacancies           # Список с фильтрами
GET    /api/v1/vacancies/:id       # Детали вакансии
```

### Отклики
```
GET    /api/v1/applications        # Мои отклики
POST   /api/v1/applications        # Откликнуться
```

**Полный список:** [4_BACKEND_DATABASE_GUIDE.md](4_BACKEND_DATABASE_GUIDE.md) → API Endpoints

---

**Последнее обновление:** 14 марта 2026  
**Версия документации:** 1.0  
**Статус:** ✅ Production Ready
