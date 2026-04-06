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
    if (!formData.kindergarten_name || formData.kindergarten_name === "Мой детский сад") {
      alert("Пожалуйста, введите название вашего детского сада");
      return;
    }
    if (!formData.kindergarten_district || formData.kindergarten_district === "Не указан") {
      alert("Пожалуйста, выберите район");
      return;
    }

    try {
      const payload = {
        full_name: formData.full_name,
        position: formData.position,
        photo_url: profile?.employer?.photo_url,
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
      console.error("Save error:", err);
      alert("Ошибка при сохранении: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-gray-500 font-bold animate-pulse text-lg">Настраиваем ваш кабинет...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Premium Header */}
      <div className="bg-white px-5 pt-8 pb-6 border-b border-slate-200">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          {!isOnboarding && (
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-all active:scale-95"
            >
              <IconArrowLeft className="w-6 h-6 text-slate-600" stroke={2.5} />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              {isOnboarding ? "Давайте создадим ваш детский сад!" : "Редактирование профиля"}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {isOnboarding ? "Заполните основную информацию, чтобы начать поиск сотрудников" : "Следите за актуальностью данных о вашем филиале"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 max-w-3xl mx-auto py-8 space-y-6">
        {/* Step 1: Kindergarten Identity */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">1</div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Карточка детского сада</h3>
          </div>
          
          <div className="space-y-6">
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Название садика *</label>
              <input
                type="text"
                name="kindergarten_name"
                value={formData.kindergarten_name}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                placeholder="Например: Садик «Солнышко»"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Район города *</label>
                <select
                  name="kindergarten_district"
                  value={formData.kindergarten_district}
                  onChange={handleChange}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
                >
                  <option value="">Выберите район</option>
                  <option value="Мирзо-Улугбекский">Мирзо-Улугбекский</option>
                  <option value="Чиланзарский">Чиланзарский</option>
                  <option value="Юнусабадский">Юнусабадский</option>
                  <option value="Яккасарайский">Яккасарайский</option>
                  <option value="Шайхантахурский">Шайхантахурский</option>
                  <option value="Мирабадский">Мирабадский</option>
                  <option value="Алмазарский">Алмазарский</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Логотип (URL)</label>
                <input
                  type="text"
                  name="kindergarten_logo_url"
                  value={formData.kindergarten_logo_url}
                  onChange={handleChange}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Точный адрес</label>
                <input
                  type="text"
                  name="kindergarten_address"
                  value={formData.kindergarten_address}
                  onChange={handleChange}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                  placeholder="Улица, дом, ориентир"
                />
            </div>
          </div>
        </div>

        {/* Step 2: About & Description */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg">2</div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Подробности</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">О детском саде</label>
              <textarea
                name="kindergarten_description"
                value={formData.kindergarten_description}
                onChange={handleChange}
                rows={4}
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 outline-none transition-all resize-none placeholder:text-slate-300"
                placeholder="Расскажите о преимуществах вашего сада..."
              />
            </div>
          </div>
        </div>

        {/* Step 3: Contact Person */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">3</div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Представитель</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Ф. И. О.</label>
                  <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 outline-none transition-all"
                  />
              </div>
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Ваша должность</label>
                  <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 outline-none transition-all"
                      placeholder="Заведующая / Директор"
                  />
              </div>
          </div>
        </div>

        {/* Step 4: Contact Information */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-lg">4</div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Контакты для откликов</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email садика</label>
                  <input
                      type="email"
                      name="kindergarten_email"
                      value={formData.kindergarten_email}
                      onChange={handleChange}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 outline-none transition-all"
                      placeholder="garden@mail.ru"
                  />
              </div>
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Контактный телефон</label>
                  <input
                      type="tel"
                      name="kindergarten_phone"
                      value={formData.kindergarten_phone}
                      onChange={handleChange}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 outline-none transition-all"
                      placeholder="+998"
                  />
              </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Сохраняем...
              </>
            ) : (
              "Сохранить и продолжить"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
