import { IconUsers, IconBriefcase, IconBuilding, IconChecklist, IconArrowUpRight, IconArrowDownRight, IconActivity } from "@tabler/icons-react";
import { useCallback, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";

export function AdminDashboard() {
  const fetchStatsFunc = useCallback(() => api.get("/admin/stats"), []);
  const { data: stats, loading } = useApi<any>(fetchStatsFunc);

  useEffect(() => {
    // In a real app, we might poll or use websockets
  }, []);

  const statCards = [
    { 
      label: "Всего пользователей", 
      value: stats?.total_users || 0, 
      icon: IconUsers, 
      color: "blue",
      trend: "+12%",
      isPositive: true
    },
    { 
      label: "Активные вакансии", 
      value: stats?.active_vacancies || 0, 
      icon: IconBriefcase, 
      color: "green",
      trend: "+5%",
      isPositive: true
    },
    { 
      label: "Организации", 
      value: stats?.employers || 0, 
      icon: IconBuilding, 
      color: "purple",
      trend: "+2",
      isPositive: true
    },
    { 
      label: "Новые отклики", 
      value: stats?.total_applications || 0, 
      icon: IconChecklist, 
      color: "orange",
      trend: "-3%",
      isPositive: false
    },
  ];

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Загрузка аналитики...</p>
        </div>
     );
  }

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Обзор платформы</h2>
          <p className="text-gray-400 font-bold text-sm mt-1">Добро пожаловать в панель управления Ish-Top</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
           <IconActivity size={18} stroke={3} />
           Сгенерировать отчет
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden">
             <div className={`absolute top-0 right-0 w-32 h-32 bg-${card.color}-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
             
             <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-${card.color}-50 text-${card.color}-600 flex items-center justify-center mb-6 group-hover:bg-${card.color}-600 group-hover:text-white transition-all duration-300 shadow-inner`}>
                    <card.icon size={28} stroke={2} />
                </div>
                
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">{card.label}</h3>
                <div className="flex items-end gap-3">
                    <span className="text-4xl font-black text-gray-900 tabular-nums tracking-tighter">{card.value}</span>
                    <div className={`flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${card.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {card.isPositive ? <IconArrowUpRight size={12} stroke={3} /> : <IconArrowDownRight size={12} stroke={3} />}
                        {card.trend}
                    </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Practical Mock Charts / Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Активность регистраций</h3>
            <div className="h-64 flex items-end gap-2 px-2">
                {[45, 67, 89, 43, 56, 78, 90, 120, 80, 95, 110, 130].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                        <div 
                            className="w-full bg-blue-100 rounded-t-xl group-hover:bg-blue-600 transition-all duration-500 relative"
                            style={{ height: `${val}%` }}
                        >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {val} чел.
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-gray-300 mt-4 uppercase tracking-tighter">
                            {['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'][i]}
                        </span>
                    </div>
                ))}
            </div>
         </div>

         <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Очередь модерации</h3>
            <div className="space-y-6">
                {[
                    { label: "Новые вакансии", count: 12, color: "blue" },
                    { label: "Детские сады (верификация)", count: stats?.pending_kindergartens || 5, color: "amber" },
                    { label: "Жалобы", count: 2, color: "red" },
                    { label: "Правки в профилях", count: 8, color: "purple" },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-white hover:border-gray-100 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full bg-${item.color}-500 shadow-lg shadow-${item.color}-200`}></div>
                            <span className="text-sm font-bold text-gray-700">{item.label}</span>
                        </div>
                        <span className="text-sm font-black text-gray-900">{item.count}</span>
                    </div>
                ))}
            </div>
            <button className="w-full mt-8 py-4 border-2 border-dashed border-gray-200 text-gray-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all active:scale-95">
                Перейти к модерации
            </button>
         </div>
      </div>
    </div>
  );
}
