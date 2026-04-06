import { IconArrowLeft, IconBuilding, IconCamera } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import api from "@/services/api";

export function KindergartenEditProfile() {
  const navigate = useNavigate();
  const query = new URLSearchParams(window.location.search);
  const isOnboarding = query.get("onboarding") === "true";
  
  const [formData, setFormData] = useState({
    full_name: "",
    position: "",
    kindergarten_name: "",
    kindergarten_description: "",
    kindergarten_address: "",
    kindergarten_district: "",
    kindergarten_phone: "",
    kindergarten_email: "",
    kindergarten_logo_url: ""
  });

  const fetchProfileFunc = useCallback(() => api.get("/employer/profile"), []);
  const { data: profile, loading } = useApi<any>(fetchProfileFunc);

  const { execute: updateProfile, loading: saving } = useApiMutation((data: any) => 
    api.put("/employer/profile", data)
  );

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.employer?.full_name || "",
        position: profile.employer?.position || "",
        kindergarten_name: profile.kindergarten?.name || "",
        kindergarten_description: profile.kindergarten?.description || "",
        kindergarten_address: profile.kindergarten?.address || "",
        kindergarten_district: profile.kindergarten?.district || "",
        kindergarten_phone: profile.kindergarten?.phone || "",
        kindergarten_email: profile.kindergarten?.email || "",
        kindergarten_logo_url: profile.kindergarten?.logo_url || ""
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      // Structure the data to match the backend's EmployerProfileUpdate schema
      const payload = {
        full_name: formData.full_name,
        position: formData.position,
        photo_url: profile?.employer?.photo_url, // Keep old photo url
        kindergarten: {
          name: formData.kindergarten_name,
          description: formData.kindergarten_description,
          address: formData.kindergarten_address,
          district: formData.kindergarten_district,
          phone: formData.kindergarten_phone,
          email: formData.kindergarten_email,
          logo_url: formData.kindergarten_logo_url
        }
      };
      
      await updateProfile(payload);
      navigate("/kindergarten/profile");
    } catch (err: any) {
      alert("Ошибка при сохранении: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3 lg:px-8 lg:pt-8 lg:pb-6 lg:border-b lg:border-gray-200">
        {!isOnboarding && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <IconArrowLeft className="w-6 h-6 text-gray-900" stroke={2} />
          </button>
        )}
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">
            {isOnboarding ? "Настройте ваш детский сад" : "Редактировать профиль"}
          </h1>
          <p className="text-gray-600 text-sm font-bold mt-1">
            {isOnboarding ? "Расскажите о себе и вашем садике" : "Обновите информацию о детском саде"}
          </p>
        </div>
      </div>

      <div className="px-5 lg:px-8 max-w-2xl mx-auto py-6">
        {/* Profile Photo */}
        <div className="mb-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Логотип и Фото</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-blue-100 overflow-hidden">
              {formData.kindergarten_logo_url ? (
                <img src={formData.kindergarten_logo_url} className="w-full h-full object-cover" />
              ) : (
                <IconBuilding className="w-10 h-10 text-blue-600" stroke={1.5} />
              )}
            </div>
            <div className="flex-1 space-y-3 w-full">
               <input
                type="text"
                name="kindergarten_logo_url"
                value={formData.kindergarten_logo_url}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                placeholder="URL логотипа..."
              />
              <p className="text-[10px] text-gray-400 font-bold italic">Вставьте прямую ссылку на изображение или используйте камеру</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
            {/* Kindergarten Info */}
            <div className="space-y-4">
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-l-4 border-blue-600 pl-3">Информация о саде</h3>
               <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Название</label>
                  <input
                    type="text"
                    name="kindergarten_name"
                    value={formData.kindergarten_name}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                    placeholder="Детский сад..."
                  />
               </div>
               <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Район</label>
                  <select
                    name="kindergarten_district"
                    value={formData.kindergarten_district}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                  >
                    <option value="">Выберите район</option>
                    <option value="Мирзо-Улугбекский">Мирзо-Улугбекский</option>
                    <option value="Чиланзарский">Чиланзарский</option>
                    <option value="Юнусабадский">Юнусабадский</option>
                    <option value="Яккасарайский">Яккасарайский</option>
                    <option value="Шайхантахурский">Шайхантахурский</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Адрес</label>
                  <input
                    type="text"
                    name="kindergarten_address"
                    value={formData.kindergarten_address}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                    placeholder="Улица, дом..."
                  />
               </div>
               <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Описание</label>
                  <textarea
                    name="kindergarten_description"
                    value={formData.kindergarten_description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all resize-none"
                    placeholder="Опишите ваш детский сад..."
                  />
               </div>
            </div>

            {/* Representative Info */}
            <div className="space-y-4 pt-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-l-4 border-blue-600 pl-3">Ваши данные</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Ваше имя</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Должность</label>
                        <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Contacts Info */}
            <div className="space-y-4 pt-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-l-4 border-blue-600 pl-3">Контакты для связи</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Публичный Email</label>
                        <input
                            type="email"
                            name="kindergarten_email"
                            value={formData.kindergarten_email}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Публичный Телефон</label>
                        <input
                            type="tel"
                            name="kindergarten_phone"
                            value={formData.kindergarten_phone}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Save Button */}
        <div className="mt-12 flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сохранить профиль"}
          </button>
        </div>
      </div>
    </div>
  );
}
