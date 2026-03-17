import { IconSearch, IconMapPin, IconAdjustments, IconBookmark, IconArrowLeft, IconBriefcase } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState } from "react";
// MOCK DATA - Replace with API call when integrating backend
import { MOCK_VACANCIES } from "../../data/mockData";

export function Vacancies() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  // MOCK DATA - Replace with API call: GET /api/vacancies
  // TODO: Implement: const { data: vacancies, loading, error } = useFetch('/api/vacancies')
  const vacancies = MOCK_VACANCIES;

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
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Все районы</option>
                    <option>Центральный</option>
                    <option>Северный</option>
                    <option>Южный</option>
                    <option>Западный</option>
                    <option>Восточный</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Зарплата от
                  </label>
                  <input
                    type="number"
                    placeholder="30 000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    График
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-blue-600 mr-2" />
                      <span className="text-sm text-gray-700">Полный день</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-blue-600 mr-2" />
                      <span className="text-sm text-gray-700">Неполный день</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-blue-600 mr-2" />
                      <span className="text-sm text-gray-700">Гибкий график</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сортировка
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Новые</option>
                    <option>По зарплате</option>
                    <option>Рекомендованные</option>
                  </select>
                </div>

                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Применить
                </button>
              </div>
            </div>
          </div>

          {/* Vacancies List */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">Найдено {vacancies.length} вакансий</p>
            </div>

            {vacancies.map((vacancy) => (
              <div
                key={vacancy.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/job/${vacancy.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                        {vacancy.title}
                      </h3>
                      {vacancy.badge && (
                        <span className={`${vacancy.badgeColor} text-white text-xs font-bold px-2 py-1 rounded`}>
                          {vacancy.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-gray-700">{vacancy.kindergarten}</p>
                      {vacancy.verified && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                          ✓ Проверено
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconBookmark className="w-6 h-6" stroke={2} />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <IconMapPin className="w-4 h-4" stroke={2} />
                    {vacancy.district}
                  </div>
                  <div className="flex items-center gap-1">
                    <IconBriefcase className="w-4 h-4" stroke={2} />
                    {vacancy.type}
                  </div>
                  <span>{vacancy.posted}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xl font-bold text-blue-600">{vacancy.salary}</span>
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
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Откликнуться
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex justify-center gap-2 pt-8">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Назад
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Вперед
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}