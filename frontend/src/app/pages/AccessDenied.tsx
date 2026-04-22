import { useNavigate } from "react-router";
import { IconLock, IconArrowLeft } from "@tabler/icons-react";
import { useTranslation } from "@/app/i18n/useTranslation";

export function AccessDenied() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-30" />
      
      <div className="text-center relative z-10 max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg shadow-red-100">
           <IconLock className="w-10 h-10 text-red-600" stroke={2} />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          Доступ ограничен
        </h1>
        <p className="text-sm font-medium text-gray-500 mb-10 leading-relaxed">
          У вас недостаточно прав для просмотра этой страницы. Пожалуйста, убедитесь, что вы вошли под правильным аккаунтом.
        </p>
        
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-gray-200 hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <IconArrowLeft className="w-5 h-5" stroke={2.5} />
          Вернуться назад
        </button>
      </div>
    </div>
  );
}
