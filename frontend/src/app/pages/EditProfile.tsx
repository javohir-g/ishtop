import { IconArrowLeft, IconCamera, IconPhone, IconMapPin } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";

interface ProfileData {
  full_name: string;
  desired_position?: string;
  about_me?: string;
  district?: string;
  experience_years?: number;
  desired_salary_min?: number;
  photo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  has_medical_book?: boolean;
  medical_book_expires_at?: string;
}

export function EditProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const query = new URLSearchParams(window.location.search);
  const isOnboarding = query.get("onboarding") === "true";

  const fetchFunc = useCallback(() => api.get("/profile"), []);
  const { data: initialData, loading: loadingProfile, execute: fetchProfile } = useApi<ProfileData>(fetchFunc);

  const [formData, setFormData] = useState<any>({
    full_name: "",
    desired_position: "",
    about_me: "",
    district: "",
    experience_years: 0,
    desired_salary_min: 0,
    phone: "",
    email: "",
    address: "",
    has_medical_book: false,
    medical_book_expires_at: "",
  });
  const [errors, setErrors] = useState<any>({});

  const { execute: updateProfile, loading: saving } = useApiMutation(
    (data: any) => api.put("/profile", data)
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || "",
        desired_position: initialData.desired_position || "",
        about_me: initialData.about_me || "",
        district: initialData.district || "",
        experience_years: initialData.experience_years || 0,
        desired_salary_min: initialData.desired_salary_min || 0,
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
        has_medical_book: initialData.has_medical_book || false,
        medical_book_expires_at: initialData.medical_book_expires_at || "",
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    const newErrors: any = {};
    if (!formData.full_name?.trim()) newErrors.full_name = "Имя обязательно";
    if (formData.phone && !/^\+?[0-9]{9,12}$/.test(formData.phone)) newErrors.phone = "Неверный формат телефона";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Неверный email";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateProfile(formData);
      navigate("/app/profile");
    } catch (err: any) {
      alert("Ошибка при сохранении: " + (err.response?.data?.detail || err.message));
    }
  };

  if (loadingProfile && !initialData) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-8">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3 lg:px-8 lg:pt-8">
        {!isOnboarding && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <IconArrowLeft className="w-6 h-6 text-gray-900" stroke={2} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isOnboarding ? "Заполните ваш профиль" : "Редактировать профиль"}
          </h1>
          {isOnboarding && <p className="text-gray-500 text-sm">Это поможет работодателям быстрее найти вас</p>}
        </div>
      </div>

      <div className="px-5 lg:px-8 lg:py-6">
        {/* Profile Photo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border border-gray-100">
               {initialData?.photo_url ? (
                 <img src={initialData.photo_url} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-blue-600 font-bold text-3xl">{formData.full_name?.charAt(0)}</span>
               )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
              <IconCamera className="w-4 h-4 text-white" stroke={2} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">Фото загружается через Telegram</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Основная информация</h3>
            <div>
              <label className="text-xs text-gray-500 font-bold mb-1 block uppercase tracking-wider">Ваше имя *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className={`w-full px-4 py-3 bg-gray-50 border ${errors.full_name ? 'border-red-500' : 'border-gray-100'} rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all`}
                placeholder="Как вас зовут?"
              />
              {errors.full_name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.full_name}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold mb-1 block uppercase tracking-wider">Желаемая должность</label>
              <input
                type="text"
                value={formData.desired_position}
                onChange={(e) => setFormData({...formData, desired_position: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="Например: Воспитатель"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Контакты и адрес</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="text-xs text-gray-500 font-bold mb-1 block flex items-center gap-1 uppercase tracking-wider">
                    <IconPhone className="w-3 h-3 text-blue-600" /> Телефон
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-100'} rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all`}
                    placeholder="+998"
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.phone}</p>}
               </div>
               <div>
                  <label className="text-xs text-gray-500 font-bold mb-1 block flex items-center gap-1 uppercase tracking-wider">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-100'} rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all`}
                    placeholder="example@mail.com"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.email}</p>}
               </div>
               <div>
                  <label className="text-xs text-gray-500 font-bold mb-1 block flex items-center gap-1 uppercase tracking-wider">
                    <IconMapPin className="w-3 h-3 text-blue-600" /> {t('district')}
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                    placeholder="Например: Чиланзар"
                  />
               </div>
               <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 font-bold mb-1 block flex items-center gap-1 uppercase tracking-wider">
                    {t('address')}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                    placeholder="Полный адрес"
                  />
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Дополнительно</h3>
            <div>
              <label className="text-xs text-gray-500 font-bold mb-1 block uppercase tracking-wider">О себе</label>
              <textarea
                value={formData.about_me}
                onChange={(e) => setFormData({...formData, about_me: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all min-h-[120px]"
                placeholder="Расскажите о своем опыте..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold mb-1 block uppercase tracking-wider">Желаемая зарплата</label>
              <input
                type="number"
                value={formData.desired_salary_min}
                onChange={(e) => setFormData({...formData, desired_salary_min: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="Например: 5000000"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">{t('medical_book')}</h3>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
              <span className="text-sm font-medium text-gray-700">{t('medical_book')}</span>
              <input 
                type="checkbox" 
                checked={formData.has_medical_book}
                onChange={(e) => setFormData({...formData, has_medical_book: e.target.checked})}
                className="w-6 h-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            {formData.has_medical_book && (
              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block uppercase tracking-wider">{t('medical_book_expires')}</label>
                <input
                  type="date"
                  value={formData.medical_book_expires_at}
                  onChange={(e) => setFormData({...formData, medical_book_expires_at: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-70"
            >
              {saving ? "Сохранение..." : "Сохранить профиль"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}