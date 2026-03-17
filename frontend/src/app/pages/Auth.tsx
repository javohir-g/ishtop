import { IconArrowLeft, IconBrandTelegram, IconShieldCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { getTelegramInitData } from "@/utils/telegram";
import api from "@/services/api";

declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

export function Auth() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthSuccess = useCallback((data: any) => {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user_role", data.role);
    
    if (data.is_new_user) {
      navigate("/onboarding/role");
    } else {
      navigate(data.role === "kindergarten_employer" ? "/kindergarten" : "/app");
    }
  }, [navigate]);

  // Handle Telegram WebApp Auth
  useEffect(() => {
    const initData = getTelegramInitData();
    if (initData) {
      setLoading(true);
      api.post("/auth/telegram", { init_data: initData })
        .then((res: { data: any }) => handleAuthSuccess(res.data))
        .catch((err: any) => {
           console.error("WebApp Auth Error:", err);
           setError("Ошибка авторизации через Telegram WebApp");
        })
        .finally(() => setLoading(false));
    }
  }, [handleAuthSuccess]);

  // Handle Telegram Login Widget (Browser)
  useEffect(() => {
    window.onTelegramAuth = (user: any) => {
      setLoading(true);
      api.post("/auth/telegram-widget", user)
        .then((res: { data: any }) => handleAuthSuccess(res.data))
        .catch((err: any) => {
           console.error("Widget Auth Error:", err);
           setError("Ошибка авторизации через Виджет");
        })
        .finally(() => setLoading(false));
    };

    // Load Telegram Widget Script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "CBU_financeapp_bot"); // Replace with actual bot username
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;
    
    const container = document.getElementById("telegram-widget-container");
    if (container) container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [handleAuthSuccess]);

  const handleDemoLogin = (role: string) => {
     setLoading(true);
     // Use dev endpoint for testing
     api.post(`/auth/dev-token?telegram_id=${Math.floor(Math.random() * 1000000)}&role=${role}`)
       .then((res: { data: any }) => handleAuthSuccess(res.data))
       .catch(() => setError("Ошибка демо входа"))
       .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <IconArrowLeft className="w-5 h-5" stroke={2} />
          {t("back")}
        </button>

        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center animate-pulse-slow">
              <IconBrandTelegram className="w-12 h-12 text-white" stroke={2} />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            {loading ? "Авторизация..." : "Вход в систему"}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          {!loading && (
            <>
              <p className="text-gray-600 mb-8">
                Авторизуйтесь через Telegram для безопасного доступа к вашему профилю
              </p>

              <div id="telegram-widget-container" className="flex justify-center mb-8">
                {/* Telegram Widget will be injected here */}
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400 font-medium italic">или демо вход</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <button
                  onClick={() => handleDemoLogin("job_seeker")}
                  className="w-full bg-white border border-blue-600 text-blue-600 py-4 px-6 rounded-xl font-bold hover:bg-blue-50 transition-all active:scale-95"
                >
                  Демо: Я ищу работу
                </button>
                
                <button
                  onClick={() => handleDemoLogin("kindergarten_employer")}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                  Демо: Я ищу сотрудников
                </button>

                <button
                  onClick={() => handleDemoLogin("admin")}
                  className="w-full bg-slate-900 text-white py-4 px-6 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <IconShieldCheck className="w-5 h-5 text-blue-400" />
                  Вход как Администратор
                </button>
              </div>
            </>
          )}

          <div className="text-sm text-gray-500">
            <p>
              Продолжая, вы соглашаетесь с{" "}
              <button onClick={() => navigate("/terms")} className="text-blue-600 hover:underline">условиями</button>{" "}
              и <button onClick={() => navigate("/privacy")} className="text-blue-600 hover:underline">политикой</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}