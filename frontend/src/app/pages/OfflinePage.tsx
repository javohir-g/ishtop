import { IconWifiOff, IconRefresh } from "@tabler/icons-react";
import { useTranslation } from "@/app/i18n/useTranslation";

export function OfflinePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5 relative overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none" />
      
      <div className="text-center relative z-10 max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-8 border border-gray-200">
           <IconWifiOff className="w-10 h-10 text-gray-400" stroke={2} />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          {t('offline_title')}
        </h1>
        <p className="text-sm font-medium text-gray-500 mb-10 leading-relaxed">
          {t('offline_desc')}
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <IconRefresh className="w-5 h-5" stroke={2.5} />
          Обновить
        </button>
      </div>
    </div>
  );
}
