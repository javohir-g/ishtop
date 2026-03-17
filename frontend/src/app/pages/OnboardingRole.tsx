import { Briefcase, Building2 } from "lucide-react";
import { useNavigate } from "react-router";

export function OnboardingRole() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Выберите роль</h1>
          <p className="text-xl text-gray-600">Кто вы?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Worker Card */}
          <button
            onClick={() => navigate("/app/profile")}
            className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group text-left"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
              <Briefcase className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Я соискатель</h3>
            <p className="text-gray-600 mb-4">
              Ищу работу в детском саду: воспитатель, методист, логопед и другие специальности
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Создать профиль
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Откликаться на вакансии
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Получать приглашения
              </li>
            </ul>
            <div className="mt-6 text-blue-600 font-semibold group-hover:underline">
              Продолжить →
            </div>
          </button>

          {/* Kindergarten Card */}
          <button
            onClick={() => navigate("/kindergarten")}
            className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all group text-left"
          >
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors">
              <Building2 className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Я детский сад</h3>
            <p className="text-gray-600 mb-4">
              Ищу сотрудников для детского сада: создаю вакансии и просматриваю кандидатов
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                Создать профиль сада
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                Публиковать вакансии
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                Находить кандидатов
              </li>
            </ul>
            <div className="mt-6 text-purple-600 font-semibold group-hover:underline">
              Продолжить →
            </div>
          </button>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
}