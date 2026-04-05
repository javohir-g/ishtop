import { IconSearch, IconMapPin, IconStar, IconBriefcase, IconX, IconFilter } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";
import { toast } from "sonner";

interface Candidate {
  id: number;
  full_name: string;
  desired_position?: string;
  experience_years?: number;
  district?: string;
  desired_salary?: string;
  rating?: number;
  photo_url?: string;
  skills?: { skill_name: string }[];
  is_available: boolean;
}

interface Vacancy {
  id: number;
  title: string;
}

export function KindergartenHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>("");

  const fetchWorkersFunc = useCallback(() => api.get("/workers", { params: { search: searchQuery } }), [searchQuery]);
  const { data: candidates, loading, execute: fetchWorkers } = useApi<Candidate[]>(fetchWorkersFunc);

  const fetchVacanciesFunc = useCallback(() => api.get("/employer/vacancies"), []);
  const { data: myVacancies } = useApi<Vacancy[]>(fetchVacanciesFunc);

  const { execute: inviteWorker, loading: inviting } = useApiMutation(
    (data: { workerId: number, vacancyId: number }) => 
      api.post(`/workers/${data.workerId}/invite?vacancy_id=${data.vacancyId}`)
  );

  useEffect(() => {
    fetchWorkers();
    api.get("/employer/vacancies"); // Initial load of vacancies
  }, [fetchWorkers]);

  const handleInvite = async () => {
    if (!selectedCandidate || !selectedVacancyId) {
       toast.error("Выберите вакансию");
       return;
    }
    try {
      await inviteWorker({ workerId: selectedCandidate.id, vacancyId: Number(selectedVacancyId) });
      toast.success("Приглашение отправлено!");
      setShowInviteModal(false);
    } catch (err: any) {
      toast.error("Ошибка: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-8">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 lg:px-8 lg:pt-8">
        <div className="hidden lg:block mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Поиск кандидатов</h1>
          <p className="text-gray-600">Найдите лучших специалистов для вашего детского сада</p>
        </div>

        {/* Search Bar */}
        <div className="mb-5">
          <div className="relative">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по имени или должности..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWorkers()}
              className="w-full h-12 pl-12 pr-4 bg-gray-50 rounded-xl text-sm border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="px-5 lg:px-8">
        {/* Status */}
        {loading && <div className="text-center py-10 text-gray-400 uppercase font-bold tracking-widest">Загрузка...</div>}

        {/* Candidates List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {!loading && candidates?.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/kindergarten/candidate/${candidate.id}`)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                   {candidate.photo_url ? (
                     <img src={candidate.photo_url} alt={candidate.full_name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-blue-600 font-bold text-xl">{candidate.full_name.charAt(0)}</span>
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-gray-900 mb-0.5">{candidate.full_name}</h4>
                  <p className="text-sm text-gray-600 mb-1">{candidate.desired_position || "Воспитатель"}</p>
                  <div className="flex items-center gap-1 mb-2">
                    <IconStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-gray-900">{candidate.rating || "5.0"}</span>
                    <span className="text-sm text-gray-500">· {candidate.experience_years || 0} лет опыта</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <IconMapPin className="w-4 h-4" />
                    <span>{candidate.district || "Ташкент"}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {candidate.skills?.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold uppercase border border-gray-100">
                    {skill.skill_name}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-sm font-bold text-blue-600">{candidate.desired_salary || "З/П не указана"}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCandidate(candidate);
                    setShowInviteModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Пригласить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Пригласить кандидата</h3>
            <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden">
                    {selectedCandidate.photo_url ? (
                        <img src={selectedCandidate.photo_url} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-blue-600 font-bold">{selectedCandidate.full_name.charAt(0)}</span>
                    )}
                </div>
                <div className="flex-1">
                    <p className="font-bold text-gray-900">{selectedCandidate.full_name}</p>
                    <p className="text-sm text-gray-500">{selectedCandidate.desired_position}</p>
                </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-gray-700 mb-2 block">Выберите вакансию</label>
              <select 
                value={selectedVacancyId}
                onChange={(e) => setSelectedVacancyId(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Не выбрано</option>
                {myVacancies?.map(v => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                onClick={() => setShowInviteModal(false)}
              >
                Отмена
              </button>
              <button
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:opacity-50"
                onClick={handleInvite}
                disabled={inviting || !selectedVacancyId}
              >
                {inviting ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}