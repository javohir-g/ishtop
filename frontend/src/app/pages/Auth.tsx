import { IconArrowLeft } from "@tabler/icons-react";
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
    script.setAttribute("data-telegram-login", "ishtop_app_bot"); // Using your real bot username
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



  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in duration-500">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium group"
        >
          <IconArrowLeft className="w-5 h-5 transition-transform" stroke={2} />
          {t("back")}
        </button>

        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-outline-variant/20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-on-surface mb-4 font-headline uppercase tracking-wide">
              {loading ? t("authorizing") : t("signIn")}
            </h1>

            {error && (
              <div className="mb-8 p-4 bg-destructive/5 text-destructive rounded-xl text-sm font-medium border border-destructive/10">
                {t(error === "Ошибка авторизации через Telegram WebApp" ? "authErrorWebApp" : "authErrorWidget" as any)}
              </div>
            )}

            {!loading && (
              <div className="space-y-8">
                <p className="text-on-surface-variant leading-relaxed">
                  {t("authSubtitle")}
                </p>

                <div id="telegram-widget-container" className="flex justify-center">
                  {/* Telegram Widget will be injected here */}
                </div>

                <div className="pt-8 border-t border-outline-variant/10 text-xs text-on-surface-variant leading-relaxed font-medium">
                  <p className="opacity-70">
                    {t("authFooterTerms")}{" "}
                    <button onClick={() => navigate("/terms")} className="text-primary hover:underline">
                      {t("termsOfUse").toLowerCase()}
                    </button>{" "}
                    {t("authFooterAnd")}{" "}
                    <button onClick={() => navigate("/privacy")} className="text-primary hover:underline">
                      {t("privacyPolicy").toLowerCase()}
                    </button>
                    {t("authFooterEnd")}
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-primary text-sm font-bold uppercase tracking-widest">{t("authorizing")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}