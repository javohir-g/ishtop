import { 
  IconArrowLeft, 
  IconMapPin, 
  IconBriefcase, 
  IconPhone, 
  IconMail, 
  IconClock, 
  IconStar, 
  IconDownload, 
  IconMessage, 
  IconBookmark, 
  IconBookmarkFilled,
  IconX
} from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";

interface Skill {
  id: number;
  skill_name: string;
}

interface Education {
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  is_current: boolean;
}

interface Experience {
  position: string;
  company_name: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

interface WorkerProfile {
  id: number;
  full_name: string;
  photo_url?: string;
  desired_position?: string;
  experience_years: number;
  district?: string;
  desired_salary_min?: number;
  desired_salary_max?: number;
  rating: number;
  about_me?: string;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
}

interface Vacancy {
  id: number;
  title: string;
}

export function CandidateDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>("");

  const fetchWorkerFunc = useCallback(() => api.get(`/workers/${id}`), [id]);
  const { data: candidate, loading } = useApi<WorkerProfile>(fetchWorkerFunc);

  const fetchVacanciesFunc = useCallback(() => api.get("/employer/vacancies"), []);
  const { data: myVacancies } = useApi<Vacancy[]>(fetchVacanciesFunc);

  const { execute: inviteWorker, loading: inviting } = useApiMutation(
    (data: { workerId: number, vacancyId: number }) => 
      api.post(`/workers/${data.workerId}/invite?vacancy_id=${data.vacancyId}`)
  );

  const handleInvite = async () => {
    if (!candidate || !selectedVacancyId) return;
    try {
      await inviteWorker({ workerId: candidate.id, vacancyId: Number(selectedVacancyId) });
      alert("Приглашение отправлено!");
      setShowInviteModal(false);
    } catch (err: any) {
      alert("Ошибка: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleMessage = () => {
    // В реальном приложении это создаст чат или перенаправит в существующий
    navigate("/kindergarten/messages");
  };

  if (loading && !candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidate) return <div className="p-10 text-center">Кандидат не найден</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <IconArrowLeft className="w-6 h-6 text-gray-900" stroke={2} />
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Профиль кандидата</h1>
          </div>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            {isSaved ? (
              <IconBookmarkFilled className="w-6 h-6 text-blue-600" />
            ) : (
              <IconBookmark className="w-6 h-6 text-gray-900" stroke={2} />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-6 space-y-4 lg:space-y-6">
        {/* Candidate Header Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
               {candidate.photo_url ? (
                 <img src={candidate.photo_url} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-blue-600 font-black text-4xl">
                   {candidate.full_name?.charAt(0)}
                 </div>
               )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl lg:text-4xl font-black text-gray-900 mb-1">{candidate.full_name}</h2>
                  <p className="text-lg lg:text-xl text-blue-600 font-bold">{candidate.desired_position || "Воспитатель"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <IconStar className="w-5 h-5 text-yellow-500 fill-yellow-500" stroke={1.5} />
                  <span className="font-black text-gray-900">{candidate.rating || "5.0"}</span>
                </div>
                <div className="h-5 w-px bg-gray-200"></div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  <IconBriefcase className="w-4 h-4 inline mr-1.5" stroke={2} />
                  {candidate.experience_years} лет опыта
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                  <IconMapPin className="w-5 h-5 text-gray-400" stroke={2} />
                  <span>{candidate.district || "Ташкент"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-50">
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
            >
              Пригласить
            </button>
            <button
              onClick={handleMessage}
              className="bg-gray-100 text-gray-700 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <IconMessage className="w-5 h-5" stroke={2} />
              Написать
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Желаемая З/П</p>
            <p className="text-lg font-black text-blue-600">
                {candidate.desired_salary_min ? `${candidate.desired_salary_min.toLocaleString()} сум` : "Не указана"}
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Стаж</p>
            <p className="text-lg font-black text-gray-900">{candidate.experience_years} лет</p>
          </div>
        </div>

        {/* About */}
        {candidate.about_me && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">О себе</h3>
            <p className="text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">{candidate.about_me}</p>
          </div>
        )}

        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Навыки</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-tight border border-blue-100"
                >
                  {skill.skill_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {candidate.experience.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Опыт работы</h3>
            <div className="space-y-6">
              {candidate.experience.sort((a,b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).map((exp, index) => (
                <div key={index} className={index > 0 ? "pt-6 border-t border-gray-50" : ""}>
                  <h4 className="font-bold text-gray-900 text-base mb-1">{exp.position}</h4>
                  <p className="text-sm font-bold text-blue-600 mb-2">{exp.company_name}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    {new Date(exp.start_date).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })} — 
                    {exp.is_current ? " Наст. время" : ` ${new Date(exp.end_date!).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}`}
                  </p>
                  {exp.description && <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {candidate.education.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Образование</h3>
            <div className="space-y-6">
              {candidate.education.map((edu, index) => (
                <div key={index} className={index > 0 ? "pt-6 border-t border-gray-50" : ""}>
                   <h4 className="font-bold text-gray-900 text-base mb-1">{edu.institution}</h4>
                   <p className="text-sm font-bold text-blue-600 mb-2">{edu.degree} {edu.field_of_study && `(${edu.field_of_study})`}</p>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       {edu.start_year || ""} — {edu.is_current ? "Наст. время" : edu.end_year || ""}
                   </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && candidate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black text-gray-900 tracking-tight">Отправить приглашение</h3>
               <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600"><IconX /></button>
            </div>
            
            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-3xl">
                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                    {candidate.photo_url ? (
                        <img src={candidate.photo_url} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-blue-600 font-black text-xl">{candidate.full_name?.charAt(0)}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 truncate">{candidate.full_name}</p>
                    <p className="text-xs font-bold text-gray-500 uppercase">{candidate.desired_position || "Воспитатель"}</p>
                </div>
            </div>

            <div className="mb-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Выберите вашу вакансию</label>
              <select 
                value={selectedVacancyId}
                onChange={(e) => setSelectedVacancyId(e.target.value)}
                className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              >
                <option value="">Не выбрано</option>
                {myVacancies?.map(v => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 h-14 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
                onClick={() => setShowInviteModal(false)}
              >
                Отмена
              </button>
              <button
                className="flex-[2] h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
                onClick={handleInvite}
                disabled={inviting || !selectedVacancyId}
              >
                {inviting ? "Отправка..." : "Пригласить кандидата"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
