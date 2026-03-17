import { 
  IconHome, 
  IconHomeFilled,
  IconMail,
  IconMailFilled,
  IconMessage,
  IconMessageFilled,
  IconUser,
  IconUserFilled
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "../i18n/useTranslation";

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      path: "/app", 
      labelKey: "home" as const,
      icon: IconHome,
      iconFilled: IconHomeFilled
    },
    { 
      path: "/app/applications", 
      labelKey: "applications" as const,
      icon: IconMail,
      iconFilled: IconMailFilled
    },
    { 
      path: "/app/messages", 
      labelKey: "messages" as const,
      icon: IconMessage,
      iconFilled: IconMessageFilled
    },
    { 
      path: "/app/profile", 
      labelKey: "profile" as const,
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