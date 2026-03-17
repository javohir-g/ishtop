import { IconDashboard, IconUsers, IconBriefcase, IconBuilding, IconSettings, IconLogout, IconBell, IconSearch, IconChevronRight } from "@tabler/icons-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

const menuItems = [
  { icon: IconDashboard, label: "Дашборд", path: "/admin" },
  { icon: IconUsers, label: "Пользователи", path: "/admin/users" },
  { icon: IconBriefcase, label: "Вакансии", path: "/admin/vacancies" },
  { icon: IconBuilding, label: "Организации", path: "/admin/kindergartens" },
  { icon: IconSettings, label: "Настройки", path: "/admin/settings" },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-30">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                <span className="font-black text-xl">I</span>
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tighter uppercase">Ish-Top</h1>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all group ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <item.icon size={22} stroke={isActive ? 2.5 : 1.5} className={isActive ? "text-white" : "group-hover:scale-110 transition-transform"} />
                  <span className={`font-bold text-sm ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
                    {item.label}
                  </span>
                  {isActive && <IconChevronRight size={16} className="ml-auto opacity-50" stroke={3} />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-800/50">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 w-full px-4 py-4 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group"
          >
            <IconLogout size={22} stroke={1.5} />
            <span className="font-bold text-sm">Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 z-20 shadow-sm shadow-gray-100/50">
          <div className="flex items-center gap-4 bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-100 w-96">
            <IconSearch size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Поиск по системе..." 
              className="bg-transparent border-none outline-none text-sm font-medium w-full"
            />
          </div>

          <div className="flex items-center gap-6">
             <button className="relative p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100">
                <IconBell size={22} stroke={1.5} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             
             <div className="h-10 w-px bg-gray-100"></div>

             <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-black text-gray-900 leading-none mb-1">Administrator</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Super User</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-blue-200">
                    <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} alt="Admin" className="w-full h-full object-cover" />
                    </div>
                </div>
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
