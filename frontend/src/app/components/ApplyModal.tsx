import { useState } from "react";
import { IconX, IconBriefcase } from "@tabler/icons-react";
import api from "@/services/api";
import { toast } from "sonner";

interface ApplyModalProps {
  vacancyId: number;
  vacancyTitle: string;
  kindergartenName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApplyModal({ 
  vacancyId, 
  vacancyTitle, 
  kindergartenName, 
  isOpen, 
  onClose,
  onSuccess 
}: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/applications", {
        vacancy_id: vacancyId,
        cover_letter: coverLetter
      });
      toast.success("Отклик успешно отправлен!");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Не удалось отправить отклик";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <IconBriefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">Отклик на вакансию</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Новая заявка</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-900 mb-1">{vacancyTitle}</h4>
            <p className="text-blue-600 font-medium">{kindergartenName}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Сопроводительное письмо (необязательно)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Расскажите немного о себе и почему вы подходите на эту роль..."
                className="w-full h-40 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            disabled={submitting}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex-[2] px-6 py-4 rounded-2xl font-bold text-white transition-all shadow-lg shadow-blue-200 ${
              submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
            }`}
          >
            {submitting ? "Отправка..." : "Отправить отклик"}
          </button>
        </div>
      </div>
    </div>
  );
}
