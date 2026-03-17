import { IconBell, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router";

interface DesktopHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export function DesktopHeader({ 
  title, 
  subtitle, 
  showSearch = false,
  showNotifications = true 
}: DesktopHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="hidden lg:block border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
          </div>
          
          <div className="flex items-center gap-3">
            {showSearch && (
              <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                <IconSearch className="w-5 h-5 text-gray-700" stroke={2} />
              </button>
            )}
            
            {showNotifications && (
              <button 
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors relative"
              >
                <IconBell className="w-5 h-5 text-gray-700" stroke={2} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
