import { 
  IconArrowLeft, 
  IconMapPin, 
  IconBriefcase, 
  IconCalendar, 
  IconPhone, 
  IconChecks,
  IconClock,
  IconAlertCircle,
  IconX
} from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useCallback } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { useApi } from "../../hooks/useApi";
import api from "../../services/api";

interface BackendApplication {
  id: number;
  status: string;
  created_at: string;
  cover_letter?: string;
  vacancy: {
    id: number;
    title: string;
    description: string;
    salary_min?: number;
    salary_max?: number;
    district: string;
    employment_type: string;
    kindergarten: {
      name: string;
      phone?: string;
    };
  };
}

export function ApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const fetchAppFunc = useCallback(() => api.get(`/applications/${id}`), [id]);
  const { data: application, loading } = useApi<BackendApplication>(fetchAppFunc);

  const job = application?.vacancy;

  // Определяем иконку статуса
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return <IconChecks className="w-6 h-6 text-green-600" stroke={2} />;
      case "rejected":
        return <IconX className="w-6 h-6 text-red-600" stroke={2} />;
      case "pending":
      case "viewed":
        return <IconClock className="w-6 h-6 text-yellow-600" stroke={2} />;
      default:
        return <IconBriefcase className="w-6 h-6 text-blue-600" stroke={2} />;
    }
  };

  // Сообщение статуса
  const getStatusMessage = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "Ваша заявка принята! Работодатель рассмотрит ваше резюме и свяжется с вами в ближайшее время.";
      case "rejected":
        return "К сожалению, ваша заявка была отклонена. Не расстраивайтесь и продолжайте искать подходящие вакансии!";
      case "pending":
      case "viewed":
        return "Ваша заявка находится на рассмотрении. Работодатель скоро с вами свяжется.";
      default:
        return "Ваша заявка успешно отправлена работодателю. Ожидайте ответа.";
    }
  };

  const statusMap: Record<string, { label: string, color: string }> = {
    pending: { label: "На рассмотрении", color: "border-yellow-600 text-yellow-600 bg-yellow-50" },
    viewed: { label: "Просмотрено", color: "border-blue-600 text-blue-600 bg-blue-50" },
    shortlisted: { label: "В шорт-листе", color: "border-purple-600 text-purple-600 bg-purple-50" },
    accepted: { label: "Принято", color: "border-green-600 text-green-600 bg-green-50" },
    rejected: { label: "Отклонено", color: "border-red-600 text-red-600 bg-red-50" },
    withdrawn: { label: "Отозвано", color: "border-gray-600 text-gray-600 bg-gray-50" },
  };

  const getStatusInfo = (status: string) => {
    return statusMap[status.toLowerCase()] || { label: status, color: "border-gray-400 text-gray-500 bg-gray-50" };
  };

  if (loading) {
     return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
     );
  }

  if (!application || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <IconAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" stroke={1.5} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Заявка не найдена</h2>
          <p className="text-gray-600 mb-6">Заявка с таким ID не существует или доступ ограничен</p>
          <button
            onClick={() => navigate("/app/applications")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Вернуться к заявкам
          </button>
        </div>
      </div>
    );
  }

  const timeline = [
    {
      status: "Заявка отправлена",
      date: new Date(application.created_at).toLocaleDateString('ru-RU'),
      completed: true,
      icon: IconChecks,
    },
    {
      status: "Рассмотрение резюме",
      date: application.status === "pending" ? "Ожидается" : new Date(application.created_at).toLocaleDateString('ru-RU'),
      completed: ["accepted", "rejected", "viewed", "shortlisted"].includes(application.status),
      icon: IconClock,
    },
    {
      status: application.status === "rejected" ? "Отклонено" : "Собеседование",
      date: application.status === "accepted" ? "Скоро" : "Ожидается",
      completed: application.status === "accepted",
      icon: application.status === "rejected" ? IconX : IconChecks,
    },
  ];

  const statusInfo = getStatusInfo(application.status);

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 transition-all">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate("/app/applications")}
            className="w-10 h-10 rounded-2xl hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95 border border-transparent hover:border-gray-100"
          >
            <IconArrowLeft className="w-6 h-6 text-gray-900" stroke={2} />
          </button>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight">Детали заявки</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-6 space-y-6 lg:space-y-8">
        {/* Status Card */}
        <div className={`rounded-[2rem] border p-6 lg:p-8 shadow-xl shadow-gray-100/50 border-l-[6px] transition-all hover:translate-y-[-2px] ${statusInfo.color}`}>
          <div className="flex items-start gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white shadow-soft font-black`}>
              {getStatusIcon(application.status)}
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-black mb-2 uppercase tracking-wide`}>
                {statusInfo.label}
              </h3>
              <p className="text-gray-800 text-sm font-medium leading-relaxed opacity-90 font-serif italic">
                {getStatusMessage(application.status)}
              </p>
            </div>
          </div>
        </div>

        {/* Job Info Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 lg:p-8 shadow-xl shadow-gray-50 transition-all hover:border-blue-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2 leading-tight">{job.title}</h2>
              <p className="text-lg text-blue-600 font-black mb-5 tracking-tight">{job.kindergarten.name}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-bold">
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                  <IconMapPin className="w-5 h-5 text-blue-500" stroke={2} />
                  <span>{job.district}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                  <IconBriefcase className="w-5 h-5 text-blue-500" stroke={2} />
                  <span>{job.employment_type === "full_time" ? "Полная занятость" : "Частичная занятость"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                  <IconCalendar className="w-5 h-5 text-blue-500" stroke={2} />
                  <span>Подана: {new Date(application.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-dashed border-gray-200">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Предлагаемая зарплата</p>
            <p className="text-2xl font-black text-gray-900">
              {job.salary_min ? `${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()} сум` : "З/П не указана"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
           {/* Timeline - Left Column */}
           <div className="lg:col-span-5 space-y-6">
                <div className="bg-gray-900 rounded-[2.5rem] p-6 lg:p-8 shadow-2xl text-white">
                  <h3 className="text-lg font-black mb-8 uppercase tracking-widest text-blue-400">История заявки</h3>
                  <div className="space-y-6 relative ml-2">
                    {timeline.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="flex gap-5 relative group">
                          <div className="flex flex-col items-center z-10">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                item.completed
                                  ? "bg-blue-600 shadow-lg shadow-blue-500/30"
                                  : "bg-gray-800 border border-gray-700"
                              }`}
                            >
                              <Icon
                                className={`w-6 h-6 ${
                                  item.completed ? "text-white" : "text-gray-500"
                                }`}
                                stroke={2.5}
                              />
                            </div>
                            {index < timeline.length - 1 && (
                              <div
                                className={`w-0.5 h-10 my-1 ${
                                  item.completed ? "bg-blue-600" : "bg-gray-800"
                                }`}
                              ></div>
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <h4
                              className={`font-black text-sm uppercase tracking-wide mb-1 ${
                                item.completed ? "text-white" : "text-gray-500"
                              }`}
                            >
                              {item.status}
                            </h4>
                            <p className="text-xs font-bold text-gray-500">{item.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                {application.status === "rejected" && (
                    <div className="bg-red-50 rounded-[2rem] border border-red-100 p-6 shadow-lg shadow-red-50">
                        <h3 className="text-lg font-black text-red-900 mb-3 tracking-tight">Не расстраивайтесь!</h3>
                        <p className="text-red-700 text-sm font-bold mb-5 leading-relaxed">На платформе еще много активных вакансий. Давайте попробуем снова?</p>
                        <button
                            onClick={() => navigate("/app")}
                            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                        >
                            Искать дальше
                        </button>
                    </div>
                )}

                {application.status === "accepted" && (
                    <div className="bg-green-600 rounded-[2rem] p-6 shadow-2xl shadow-green-200">
                        <h3 className="text-xl font-black text-white mb-3 tracking-tight italic">Поздравляем! 🎉</h3>
                        <p className="text-green-50 text-sm font-bold mb-6 leading-relaxed opacity-90">Ваша кандидатура одобрена. Переходите в чат для обсуждения деталей.</p>
                        <button
                            onClick={() => navigate("/app/messages")}
                            className="w-full bg-white text-green-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-50 transition-all shadow-xl active:scale-95"
                        >
                            Перейти в чат
                        </button>
                    </div>
                )}
           </div>

           {/* Details - Right Column */}
           <div className="lg:col-span-7 space-y-6 lg:space-y-8">
                {/* Cover Letter */}
                {application.cover_letter && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 lg:p-8 shadow-xl shadow-gray-50 border-t-4 border-t-blue-600">
                    <h3 className="text-xl font-black text-gray-900 mb-5 tracking-tight flex items-center gap-2">
                        <IconMail className="w-6 h-6 text-blue-600" />
                        Ваше письмо
                    </h3>
                    <p className="text-gray-700 leading-relaxed font-serif italic text-lg px-4 border-l-2 border-gray-100">
                        {application.cover_letter}
                    </p>
                </div>
                )}

                <div className="bg-blue-50 rounded-[2.5rem] border border-blue-100 p-6 lg:p-8 shadow-xl shadow-blue-50 container-blob">
                  <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">О вакансии</h3>
                  <p className="text-gray-700 leading-relaxed font-medium mb-8 whitespace-pre-wrap">{job.description}</p>
                  
                  <div className="pt-6 border-t border-blue-100">
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Контакты организации</h4>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-blue-100 flex-shrink-0">
                            <IconPhone className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900">{job.kindergarten.name}</p>
                            <p className="text-sm font-bold text-blue-600">{job.kindergarten.phone || "Телефон не указан"}</p>
                        </div>
                      </div>
                  </div>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
}
