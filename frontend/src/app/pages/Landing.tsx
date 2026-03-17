import { Search, MapPin, Clock, TrendingUp, Users, Briefcase, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
// MOCK DATA - Replace with API call when integrating backend
import { MOCK_VACANCIES } from "../../data/mockData";

export function Landing() {
  const navigate = useNavigate();

  // MOCK DATA - Replace with API call: GET /api/vacancies?limit=6&recent=true
  // TODO: Implement: const { data: recentVacancies } = useFetch('/api/vacancies?limit=6&recent=true')
  const recentVacancies = MOCK_VACANCIES.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <h1 className="text-2xl font-bold text-blue-600">Ish-Top</h1>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#vacancies" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Вакансии
              </a>
              <a href="#candidates" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Кандидаты
              </a>
              <a href="#kindergartens" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Для садов
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Тарифы
              </a>
            </nav>
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.61 3.73-.53.36-1.01.54-1.44.52-.48-.02-1.39-.27-2.07-.49-.84-.27-1.51-.42-1.45-.89.03-.24.37-.49.99-.74 3.88-1.69 6.47-2.81 7.77-3.34 3.7-1.54 4.47-1.81 4.97-1.82.11 0 .36.03.52.16.14.11.17.26.19.37.01.08.03.28.01.43z"/>
            </svg>
            Войти через Telegram
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Работа и сотрудники для детских садов
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Крупнейшая платформа для поиска работы в детских садах и найма квалифицированных специалистов
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => navigate("/vacancies")}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg"
                >
                  Найти работу
                </button>
                <button
                  onClick={() => navigate("/workers")}
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg"
                >
                  Найти сотрудника
                </button>
              </div>
              
              {/* Trust Block */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">1 240+</div>
                  <div className="text-sm text-gray-600">Вакансий</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">320+</div>
                  <div className="text-sm text-gray-600">Детских садов</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">5 800+</div>
                  <div className="text-sm text-gray-600">Кандидатов</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1601339434203-130259102db6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraW5kZXJnYXJ0ZW4lMjB0ZWFjaGVyJTIwY2hpbGRyZW4lMjBoYXBweSUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NzI1MTc0MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Kindergarten teacher with children"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg -mt-20 relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Быстрый поиск</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Должность"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option>Район</option>
                  <option>Центральный район</option>
                  <option>Северный район</option>
                  <option>Южный район</option>
                  <option>Западный район</option>
                  <option>Восточный район</option>
                </select>
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option>График</option>
                  <option>Полный день</option>
                  <option>Неполный день</option>
                  <option>Гибкий график</option>
                </select>
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Найти
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Vacancies */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-gray-900">Топ вакансии</h3>
            <button
              onClick={() => navigate("/vacancies")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Посмотреть все →
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentVacancies.map((vacancy) => (
              <div
                key={vacancy.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/vacancies/${vacancy.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 flex-1">
                    {vacancy.title}
                  </h4>
                  {vacancy.badge && (
                    <span className={`${vacancy.badgeColor} text-white text-xs font-bold px-2 py-1 rounded`}>
                      {vacancy.badge}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{vacancy.kindergarten}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4" />
                  {vacancy.district}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-lg font-bold text-blue-600">{vacancy.salary}</span>
                  <span className="text-sm text-gray-500">{vacancy.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Как это работает</h3>
          
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Для соискателей</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Войдите через Telegram</h5>
                    <p className="text-gray-600">Быстрая регистрация за пару секунд</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Заполните профиль</h5>
                    <p className="text-gray-600">Укажите опыт, квалификацию и желаемую зарплату</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Откликайтесь на вакансии</h5>
                    <p className="text-gray-600">Отправляйте отклики и получайте приглашения</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Для детских садов</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Создайте профиль сада</h5>
                    <p className="text-gray-600">Расскажите о вашем учреждении</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Опубликуйте вакансию</h5>
                    <p className="text-gray-600">Укажите требования и условия работы</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Выберите кандидата</h5>
                    <p className="text-gray-600">Просматривайте отклики и приглашайте на собеседование</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Преимущества платформы</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Быстрый поиск</h4>
              <p className="text-gray-600">Удобные фильтры и умный алгоритм подбора вакансий</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Большая база</h4>
              <p className="text-gray-600">Тысячи вакансий и кандидатов по всему городу</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Проверенные работодатели</h4>
              <p className="text-gray-600">Все детские сады проходят верификацию</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-bold mb-4">Ish-Top</h4>
              <p className="text-gray-400">Работа и сотрудники для детских садов</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Соискателям</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Найти работу</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Как это работает</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Помощь</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Работодателям</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Найти сотрудников</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Тарифы</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Поддержка</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Компания</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Контакты</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Оферта</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Ish-Top. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}