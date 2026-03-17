import { IconSearch, IconFilter, IconDotsVertical, IconCheck, IconX, IconShieldCheck, IconUser } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";

interface UserAdmin {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at?: string;
  updated_at: string;
}

export function AdminUsers() {
  const [filterRole, setFilterRole] = useState<string>("");
  const fetchUsersFunc = useCallback(() => api.get(`/admin/users${filterRole ? `?role=${filterRole}` : ''}`), [filterRole]);
  const { data: users, loading, execute: fetchUsers } = useApi<UserAdmin[]>(fetchUsersFunc);

  const { execute: toggleUserStatus, loading: statusLoading } = useApiMutation(
    ({ id, is_active }: { id: number, is_active: boolean }) => api.patch(`/admin/users/${id}/status`, { is_active })
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusToggle = async (user: UserAdmin) => {
    try {
      await toggleUserStatus({ id: user.id, is_active: !user.is_active });
      fetchUsers();
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100">Super Admin</span>;
      case "kindergarten_employer": return <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-100">Работодатель</span>;
      default: return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">Соискатель</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Пользователи</h2>
          <p className="text-gray-400 font-bold text-sm mt-1">Управление всеми участниками платформы</p>
        </div>
        
        <div className="flex gap-3">
            <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                <button 
                    onClick={() => setFilterRole("")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!filterRole ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    Все
                </button>
                <button 
                    onClick={() => setFilterRole("job_seeker")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterRole === 'job_seeker' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    Соискатели
                </button>
                <button 
                    onClick={() => setFilterRole("kindergarten_employer")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterRole === 'kindergarten_employer' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    Заведующие
                </button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Пользователь</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Роль</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Статус</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Дата регистрации</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
                <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Синхронизация данных...</span>
                    </td>
                </tr>
            ) : (
                users?.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-white shadow-sm ring-1 ring-gray-100">
                             {user.photo_url ? (
                               <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <IconUser size={20} className="text-gray-400" />
                             )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-none mb-1">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-gray-400 font-medium">@{user.username || user.telegram_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-red-500 shadow-lg shadow-red-200'}`}></div>
                            <span className={`text-xs font-bold ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>
                                {user.is_active ? 'Активен' : 'Заблокирован'}
                            </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                            {new Date(user.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                            {new Date(user.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleStatusToggle(user)}
                                disabled={statusLoading}
                                className={`p-2 rounded-xl border transition-all ${user.is_active ? 'border-red-100 text-red-500 hover:bg-red-50' : 'border-green-100 text-green-600 hover:bg-green-50'}`}
                                title={user.is_active ? "Заблокировать" : "Разблокировать"}
                            >
                                {user.is_active ? <IconX size={18} stroke={2.5} /> : <IconCheck size={18} stroke={2.5} />}
                            </button>
                            <button className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all">
                                <IconDotsVertical size={18} stroke={2} />
                            </button>
                        </div>
                      </td>
                    </tr>
                ))
            )}
            {!loading && users?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                        Пользователи не найдены
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
