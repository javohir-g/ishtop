import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";

interface BackendApplication {
  id: number;
  vacancy_id: number;
  vacancy?: {
    title: string;
    kindergarten?: {
      name: string;
    };
    district: string;
    salary_min?: number;
    salary_max?: number;
  };
  status: string;
  created_at: string;
  cover_letter?: string;
}

export function Applications() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState("all");

  const statusMap: Record<string, { label: string, color: string }> = {
    pending: { label: "На рассмотрении", color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
    viewed: { label: "Просмотрено", color: "bg-blue-50 text-blue-700 border-blue-100" },
    shortlisted: { label: "В шорт-листе", color: "bg-purple-50 text-purple-700 border-purple-100" },
    accepted: { label: "Принято", color: "bg-green-50 text-green-700 border-green-100" },
    rejected: { label: "Отклонено", color: "bg-red-50 text-red-700 border-red-100" },
    withdrawn: { label: "Отозвано", color: "bg-gray-50 text-gray-700 border-gray-100" },
  };

  const fetchFunc = useCallback(() => api.get("/applications/my"), []);
  const { data: apps, loading, error, execute: fetchApps } = useApi<BackendApplication[]>(fetchFunc);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const filters = [
    { id: "all", label: "Все" },
    { id: "pending", label: "На рассмотрении" },
    { id: "accepted", label: "Принято" },
    { id: "rejected", label: "Отклонено" },
  ];

  const filteredApplications = apps?.filter(app => {
    if (activeFilter === "all") return true;
    return app.status.toLowerCase() === activeFilter.toLowerCase();
  }) || [];

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} сум`;
    if (min) return `от ${min.toLocaleString()} сум`;
    if (max) return `до ${max.toLocaleString()} сум`;
    return "Зарплата не указана";
  };

  const getStatusInfo = (status: string) => {
    return statusMap[status.toLowerCase()] || { label: status, color: "bg-gray-50 text-gray-600 border-gray-100" };
  };

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-8">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 lg:px-8 lg:pt-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("myApplications")}</h1>
            <p className="text-gray-600 mt-1 hidden lg:block">{t("trackApplicationStatus")}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
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
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      {loading && <div className="text-center py-10 text-gray-500">Загрузка заявок...</div>}
      {error && <div className="text-center py-10 text-red-500 uppercase font-bold">{error}</div>}

      {/* Applications List */}
      <div className="px-5 space-y-3 lg:px-8">
        {!loading && filteredApplications.length === 0 && (
          <div className="text-center py-10 text-gray-500">Заявки не найдены</div>
        )}
        {filteredApplications.map((app) => (
          <div
            key={app.id}
            onClick={() => navigate(`/app/applications/${app.id}`)}
            className="bg-white border border-gray-100 rounded-3xl p-5 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="mb-3">
              <h3 className="text-base font-bold text-gray-900 mb-1">{app.vacancy?.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{app.vacancy?.kindergarten?.name}</p>
              <p className="text-xs text-gray-500 mb-2">{app.vacancy?.district}</p>
              <p className="text-sm font-semibold text-blue-600 mb-2">
                {formatSalary(app.vacancy?.salary_min, app.vacancy?.salary_max)}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <span
                className={`inline-block px-3 py-1 rounded-lg text-[10px] uppercase font-bold border ${getStatusInfo(app.status).color}`}
              >
                {getStatusInfo(app.status).label}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(app.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}