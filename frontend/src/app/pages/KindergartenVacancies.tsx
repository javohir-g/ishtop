import { Plus, Edit2, Pause, Play, Trash2, Users, X, Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";

interface Vacancy {
  id: number;
  title: string;
  salary_min?: number;
  salary_max?: number;
  district: string;
  is_active: boolean;
  published_at?: string;
  applications_count?: number;
}

interface Application {
  id: number;
  worker_id: number;
  status: string;
  created_at: string;
  worker: {
    full_name: string;
    photo_url?: string;
    desired_position?: string;
    experience_years?: number;
    desired_salary?: string;
  };
}

export function KindergartenVacancies() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);

  const fetchVacanciesFunc = useCallback(() => api.get("/employer/vacancies"), []);
  const { data: allVacancies, loading, execute: fetchVacancies } = useApi<Vacancy[]>(fetchVacanciesFunc);

  const fetchApplicantsFunc = useCallback(() => 
    selectedVacancy ? api.get(`/employer/vacancies/${selectedVacancy.id}/applications`) : Promise.resolve({ data: [] }), 
    [selectedVacancy]
  );
  const { data: applicants, execute: fetchApplicants } = useApi<Application[]>(fetchApplicantsFunc);

  const { execute: toggleStatus } = useApiMutation((v: Vacancy) => 
    api.put(`/employer/vacancies/${v.id}`, { is_active: !v.is_active })
  );

  const { execute: deleteVacancy } = useApiMutation((id: number) => api.delete(`/employer/vacancies/${id}`));

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  useEffect(() => {
    if (showApplicantsModal && selectedVacancy) {
      fetchApplicants();
    }
  }, [showApplicantsModal, selectedVacancy, fetchApplicants]);

  const filteredVacancies = allVacancies?.filter(v => {
    if (filter === "all") return true;
    if (filter === "active") return v.is_active;
    if (filter === "inactive") return !v.is_active;
    return true;
  }) || [];

  const handleToggle = async (v: Vacancy) => {
    try {
      await toggleStatus(v);
      fetchVacancies();
    } catch (err: any) {
      alert("Ошибка: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту вакансию?")) return;
    try {
      await deleteVacancy(id);
      fetchVacancies();
    } catch (err: any) {
      alert("Ошибка: " + (err.response?.data?.detail || err.message));
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} сум`;
    if (min) return `от ${min.toLocaleString()} сум`;
    if (max) return `до ${max.toLocaleString()} сум`;
    return "З/П не указана";
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Мои вакансии</h1>
        <button
          onClick={() => navigate("/kindergarten/vacancies/new")}
          className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
        >
          <Plus className="w-6 h-6" strokeWidth={3} />
        </button>
      </div>

      <div className="px-5">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto mb-5 hide-scrollbar py-2">
          {[
            { id: "all", label: "Все" },
            { id: "active", label: "Активные" },
            { id: "inactive", label: "Черновики" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`${
                filter === tab.id ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600"
              } px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-10 text-gray-400 uppercase font-black italic tracking-widest">Загрузка...</div>}

        <div className="flex flex-col gap-4">
          {filteredVacancies.map((vacancy) => (
            <div key={vacancy.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:border-blue-100 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{vacancy.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{vacancy.district}</p>
                  <p className="text-base font-black text-blue-600">{formatSalary(vacancy.salary_min, vacancy.salary_max)}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                  vacancy.is_active ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-500 border-gray-100"
                }`}>
                  {vacancy.is_active ? "Активна" : "Пауза"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <button 
                  onClick={() => {
                    setSelectedVacancy(vacancy);
                    setShowApplicantsModal(true);
                  }}
                  className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl"
                >
                  <Users className="w-4 h-4" />
                  <span>{vacancy.applications_count || 0} откликов</span>
                </button>
                <span className="text-xs text-gray-400 font-medium italic">
                  {vacancy.published_at ? new Date(vacancy.published_at).toLocaleDateString('ru-RU') : "Не опубл."}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <button 
                  onClick={() => navigate(`/kindergarten/vacancies/${vacancy.id}/edit`)}
                  className="bg-gray-50 text-gray-600 h-11 rounded-xl font-bold text-xs uppercase hover:bg-gray-100 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Ред.
                </button>
                
                <button 
                  onClick={() => handleToggle(vacancy)}
                  className={`h-11 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all ${
                    vacancy.is_active ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {vacancy.is_active ? <><Pause className="w-4 h-4" /> Пауза</> : <><Play className="w-4 h-4" /> Пуск</>}
                </button>

                <button 
                  onClick={() => handleDelete(vacancy.id)}
                  className="bg-red-50 text-red-600 h-11 rounded-xl font-bold text-xs uppercase hover:bg-red-100 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredVacancies.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold mb-4">Вакансии не найдены</p>
            <button
              onClick={() => navigate("/kindergarten/vacancies/new")}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-sm shadow-lg shadow-blue-200"
            >
              Создать вакансию
            </button>
          </div>
        )}
      </div>

      {/* Applicants Modal */}
      {showApplicantsModal && selectedVacancy && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 py-2">
              <div>
                <h3 className="text-xl font-black text-gray-900">{selectedVacancy.title}</h3>
                <p className="text-sm font-bold text-blue-600">Список откликов</p>
              </div>
              <button 
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600" 
                onClick={() => setShowApplicantsModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {applicants?.map((app) => (
                <div
                  key={app.id}
                  className="bg-gray-50 border border-gray-100 rounded-3xl p-4 hover:border-blue-200 transition-all cursor-pointer"
                  onClick={() => navigate(`/kindergarten/application/${app.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-gray-200">
                       {app.worker.photo_url ? (
                         <img src={app.worker.photo_url} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-blue-600 font-black text-xl">{app.worker.full_name.charAt(0)}</span>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-gray-900 truncate mr-2">{app.worker.full_name}</h4>
                        <span className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-tighter">
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-tight">{app.worker.desired_position || "Воспитатель"}</p>
                      
                      <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-gray-900 font-bold">5.0</span>
                        </div>
                        <span>•</span>
                        <span>{app.worker.experience_years || 0} лет опыта</span>
                        <span>•</span>
                        <span className="text-blue-600 font-bold">{app.worker.desired_salary || "З/П не указ."}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {applicants?.length === 0 && <div className="text-center py-10 text-gray-400 font-bold">Откликов пока нет</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}