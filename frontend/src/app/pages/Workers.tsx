import { IconSearch, IconMapPin, IconAdjustments, IconStar, IconArrowLeft, IconBriefcase, IconSchool, IconHeart } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState, useCallback, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";

interface Worker {
  id: number;
  full_name: string;
  photo_url?: string;
  district?: string;
  desired_position?: string;
  experience_years: number;
  rating: number;
}

export function Workers() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [minExperience, setMinExperience] = useState<number | "">("");
  const [position, setPosition] = useState("");

  const fetchWorkersFunc = useCallback(() => {
    const params: any = {
      position: position || undefined,
      district: district || undefined,
      min_experience: minExperience || undefined,
    };
    if (search) params.search = search; // Though the backend position param might cover this

    return api.get("/workers", { params });
  }, [position, district, minExperience, search]);

  const { data: workers, loading, execute: fetchWorkers } = useApi<Worker[]>(fetchWorkersFunc);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Поиск сотрудников</h1>
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
              placeholder="Поиск по должности или имени..."
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
                    Должность
                  </label>
                  <select 
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Все должности</option>
                    <option value="Воспитатель">Воспитатель</option>
                    <option value="Логопед">Логопед</option>
                    <option value="Музыкальный руководитель">Музыкальный руководитель</option>
                    <option value="Методист">Методист</option>
                    <option value="Педагог-психолог">Педагог-психолог</option>
                  </select>
                </div>

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
                    Опыт от (лет)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minExperience}
                    onChange={(e) => setMinExperience(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button 
                  onClick={() => {
                    fetchWorkers();
                    setShowFilters(false);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Применить
                </button>
              </div>
            </div>
          </div>

          {/* Workers List */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {loading ? "Загрузка..." : `Найдено ${workers?.length || 0} специалистов`}
              </p>
            </div>

            {loading && !workers ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse h-40"></div>
                ))}
              </div>
            ) : workers?.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/kindergarten/candidate/${worker.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-50 flex-shrink-0 overflow-hidden border border-blue-100">
                    {worker.photo_url ? (
                      <img src={worker.photo_url} alt={worker.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                        {worker.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate mb-1">
                          {worker.full_name}
                        </h3>
                        <p className="text-blue-600 font-medium text-sm sm:text-base mb-2">
                          {worker.desired_position || "Специалист"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-yellow-700">
                        <IconStar className="w-4 h-4 fill-current" />
                        <span className="font-bold text-sm">{worker.rating || "0.0"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <IconMapPin className="w-4 h-4" />
                        {worker.district || "Не указан"}
                      </div>
                      <div className="flex items-center gap-1">
                        <IconBriefcase className="w-4 h-4" />
                        {worker.experience_years} лет опыта
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // invite flow
                        navigate(`/kindergarten/candidate/${worker.id}`);
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm sm:text-base"
                    >
                      Пригласить
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/kindergarten/candidate/${worker.id}`);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      Резюме
                    </button>
                  </div>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <IconHeart className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}

            {!loading && workers?.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">Специалисты не найдены. Попробуйте изменить фильтры.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}