import { ArrowLeft, Bookmark, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";

interface BackendVacancy {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  salary_min?: number;
  salary_max?: number;
  district: string;
  employment_type: string;
  published_at?: string;
  kindergarten?: {
    name: string;
    logo_url?: string;
    description?: string;
  };
}

export function JobDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"description" | "requirements" | "contacts">("description");
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchFunc = useCallback(() => api.get(`/vacancies/${id}`), [id]);
  const { data: job, loading, error, execute: fetchJob } = useApi<BackendVacancy>(fetchFunc);

  const { execute: apply, loading: applying } = useApiMutation(
    (vacancyId: number) => api.post("/applications", { vacancy_id: vacancyId })
  );

  const { execute: toggleFavorite, loading: togglingFav } = useApiMutation(
    (isFav: boolean) => isFav 
      ? api.delete(`/favorites/${id}`) 
      : api.post(`/favorites?vacancy_id=${id}`)
  );

  useEffect(() => {
    fetchJob();
    // Check if favorite (could be optimized)
    api.get("/favorites").then(res => {
      const favs = res.data as any[];
      setIsFavorite(favs.some(f => f.vacancy_id === Number(id)));
    }).catch(() => {});
  }, [fetchJob, id]);

  const handleApply = async () => {
    if (!job) return;
    try {
      await apply(job.id);
      alert("Заявка успешно отправлена!");
      navigate("/app/applications");
    } catch (err: any) {
      alert("Ошибка: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(isFavorite);
      setIsFavorite(!isFavorite);
    } catch (err: any) {
      alert("Ошибка избранного: " + (err.response?.data?.detail || err.message));
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} сум`;
    if (min) return `от ${min.toLocaleString()} сум`;
    if (max) return `до ${max.toLocaleString()} сум`;
    return "Зарплата не указана";
  };

  if (loading) return <div className="text-center py-20">Загрузка...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;
  if (!job) return <div className="text-center py-20">Вакансия не найдена</div>;

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" strokeWidth={2} />
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleToggleFavorite}
            disabled={togglingFav}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center"
          >
            <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-blue-600 text-blue-600' : 'text-gray-900'}`} strokeWidth={2} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
            <Send className="w-5 h-5 text-gray-900" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Job Card */}
      <div className="px-5 py-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden">
            {job.kindergarten?.logo_url ? (
               <img src={job.kindergarten.logo_url} alt={job.kindergarten.name} className="w-full h-full object-cover" />
            ) : (
               <span className="text-blue-600 font-bold text-2xl">{job.kindergarten?.name?.charAt(0)}</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h1>
          <p className="text-base text-blue-600 font-semibold mb-4">{job.kindergarten?.name}</p>
          <p className="text-sm text-gray-600 mb-3">{job.district}</p>
          <p className="text-xl font-bold text-blue-600 mb-4">{formatSalary(job.salary_min, job.salary_max)}</p>
          <div className="flex gap-2 justify-center mb-4">
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium border border-blue-100 uppercase">
              {t(job.employment_type as any)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {job.published_at ? `Опубликовано ${new Date(job.published_at).toLocaleDateString('ru-RU')}` : ""}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="px-5 flex gap-8">
          {[
            { id: "description", label: "Описание" },
            { id: "requirements", label: "Требования" },
            { id: "contacts", label: "Контакты" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-semibold relative ${
                activeTab === tab.id ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {activeTab === "description" && (
          <div className="animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-3">Детали работы:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
            {job.responsibilities && (
              <>
                <h3 className="text-base font-bold text-gray-900 mt-6 mb-3">Обязанности:</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.responsibilities}</p>
              </>
            )}
          </div>
        )}
        {activeTab === "requirements" && (
          <div className="animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-3">Что мы ищем:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.requirements || "Требования не указаны"}</p>
          </div>
        )}
        {activeTab === "contacts" && (
          <div className="animate-fade-in">
             <h3 className="text-base font-bold text-gray-900 mb-3">О детском саде:</h3>
             <p className="text-sm text-gray-700 mb-4">{job.kindergarten?.description || "Информация отсутствует"}</p>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5 z-20"
        style={{ paddingBottom: 'calc(1.25rem + var(--tg-safe-bottom, 0px))' }}
      >
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleApply}
            disabled={applying}
            className="w-full bg-blue-600 text-white py-4 rounded-full text-base font-bold shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
          >
            {applying ? "Отправка..." : "Откликнуться"}
          </button>
        </div>
      </div>
    </div>
  );
}