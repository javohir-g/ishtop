# Frontend ↔️ Backend Integration Guide

## 🔗 Быстрая интеграция фронтенда с бэкендом

---

## 1. Настройка API Client

### Создать API сервис

**`/src/services/api.ts`**
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Создать axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавить токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Токен истёк - попробовать обновить
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        localStorage.setItem('access_token', response.data.access_token);
        
        // Повторить оригинальный запрос
        error.config.headers.Authorization = `Bearer ${response.data.access_token}`;
        return axios.request(error.config);
      } catch (refreshError) {
        // Не удалось обновить - разлогинить
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 2. API Methods для каждого раздела

### Auth Service

**`/src/services/authService.ts`**
```typescript
import api from './api';

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    role: 'candidate' | 'employer';
    first_name: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export const authService = {
  // Авторизация через Telegram WebApp
  async loginWithTelegram(initData: string): Promise<AuthResponse> {
    const response = await api.post('/auth/telegram', { init_data: initData });
    
    // Сохранить токены
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  // Получить текущего пользователя
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Выход
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};
```

### Vacancies Service

**`/src/services/vacanciesService.ts`**
```typescript
import api from './api';

export interface VacancyFilters {
  city_id?: string;
  category_id?: string;
  salary_from?: number;
  salary_to?: number;
  employment_type?: string;
  work_format?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Vacancy {
  id: string;
  title: string;
  description: string;
  salary_from: number;
  salary_to: number;
  city: {
    id: string;
    name: string;
  };
  company: {
    id: string;
    name: string;
    logo_url?: string;
  };
  employment_type: string;
  work_format: string;
  published_at: string;
  views_count: number;
  applications_count: number;
}

export const vacanciesService = {
  // Получить список вакансий с фильтрами
  async getVacancies(filters: VacancyFilters = {}) {
    const response = await api.get('/vacancies', { params: filters });
    return response.data;
  },

  // Получить детали вакансии
  async getVacancy(id: string) {
    const response = await api.get(`/vacancies/${id}`);
    return response.data;
  },

  // Отметить просмотр
  async markAsViewed(id: string) {
    await api.post(`/vacancies/${id}/view`);
  },
};
```

### Applications Service

**`/src/services/applicationsService.ts`**
```typescript
import api from './api';

export interface CreateApplicationData {
  vacancy_id: string;
  resume_id: string;
  cover_letter?: string;
}

export interface Application {
  id: string;
  vacancy: {
    id: string;
    title: string;
    company_name: string;
    salary_from: number;
    salary_to: number;
  };
  status: 'pending' | 'viewed' | 'invited' | 'rejected' | 'hired';
  applied_at: string;
  cover_letter?: string;
}

export const applicationsService = {
  // Получить мои отклики
  async getMyApplications(status?: string) {
    const response = await api.get('/applications', { 
      params: status ? { status } : {} 
    });
    return response.data;
  },

  // Создать отклик
  async createApplication(data: CreateApplicationData) {
    const response = await api.post('/applications', data);
    return response.data;
  },

  // Получить детали отклика
  async getApplication(id: string) {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },
};
```

### Profile Service

**`/src/services/profileService.ts`**
```typescript
import api from './api';

export interface CandidateProfile {
  id: string;
  first_name: string;
  last_name?: string;
  avatar_url?: string;
  city_id?: string;
  about?: string;
  expected_salary_from?: number;
  expected_salary_to?: number;
  telegram_username?: string;
  phone?: string;
}

export const profileService = {
  // Получить профиль
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  // Обновить профиль
  async updateProfile(data: Partial<CandidateProfile>) {
    const response = await api.patch('/profile', data);
    return response.data;
  },

  // Загрузить аватар
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
```

### Favorites Service

**`/src/services/favoritesService.ts`**
```typescript
import api from './api';

export const favoritesService = {
  // Получить сохраненные вакансии
  async getFavorites() {
    const response = await api.get('/favorites');
    return response.data;
  },

  // Добавить в избранное
  async addToFavorites(vacancyId: string) {
    const response = await api.post('/favorites', { vacancy_id: vacancyId });
    return response.data;
  },

  // Убрать из избранного
  async removeFromFavorites(vacancyId: string) {
    await api.delete(`/favorites/${vacancyId}`);
  },

  // Проверить, в избранном ли
  async isFavorite(vacancyId: string): Promise<boolean> {
    try {
      const response = await api.get(`/favorites/${vacancyId}`);
      return response.data.is_favorite;
    } catch {
      return false;
    }
  },
};
```

---

## 3. React Hooks для данных

### useVacancies Hook

**`/src/hooks/useVacancies.ts`**
```typescript
import { useState, useEffect } from 'react';
import { vacanciesService, VacancyFilters } from '../services/vacanciesService';

export function useVacancies(filters: VacancyFilters = {}) {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVacancies() {
      try {
        setLoading(true);
        const data = await vacanciesService.getVacancies(filters);
        setVacancies(data.items);
      } catch (err) {
        setError('Не удалось загрузить вакансии');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchVacancies();
  }, [JSON.stringify(filters)]);

  return { vacancies, loading, error, refetch: () => fetchVacancies() };
}
```

### useApplications Hook

**`/src/hooks/useApplications.ts`**
```typescript
import { useState, useEffect } from 'react';
import { applicationsService } from '../services/applicationsService';

export function useApplications(status?: string) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationsService.getMyApplications(status);
      setApplications(data);
    } catch (err) {
      setError('Не удалось загрузить заявки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [status]);

  return { applications, loading, error, refetch: fetchApplications };
}
```

---

## 4. Обновить страницы с реальными данными

### Home.tsx (пример)

```typescript
import { useState } from 'react';
import { useVacancies } from '../hooks/useVacancies';
import { vacanciesService } from '../services/vacanciesService';
import { applicationsService } from '../services/applicationsService';

export function Home() {
  const [filters, setFilters] = useState({
    search: '',
    city_id: undefined,
    category_id: undefined,
  });

  const { vacancies, loading, error } = useVacancies(filters);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);

  const handleApply = async (vacancyId: string) => {
    try {
      await applicationsService.createApplication({
        vacancy_id: vacancyId,
        resume_id: 'current-resume-id', // Получить из профиля
        cover_letter: coverLetterText,
      });
      
      // Показать успешное уведомление
      alert('Отклик успешно отправлен!');
      setShowApplyModal(false);
    } catch (err) {
      alert('Не удалось отправить отклик');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-5">Загрузка...</div>;
  }

  if (error) {
    return <div className="p-5 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Search and filters */}
      <input
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder="Поиск работы"
      />

      {/* Vacancies list */}
      <div className="space-y-4 px-5">
        {vacancies.map((vacancy) => (
          <div key={vacancy.id} className="border rounded-3xl p-5">
            <h3>{vacancy.title}</h3>
            <p>{vacancy.company.name}</p>
            <p>{vacancy.salary_from} - {vacancy.salary_to} сум</p>
            
            <button onClick={() => {
              setSelectedVacancy(vacancy);
              setShowApplyModal(true);
            }}>
              Откликнуться
            </button>
          </div>
        ))}
      </div>

      {/* Apply modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50">
          {/* Modal content */}
          <button onClick={() => handleApply(selectedVacancy.id)}>
            Отправить
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Telegram WebApp интеграция

### Получить initData из Telegram

**`/src/utils/telegram.ts`**
```typescript
export function getTelegramInitData(): string | null {
  if (window.Telegram?.WebApp) {
    return window.Telegram.WebApp.initData;
  }
  return null;
}

export function getTelegramUser() {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  return null;
}

// Объявление типов для TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}
```

### Auth.tsx с Telegram авторизацией

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/authService';
import { getTelegramInitData } from '../utils/telegram';

export function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    async function authenticate() {
      const initData = getTelegramInitData();
      
      if (!initData) {
        // Не в Telegram WebApp
        console.error('Not in Telegram WebApp');
        return;
      }

      try {
        const authData = await authService.loginWithTelegram(initData);
        
        // Перенаправить в зависимости от роли
        if (authData.user.role === 'candidate') {
          navigate('/app');
        } else if (authData.user.role === 'employer') {
          navigate('/app/kindergarten');
        }
      } catch (error) {
        console.error('Auth failed:', error);
        // Показать ошибку
      }
    }

    authenticate();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Авторизация...</p>
      </div>
    </div>
  );
}
```

---

## 6. Environment Variables

**`.env`**
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
```

**`.env.production`**
```env
VITE_API_URL=https://api.yourapp.uz/api/v1
VITE_TELEGRAM_BOT_TOKEN=your_production_bot_token
```

---

## 7. Error Handling

### Глобальный обработчик ошибок

**`/src/utils/errorHandler.ts`**
```typescript
import { AxiosError } from 'axios';

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    // Ошибки от API
    if (error.response) {
      const message = error.response.data?.detail || error.response.data?.message;
      return message || `Ошибка ${error.response.status}`;
    }
    
    // Ошибки сети
    if (error.request) {
      return 'Нет связи с сервером';
    }
  }
  
  // Другие ошибки
  return 'Произошла ошибка';
}
```

**Использование:**
```typescript
try {
  await vacanciesService.getVacancies();
} catch (error) {
  const errorMessage = handleApiError(error);
  console.error(errorMessage);
  // Показать toast/alert
}
```

---

## 8. Loading States

### Компонент Loading

**`/src/components/Loading.tsx`**
```typescript
export function Loading({ text = 'Загрузка...' }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}
```

### Skeleton Loader

**`/src/components/VacancySkeleton.tsx`**
```typescript
export function VacancySkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    </div>
  );
}
```

---

## 9. Типы данных (TypeScript)

**`/src/types/index.ts`**
```typescript
// User types
export interface User {
  id: string;
  first_name: string;
  last_name?: string;
  avatar_url?: string;
  role: 'candidate' | 'employer' | 'admin';
  telegram_id?: number;
  telegram_username?: string;
}

