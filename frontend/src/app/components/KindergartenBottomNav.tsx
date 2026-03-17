import { 
  IconSearch,
  IconBriefcase,
  IconBriefcaseFilled,
  IconMail,
  IconMailFilled,
  IconMessage,
  IconMessageFilled,
  IconUser,
  IconUserFilled
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";

export function KindergartenBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      path: "/kindergarten", 
      label: "Главная",
      icon: IconSearch,
      iconFilled: IconSearch
    },
    { 
      path: "/kindergarten/vacancies", 
      label: "Вакансии",
      icon: IconBriefcase,
      iconFilled: IconBriefcaseFilled
    },
    { 
      path: "/kindergarten/applications", 
      label: "Отклики",
      icon: IconMail,
      iconFilled: IconMailFilled
    },
    { 
      path: "/kindergarten/messages", 
      label: "Сообщения",
      icon: IconMessage,
      iconFilled: IconMessageFilled
    },
    { 
      path: "/kindergarten/profile", 
      label: "Профиль",
      icon: IconUser,
      iconFilled: IconUserFilled
    },
  ];

  return (
    <>
      {/* Bottom Navigation with Telegram Safe Area Support */}
      <div 
        className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-100 py-3 flex justify-around items-center z-50 transition-[bottom] duration-300 ease-out"
        style={{
          bottom: 'var(--tg-safe-bottom, 0px)',
          height: 'var(--bottom-nav-height, 64px)'
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = active ? item.iconFilled : item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center justify-center transition-all ${
                active ? 'transform scale-110' : ''
              }`}
            >
              <Icon 
                className={`w-7 h-7 transition-colors ${active ? "text-blue-600" : "text-gray-400"}`}
                stroke={1.5}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}