import { IconArrowLeft, IconChevronRight, IconWorld, IconMoon, IconHelp, IconFileText, IconShield, IconInfoCircle, IconX, IconLogout } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../i18n/useTranslation";

export function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [showDeactivate, setShowDeactivate] = useState(false);

  const languageLabels: Record<string, string> = {
    "uz-latn": "O'zbek (lotin)",
    "uz-cyrl": "Ўзбек (кирилл)",
    "ru": "Русский"
  };

  const handleDeactivate = () => {
    setShowDeactivate(false);
    // Logic for deactivation
    alert("Ваш аккаунт деактивирован");
    navigate('/');
  };

  return (
    <div className="bg-white min-h-screen pb-20 lg:pb-8">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center lg:px-8 lg:pt-8 lg:pb-6 lg:border-b lg:border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3 hover:bg-gray-100 transition-all active:scale-90"
        >
          <IconArrowLeft className="w-6 h-6 text-gray-900" stroke={2} />
        </button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Настройки</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 hidden lg:block">Ваш персональный профиль</p>
        </div>
      </div>

      <div className="px-5 lg:px-8 lg:py-6 max-w-xl mx-auto">
        <div className="space-y-1">
            <button 
                onClick={() => navigate("/app/settings/language")}
                className="w-full flex items-center justify-between py-5 border-b border-gray-50 hover:bg-gray-50 transition-all group px-2 rounded-2xl"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <IconWorld className="w-5 h-5" stroke={2} />
                    </div>
                    <span className="text-base font-bold text-gray-900">Язык приложения</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{languageLabels[language] || "Русский"}</span>
                    <IconChevronRight className="w-5 h-5 text-gray-300" stroke={2} />
                </div>
            </button>

            <div className="w-full flex items-center justify-between py-5 border-b border-gray-50 px-2 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <IconMoon className="w-5 h-5" stroke={2} />
                    </div>
                    <span className="text-base font-bold text-gray-900">Темная тема</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>

            <button className="w-full flex items-center justify-between py-5 border-b border-gray-50 hover:bg-gray-50 transition-all group px-2 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <IconHelp className="w-5 h-5" stroke={2} />
                    </div>
                    <span className="text-base font-bold text-gray-900">Помощь и поддержка</span>
                </div>
                <IconChevronRight className="w-5 h-5 text-gray-300" stroke={2} />
            </button>
        </div>

        {/* About Section */}
        <div className="mt-10 mb-4 px-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Юридическая информация</h3>
        </div>

        <div className="space-y-1">
            <button 
            onClick={() => navigate("/privacy")}
            className="w-full flex items-center justify-between py-5 border-b border-gray-50 hover:bg-gray-50 transition-all group px-2 rounded-2xl"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                        <IconShield className="w-5 h-5" stroke={2} />
                    </div>
                    <span className="text-base font-bold text-gray-900">Политика конфиденциальности</span>
                </div>
                <IconChevronRight className="w-5 h-5 text-gray-300" stroke={2} />
            </button>

            <button 
            onClick={() => navigate("/terms")}
            className="w-full flex items-center justify-between py-5 border-b border-gray-50 hover:bg-gray-50 transition-all group px-2 rounded-2xl"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <IconFileText className="w-5 h-5" stroke={2} />
                    </div>
                    <span className="text-base font-bold text-gray-900">Условия использования</span>
                </div>
                <IconChevronRight className="w-5 h-5 text-gray-300" stroke={2} />
            </button>

            <button className="w-full flex items-center justify-between py-5 border-b border-gray-50 hover:bg-gray-50 transition-all group px-2 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
                        <IconInfoCircle className="w-5 h-5" stroke={2} />
                    </div>
                    <span className="text-base font-bold text-gray-900">О приложении</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400">v1.0.0</span>
                    <IconChevronRight className="w-5 h-5 text-gray-300" stroke={2} />
                </div>
            </button>
        </div>

        {/* Danger Zone */}
        <div className="mt-10 space-y-1">
            <button 
            onClick={() => setShowDeactivate(true)}
            className="w-full flex items-center justify-between py-5 group px-2 rounded-2xl"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <IconX className="w-5 h-5" stroke={2} />
                    </div>
                    <span className="text-base font-bold text-red-500">Деактивировать аккаунт</span>
                </div>
            </button>

            <button 
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-between py-5 group px-2 rounded-2xl"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-gray-900 group-hover:text-white transition-all">
                        <IconLogout className="w-5 h-5" stroke={2} />
                    </div>
                    <span className="text-base font-bold text-gray-500 group-hover:text-gray-900 transition-all">Выйти из аккаунта</span>
                </div>
            </button>
        </div>
      </div>

      {/* Modal: Deactivate Account */}
      {showDeactivate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl scale-in-center border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border-4 border-white shadow-xl">
                <IconX className="w-10 h-10 text-red-600" stroke={2.5} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 text-center mb-3">
              Удалить аккаунт?
            </h3>
            <p className="text-sm font-medium text-gray-500 text-center mb-8 leading-relaxed">
              Вы уверены, что хотите деактивировать свой профиль? Все ваши данные будут скрыты.
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
                className="py-4 bg-gray-100 text-gray-900 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
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