// Vacancy types
export interface Vacancy {
  id: string;
  title: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  salary_from: number;
  salary_to: number;
  currency: string;
  city: City;
  category: Category;
  company: Company;
  employment_type: string;
  work_format: string;
  status: 'draft' | 'active' | 'archived' | 'closed';
  published_at: string;
  views_count: number;
  applications_count: number;
}

// City types
export interface City {
  id: string;
  name: string;
  name_ru: string;
  name_uz: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  name_ru: string;
  name_uz: string;
  slug: string;
}

// Company types
export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  city: City;
  is_verified: boolean;
}

// Application types
export interface Application {
  id: string;
  vacancy: Vacancy;
  status: 'pending' | 'viewed' | 'invited' | 'rejected' | 'hired';
  cover_letter?: string;
  applied_at: string;
  updated_at: string;
}
```

---

## 10. Checklist интеграции

### Frontend
- [ ] Создать API client (`/src/services/api.ts`)
- [ ] Создать сервисы для каждого раздела
- [ ] Создать React hooks для данных
- [ ] Добавить обработку ошибок
- [ ] Добавить loading states
- [ ] Интегрировать Telegram WebApp
- [ ] Обновить все страницы с реальными данными
- [ ] Добавить оптимистичные обновления UI
- [ ] Протестировать все флоу

### Backend
- [ ] Развернуть API на сервере
- [ ] Настроить CORS для Telegram WebApp
- [ ] Протестировать все endpoints
- [ ] Настроить логирование
- [ ] Добавить мониторинг

---

## Полезные ссылки

- 📚 [Полный Backend Guide](/BACKEND_DATABASE_GUIDE.md)
- 🚀 [Quick Start Backend](/QUICK_START_BACKEND.md)
- 📖 [Axios документация](https://axios-http.com/docs/intro)
- 📱 [Telegram WebApp Docs](https://core.telegram.org/bots/webapps)

---

**Время интеграции:** ~2-3 часа  
**Готово к работе!** 🎉
