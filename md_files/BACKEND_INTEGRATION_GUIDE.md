# Руководство по интеграции Backend и удалению Mock данных

## 📋 Содержание

1. [Обзор](#обзор)
2. [Где находятся Mock данные](#где-находятся-mock-данные)
3. [Пошаговая инструкция по интеграции](#пошаговая-инструкция-по-интеграции)
4. [Создание API клиента](#создание-api-клиента)
5. [Замена Mock данных в компонентах](#замена-mock-данных-в-компонентах)
6. [Добавление Loading и Error состояний](#добавление-loading-и-error-состояний)
7. [Тестирование интеграции](#тестирование-интеграции)
8. [Checklist перед продакшеном](#checklist-перед-продакшеном)

---

## 🎯 Обзор

Все mock данные приложения централизованы в одном файле:
```
/src/data/mockData.ts
```

В коде используются комментарии для обозначения мест, где нужно заменить mock данные на реальные API вызовы:

```typescript
// MOCK DATA - Replace with API call when integrating backend
// TODO: Implement: const { data, loading, error } = useFetch('/api/vacancies')
```

---

## 📂 Где находятся Mock данные

### 1. Централизованный файл

**Файл:** `/src/data/mockData.ts`

**Содержит:**
- `MOCK_VACANCIES` - вакансии для соискателей
- `MOCK_WORKERS` - кандидаты для работодателей
- `MOCK_MESSAGES` - список чатов
- `MOCK_CHAT_MESSAGES` - сообщения в чате
- `MOCK_APPLICATIONS` - заявки соискателя
- `MOCK_JOB_DETAILS` - детали вакансии
- `MOCK_KINDERGARTEN_VACANCIES` - вакансии работодателя
- `MOCK_KINDERGARTEN_APPLICATIONS` - заявки к работодателю
- `MOCK_SAVED_JOBS` - сохраненные вакансии
- `MOCK_STATISTICS` - статистика соискателя
- `MOCK_KINDERGARTEN_STATISTICS` - статистика работодателя

### 2. Компоненты с Mock данными

**Найдите все файлы с комментарием `MOCK DATA`:**

```bash
# Поиск всех файлов с MOCK DATA комментариями
grep -r "MOCK DATA" src/
```

**Список файлов с mock данными:**

1. `/src/app/pages/Vacancies.tsx` - список вакансий
2. `/src/app/pages/Workers.tsx` - список кандидатов
3. `/src/app/pages/Landing.tsx` - лендинг с последними вакансиями
4. Другие компоненты (см. результаты grep)

---

## 🔧 Пошаговая инструкция по интеграции

### Шаг 1: Подготовка

**1.1. Убедитесь, что backend API готов**

Проверьте, что все endpoints из `/BACKEND_SPECIFICATION.md` работают:

```bash
# Пример проверки API
curl http://localhost:8000/api/vacancies
curl http://localhost:8000/api/workers
curl http://localhost:8000/api/applications
```

**1.2. Получите URL вашего API**

```typescript
// В .env файле
VITE_API_BASE_URL=http://localhost:8000
# или для production
VITE_API_BASE_URL=https://api.ishtop.uz
```

---

### Шаг 2: Создание API клиента

**2.1. Создайте файл для API клиента**

**Файл:** `/src/services/api.ts`

```typescript
/**
 * API Client for Ish-Top Application
 * 
 * This file contains all API calls to the backend.
 * Base URL is configured via environment variable VITE_API_BASE_URL
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Types (import from mockData or create new ones)
import type { Vacancy, Worker, Application, Message } from '../data/mockData';

/**
 * Generic API fetch function with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token
        // 'Authorization': `Bearer ${getAuthToken()}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

// ==================== VACANCIES API ====================

/**
 * Get all vacancies
 * @param filters - Optional filters (district, salary, type, etc.)
 */
export async function getVacancies(filters?: {
  district?: string;
  minSalary?: number;
  type?: string;
  limit?: number;
  offset?: number;
}): Promise<Vacancy[]> {
  const params = new URLSearchParams();
  
  if (filters?.district) params.append('district', filters.district);
  if (filters?.minSalary) params.append('min_salary', filters.minSalary.toString());
  if (filters?.type) params.append('type', filters.type);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<Vacancy[]>(`/api/vacancies${query}`);
}

/**
 * Get vacancy by ID
 */
export async function getVacancyById(id: number): Promise<Vacancy> {
  return apiFetch<Vacancy>(`/api/vacancies/${id}`);
}

/**
 * Apply to vacancy
 */
export async function applyToVacancy(vacancyId: number): Promise<void> {
  return apiFetch<void>(`/api/vacancies/${vacancyId}/apply`, {
    method: 'POST',
  });
}

/**
 * Save/bookmark vacancy
 */
export async function saveVacancy(vacancyId: number): Promise<void> {
  return apiFetch<void>(`/api/vacancies/${vacancyId}/save`, {
    method: 'POST',
  });
}

// ==================== WORKERS API ====================

/**
 * Get all workers/candidates
 */
export async function getWorkers(filters?: {
  position?: string;
  district?: string;
  minRating?: number;
  maxSalary?: number;
  limit?: number;
  offset?: number;
}): Promise<Worker[]> {
  const params = new URLSearchParams();
  
  if (filters?.position) params.append('position', filters.position);
  if (filters?.district) params.append('district', filters.district);
  if (filters?.minRating) params.append('min_rating', filters.minRating.toString());
  if (filters?.maxSalary) params.append('max_salary', filters.maxSalary.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<Worker[]>(`/api/workers${query}`);
}

/**
 * Get worker by ID
 */
export async function getWorkerById(id: number): Promise<Worker> {
  return apiFetch<Worker>(`/api/workers/${id}`);
}

/**
 * Invite worker to vacancy
 */
export async function inviteWorker(workerId: number, vacancyId: number): Promise<void> {
  return apiFetch<void>(`/api/workers/${workerId}/invite`, {
    method: 'POST',
    body: JSON.stringify({ vacancy_id: vacancyId }),
  });
}

// ==================== APPLICATIONS API ====================

/**
 * Get user's applications
 */
export async function getApplications(): Promise<Application[]> {
  return apiFetch<Application[]>('/api/applications');
}

/**
 * Get application by ID
 */
export async function getApplicationById(id: number): Promise<Application> {
  return apiFetch<Application>(`/api/applications/${id}`);
}

/**
 * Withdraw application
 */
export async function withdrawApplication(id: number): Promise<void> {
  return apiFetch<void>(`/api/applications/${id}/withdraw`, {
    method: 'POST',
  });
}

// ==================== MESSAGES API ====================

/**
 * Get all conversations
 */
export async function getConversations(): Promise<Message[]> {
  return apiFetch<Message[]>('/api/messages');
}

/**
 * Get messages in conversation
 */
export async function getConversationMessages(conversationId: number) {
  return apiFetch(`/api/messages/${conversationId}`);
}

/**
 * Send message
 */
export async function sendMessage(conversationId: number, text: string): Promise<void> {
  return apiFetch<void>(`/api/messages/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

// ==================== SAVED JOBS API ====================

/**
 * Get saved/bookmarked jobs
 */
export async function getSavedJobs(): Promise<Vacancy[]> {
  return apiFetch<Vacancy[]>('/api/saved-jobs');
}

/**
 * Remove from saved jobs
 */
export async function unsaveJob(vacancyId: number): Promise<void> {
  return apiFetch<void>(`/api/saved-jobs/${vacancyId}`, {
    method: 'DELETE',
  });
}

// ==================== STATISTICS API ====================

/**
 * Get user statistics (for job seekers)
 */
export async function getUserStatistics() {
  return apiFetch('/api/statistics');
}

/**
 * Get kindergarten statistics (for employers)
 */
export async function getKindergartenStatistics() {
  return apiFetch('/api/kindergarten/statistics');
}

// ==================== KINDERGARTEN VACANCIES API ====================

/**
 * Get kindergarten's own vacancies
 */
export async function getKindergartenVacancies() {
  return apiFetch('/api/kindergarten/vacancies');
}

/**
 * Create new vacancy
 */
export async function createVacancy(data: any): Promise<void> {
  return apiFetch('/api/kindergarten/vacancies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update vacancy
 */
export async function updateVacancy(id: number, data: any): Promise<void> {
  return apiFetch(`/api/kindergarten/vacancies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete vacancy
 */
export async function deleteVacancy(id: number): Promise<void> {
  return apiFetch(`/api/kindergarten/vacancies/${id}`, {
    method: 'DELETE',
  });
}

// ==================== KINDERGARTEN APPLICATIONS API ====================

/**
 * Get applications to kindergarten's vacancies
 */
export async function getKindergartenApplications() {
  return apiFetch('/api/kindergarten/applications');
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  id: number,
  status: 'reviewing' | 'interview' | 'accepted' | 'rejected'
): Promise<void> {
  return apiFetch(`/api/kindergarten/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ==================== PROFILE API ====================

/**
 * Get current user profile
 */
export async function getUserProfile() {
  return apiFetch('/api/profile');
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: any): Promise<void> {
  return apiFetch('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Upload profile photo
 */
export async function uploadProfilePhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await fetch(`${API_BASE_URL}/api/profile/photo`, {
    method: 'POST',
    body: formData,
    // Note: Don't set Content-Type for FormData, browser will set it automatically
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload photo');
  }
  
  const data = await response.json();
  return data.url;
}
```

---

### Шаг 3: Создание Custom Hook для Data Fetching

**Файл:** `/src/hooks/useApi.ts`

```typescript
import { useState, useEffect } from 'react';

/**
 * Custom hook for API data fetching with loading and error states
 * 
 * @example
 * const { data, loading, error, refetch } = useApi(() => getVacancies());
 */
export function useApi<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for API mutations (POST, PUT, DELETE)
 * 
 * @example
 * const { mutate, loading, error } = useApiMutation(applyToVacancy);
 * mutate(vacancyId);
 */
export function useApiMutation<TArgs extends any[], TResult>(
  mutationFunction: (...args: TArgs) => Promise<TResult>
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (...args: TArgs): Promise<TResult | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFunction(...args);
      return result;
    } catch (err) {
      setError(err as Error);
      console.error('Mutation Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
}
```

---

### Шаг 4: Замена Mock данных в компонентах

#### Пример 1: Vacancies.tsx

**БЫЛО (Mock данные):**

```typescript
import { MOCK_VACANCIES } from "../../data/mockData";

export function Vacancies() {
  const vacancies = MOCK_VACANCIES;
  
  return (
    // ... JSX
  );
}
```

**СТАЛО (API):**

```typescript
import { useApi } from "../../hooks/useApi";
import { getVacancies } from "../../services/api";

export function Vacancies() {
  // Replace mock data with API call
  const { data: vacancies, loading, error } = useApi(() => getVacancies());
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка вакансий...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка загрузки: {error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
  
  return (
    // ... JSX with vacancies data
  );
}
```

#### Пример 2: Workers.tsx

```typescript
import { useApi } from "../../hooks/useApi";
import { getWorkers } from "../../services/api";

export function Workers() {
  const { data: workers, loading, error } = useApi(() => getWorkers());
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    // ... JSX
  );
}
```

#### Пример 3: Applications.tsx с фильтрами

```typescript
import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { getApplications } from "../../services/api";

export function Applications() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Refetch when filter changes
  const { data: applications, loading, error } = useApi(
    () => getApplications(),
    [statusFilter]
  );
  
  const filteredApplications = applications?.filter(app => 
    !statusFilter || app.status === statusFilter
  );
  
  return (
    // ... JSX
  );
}
```

---

### Шаг 5: Добавление Loading и Error компонентов

**Файл:** `/src/components/LoadingSpinner.tsx`

```typescript
export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка...</p>
      </div>
    </div>
  );
}
```

**Файл:** `/src/components/ErrorMessage.tsx`

```typescript
interface ErrorMessageProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center border border-red-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
        <p className="text-gray-600 mb-6">{error.message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
        )}
      </div>
    </div>
  );
}
```

---

### Шаг 6: Пример полной замены для Vacancies.tsx

**Финальная версия с API:**

```typescript
import { IconSearch, IconMapPin, IconAdjustments, IconBookmark, IconArrowLeft, IconBriefcase } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { getVacancies } from "../../services/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";

export function Vacancies() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  
  // API Integration - replaced MOCK_VACANCIES
  const { data: vacancies, loading, error, refetch } = useApi(() => getVacancies());
  
  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }
  
  // No data
  if (!vacancies || vacancies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Вакансии не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... rest of JSX */}
      {vacancies.map((vacancy) => (
        // ... vacancy card
      ))}
    </div>
  );
}
```

---

## 🗑️ Удаление Mock данных

### После полной интеграции:

**1. Удалите файл с mock данными:**

```bash
rm /src/data/mockData.ts
```

**2. Удалите все импорты mock данных:**

Найдите и удалите:
```typescript
// Удалите эти строки из всех файлов:
import { MOCK_VACANCIES } from "../../data/mockData";
const vacancies = MOCK_VACANCIES;
```

**3. Проверьте отсутствие упоминаний mock данных:**

```bash
grep -r "MOCK" src/
grep -r "mockData" src/
```

Если команда ничего не находит - отлично! ✅

---

## ✅ Checklist перед продакшеном

### Frontend

- [ ] Все mock данные заменены на API вызовы
- [ ] Файл `/src/data/mockData.ts` удален
- [ ] Все импорты mock данных удалены
- [ ] Loading состояния добавлены везде
- [ ] Error состояния добавлены везде
- [ ] Добавлена обработка пустых данных
- [ ] Environment variables настроены (`VITE_API_BASE_URL`)
- [ ] API authentication токены реализованы
- [ ] Error tracking настроен (Sentry, etc.)

### Backend

- [ ] Все endpoints из `/BACKEND_SPECIFICATION.md` реализованы
- [ ] API возвращает данные в правильном формате
- [ ] CORS настроен правильно
- [ ] Rate limiting настроен
- [ ] API документация актуальна
- [ ] Тесты API написаны и проходят
- [ ] Database миграции применены
- [ ] Backup система настроена

### Testing

- [ ] Unit тесты для API клиента
- [ ] Integration тесты для основных flows
- [ ] E2E тесты для критичных функций
- [ ] Performance тестирование
- [ ] Load тестирование API
- [ ] Security audit проведен

---

## 🎯 Порядок интеграции (рекомендуется)

**Фаза 1: Критичные функции**
1. ✅ Авторизация (Telegram)
2. ✅ Получение профиля пользователя
3. ✅ Список вакансий
4. ✅ Детали вакансии
5. ✅ Подача заявки

**Фаза 2: Основные функции**
6. ✅ Список кандидатов
7. ✅ Сообщения
8. ✅ Заявки пользователя
9. ✅ Сохраненные вакансии

**Фаза 3: Функции работодателя**
10. ✅ Управление вакансиями
11. ✅ Просмотр заявок
12. ✅ Приглашение кандидатов
13. ✅ Статистика

**Фаза 4: Дополнительно**
14. ✅ Уведомления
15. ✅ Фильтры и поиск
16. ✅ Настройки профиля

---

## 📝 Примечания

### Типизация TypeScript

Используйте типы из `mockData.ts` или создайте отдельный файл типов:

```typescript
// /src/types/api.ts
export interface Vacancy {
  id: number;
  title: string;
  // ... other fields
}
```

### Кэширование

Рассмотрите использование библиотек для кэширования:
- **React Query** (TanStack Query)
- **SWR** (Stale-While-Revalidate)
- **RTK Query** (Redux Toolkit Query)

### Error Handling

Централизуйте обработку ошибок:

```typescript
// /src/services/errorHandler.ts
export function handleApiError(error: Error) {
  // Log to error tracking service
  console.error('API Error:', error);
  
  // Show user-friendly message
  if (error.message.includes('401')) {
    // Redirect to login
  } else if (error.message.includes('500')) {
    // Show server error
  }
}
```

---

## 🚀 Готово к продакшену!

После выполнения всех шагов:

1. ✅ Mock данные удалены
2. ✅ API интегрирован
3. ✅ Error handling настроен
4. ✅ Loading states добавлены
5. ✅ Тесты пройдены

**Ваше приложение готово к деплою!** 🎉

---

**Версия:** 1.0.0  
**Дата:** 13 марта 2026 г.  
**Автор:** Ish-Top Development Team
