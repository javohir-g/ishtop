import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";
import { Star, Clock, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: number;
  vacancy_id: number;
  status: string;
  created_at: string;
  vacancy: {
    title: string;
  };
  job_seeker: {
    id: number;
    full_name: string;
    photo_url?: string;
    desired_position?: string;
    experience_years?: number;
    desired_salary_min?: number;
    desired_salary_max?: number;
    rating?: number;
  };
}

export function KindergartenApplications() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchApplicationsFunc = useCallback(() => api.get("/employer/applications"), []);
  const { data: allApplications, loading, execute: fetchApplications } = useApi<Application[]>(fetchApplicationsFunc);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = async (e: React.MouseEvent, appId: number, newStatus: string) => {
    e.stopPropagation();
    try {
      await api.patch(`/employer/applications/${appId}/status`, { 
        new_status: newStatus 
      });
      toast.success(`Статус обновлен на: ${mapStatus(newStatus).label}`);
      fetchApplications();
    } catch (err: any) {
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const filters = [
    { id: "all", label: "Все" },
    { id: "pending", label: "Новые" },
    { id: "viewed", label: "Просмотрены" },
    { id: "accepted", label: "Приняты" },
    { id: "rejected", label: "Отклонены" },
  ];

  const mapStatus = (status: string) => {
    switch (status) {
      case "pending": return { label: "Новый", color: "bg-blue-50 text-blue-600 border-blue-100" };
      case "viewed": return { label: "Просмотрен", color: "bg-yellow-50 text-yellow-600 border-yellow-100" };
      case "accepted": return { label: "Принят", color: "bg-green-50 text-green-600 border-green-100" };
      case "rejected": return { label: "Отклонен", color: "bg-red-50 text-red-600 border-red-100" };
      default: return { label: status, color: "bg-gray-50 text-gray-600 border-gray-100" };
    }
  };

  const filteredApplications = allApplications?.filter(app => {
    if (activeFilter === "all") return true;
    return app.status === activeFilter;
  }) || [];

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black text-gray-900">Входящие отклики</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`${
                activeFilter === filter.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                  : "bg-gray-100 text-gray-500"
              } px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="px-5 py-20 text-center">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
           <p className="text-gray-400 font-bold italic">Загрузка откликов...</p>
        </div>
      )}

      {/* Applications List */}
      <div className="px-5 space-y-4">
        {filteredApplications.map((app) => {
          const statusInfo = mapStatus(app.status);
          return (
            <div
              key={app.id}
              onClick={() => navigate(`/kindergarten/application/${app.id}`)}
              className="bg-white border border-gray-100 rounded-[2rem] p-5 cursor-pointer hover:border-blue-100 transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                  {app.job_seeker.photo_url ? (
                    <img src={app.job_seeker.photo_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-600 font-black text-2xl">
                        {app.job_seeker.full_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-black text-gray-900 truncate mr-2">{app.job_seeker.full_name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-black text-yellow-700">{app.job_seeker.rating || "5.0"}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs font-bold text-blue-600 mb-1">на: {app.vacancy.title}</p>
                  <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(app.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    
                    {app.status === "pending" || app.status === "viewed" ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => updateStatus(e, app.id, "accepted")}
                          className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                          title="Принять"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => updateStatus(e, app.id, "rejected")}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                          title="Отклонить"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-black text-gray-900">
                        {app.job_seeker.desired_salary_min ? `${app.job_seeker.desired_salary_min.toLocaleString()} сум` : "З/П не указ."}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredApplications.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
             <p className="text-gray-400 font-bold">Откликов не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}