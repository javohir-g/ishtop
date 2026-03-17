import { Outlet, useLocation } from "react-router";
import { BottomNav } from "./components/BottomNav";
import { KindergartenBottomNav } from "./components/KindergartenBottomNav";
import { DesktopSidebar } from "./components/DesktopSidebar";
import { KindergartenDesktopSidebar } from "./components/KindergartenDesktopSidebar";
import { ScrollToTop } from "./components/ScrollToTop";
import { useTelegramSafeArea } from "./hooks/useTelegramSafeArea";

export function Root() {
  const location = useLocation();
  
  // Initialize Telegram safe area support
  useTelegramSafeArea();
  
  // Determine if user is a kindergarten (employer)
  const isKindergarten = location.pathname.startsWith("/kindergarten");
  
  // Hide bottom nav for these pages
  const hideBottomNav = location.pathname.includes("/messages/") || 
                        location.pathname.endsWith("/settings") ||
                        location.pathname.includes("/settings/") ||
                        location.pathname.includes("/vacancies/new") ||
                        location.pathname.includes("/vacancies/") && location.pathname.includes("/edit");

  return (
    <div className="bg-gray-50 text-gray-900 antialiased min-h-screen">
      <ScrollToTop />
      
      {/* Desktop Sidebar */}
      {isKindergarten ? <KindergartenDesktopSidebar /> : <DesktopSidebar />}
      
      {/* Main Content */}
      <div className="lg:pl-64">
        <div 
          className="min-h-screen relative"
          style={{
            paddingBottom: hideBottomNav 
              ? '0px' 
              : 'calc(var(--bottom-nav-height, 64px) + var(--tg-safe-bottom, 0px))'
          }}
        >
          {/* Desktop Container with larger max-width */}
          <div className="lg:max-w-6xl lg:mx-auto">
            <Outlet />
          </div>
          
          {/* Mobile Bottom Nav */}
          {!hideBottomNav && (
            <div className="lg:hidden">
              {isKindergarten ? <KindergartenBottomNav /> : <BottomNav />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}