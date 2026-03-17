import { 
  IconArrowLeft, 
  IconMapPin, 
  IconBriefcase, 
  IconCalendar, 
  IconPhone, 
  IconMail,
  IconBrandTelegram,
  IconChecks,
  IconClock,
  IconAlertCircle,
  IconX
} from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { getApplicationById, getJobById } from "../../data/mockData";
import { useTranslation } from "../i18n/useTranslation";

export function ApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const application = getApplicationById(Number(id));
  const job = application ? getJobById(application.jobId) : undefined;

  if (!application || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <IconAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" stroke={1.5} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Заявка не найдена</h2>
          <p className="text-gray-600 mb-6">Заявка с таким ID не существует</p>
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

  // Определяем иконку статуса
  const getStatusIcon = () => {
    switch (application.filterType) {
      case "accepted":
        return <IconChecks className="w-6 h-6 text-green-600" stroke={2} />;
      case "rejected":
        return <IconX className="w-6 h-6 text-red-600" stroke={2} />;
      case "pending":
        return <IconClock className="w-6 h-6 text-yellow-600" stroke={2} />;
      default:
        return <IconBriefcase className="w-6 h-6 text-blue-600" stroke={2} />;
    }
  };

  // Сообщение статуса
  const getStatusMessage = () => {
    switch (application.filterType) {
      case "accepted":
        return "Ваша заявка принята! Работодатель рассмотрит ваше резюме и свяжется с вами в ближайшее время.";
      case "rejected":
        return "К сожалению, ваша заявка была отклонена. Не расстраивайтесь и продолжайте искать подходящие вакансии!";
      case "pending":
        return "Ваша заявка находится на рассмотрении. Работодатель скоро с вами свяжется.";
      default:
        return "Ваша заявка успешно отправлена работодателю. Ожидайте ответа.";
    }
  };

  const timeline = [
    {
      status: "Заявка отправлена",
      date: application.appliedDate,
      completed: true,
      icon: IconChecks,
    },
    {
      status: "Рассмотрение резюме",
      date: application.filterType === "sent" ? "Ожидается" : application.appliedDate,
      completed: ["accepted", "rejected", "pending"].includes(application.filterType),
      icon: IconClock,
    },
    {
      status: application.filterType === "rejected" ? "Отклонено" : "Собеседование",
      date: application.filterType === "accepted" ? "Скоро" : "Ожидается",
      completed: application.filterType === "accepted",
      icon: application.filterType === "rejected" ? IconX : IconChecks,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate("/app/applications")}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <IconArrowLeft className="w-6 h-6 text-gray-900" stroke={2} />
          </button>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Детали заявки</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-6 space-y-4 lg:space-y-6">
        {/* Status Card */}
        <div className={`rounded-2xl border p-5 lg:p-6 ${application.statusColor.replace('border-', 'border-2 border-')}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${application.statusColor.split(' ')[0]}`}>
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-1 ${application.statusColor.split(' ')[1]}`}>
                {application.status}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {getStatusMessage()}
              </p>
            </div>
          </div>
        </div>

        {/* Job Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
              <p className="text-base text-gray-700 font-medium mb-3">{job.company}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <IconMapPin className="w-5 h-5 text-gray-400" stroke={1.5} />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <IconBriefcase className="w-5 h-5 text-gray-400" stroke={1.5} />
                  <span>{job.tags.join(" · ")}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <IconCalendar className="w-5 h-5 text-gray-400" stroke={1.5} />
                  <span>Подана: {application.appliedDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Зарплата</p>
            <p className="text-xl font-bold text-blue-600">{job.salary}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Статус заявки</h3>
          <div className="space-y-4">
            {timeline.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.completed
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          item.completed ? "text-blue-600" : "text-gray-400"
                        }`}
                        stroke={2}
                      />
                    </div>
                    {index < timeline.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          item.completed ? "bg-blue-200" : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <h4
                      className={`font-semibold mb-1 ${
                        item.completed ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {item.status}
                    </h4>
                    <p className="text-sm text-gray-600">{item.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cover Letter */}
        {application.coverLetter && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Сопроводительное письмо</h3>
            <p className="text-gray-700 leading-relaxed">{application.coverLetter}</p>
          </div>
        )}

        {/* Job Description */}
        {job.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание вакансии</h3>
            <p className="text-gray-700 leading-relaxed mb-4">{job.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Employer Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Контактная информация работодателя</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <IconBriefcase className="w-5 h-5 text-gray-400 mt-0.5" stroke={1.5} />
              <div>
                <p className="text-sm text-gray-600">Контактное лицо</p>
                <p className="font-medium text-gray-900">{job.contactPerson}</p>
              </div>
            </div>
            <a
              href={`tel:${job.phone}`}
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <IconPhone className="w-5 h-5 text-gray-400" stroke={1.5} />
              <div>
                <p className="text-sm text-gray-600">Телефон</p>
                <p className="font-medium">{job.phone}</p>
              </div>
            </a>
            <a
              href={`https://t.me/${job.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <IconBrandTelegram className="w-5 h-5 text-gray-400" stroke={1.5} />
              <div>
                <p className="text-sm text-gray-600">Telegram</p>
                <p className="font-medium">{job.telegram}</p>
              </div>
            </a>
          </div>
        </div>

        {/* Actions */}
        {application.filterType === "rejected" && (
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Что делать дальше?</h3>
            <p className="text-gray-700 mb-4">Не переживайте! Продолжайте искать подходящие вакансии. У нас много предложений для вас.</p>
            <button
              onClick={() => navigate("/app")}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Найти другие вакансии
            </button>
          </div>
        )}

        {application.filterType === "accepted" && (
          <div className="bg-green-50 rounded-2xl border border-green-100 p-5 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Поздравляем! 🎉</h3>
            <p className="text-gray-700 mb-4">Ваша заявка принята. Скоро работодатель свяжется с вами для собеседования. Подготовьтесь и будьте на связи!</p>
            <button
              onClick={() => navigate("/app/messages")}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Перейти к сообщениям
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
