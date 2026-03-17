import { IconSettings, IconMail, IconPhone, IconMapPin, IconBuilding, IconUsers, IconCalendar, IconCircleCheck, IconX, IconEdit } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";

export function KindergartenProfile() {
  const navigate = useNavigate();
  const [showDeactivate, setShowDeactivate] = useState(false);

  const fetchProfileFunc = useCallback(() => api.get("/employer/profile"), []);
  const { data: profileData, loading: loadingProfile } = useApi<any>(fetchProfileFunc);

  const fetchStatsFunc = useCallback(() => api.get("/employer/statistics"), []);
  const { data: stats, loading: loadingStats } = useApi<any>(fetchStatsFunc);

  useEffect(() => {
    // Initial fetch handled by useApi
  }, []);

  const handleDeactivate = () => {
    setShowDeactivate(false);
    // Logic for deactivation would go here
    alert("Функция деактивации в разработке");
  };

  if (loadingProfile || loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const employer = profileData?.employer;
  const kindergarten = profileData?.kindergarten;

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
        <button
          onClick={() => navigate("/kindergarten/settings")}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <IconSettings className="w-6 h-6 text-gray-900" stroke={2} />
        </button>
      </div>

      <div className="px-5">
        {/* Profile Header Card */}
        <div className="border border-gray-100 rounded-3xl p-5 mb-6 flex items-center gap-4 bg-gradient-to-r from-blue-50/50 to-transparent">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-blue-100">
            {kindergarten?.logo_url ? (
              <img src={kindergarten.logo_url} className="w-full h-full object-cover rounded-2xl" alt="Logo" />
            ) : (
              <IconBuilding className="w-10 h-10 text-blue-600" stroke={1.5} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-gray-900 truncate mb-1">{kindergarten?.name || "Название не указано"}</h2>
            <p className="text-sm font-bold text-blue-600 flex items-center gap-1">
              <IconMapPin className="w-4 h-4" />
              {kindergarten?.district || "Район не указан"}
            </p>
            {kindergarten?.is_verified && (
              <div className="flex items-center gap-1 mt-2">
                <IconCircleCheck className="w-4 h-4 text-green-600" stroke={2} />
                <span className="text-[10px] text-green-600 font-black uppercase tracking-wider">Верифицирован</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate("/kindergarten/profile/edit")}
            className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-all"
          >
            <IconEdit className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <p className="text-2xl font-black text-blue-600">{stats?.active_vacancies || 0}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-1 leading-tight">Активные вакансии</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <p className="text-2xl font-black text-blue-600">{stats?.applications_total || 0}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-1 leading-tight">Всего откликов</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <p className="text-2xl font-black text-green-600">{stats?.views_total || 0}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-1 leading-tight">Просмотры</p>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900">Контакты</h3>
          </div>
          <div className="border border-gray-100 rounded-3xl p-5 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <IconMail className="w-5 h-5" stroke={2} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-sm font-bold text-gray-900">{kindergarten?.email || "Не указан"}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <IconPhone className="w-5 h-5" stroke={2} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Телефон</p>
                <p className="text-sm font-bold text-gray-900">{kindergarten?.phone || "Не указан"}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <IconMapPin className="w-5 h-5" stroke={2} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Адрес</p>
                <p className="text-sm font-bold text-gray-900 leading-relaxed">{kindergarten?.address || "Не указан"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <h3 className="text-lg font-black text-gray-900 mb-4">О детском саде</h3>
          <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50/30">
            <p className="text-sm font-medium text-gray-700 leading-relaxed">
              {kindergarten?.description || "Описание пока не заполнено."}
            </p>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mb-8">
          <h3 className="text-lg font-black text-gray-900 mb-4">Дополнительно</h3>
          <div className="border border-gray-100 rounded-3xl p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <IconUsers className="w-5 h-5" stroke={2} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Представитель</p>
                <p className="text-sm font-bold text-gray-900">{employer?.full_name}</p>
                {employer?.position && <p className="text-[10px] text-blue-600 font-bold uppercase">{employer.position}</p>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <IconCalendar className="w-5 h-5" stroke={2} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">На платформе с</p>
                <p className="text-sm font-bold text-gray-900">
                  {kindergarten?.created_at ? new Date(kindergarten.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' }) : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <button 
            onClick={() => setShowDeactivate(true)}
            className="w-full py-4 text-sm font-black text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-colors"
          >
            Деактивировать аккаунт
          </button>
        </div>
      </div>

      {/* Modal: Deactivate Account */}
      {showDeactivate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl scale-in-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border-4 border-white shadow-xl">
                <IconX className="w-10 h-10 text-red-600" stroke={2.5} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 text-center mb-3 tracking-tight">
              Удалить аккаунт?
            </h3>
            <p className="text-sm font-medium text-gray-500 text-center mb-8 leading-relaxed">
              Вы уверены, что хотите деактивировать свой профиль? Все ваши вакансии будут скрыты.
            </p>
            <div className="grid grid-cols-1 gap-3">
               <button
                onClick={handleDeactivate}
                className="py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-200"
              >
                Да, деактивировать
              </button>
              <button
                onClick={() => setShowDeactivate(false)}
                className="py-4 bg-gray-100 text-gray-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 active:scale-95 transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}