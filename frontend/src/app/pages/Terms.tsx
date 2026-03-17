import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router";

export function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center lg:px-8 lg:pt-8 lg:pb-6 lg:border-b lg:border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3 hover:bg-gray-100 transition-all active:scale-90"
        >
          <IconArrowLeft className="w-6 h-6 text-gray-900" stroke={2} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Условия</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 hidden lg:block">Правила использования сервиса</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 max-w-3xl mx-auto">
        <div className="space-y-6">
          {/* Last Updated */}
          <div className="text-sm text-gray-500">
            Последнее обновление: 13 марта 2026 г.
          </div>

          {/* Introduction */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              1. Принятие условий
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Добро пожаловать в приложение для поиска работы в детских садах. Используя наше приложение, 
              вы соглашаетесь с настоящими Условиями использования. Если вы не согласны с этими условиями, 
              пожалуйста, не используйте приложение.
            </p>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              2. Описание услуг
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Наше приложение предоставляет платформу для:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
              <li>Поиска вакансий в детских садах</li>
              <li>Размещения резюме соискателей</li>
              <li>Публикации вакансий работодателями</li>
              <li>Коммуникации между работодателями и соискателями</li>
              <li>Управления заявками на вакансии</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              3. Учетные записи пользователей
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              При создании учетной записи вы обязуетесь:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
              <li>Предоставлять точную и актуальную информацию</li>
              <li>Поддерживать безопасность своей учетной записи</li>
              <li>Немедленно уведомлять нас о любом несанкционированном использовании</li>
              <li>Не передавать свою учетную запись третьим лицам</li>
            </ul>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              4. Правила поведения пользователей
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Вы соглашаетесь НЕ использовать приложение для:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
              <li>Размещения ложной или вводящей в заблуждение информации</li>
              <li>Публикации оскорбительного или дискриминационного контента</li>
              <li>Нарушения прав интеллектуальной собственности</li>
              <li>Распространения спама или вредоносного ПО</li>
              <li>Незаконной деятельности любого рода</li>
            </ul>
          </section>

          {/* Content */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              5. Контент пользователей
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Вы сохраняете все права на контент, который публикуете в приложении. 
              Однако, размещая контент, вы предоставляете нам лицензию на использование, 
              хранение и отображение этого контента в рамках предоставления наших услуг.
            </p>
          </section>

          {/* Job Postings */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              6. Размещение вакансий
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Работодатели обязуются размещать только реальные вакансии и предоставлять 
              достоверную информацию об условиях труда, заработной плате и требованиях к кандидатам.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              7. Конфиденциальность
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Использование вашей личной информации регулируется нашей{" "}
              <button
                onClick={() => navigate("/privacy")}
                className="text-blue-600 hover:underline"
              >
                Политикой конфиденциальности
              </button>
              . Пожалуйста, ознакомьтесь с ней, чтобы понять, как мы собираем, 
              используем и защищаем вашу информацию.
            </p>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              8. Ограничение ответственности
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Приложение предоставляется "как есть". Мы не гарантируем трудоустройство 
              или успешное заполнение вакансий. Мы не несем ответственности за действия 
              пользователей или результаты взаимодействия между работодателями и соискателями.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              9. Прекращение доступа
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Мы оставляем за собой право приостановить или прекратить ваш доступ к приложению 
              в случае нарушения этих условий или по другим законным основаниям.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              10. Изменения в условиях
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Мы можем обновлять эти условия время от времени. Продолжение использования 
              приложения после изменений означает ваше согласие с новыми условиями.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              11. Применимое право
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Настоящие условия регулируются и толкуются в соответствии с законодательством 
              Республики Узбекистан.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              12. Контактная информация
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Если у вас есть вопросы об этих Условиях использования, свяжитесь с нами:
            </p>
            <div className="mt-3 space-y-2 text-gray-700">
              <p>Email: support@ishtop.uz</p>
              <p>Telegram: @ishtop_support</p>
            </div>
          </section>

          {/* Bottom Spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
}
