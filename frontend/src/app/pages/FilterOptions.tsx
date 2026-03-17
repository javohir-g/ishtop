import { X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

export function FilterOptions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"location" | "workType" | "jobLevel">("location");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
        >
          <X className="w-6 h-6 text-gray-900" strokeWidth={2} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Фильтры</h1>
        <div className="w-10" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="px-5 flex gap-8">
          <button
            onClick={() => setActiveTab("location")}
            className={`pb-3 pt-4 text-sm font-semibold relative ${
              activeTab === "location" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            Локация и зарплата
            {activeTab === "location" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("workType")}
            className={`pb-3 pt-4 text-sm font-semibold relative ${
              activeTab === "workType" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            Тип работы
            {activeTab === "workType" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("jobLevel")}
            className={`pb-3 pt-4 text-sm font-semibold relative ${
              activeTab === "jobLevel" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            Уровень
            {activeTab === "jobLevel" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {/* Location & Salary */}
        <div
          className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("location")}
        >
          <span className="text-base font-semibold text-gray-900">Локация и зарплата</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSection === "location" ? "rotate-180" : ""
            }`}
          />
        </div>

        {expandedSection === "location" && (
          <div className="mb-4 px-2">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <input type="checkbox" id="united-states" className="w-4 h-4 text-blue-600" />
                <label htmlFor="united-states" className="text-sm text-gray-700">Ташкент</label>
              </div>
              <div className="flex items-center gap-4 ml-6">
                <input
                  type="range"
                  min="0"
                  max="100000"
                  className="flex-1 h-1 bg-blue-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-6">сум / месяц</p>
            </div>
          </div>
        )}

        {/* Work Type */}
        <div
          className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("workType")}
        >
          <span className="text-base font-semibold text-gray-900">Тип работы</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSection === "workType" ? "rotate-180" : ""
            }`}
          />
        </div>

        {expandedSection === "workType" && (
          <div className="mb-4 px-2 space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="onsite" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="onsite" className="text-sm text-gray-700">В офисе</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remote" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="remote" className="text-sm text-gray-700">Удаленно</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="hybrid" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="hybrid" className="text-sm text-gray-700">Гибридный</label>
            </div>
          </div>
        )}

        {/* Job Level */}
        <div
          className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("jobLevel")}
        >
          <span className="text-base font-semibold text-gray-900">Уровень должности</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSection === "jobLevel" ? "rotate-180" : ""
            }`}
          />
        </div>

        {expandedSection === "jobLevel" && (
          <div className="mb-4 px-2 space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="internship" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="internship" className="text-sm text-gray-700">Стажер</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="entry" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="entry" className="text-sm text-gray-700">Начальный уровень</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="associate" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="associate" className="text-sm text-gray-700">Специалист</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="senior" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="senior" className="text-sm text-gray-700">Старший специалист</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="director" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="director" className="text-sm text-gray-700">Директор / Руководитель</label>
            </div>
          </div>
        )}

        {/* Employment Type */}
        <div
          className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("employment")}
        >
          <span className="text-base font-semibold text-gray-900">Тип занятости</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSection === "employment" ? "rotate-180" : ""
            }`}
          />
        </div>

        {expandedSection === "employment" && (
          <div className="mb-4 px-2 space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="fulltime" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="fulltime" className="text-sm text-gray-700">Полная занятость</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="parttime" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="parttime" className="text-sm text-gray-700">Частичная занятость</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="freelance" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="freelance" className="text-sm text-gray-700">Фриланс</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="contract" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="contract" className="text-sm text-gray-700">По контракту</label>
            </div>
          </div>
        )}

        {/* Experience */}
        <div
          className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("experience")}
        >
          <span className="text-base font-semibold text-gray-900">Опыт работы</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSection === "experience" ? "rotate-180" : ""
            }`}
          />
        </div>

        {expandedSection === "experience" && (
          <div className="mb-4 px-2 space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="no-exp" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="no-exp" className="text-sm text-gray-700">Без опыта</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="1-3" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="1-3" className="text-sm text-gray-700">1 - 3 года</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="4-7" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="4-7" className="text-sm text-gray-700">4 - 7+ лет</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="more" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="more" className="text-sm text-gray-700">Более 10 лет</label>
            </div>
          </div>
        )}

        {/* Education */}
        <div
          className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("education")}
        >
          <span className="text-base font-semibold text-gray-900">Образование</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSection === "education" ? "rotate-180" : ""
            }`}
          />
        </div>

        {expandedSection === "education" && (
          <div className="mb-4 px-2 space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="less-hs" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="less-hs" className="text-sm text-gray-700">Среднее</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="hs" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="hs" className="text-sm text-gray-700">Среднее специальное</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="cert" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="cert" className="text-sm text-gray-700">Курсы / Сертификат</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="bachelor" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="bachelor" className="text-sm text-gray-700">Бакалавр</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="prof" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="prof" className="text-sm text-gray-700">Магистр</label>
            </div>
          </div>
        )}

        {/* Job Function */}
        <div
          className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("function")}
        >
          <span className="text-base font-semibold text-gray-900">Направление работы</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSection === "function" ? "rotate-180" : ""
            }`}
          />
        </div>

        {expandedSection === "function" && (
          <div className="mb-4 px-2 space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="accounting" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="accounting" className="text-sm text-gray-700">Бухгалтерия и финансы</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="admin" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="admin" className="text-sm text-gray-700">Администрация и координация</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="arts" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="arts" className="text-sm text-gray-700">Искусство и спорт</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="education" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="education" className="text-sm text-gray-700">Образование и обучение</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="general" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="general" className="text-sm text-gray-700">Общие услуги</label>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5"
        style={{ paddingBottom: 'calc(1.25rem + var(--tg-safe-bottom, 0px))' }}
      >
        <div className="max-w-md mx-auto flex gap-3">
          <button className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full text-base font-bold hover:bg-gray-200 transition-colors">
            Сбросить
          </button>
          <button className="flex-1 bg-blue-600 text-white py-4 rounded-full text-base font-bold shadow-lg hover:bg-blue-700 transition-colors">
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}