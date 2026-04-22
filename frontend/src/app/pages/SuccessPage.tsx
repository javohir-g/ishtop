import { useNavigate } from "react-router";
import { IconCircleCheck, IconBriefcase, IconArrowRight } from "@tabler/icons-react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { motion } from "motion/react";

export function SuccessPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent)] pointer-events-none" />
      
      <div className="text-center relative z-10 max-w-sm w-full">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl"
        >
          <IconCircleCheck className="w-12 h-12 text-green-600" stroke={2.5} />
        </motion.div>
        
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter">
            {t('success_title')}
          </h1>
          <p className="text-sm font-medium text-gray-500 mb-12 leading-relaxed px-4">
            {t('application_sent')}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/app/applications')}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <IconBriefcase className="w-5 h-5" />
              {t('view_applications')}
            </button>
            
            <button
              onClick={() => navigate('/app')}
              className="w-full py-4 rounded-2xl border-2 border-gray-50 text-gray-900 font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 group"
            >
              Домой
              <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
