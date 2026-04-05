import { IconSearch, IconBookmark, IconAdjustments, IconX, IconPhone, IconBrandWhatsapp, IconBrandTelegram } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";
import { ApplyModal } from "@/app/components/ApplyModal";
import { toast } from "sonner";

interface BackendVacancy {
  id: number;
  title: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  district: string;
  employment_type: string;
  kindergarten?: {
    name: string;
    logo_url?: string;
    phone?: string;
  };
  is_featured: boolean;
  is_favorite: boolean;
}

interface VacancyListResponse {
  items: BackendVacancy[];
  total: number;
}

export function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // UI States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<BackendVacancy | null>(null);
  
  // Filter States
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFunc = useCallback((params: any) => api.get("/vacancies", { params }), []);
  const { data, loading, error, execute: fetchVacancies } = useApi<VacancyListResponse>(fetchFunc);

  useEffect(() => {
    const params: any = {};
    if (activeFilter !== "all" && activeFilter !== "recommended") {
      params.employment_type = activeFilter;
    }
    if (searchQuery) {
      params.search = searchQuery;
    }
    fetchVacancies(params);
  }, [activeFilter, searchQuery, fetchVacancies]);

  const filters = [
    { id: "all", labelKey: "all" as const },
    { id: "recommended", labelKey: "featured" as const },
    { id: "full_time", labelKey: "fullTime" as const },
    { id: "part_time", labelKey: "partTime" as const },
  ];

  const vacancies = data?.items || [];

  const handleApply = (job: BackendVacancy) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleContact = (job: BackendVacancy) => {
    setSelectedJob(job);
    setShowContactModal(true);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} сум`;
    if (min) return `от ${min.toLocaleString()} сум`;
    if (max) return `до ${max.toLocaleString()} сум`;
    return "Зарплата не указана";
  };

  const toggleFavorite = async (e: React.MouseEvent, job: BackendVacancy) => {
    e.stopPropagation();
    try {
      if (job.is_favorite) {
        await api.delete(`/favorites/${job.id}`);
      } else {
        await api.post(`/favorites`, null, { params: { vacancy_id: job.id } });
      }
      // Refresh list
      fetchVacancies({
        search: searchQuery || undefined,
        employment_type: activeFilter !== "all" ? activeFilter : undefined
      });
    } catch (err: any) {
      toast.error("Ошибка при обновлении избранного: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-8">
      <div className="px-5 pt-6 lg:px-8 lg:pt-8">
        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("findJob")}</h1>
          <p className="text-gray-600">{t("home")}</p>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" stroke={2} />
            <input
              type="text"
              placeholder={t("searchJobs")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-white rounded-xl text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => navigate("/filter")}
            className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-gray-100 rounded-xl"
          >
            <IconAdjustments className="w-6 h-6 text-gray-700" stroke={2} />
          </button>
          <button 
            onClick={() => navigate("/app/saved-jobs")}
            className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-gray-100 rounded-xl"
          >
            <IconBookmark className="w-6 h-6 text-gray-700" stroke={2} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 p-[0px]">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`${
                activeFilter === filter.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              } px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors`}
            >
              {t(filter.labelKey)}
            </button>
          ))}
        </div>

        {/* Status Messages */}
        {loading && <div className="text-center py-10 text-gray-500">Загрузка вакансий...</div>}
        {error && <div className="text-center py-10 text-red-500 uppercase font-bold">{error}</div>}
        
        {/* Jobs List */}
        <div className="space-y-4">
          {!loading && vacancies.length === 0 && (
            <div className="text-center py-10 text-gray-500">Вакансии не найдены</div>
          )}
          {vacancies.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-gray-100 rounded-3xl p-5 relative"
            >
              <button 
                onClick={(e) => toggleFavorite(e, job)}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center transition-transform active:scale-90"
              >
                <IconBookmark 
                  className={`w-6 h-6 ${job.is_favorite ? "text-blue-600 fill-blue-600" : "text-gray-400"}`} 
                  stroke={2} 
                />
              </button>

              <div className="mb-4 pr-10">
                <h4 className="text-base font-bold text-gray-900 mb-2">{job.title}</h4>
                <p className="text-sm text-gray-600 mb-1">{job.kindergarten?.name || "Детский сад"}</p>
                <p className="text-sm text-gray-500 mb-2">{job.district}</p>
                <p className="text-base font-bold text-blue-600 mb-3">{formatSalary(job.salary_min, job.salary_max)}</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-[10px] uppercase font-bold border border-gray-100">
                    {t(job.employment_type as any)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(job);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Откликнуться
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContact(job);
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                  Связаться
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reusable Apply Modal */}
      {selectedJob && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          vacancyId={selectedJob.id}
          vacancyTitle={selectedJob.title}
          kindergartenName={selectedJob.kindergarten?.name || "Детский сад"}
        />
      )}

      {/* Contact Modal */}
      {showContactModal && selectedJob && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowContactModal(false)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Контакты</h3>
                <button onClick={() => setShowContactModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <IconX className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Организация</p>
                  <p className="text-base font-semibold text-gray-900">{selectedJob.kindergarten?.name}</p>
                </div>

                {selectedJob.kindergarten?.phone ? (
                  <>
                    <a 
                      href={`tel:${selectedJob.kindergarten.phone}`}
                      className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition-colors"
                    >
                      <IconPhone className="w-5 h-5" />
                      <span className="font-bold">{selectedJob.kindergarten.phone}</span>
                      <span className="ml-auto text-xs font-semibold">Позвонить</span>
                    </a>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <a 
                        href={`https://wa.me/${selectedJob.kindergarten.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-700 rounded-2xl hover:bg-green-100 transition-colors"
                      >
                        <IconBrandWhatsapp className="w-5 h-5" />
                        <span className="font-bold">WhatsApp</span>
                      </a>
                      <a 
                        href={`https://t.me/${selectedJob.kindergarten.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 p-4 bg-sky-50 text-sky-700 rounded-2xl hover:bg-sky-100 transition-colors"
                      >
                        <IconBrandTelegram className="w-5 h-5" />
                        <span className="font-bold">Telegram</span>
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-orange-50 text-orange-700 rounded-2xl text-center font-medium">
                    Телефон не указан пользователем
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 pb-6">
              <button 
                onClick={() => setShowContactModal(false)}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}