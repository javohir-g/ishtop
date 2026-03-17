import { IconSettings, IconShieldLock, IconDatabase, IconCloudUpload, IconBell, IconChevronRight, IconWorld } from "@tabler/icons-react";

export function AdminSettings() {
  const sections = [
    {
      title: "Системные настройки",
      icon: IconSettings,
      items: [
        { label: "Регионы и районы", description: "Управление списком районов города", icon: IconWorld },
        { label: "Категории должностей", description: "Редактирование доступных вакансий", icon: IconDatabase },
        { label: "Ключевые навыки", description: "Справочник тегов для профилей", icon: IconChecklist },
      ]
    },
    {
      title: "Безопасность",
      icon: IconShieldLock,
      items: [
        { label: "Роли и права", description: "Настройка уровней доступа", icon: IconShieldLock },
        { label: "Логи активности", description: "Журнал действий администраторов", icon: IconActivity },
      ]
    },
    {
       title: "Уведомления",
       icon: IconBell,
       items: [
         { label: "Шаблоны сообщений", description: "Email и Telegram рассылки", icon: IconCloudUpload },
         { label: "Системные оповещения", description: "Технические уведомления", icon: IconBell },
       ]
    }
  ];

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Настройки системы</h2>
        <p className="text-gray-400 font-bold text-sm mt-1">Глобальная конфигурация платформы Ish-Top</p>
      </div>

      <div className="space-y-12">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <section.icon size={20} stroke={2.5} />
               </div>
               <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">{section.title}</h3>
            </div>

            <div className="grid gap-4">
               {section.items.map((item, i) => (
                  <button key={i} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-200/20 transition-all group text-left">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center">
                           <item.icon size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-gray-900 mb-0.5">{item.label}</p>
                           <p className="text-xs text-gray-400 font-medium">{item.description}</p>
                        </div>
                     </div>
                     <IconChevronRight size={20} className="text-gray-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" stroke={3} />
                  </button>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Internal reusable mock icons for the settings page
const IconChecklist = ({ size }: { size: number }) => <IconBriefcase size={size} />;
const IconActivity = ({ size }: { size: number }) => <IconActivityActual size={size} />;
import { IconBriefcase, IconActivity as IconActivityActual } from "@tabler/icons-react";
