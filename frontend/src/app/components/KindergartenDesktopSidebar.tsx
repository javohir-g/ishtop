import { 
  IconSearch,
  IconBriefcase,
  IconBriefcaseFilled,
  IconMail,
  IconMailFilled,
  IconMessage,
  IconMessageFilled,
  IconUser,
  IconUserFilled,
  IconSettings,
  IconLogout,
  IconBuilding
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "../i18n/useTranslation";

export function KindergartenDesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      path: "/kindergarten", 
      label: t("main"),
      icon: IconSearch,
      iconFilled: IconSearch
    },
    { 
      path: "/kindergarten/vacancies", 
      label: t("vacancies"),
      icon: IconBriefcase,
      iconFilled: IconBriefcaseFilled
    },
    { 
      path: "/kindergarten/applications", 
      label: t("applications"),
      icon: IconMail,
      iconFilled: IconMailFilled
    },
    { 
      path: "/kindergarten/messages", 
      label: t("messages"),
      icon: IconMessage,
      iconFilled: IconMessageFilled
    },
    { 
      path: "/kindergarten/profile", 
      label: t("profile"),
      icon: IconUser,
      iconFilled: IconUserFilled
    },
  ];

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:z-50">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-200">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <IconBuilding className="w-6 h-6 text-white" stroke={2} />
        </div>
        <div>
          <span className="text-sm font-bold text-gray-900 block">IshTop</span>
          <span className="text-xs text-gray-500">{t("employer")}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = active ? item.iconFilled : item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-6 h-6" stroke={1.5} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => navigate("/kindergarten/settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
        >
          <IconSettings className="w-6 h-6" stroke={1.5} />
          <span className="font-medium">{t("settings")}</span>
        </button>
        
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
        >
          <IconLogout className="w-6 h-6" stroke={1.5} />
          <span className="font-medium">{t("logout")}</span>
        </button>
      </div>
    </div>
  );
}