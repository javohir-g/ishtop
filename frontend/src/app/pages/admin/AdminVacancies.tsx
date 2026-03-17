import { IconBriefcase, IconCheck, IconX, IconTrendingUp, IconMapPin, IconClock } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";

interface VacancyAdmin {
  id: number;
  title: string;
  kindergarten_id: number;
  kindergarten?: { name: string; logo_url?: string };
  status: string;
  district: string;
  created_at: string;
  applications_count: number;
  views_count: number;
}

export function AdminVacancies() {
  const fetchVacanciesFunc = useCallback(() => api.get("/admin/vacancies/moderation"), []);
  const { data: vacancies, loading } = useApi<VacancyAdmin[]>(fetchVacanciesFunc);

  useEffect(() => {
    // In a real app we'd have moderation specific filter/endpoints
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100">Активна</span>;
      case "closed": return <span className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-100">Закрыта</span>;
      default: return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Модерация вакансий</h2>
          <p className="text-gray-400 font-bold text-sm mt-1">Контроль качества публикуемого контента</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Вакансия</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Организация</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Статистика</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Статус</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
                <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                        Загрузка вакансий...
                    </td>
                </tr>
            ) : (
                vacancies?.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-white shadow-sm ring-1 ring-blue-50">
                             <IconBriefcase size={24} stroke={2} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-none mb-1">{v.title}</p>
                            <div className="flex items-center gap-2 text-gray-400">
                                <IconMapPin size={12} stroke={3} />
                                <span className="text-[10px] font-black uppercase tracking-wider">{v.district}</span>
                                <span className="text-[10px] text-gray-200">|</span>
                                <IconClock size={12} stroke={3} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">{new Date(v.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-700">{v.kindergarten?.name || 'Организация'}</p>
                        <p className="text-[10px] text-gray-400 font-medium">ID: {v.kindergarten_id}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-sm font-black text-gray-900 leading-none">{v.views_count}</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Просмотры</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-blue-600 leading-none">{v.applications_count}</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Отклики</p>
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {getStatusBadge(v.status)}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
                                <IconX size={18} stroke={2.5} />
                            </button>
                            <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200">
                                Детали
                            </button>
                        </div>
                      </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
