import { 
  IconArrowLeft, 
  IconMapPin, 
  IconBriefcase, 
  IconPhone, 
  IconMail,
  IconBrandTelegram,
  IconStar,
  IconCheck,
  IconX,
  IconClock
} from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";

export function KindergartenApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchApplicationFunc = useCallback(() => api.get(`/employer/applications/${id}`), [id]);
  const { data: appData, loading, execute: refreshApp } = useApi<any>(fetchApplicationFunc);

  const { execute: updateStatus, loading: updating } = useApiMutation((newStatus: string) => 
    api.patch(`/employer/applications/${id}/status`, { new_status: newStatus })
  );

  useEffect(() => {
    refreshApp();
  }, [refreshApp]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatus(newStatus);
      refreshApp();
    } catch (err: any) {
      alert("Ошибка при обновлении статуса: " + (err.response?.data?.detail || err.message));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100">
            <IconCheck className="w-5 h-5" stroke={2} />
            <span className="font-semibold">Принята</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100">
            <IconX className="w-5 h-5" stroke={2} />
            <span className="font-semibold">Отклонена</span>
          </div>
        );
      case "viewed":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-100">
            <IconClock className="w-5 h-5" stroke={2} />
            <span className="font-semibold">Просмотрена</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
            <IconClock className="w-5 h-5" stroke={2} />
            <span className="font-semibold">Новая</span>
          </div>
        );
    }
  };

  if (loading && !appData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appData) return <div className="p-10 text-center">Заявка не найдена</div>;

  const jobSeeker = appData.job_seeker;
  const vacancy = appData.vacancy;

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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Детали отклика</h1>
          </div>
          {getStatusBadge(appData.status)}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-6 space-y-4 lg:space-y-6">
        {/* Candidate Info Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
               {jobSeeker.photo_url ? (
                 <img src={jobSeeker.photo_url} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-blue-600 font-black text-4xl">
                   {jobSeeker.full_name?.charAt(0)}
                 </div>
               )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl lg:text-4xl font-black text-gray-900 mb-2">{jobSeeker.full_name}</h2>
              <p className="text-lg lg:text-xl text-blue-600 font-bold mb-4">{jobSeeker.desired_position || "Кандидат"}</p>
              
              <div className="flex items-center gap-6 mb-5">
                <div className="flex items-center gap-1.5">
                  <IconStar className="w-5 h-5 text-yellow-500 fill-yellow-500" stroke={1.5} />
                  <span className="font-black text-gray-900">{jobSeeker.rating || "5.0"}</span>
                </div>
                <div className="h-5 w-px bg-gray-200"></div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  <IconBriefcase className="w-4 h-4 inline mr-1.5" stroke={2} />
                  {jobSeeker.experience_years || 0} лет опыта
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                  <IconMapPin className="w-5 h-5 text-gray-400" stroke={2} />
                  <span>{jobSeeker.district || "Район не указан"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                  <IconClock className="w-5 h-5 text-gray-400" stroke={2} />
                  <span>Отклик: {new Date(appData.created_at).toLocaleDateString('ru-RU')} на вакансию "{vacancy.title}"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - если статус не финальный */}
          {["pending", "viewed"].includes(appData.status) && (
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
              <button
                onClick={() => handleStatusUpdate("rejected")}
                disabled={updating}
                className="bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <IconX className="w-5 h-5" stroke={3} />
                Отклонить
              </button>
              <button
                onClick={() => handleStatusUpdate("accepted")}
                disabled={updating}
                className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
              >
                <IconCheck className="w-5 h-5" stroke={3} />
                Принять
              </button>
            </div>
          )}

          {/* Already accepted */}
          {appData.status === "accepted" && (
            <div className="pt-6 border-t border-gray-50">
              <button
                onClick={() => navigate(`/kindergarten/candidate/${jobSeeker.id}`)}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
              >
                Открыть профиль кандидата
              </button>
            </div>
          )}
        </div>

        {/* Salary */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Ожидаемая зарплата</h3>
          <p className="text-2xl font-black text-blue-600">
             {jobSeeker.desired_salary_min ? `от ${jobSeeker.desired_salary_min.toLocaleString()} сум` : "Не указана"}
          </p>
        </div>

        {/* Cover Letter */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Сопроводительное письмо</h3>
          <p className="text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
            {appData.cover_letter || "Кандидат не оставил сопроводительного письма."}
          </p>
        </div>

        {/* About Seeker */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">О кандидате</h3>
          <p className="text-sm font-medium text-gray-700 leading-relaxed">
            {jobSeeker.about_me || "Информация отсутствует."}
          </p>
        </div>

        {/* Education & Experience potentially would go here or in CandidateDetail */}

        {/* Contact Info - Показываем полностью только если принято или по правилам бизнеса */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Контактная информация</h3>
          <div className="space-y-4">
             {appData.status === "accepted" ? (
               <>
                <div className="flex items-center gap-4 text-gray-700">
                  <IconPhone className="w-5 h-5 text-blue-600" stroke={2} />
                  <span className="font-bold">{jobSeeker.phone || "+998 90 123 45 67"}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-700">
                  <IconMail className="w-5 h-5 text-blue-600" stroke={2} />
                  <span className="font-bold">{jobSeeker.email || "—"}</span>
                </div>
               </>
             ) : (
               <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                  <p className="text-xs font-bold text-gray-400 italic">Контакты будут доступны после принятия отклика</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
