import { IconSettingsAutomation } from "@tabler/icons-react";
import { useTranslation } from "@/app/i18n/useTranslation";

export function MaintenancePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px] -mr-48 -mt-48" />
      
      <div className="text-center relative z-10 max-w-sm">
        <div className="w-24 h-24 rounded-[2.5rem] bg-blue-50 flex items-center justify-center mx-auto mb-10 shadow-inner">
           <IconSettingsAutomation className="w-12 h-12 text-blue-600 animate-[spin_8s_linear_infinite]" stroke={1.5} />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">
          {t('maintenance_title')}
        </h1>
        <p className="text-sm font-medium text-gray-500 mb-12 leading-relaxed px-6">
          {t('maintenance_desc')}
        </p>
        
        <div className="flex justify-center gap-4">
           <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
           <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
           <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.5s]" />
        </div>
      </div>
    </div>
  );
}
