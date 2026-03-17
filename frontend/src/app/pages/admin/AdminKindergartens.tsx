import { IconBuilding, IconCheck, IconX, IconShieldCheck, IconPhone, IconMapPin, IconUsers } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";

interface KindergartenAdmin {
  id: number;
  name: string;
  slug?: string;
  logo_url?: string;
  district: string;
  address?: string;
  phone?: string;
  email?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employer_count: number;
}

export function AdminKindergartens() {
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const fetchKFunc = useCallback(() => api.get(`/admin/kindergartens${filterVerified !== null ? `?verified=${filterVerified}` : ''}`), [filterVerified]);
  const { data: kindergartens, loading, execute: fetchK } = useApi<KindergartenAdmin[]>(fetchKFunc);

  const { execute: verifyK, loading: verifyLoading } = useApiMutation(
    (id: number) => api.post(`/admin/kindergartens/${id}/verify`)
  );

  useEffect(() => {
    fetchK();
  }, [fetchK]);

  const handleVerify = async (id: number) => {
    try {
      await verifyK(id);
      fetchK();
    } catch (err: any) {
      alert("Ошибка верификации: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Организации</h2>
          <p className="text-gray-400 font-bold text-sm mt-1">Верификация и управление детскими садами</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
            <button 
                onClick={() => setFilterVerified(null)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterVerified === null ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-900'}`}
            >
                Все
            </button>
            <button 
                onClick={() => setFilterVerified(false)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterVerified === false ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-400 hover:text-gray-900'}`}
            >
                На проверке
            </button>
            <button 
                onClick={() => setFilterVerified(true)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterVerified === true ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-400 hover:text-gray-900'}`}
            >
                Проверено
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Организация</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Контакты</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Персонал</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Дата создания</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
                <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                        Загрузка списка организаций...
                    </td>
                </tr>
            ) : (
                kindergartens?.map((k) => (
                    <tr key={k.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-white shadow-sm ring-1 ring-gray-100">
                             {k.logo_url ? (
                               <img src={k.logo_url} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <IconBuilding size={20} className="text-gray-400" />
                             )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-gray-900 leading-none">{k.name}</p>
                                {k.is_verified && <IconShieldCheck size={16} className="text-blue-600" stroke={3} />}
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                                <IconMapPin size={12} stroke={3} />
                                <span className="text-[10px] font-black uppercase tracking-wider">{k.district}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-1">
                            {k.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                                    <IconPhone size={12} className="text-gray-400" />
                                    {k.phone}
                                </div>
                            )}
                            <p className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{k.address || 'Адрес не указан'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                            <IconUsers size={14} className="text-gray-400" stroke={3} />
                            <span className="text-xs font-black text-gray-900 tabular-nums">{k.employer_count}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                            {new Date(k.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">ID: {k.id}</p>
                      </td>
                      <td className="px-8 py-5">
                        {!k.is_verified && (
                            <button 
                                onClick={() => handleVerify(k.id)}
                                disabled={verifyLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Верифицировать
                            </button>
                        )}
                        {k.is_verified && (
                             <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                                <IconCheck size={14} stroke={4} />
                                Подтверждено
                             </span>
                        )}
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
