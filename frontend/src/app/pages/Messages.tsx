import { useNavigate } from "react-router";
import { useEffect, useCallback } from "react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";

interface BackendChat {
  id: number;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  other_party_name: string;
  other_party_photo?: string;
}

export function Messages() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchFunc = useCallback(() => api.get("/chats"), []);
  const { data: chats, loading, error, execute: fetchChats } = useApi<BackendChat[]>(fetchFunc);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Вчера";
    }
    
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-8">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 lg:px-8 lg:pt-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("messages")}</h1>
            <p className="text-gray-600 mt-1 hidden lg:block">{t("communicateWithEmployers")}</p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {loading && <div className="text-center py-10 text-gray-500">Загрузка чатов...</div>}
      {error && <div className="text-center py-10 text-red-500 uppercase font-bold">{error}</div>}

      {/* Chat List */}
      <div className="px-5 lg:px-8">
        {!loading && (!chats || chats.length === 0) && (
          <div className="text-center py-10 text-gray-500">Нет активных диалогов</div>
        )}
        {chats?.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate(`/app/messages/${chat.id}`)}
            className="flex items-center gap-3 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 -mx-5 px-5 lg:mx-0 lg:rounded-xl transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {chat.other_party_photo ? (
                <img src={chat.other_party_photo} alt={chat.other_party_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                  {chat.other_party_name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-gray-900 truncate pr-2">{chat.other_party_name}</h3>
                <span className="text-xs text-gray-500 flex-shrink-0">{formatTime(chat.last_message_at)}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{chat.last_message || "Нет сообщений"}</p>
            </div>
            {chat.unread_count > 0 && (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{chat.unread_count}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}