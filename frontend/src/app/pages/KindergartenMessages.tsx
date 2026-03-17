import { useNavigate } from "react-router";
import { useCallback, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";

interface Chat {
  id: number;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  other_party_name: string;
  other_party_photo?: string;
}

export function KindergartenMessages() {
  const navigate = useNavigate();

  const fetchChatsFunc = useCallback(() => api.get("/chats"), []);
  const { data: chats, loading, execute: fetchChats } = useApi<Chat[]>(fetchChatsFunc);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black text-gray-900">Сообщения</h1>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-400 font-bold italic">Загрузка чатов...</p>
        </div>
      )}

      {/* Chat List */}
      <div className="px-5">
        {chats?.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate(`/kindergarten/messages/${chat.id}`)}
            className="flex items-center gap-4 py-5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 -mx-5 px-5 active:bg-blue-50/30 transition-colors"
          >
            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
               {chat.other_party_photo ? (
                 <img src={chat.other_party_photo} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-black text-2xl">
                    {chat.other_party_name?.charAt(0)}
                 </div>
               )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-base font-black text-gray-900 truncate">{chat.other_party_name}</h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex-shrink-0 ml-2">
                    {formatTime(chat.last_message_at)}
                </span>
              </div>
              <p className={`text-sm ${chat.unread_count > 0 ? "font-bold text-gray-900" : "text-gray-500"} truncate`}>
                {chat.last_message || "Пока нет сообщений"}
              </p>
            </div>
            {chat.unread_count > 0 && (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                <span className="text-white text-[10px] font-black">{chat.unread_count}</span>
              </div>
            )}
          </div>
        ))}

        {!loading && (!chats || chats.length === 0) && (
          <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
             <p className="text-gray-400 font-bold">У вас пока нет активных диалогов</p>
          </div>
        )}
      </div>
    </div>
  );
}