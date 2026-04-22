import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";
import { toast } from "sonner";
import { useTranslation } from "@/app/i18n/useTranslation";

interface VacancyFormData {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salary_min: number | "";
  salary_max: number | "";
  district: string;
  employment_type: string;
}

export function KindergartenVacancyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<VacancyFormData>({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    salary_min: "",
    salary_max: "",
    district: "",
    employment_type: "full_time",
  });
  const [errors, setErrors] = useState<any>({});
  const { t } = useTranslation();

  const fetchVacancyFunc = useCallback(() => api.get(`/employer/vacancies/${id}`), [id]);
  const { data: initialVacancy, loading: loadingInitial } = useApi<any>(isEditing ? fetchVacancyFunc : () => Promise.resolve({ data: null }));

  const { execute: saveVacancy, loading: saving } = useApiMutation((data: any) => 
    isEditing ? api.put(`/employer/vacancies/${id}`, data) : api.post("/employer/vacancies", data)
  );

  useEffect(() => {
    if (isEditing && initialVacancy) {
      setFormData({
        title: initialVacancy.title || "",
        description: initialVacancy.description || "",
        requirements: initialVacancy.requirements || "",
        responsibilities: initialVacancy.responsibilities || "",
        salary_min: initialVacancy.salary_min || "",
        salary_max: initialVacancy.salary_max || "",
        district: initialVacancy.district || "",
        employment_type: initialVacancy.employment_type || "full_time",
      });
    }
  }, [isEditing, initialVacancy]);

  const handleSubmit = async (publish: boolean) => {
    const newErrors: any = {};
    if (!formData.title?.trim()) newErrors.title = "Название обязательно";
    if (!formData.description?.trim()) newErrors.description = "Описание обязательно";
    if (!formData.district?.trim()) newErrors.district = "Район обязателен";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Пожалуйста, заполните обязательные поля");
      return;
    }
    
    try {
      await saveVacancy(formData);
      toast.success(isEditing ? "Вакансия сохранена" : "Вакансия опубликована!");
      navigate("/kindergarten/vacancies");
    } catch (err: any) {
      toast.error("Ошибка: " + (err.response?.data?.detail || err.message));
    }
  };

  if (loadingInitial) return <div className="text-center py-20 font-black italic text-blue-600 animate-pulse">Загрузка данных...</div>;

  return (
    <div className="px-5 pt-8 pb-32 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/kindergarten/vacancies")}
          className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all active:scale-90"
        >
          <ArrowLeft strokeWidth={2.5} className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {isEditing ? "Редактировать" : "Новая вакансия"}
        </h1>
      </div>

      {/* Form */}
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Title */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Название должности *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Например: Воспитатель младшей группы"
            className={`w-full px-5 py-4 bg-gray-50 border ${errors.title ? 'border-red-500' : 'border-gray-100'} rounded-2xl text-base font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none`}
          />
          {errors.title && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.title}</p>}
        </div>

        {/* Salary */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Зарплата (сум)</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">От</p>
              <input
                type="number"
                value={formData.salary_min}
                onChange={(e) => setFormData({...formData, salary_min: e.target.value ? Number(e.target.value) : ""})}
                placeholder="5 000 000"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-base font-bold focus:bg-white transition-all outline-none"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">До</p>
              <input
                type="number"
                value={formData.salary_max}
                onChange={(e) => setFormData({...formData, salary_max: e.target.value ? Number(e.target.value) : ""})}
                placeholder="8 000 000"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-base font-bold focus:bg-white transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Район</label>
              <input 
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                placeholder="Чиланзарский, Юнусабадский..."
                className={`w-full px-5 py-4 bg-gray-50 border ${errors.district ? 'border-red-500' : 'border-gray-100'} rounded-2xl text-base font-bold focus:bg-white transition-all outline-none`}
              />
              {errors.district && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.district}</p>}
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Тип занятости</label>
              <select 
                value={formData.employment_type}
                onChange={(e) => setFormData({...formData, employment_type: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-base font-bold focus:bg-white transition-all outline-none"
              >
                <option value="full_time">Полный день</option>
                <option value="part_time">Неполный день</option>
                <option value="contract">Контракт</option>
                <option value="internship">Стажировка</option>
              </select>
            </div>
          </div>
        </div>

        {/* Text Areas */}
        {[
          { id: "description", label: "Описание вакансии *", placeholder: "Опишите условия работы..." },
          { id: "requirements", label: "Требования", placeholder: "Опыт, образование, навыки..." },
          { id: "responsibilities", label: "Обязанности", placeholder: "Что предстоит делать..." }
        ].map(field => (
          <div key={field.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{field.label}</label>
            <textarea
              value={(formData as any)[field.id]}
              onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
              placeholder={field.placeholder}
              rows={5}
              className={`w-full px-5 py-4 bg-gray-50 border ${errors[field.id] ? 'border-red-500' : 'border-gray-100'} rounded-2xl text-sm font-medium focus:bg-white transition-all outline-none resize-none leading-relaxed`}
            />
            {errors[field.id] && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors[field.id]}</p>}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-5 z-20">
        <div className="max-w-2xl mx-auto flex gap-4">
           {!isEditing && (
             <button 
               className="flex-1 h-14 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-sm hover:bg-gray-200 transition-all active:scale-95"
               onClick={() => handleSubmit(false)}
               disabled={saving}
             >
               В черновик
             </button>
           )}
           <button 
             onClick={() => handleSubmit(true)}
             disabled={saving}
             className="flex-[2] h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
           >
             {saving ? "Сохранение..." : (isEditing ? "Сохранить изменения" : "Опубликовать")}
           </button>
        </div>
      </div>
    </div>
  );
}