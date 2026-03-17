import { Bookmark } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";

interface BackendSavedVacancy {
  id: number;
  vacancy_id: number;
  vacancy: {
    id: number;
    title: string;
    description: string;
    salary_min?: number;
    salary_max?: number;
    district: string;
    employment_type: string;
    kindergarten?: {
      name: string;
    };
  };
}

export function SavedJobs() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<BackendSavedVacancy | null>(null);

  const fetchFunc = useCallback(() => api.get("/favorites"), []);
  const { data: savedJobs, loading, error, execute: fetchSavedJobs } = useApi<BackendSavedVacancy[]>(fetchFunc);

  const { execute: removeFavorite, loading: removing } = useApiMutation(
    (vacancyId: number) => api.delete(`/favorites/${vacancyId}`)
  );

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleRemoveClick = (job: BackendSavedVacancy) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedJob) return;
    try {
      await removeFavorite(selectedJob.vacancy_id);
      setShowModal(false);
      fetchSavedJobs(); // Refresh list
    } catch (err: any) {
      alert("Ошибка при удалении: " + (err.response?.data?.detail || err.message));
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} сум`;
    if (min) return `от ${min.toLocaleString()} сум`;
    if (max) return `до ${max.toLocaleString()} сум`;
    return "Зарплата не указана";
  };

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-8">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 lg:px-8 lg:pt-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <IconArrowLeft className="w-6 h-6 text-gray-900" stroke={2} />
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Сохраненные</h1>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {loading && <div className="text-center py-10 text-gray-500">Загрузка...</div>}
      {error && <div className="text-center py-10 text-red-500 uppercase font-bold">{error}</div>}

      {/* Saved Jobs List */}
      <div className="px-5 space-y-4 lg:px-8">
        {!loading && (!savedJobs || savedJobs.length === 0) && (
          <div className="text-center py-10 text-gray-500">Нет сохраненных вакансий</div>
        )}
        {savedJobs?.map((saved) => (
          <div
            key={saved.id}
            className="bg-white border border-gray-100 rounded-3xl p-5 relative"
          >
            <button
              onClick={() => handleRemoveClick(saved)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center flex-shrink-0"
              disabled={removing}
            >
              <Bookmark className="w-6 h-6 fill-blue-600 text-blue-600" strokeWidth={2} />
            </button>

            <div className="pr-10">
              <h3 className="text-base font-bold text-gray-900 mb-2">{saved.vacancy.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{saved.vacancy.kindergarten?.name || "Детский сад"}</p>
              <p className="text-sm text-gray-600 mb-2">{saved.vacancy.district}</p>
              <p className="text-base font-bold text-blue-600 mb-3">{formatSalary(saved.vacancy.salary_min, saved.vacancy.salary_max)}</p>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-100">
                  {t(saved.vacancy.employment_type as any)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Remove Modal */}
      {showModal && selectedJob && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 animate-slide-up"
            style={{ marginBottom: 'calc(var(--bottom-nav-height, 64px) + var(--tg-safe-bottom, 0px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6 md:hidden"></div>
            
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
              Убрать из сохраненных?
            </h2>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">{selectedJob.vacancy.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedJob.vacancy.kindergarten?.name}</p>
              <p className="text-sm text-gray-600 mb-2">{selectedJob.vacancy.district}</p>
              <p className="text-base font-bold text-blue-600">
                {formatSalary(selectedJob.vacancy.salary_min, selectedJob.vacancy.salary_max)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-xl text-base font-bold hover:bg-gray-200 transition-colors"
                disabled={removing}
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmRemove}
                className="flex-1 bg-blue-600 text-white py-4 rounded-xl text-base font-bold shadow-lg hover:bg-blue-700 transition-colors"
                disabled={removing}
              >
                {removing ? "Удаление..." : "Да, убрать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}