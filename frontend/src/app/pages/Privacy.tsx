import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router";

export function Privacy() {
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Приватность</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 hidden lg:block">Защита ваших данных</p>
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
              1. Введение
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Мы уважаем вашу конфиденциальность и обязуемся защищать ваши персональные данные. 
              Эта Политика конфиденциальности объясняет, как мы собираем, используем, храним и 
              защищаем вашу информацию при использовании нашего приложения для поиска работы в детских садах.
            </p>
          </section>

          {/* Data We Collect */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              2. Какие данные мы собираем
            </h2>
            
            <h3 className="text-base font-medium text-gray-900 mt-4 mb-2">
              2.1. Информация, которую вы предоставляете
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
              <li>Данные из Telegram (имя пользователя, ID, аватар)</li>
              <li>Контактная информация (телефон, email)</li>
              <li>Профессиональная информация (резюме, опыт работы, образование)</li>
              <li>Информация о вакансиях (для работодателей)</li>
              <li>Сообщения и коммуникации в приложении</li>
            </ul>

            <h3 className="text-base font-medium text-gray-900 mt-4 mb-2">
              2.2. Автоматически собираемая информация
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
              <li>Информация об устройстве (тип, операционная система)</li>
              <li>IP-адрес и данные о местоположении (приблизительные)</li>
              <li>Данные об использовании приложения (просмотренные вакансии, время в приложении)</li>
              <li>Технические данные (версия приложения, язык интерфейса)</li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              3. Как мы используем ваши данные
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
              <li>Предоставление и улучшение наших услуг</li>
              <li>Сопоставление соискателей с подходящими вакансиями</li>
              <li>Обеспечение связи между работодателями и соискателями</li>
              <li>Отправка уведомлений о новых вакансиях и откликах</li>
              <li>Анализ и улучшение функциональности приложения</li>
              <li>Обеспечение безопасности и предотвращение мошенничества</li>
              <li>Соблюдение законодательных требований</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              4. Передача данных третьим лицам
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Мы можем передавать ваши данные:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
              <li>
                <strong>Работодателям</strong> — когда вы подаете заявку на вакансию, 
                работодатель получает доступ к вашему резюме и контактной информации
              </li>
              <li>
                <strong>Соискателям</strong> — работодатели могут видеть информацию о кандидатах, 
                которые откликнулись на их вакансии
              </li>
              <li>
                <strong>Поставщикам услуг</strong> — компании, которые помогают нам 
                предоставлять наши услуги (хостинг, аналитика, поддержка)
              </li>
              <li>
                <strong>Правоохранительным органам</strong> — при наличии законных требований
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Мы <strong>НЕ продаем</strong> ваши персональные данные третьим лицам.
            </p>
          </section>

          {/* Telegram */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              5. Интеграция с Telegram
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Наше приложение работает через Telegram Mini App. При авторизации через Telegram 
              мы получаем базовую информацию из вашего профиля Telegram (имя, username, фото профиля). 
              Эта информация используется для создания вашей учетной записи и идентификации в приложении.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Мы <strong>НЕ получаем доступ</strong> к вашим личным сообщениям в Telegram или 
              списку контактов.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              6. Безопасность данных
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Мы применяем технические и организационные меры для защиты ваших данных:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
              <li>Шифрование данных при передаче (SSL/TLS)</li>
              <li>Шифрование данных при хранении</li>
              <li>Регулярные проверки безопасности</li>
              <li>Ограниченный доступ к данным для сотрудников</li>
              <li>Регулярное резервное копирование</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Однако, ни один метод передачи данных через интернет не является на 100% безопасным. 
              Мы делаем все возможное для защиты ваших данных, но не можем гарантировать абсолютную безопасность.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              7. Хранение данных
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Мы храним ваши персональные данные только в течение периода, необходимого для 
              достижения целей, для которых они были собраны, или в соответствии с законодательными требованиями.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              После удаления учетной записи мы удаляем или анонимизируем ваши персональные данные 
              в течение 30 дней, за исключением информации, которую мы обязаны хранить по закону.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              8. Ваши права
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Вы имеете следующие права в отношении ваших персональных данных:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
              <li><strong>Доступ</strong> — запросить копию ваших данных</li>
              <li><strong>Исправление</strong> — обновить неточную или неполную информацию</li>
              <li><strong>Удаление</strong> — запросить удаление ваших данных</li>
              <li><strong>Ограничение обработки</strong> — ограничить использование ваших данных</li>
              <li><strong>Переносимость</strong> — получить ваши данные в машиночитаемом формате</li>
              <li><strong>Возражение</strong> — возразить против определенных видов обработки</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Для осуществления этих прав свяжитесь с нами по адресу: privacy@ishtop.uz
            </p>
          </section>

          {/* Children Privacy */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              9. Конфиденциальность детей
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Наше приложение предназначено для лиц старше 18 лет. Мы сознательно не собираем 
              персональные данные детей младше 18 лет. Если вы узнали, что ребенок предоставил 
              нам персональные данные, пожалуйста, свяжитесь с нами.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              10. Cookies и похожие технологии
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Мы используем cookies и похожие технологии для улучшения работы приложения, 
              анализа использования и персонализации вашего опыта. Вы можете управлять 
              настройками cookies в вашем браузере.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              11. Изменения в политике
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Мы можем обновлять эту Политику конфиденциальности время от времени. 
              Мы уведомим вас о существенных изменениях через приложение или по email. 
              Дата последнего обновления указана в начале документа.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              12. Международная передача данных
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Ваши данные могут обрабатываться на серверах, расположенных в разных странах. 
              Мы обеспечиваем надлежащие гарантии защиты ваших данных при международной передаче 
              в соответствии с применимым законодательством.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              13. Свяжитесь с нами
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Если у вас есть вопросы о нашей Политике конфиденциальности или обработке ваших данных, 
              свяжитесь с нами:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-gray-700">
              <p><strong>Email:</strong> privacy@ishtop.uz</p>
              <p><strong>Поддержка:</strong> support@ishtop.uz</p>
              <p><strong>Telegram:</strong> @ishtop_support</p>
              <p><strong>Адрес:</strong> Ташкент, Узбекистан</p>
            </div>
          </section>

          {/* GDPR Notice */}
          <section className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Для пользователей из ЕС
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Если вы находитесь в Европейском Союзе, применяются дополнительные права 
              в соответствии с GDPR (Общим регламентом по защите данных). Вы имеете право 
              подать жалобу в надзорный орган по защите данных вашей страны.
            </p>
          </section>

          {/* Bottom Spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
}
