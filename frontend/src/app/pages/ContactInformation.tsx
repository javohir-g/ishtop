import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState } from "react";

export function ContactInformation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "Андрей",
    lastName: "Эйнсли",
    email: "andrew.ainsley@email.com",
    phone: "+998 90 123 4567",
    city: "Ташкент",
    country: "Узбекистан",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    navigate(-1);
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
        >
          <IconArrowLeft className="w-6 h-6 text-gray-900" stroke={2} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Контактная информация</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Имя
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl text-sm text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите имя"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Фамилия
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl text-sm text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите фамилию"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl text-sm text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl text-sm text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите телефон"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Город
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl text-sm text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите город"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Страна
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl text-sm text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите страну"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-8 bg-blue-600 text-white py-4 rounded-full text-base font-bold shadow-lg hover:bg-blue-700 transition-colors"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
}
