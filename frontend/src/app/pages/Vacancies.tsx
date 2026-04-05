import { IconSearch, IconMapPin, IconAdjustments, IconBookmark, IconArrowLeft, IconBriefcase } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState, useCallback, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";
import { ApplyModal } from "@/app/components/ApplyModal";
import { toast } from "sonner";

interface Vacancy {
  id: number;
  title: string;
  kindergarten?: { 
    name: string;
    is_verified: boolean;
  };
  district: string;
  salary_min?: number;
  salary_max?: number;
  employment_type: string;
  published_at?: string;
  is_featured?: boolean;
  is_favorite?: boolean;
}

export function Vacancies() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [salaryMin, setSalaryMin] = useState<number | "">("");
  const [sortBy, setSortBy] = useState("new");

  const fetchVacanciesFunc = useCallback(() => {
    const params: any = {
      search: search || undefined,
      district: district || undefined,
      salary_min: salaryMin || undefined,
    };
    
    if (sortBy === "recommended") params.is_featured = true;
    if (sortBy === "new") params.is_new = true;

    return api.get("/vacancies", { params });
  }, [search, district, salaryMin, sortBy]);

  const { data: vacancyResponse, loading, execute: fetchVacancies } = useApi<{ items: Vacancy[] }>(fetchVacanciesFunc);

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  const vacancies = vacancyResponse?.items || [];

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "З/П не указана";
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} сум`;
    if (min) return `от ${min.toLocaleString()} сум`;
    if (max) return `до ${max.toLocaleString()} сум`;
    return "З/П не указана";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Недавно";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  const toggleFavorite = async (e: React.MouseEvent, job: Vacancy) => {
    e.stopPropagation();
    try {
      if (job.is_favorite) {
        await api.delete(`/favorites/${job.id}`);
      } else {
        await api.post(`/favorites`, null, { params: { vacancy_id: job.id } });
      }
      // Refresh list
      fetchVacancies();
    } catch (err: any) {
      toast.error("Ошибка при обновлении избранного: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <IconArrowLeft className="w-5 h-5 text-gray-700" stroke={2} />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Вакансии</h1>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <IconAdjustments className="w-5 h-5 text-gray-700" stroke={2} />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" stroke={2} />
            <input
              type="text"
              placeholder="Поиск по должности или садику..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div 
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowFilters(false)}
            />
          )}
          
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'fixed inset-y-0 right-0 w-80 z-50' : 'hidden'} md:block md:static md:col-span-1`}>
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 md:sticky md:top-24 h-full md:h-auto overflow-y-auto">
              <div className="flex items-center justify-between mb-4 md:block">
                <h3 className="font-semibold text-gray-900">Фильтры</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="md:hidden text-gray-500 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Район
                  </label>
                  <select 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Все районы</option>
                    <option value="Мирзо-Улугбекский">Мирзо-Улугбекский</option>
                    <option value="Юнусабадский">Юнусабадский</option>
                    <option value="Чиланзарский">Чиланзарский</option>
                    <option value="Яшнабадский">Яшнабадский</option>
                    <option value="Мирабадский">Мирабадский</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Зарплата от
                  </label>
                  <input
                    type="number"
                    placeholder="3 000 000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сортировка
                  </label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">Новые</option>
                    <option value="salary">По зарплате</option>
                    <option value="recommended">Рекомендованные</option>
                  </select>
                </div>

                <button 
                  onClick={() => {
                    fetchVacancies();
                    setShowFilters(false);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Применить
                </button>
              </div>
            </div>
          </div>

          {/* Vacancies List */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {loading ? "Поиск вакансий..." : `Найдено ${vacancies.length} вакансий`}
              </p>
            </div>

            {loading && vacancies.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                    <div className="h-10 bg-gray-50 rounded mt-4"></div>
                  </div>
                ))}
              </div>
            ) : vacancies.map((vacancy) => (
              <div
                key={vacancy.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/job/${vacancy.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {vacancy.title}
                      </h3>
                      {vacancy.is_featured && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                          ТОП
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-gray-700">{vacancy.kindergarten?.name || "Детский сад"}</p>
                      {vacancy.kindergarten?.is_verified && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                          ✓ Проверено
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors active:scale-90"
                    onClick={(e) => toggleFavorite(e, vacancy)}
                  >
                    <IconBookmark 
                      className={`w-6 h-6 ${vacancy.is_favorite ? "text-blue-600 fill-blue-600" : "text-gray-400"}`} 
                      stroke={2} 
                    />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <IconMapPin className="w-4 h-4" stroke={2} />
                    {vacancy.district}
                  </div>
                  <div className="flex items-center gap-1">
                    <IconBriefcase className="w-4 h-4" stroke={2} />
                    {vacancy.employment_type === "full_time" ? "Полная занятость" : "Частичная занятость"}
                  </div>
                  <span>{formatDate(vacancy.published_at)}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xl font-bold text-blue-600">
                    {formatSalary(vacancy.salary_min, vacancy.salary_max)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/job/${vacancy.id}`);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Открыть
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVacancy(vacancy);
                        setShowApplyModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Откликнуться
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Component Placeholder */}
            {!loading && vacancies.length > 0 && (
              <div className="flex justify-center gap-2 pt-8">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Назад</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Вперед</button>
              </div>
            )}
            
            {!loading && vacancies.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">По вашему запросу вакансий не найдено. Попробуйте изменить фильтры.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {selectedVacancy && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          vacancyId={selectedVacancy.id}
          vacancyTitle={selectedVacancy.title}
          kindergartenName={selectedVacancy.kindergarten?.name || "Детский сад"}
        />
      )}
    </div>
  );
}