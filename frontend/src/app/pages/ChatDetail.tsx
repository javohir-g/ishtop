import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";
import { toast } from "sonner";

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatMetadata {
  id: number;
  other_party_name: string;
  other_party_photo?: string;
}

interface User {
  id: number;
  role: string;
}

export function ChatDetail() {
  const navigate = useNavigate();
  const { id: chatId } = useParams();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessagesFunc = useCallback(() => api.get(`/chats/${chatId}`), [chatId]);
  const { data: messages, execute: fetchMessages } = useApi<Message[]>(fetchMessagesFunc);

  const fetchChatMetadataFunc = useCallback(() => api.get(`/chats/${chatId}/metadata`), [chatId]);
  const { data: chatMetadata, execute: fetchChatMetadata } = useApi<ChatMetadata>(fetchChatMetadataFunc);

  const fetchMeFunc = useCallback(() => api.get("/auth/me"), []);
  const { data: me } = useApi<User>(fetchMeFunc);

  const { execute: sendMessage, loading: sending } = useApiMutation(
    (text: string) => api.post(`/chats/${chatId}/messages`, { content: text })
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    fetchChatMetadata();
    api.get("/auth/me"); // Load me if not already loaded
    
    // Mark as read
    api.patch(`/chats/${chatId}/read`).catch(() => {});

    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchMessages, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;
    try {
      await sendMessage(messageText);
      setMessageText("");
      fetchMessages();
    } catch (err: any) {
      toast.error("Ошибка при отправке: " + (err.response?.data?.detail || err.message));
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 bg-white z-10 flex-shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <IconArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-3">
            {chatMetadata?.other_party_photo ? (
              <img 
                src={chatMetadata.other_party_photo} 
                alt={chatMetadata.other_party_name} 
                className="w-10 h-10 rounded-full bg-gray-100 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {chatMetadata?.other_party_name?.charAt(0) || "?"}
              </div>
            )}
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {chatMetadata?.other_party_name || `Чат #${chatId}`}
              </h1>
              <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">В сети</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 bg-gray-50">
        <div className="space-y-4">
          {messages?.map((msg) => {
            const isSentByMe = me && msg.sender_id === me.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${
                    isSentByMe
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900"
                  } rounded-2xl px-4 py-3 shadow-sm`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isSentByMe ? "text-white/70" : "text-gray-400"}`}>
                    <span>{formatTime(msg.created_at)}</span>
                    {isSentByMe && (
                      <span className="ml-1">
                        {msg.is_read ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-5 py-4 border-t border-gray-100 bg-white z-10 flex-shrink-0" style={{ paddingBottom: 'calc(1rem + var(--tg-safe-bottom, 0px))' }}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Сообщение..."
            className="flex-1 h-12 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-50 transition-all active:scale-95"
          >
            <IconSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}