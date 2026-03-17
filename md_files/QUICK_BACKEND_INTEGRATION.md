# 🚀 Быстрая инструкция: Интеграция Backend

## ⚡ TL;DR - Краткая версия

### 1️⃣ Найти Mock данные

```bash
# Найти все места с mock данными
grep -r "MOCK DATA" src/
```

### 2️⃣ Создать API клиент

Создайте `/src/services/api.ts` и `/src/hooks/useApi.ts` (см. детали в `/BACKEND_INTEGRATION_GUIDE.md`)

### 3️⃣ Заменить в компонентах

**БЫЛО:**
```typescript
import { MOCK_VACANCIES } from "../../data/mockData";
const vacancies = MOCK_VACANCIES;
```

**СТАЛО:**
```typescript
import { useApi } from "../../hooks/useApi";
import { getVacancies } from "../../services/api";

const { data: vacancies, loading, error } = useApi(() => getVacancies());
```

### 4️⃣ Добавить Loading/Error

```typescript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### 5️⃣ Удалить Mock данные

```bash
# После полной интеграции
rm /src/data/mockData.ts

# Проверить что не осталось
grep -r "mockData" src/
```

---

## 📋 Список файлов для обновления

### Обязательные

- [ ] `/src/app/pages/Vacancies.tsx` - список вакансий
- [ ] `/src/app/pages/Workers.tsx` - список кандидатов  
- [ ] `/src/app/pages/Landing.tsx` - главная страница
- [ ] `/src/app/pages/Applications.tsx` - заявки
- [ ] `/src/app/pages/SavedJobs.tsx` - сохраненные
- [ ] `/src/app/pages/Messages.tsx` - сообщения
- [ ] `/src/app/pages/JobDetail.tsx` - детали вакансии
- [ ] `/src/app/pages/Home.tsx` - главная соискателя
- [ ] `/src/app/pages/KindergartenHome.tsx` - главная работодателя
- [ ] `/src/app/pages/KindergartenVacancies.tsx` - вакансии работодателя
- [ ] `/src/app/pages/KindergartenApplications.tsx` - заявки работодателя

### Дополнительные (если используют данные)

- [ ] Другие компоненты с `MOCK DATA` комментарием

---

## 🔍 Поиск Mock данных

### Команды для поиска

```bash
# Найти все файлы с MOCK DATA комментариями
grep -rn "MOCK DATA" src/

# Найти все импорты mockData
grep -rn "from.*mockData" src/

# Найти все использования MOCK_
grep -rn "MOCK_" src/
```

---

## 🎯 Шаблон замены

### До интеграции

```typescript
// MOCK DATA - Replace with API call
import { MOCK_VACANCIES } from "../../data/mockData";

export function Vacancies() {
  const vacancies = MOCK_VACANCIES;
  
  return <div>{/* JSX */}</div>;
}
```

### После интеграции

```typescript
import { useApi } from "../../hooks/useApi";
import { getVacancies } from "../../services/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";

export function Vacancies() {
  const { data: vacancies, loading, error, refetch } = useApi(() => getVacancies());
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!vacancies?.length) return <EmptyState />;
  
  return <div>{/* JSX */}</div>;
}
```

---

## 📦 Что нужно создать

### 1. API клиент

**Файл:** `/src/services/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getVacancies() {
  const response = await fetch(`${API_BASE_URL}/api/vacancies`);
  return response.json();
}

export async function getWorkers() {
  const response = await fetch(`${API_BASE_URL}/api/workers`);
  return response.json();
}

// ... другие функции
```

### 2. Custom Hook

**Файл:** `/src/hooks/useApi.ts`

```typescript
import { useState, useEffect } from 'react';

export function useApi<T>(fetchFunction: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchFunction()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

### 3. Loading компонент

**Файл:** `/src/components/LoadingSpinner.tsx`

```typescript
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
    </div>
  );
}
```

### 4. Error компонент

**Файл:** `/src/components/ErrorMessage.tsx`

```typescript
export function ErrorMessage({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-red-600 mb-4">{error.message}</p>
        {onRetry && (
          <button onClick={onRetry} className="bg-blue-600 text-white px-4 py-2 rounded">
            Повторить
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 🔧 Environment Variables

Создайте `.env` файл:

```env
# Development
VITE_API_BASE_URL=http://localhost:8000

# Production (закомментируйте для dev)
# VITE_API_BASE_URL=https://api.ishtop.uz
```

---

## ✅ Финальная проверка

```bash
# 1. Mock данные удалены
rm /src/data/mockData.ts

# 2. Нет импортов mockData
grep -r "mockData" src/
# Должно быть пусто!

# 3. Нет MOCK_ констант
grep -r "MOCK_" src/
# Должно быть пусто!

# 4. Все API вызовы используют useApi
grep -r "useApi" src/app/pages/
# Должны быть результаты

# 5. Все компоненты имеют loading/error
grep -r "LoadingSpinner" src/app/pages/
grep -r "ErrorMessage" src/app/pages/
```

---

## 🎯 Порядок действий (Step-by-Step)

1. ✅ Создать `/src/services/api.ts`
2. ✅ Создать `/src/hooks/useApi.ts`
3. ✅ Создать `/src/components/LoadingSpinner.tsx`
4. ✅ Создать `/src/components/ErrorMessage.tsx`
5. ✅ Настроить `.env` с `VITE_API_BASE_URL`
6. ✅ Обновить `Vacancies.tsx` (тестовая интеграция)
7. ✅ Проверить что работает
8. ✅ Обновить остальные компоненты по списку
9. ✅ Удалить `/src/data/mockData.ts`
10. ✅ Проверить grep-ом что нет упоминаний mock данных
11. ✅ Протестировать всё приложение
12. ✅ Deploy! 🚀

---

## 💡 Полезные команды

```bash
# Поиск всех TODO комментариев
grep -rn "TODO" src/

# Поиск всех API вызовов
grep -rn "apiFetch" src/

# Поиск всех useApi
grep -rn "useApi" src/

# Проверка что нет mock данных
! grep -r "MOCK" src/ && echo "✅ No mock data found"
```

---

## 📚 Полная документация

Для детальной информации смотрите:
- `/BACKEND_INTEGRATION_GUIDE.md` - полное руководство
- `/BACKEND_SPECIFICATION.md` - API спецификация
- `/DATABASE_IMPLEMENTATION_PROMPT.md` - Database схема

---

**Готово! Следуйте шагам и всё получится! 💪**
