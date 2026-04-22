import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { useTranslation } from "@/app/i18n/useTranslation";

export function ErrorBoundary() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(239,68,68,0.03),transparent)]" />
      
      <div className="text-center relative z-10 max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-8 animate-pulse shadow-lg shadow-red-100">
           <IconAlertTriangle className="w-10 h-10 text-red-600" stroke={2} />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          {t('error_500_title')}
        </h1>
        <p className="text-sm font-medium text-gray-500 mb-10 leading-relaxed px-4">
          {t('error_500_desc')}
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-gray-200 hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <IconRefresh className="w-5 h-5" stroke={2.5} />
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
