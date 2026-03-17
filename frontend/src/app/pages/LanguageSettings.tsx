import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../i18n/useTranslation";

export function LanguageSettings() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const handleSave = () => {
    setLanguage(selectedLanguage);
    navigate(-1);
  };

  const languages = [
    { 
      code: "uz-latn" as const, 
      label: "O'zbek (lotin)",
      flag: "🇺🇿"
    },
    { 
      code: "uz-cyrl" as const, 
      label: "Ўзбек (кирилл)",
      flag: "🇺🇿"
    },
    { 
      code: "ru" as const, 
      label: "Русский",
      flag: "🇷🇺"
    },
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center lg:px-8 lg:pt-8 lg:pb-6 lg:border-b lg:border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3 hover:bg-gray-100 transition-all active:scale-90"
        >
          <IconArrowLeft className="w-6 h-6 text-gray-900" stroke={2} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Язык</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 hidden lg:block">Выберите язык интерфейса</p>
        </div>
      </div>

      <div className="px-5 lg:px-8 max-w-xl mx-auto py-8">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 text-center sm:text-left">
          {t("selectLanguage")}
        </p>

        <div className="grid grid-cols-1 gap-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                selectedLanguage === lang.code
                  ? "border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-100/50 scale-[1.02]"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 active:scale-[0.98]"
              }`}
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 flex items-center justify-center text-4xl grayscale-[0.5] group-hover:grayscale-0 transition-all">
                  {lang.flag}
                </div>
                <span className={`text-base font-black ${selectedLanguage === lang.code ? "text-blue-600" : "text-gray-900"}`}>
                  {lang.label}
                </span>
              </div>
              {selectedLanguage === lang.code && (
                <div className="w-8 h-8 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 animate-in zoom-in duration-300">
                  <IconCheck className="w-5 h-5 text-white" stroke={4} />
                </div>
              )}
            </button>
          ))}
        </div>

        <button 
          onClick={handleSave}
          className="w-full mt-12 bg-blue-600 text-white h-16 rounded-[2rem] font-black uppercase text-sm tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
}