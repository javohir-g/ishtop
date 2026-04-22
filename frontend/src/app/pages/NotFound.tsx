import { useNavigate } from "react-router";
import { IconHome, IconSearch } from "@tabler/icons-react";
import { useTranslation } from "@/app/i18n/useTranslation";

export function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30" />
      
      <div className="text-center relative z-10 max-w-sm">
        <div className="relative inline-block mb-8">
           <div className="text-[120px] font-black text-gray-100 leading-none select-none">404</div>
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200 rotate-12">
                 <IconSearch className="w-8 h-8 text-white" stroke={2.5} />
              </div>
           </div>
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          {t('not_found_title')}
        </h1>
        <p className="text-sm font-medium text-gray-500 mb-10 leading-relaxed">
          {t('not_found_desc')}
        </p>
        
        <button
          onClick={() => navigate('/')}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <IconHome className="w-5 h-5" stroke={2.5} />
          {t('back_to_home')}
        </button>
        
        <button 
           onClick={() => navigate(-1)}
           className="mt-4 w-full py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
        >
           Вернуться назад
        </button>
      </div>
    </div>
  );
}
