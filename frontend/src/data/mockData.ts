// Централизованные моковые данные для приложения

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  saved: boolean;
  recommended: boolean;
  contactPerson: string;
  telegram: string;
  phone: string;
  description?: string;
}

// Интерфейс для вакансий работодателя (Employer Portal)
export interface Vacancy {
  id: number;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: 'active' | 'paused' | 'closed';
  applicantsCount: number;
  createdAt: string;
}

// Интерфейс для кандидатов (Workers)
export interface Worker {
  id: number;
  name: string;
  position: string;
  location: string;
  experience: string;
  education: string;
  skills: string[];
  salary: string;
  phone: string;
  email: string;
  telegram: string;
  avatar: string;
  bio?: string;
}

export interface Application {
  id: number;
  jobId: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  status: string;
  statusColor: string;
  filterType: 'sent' | 'accepted' | 'rejected' | 'pending';
  appliedDate: string;
  coverLetter?: string;
}

export interface UserProfile {
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  avatar: string;
  jobTitle: string;
  jobPeriod: string;
  educationDegree: string;
  educationUniversity: string;
  educationPeriod: string;
  desiredSalary: string;
}

// Вакансии (Jobs)
export const jobs: Job[] = [
  {
    id: 1,
    title: "Воспитатель младшей группы",
    company: "Детский сад «Солнышко»",
    location: "Ташкент, Узбекистан",
    salary: "3 000 000 - 5 000 000 сум/месяц",
    tags: ["Полная занятость", "В офисе"],
    saved: false,
    recommended: true,
    contactPerson: "Иванова Мария Петровна",
    telegram: "@kindergarten_solnyshko",
    phone: "+998 90 123 45 67",
    description: "Работа с детьми 2-3 лет, организация занятий и досуга."
  },
  {
    id: 2,
    title: "Воспитатель средней группы",
    company: "Детский сад «Радуга»",
    location: "Самарканд, Узбекистан",
    salary: "2 800 000 - 4 500 000 сум/месяц",
    tags: ["Частичная занятость", "В офисе"],
    saved: false,
    recommended: false,
    contactPerson: "Смирнова Елена Викторовна",
    telegram: "@raduga_kindergarten",
    phone: "+998 91 234 56 78",
    description: "Проведение развивающих занятий с детьми 3-4 лет."
  },
  {
    id: 3,
    title: "Методист дошкольного образования",
    company: "Образовательный центр «Знание»",
    location: "Ташкент, Узбекистан",
    salary: "4 000 000 - 7 000 000 сум/месяц",
    tags: ["Полная занятость", "Гибридный формат"],
    saved: false,
    recommended: true,
    contactPerson: "Петрова Анна Сергеевна",
    telegram: "@edu_center_uz",
    phone: "+998 93 345 67 89",
    description: "Разработка методических материалов, консультирование воспитателей."
  },
  {
    id: 4,
    title: "Музыкальный руководитель",
    company: "Детский сад №15",
    location: "Бухара, Узбекистан",
    salary: "2 500 000 - 4 000 000 сум/месяц",
    tags: ["Частичная занятость", "В офисе"],
    saved: true,
    recommended: false,
    contactPerson: "Козловская Елена Ивановна",
    telegram: "@kindergarten_15",
    phone: "+998 94 456 78 90",
    description: "Проведение музыкальных занятий, подготовка к утренникам."
  },
  {
    id: 5,
    title: "Логопед",
    company: "Развивающий центр «Умка»",
    location: "Ташкент, Узбекистан",
    salary: "3 500 000 - 6 000 000 сум/месяц",
    tags: ["Гибкий график", "Частичная занятость"],
    saved: false,
    recommended: true,
    contactPerson: "Соколова Ольга Дмитриевна",
    telegram: "@umka_center",
    phone: "+998 95 567 89 01",
    description: "Коррекция речевых нарушений у детей дошкольного возраста."
  },
  {
    id: 6,
    title: "Инструктор по физической культуре",
    company: "Детский сад «Здоровье»",
    location: "Фергана, Узбекистан",
    salary: "2 800 000 - 4 500 000 сум/месяц",
    tags: ["Полная занятость", "В офисе"],
    saved: false,
    recommended: true,
    contactPerson: "Николаев Сергей Михайлович",
    telegram: "@zdravie_kinder",
    phone: "+998 97 678 90 12",
    description: "Проведение физкультурных занятий, организация спортивных мероприятий."
  },
  {
    id: 7,
    title: "Воспитатель старшей группы",
    company: "Частный детский сад «Малышок»",
    location: "Андижан, Узбекистан",
    salary: "3 200 000 - 5 500 000 сум/месяц",
    tags: ["Полная занятость", "В офисе"],
    saved: true,
    recommended: false,
    contactPerson: "Рахимова Динара Абдуллаевна",
    telegram: "@malyshok_kinder",
    phone: "+998 98 789 01 23",
    description: "Подготовка детей 5-6 лет к школе, развивающие занятия."
  },
  {
    id: 8,
    title: "Психолог детского сада",
    company: "Детский сад «Росток»",
    location: "Наманган, Узбекистан",
    salary: "3 800 000 - 6 500 000 сум/месяц",
    tags: ["Полная занятость", "В офисе"],
    saved: false,
    recommended: true,
    contactPerson: "Карпова Светлана Игоревна",
    telegram: "@rostok_psy",
    phone: "+998 99 890 12 34",
    description: "Психологическое сопровождение детей, консультирование родителей."
  },
  {
    id: 9,
    title: "Педагог дополнительного образования (ИЗО)",
    company: "Центр творчества «Радуга»",
    location: "Ташкент, Узбекистан",
    salary: "2 500 000 - 4 200 000 сум/месяц",
    tags: ["Частичная занятость", "В офисе"],
    saved: false,
    recommended: false,
    contactPerson: "Алиева Нигора Рашидовна",
    telegram: "@raduga_art",
    phone: "+998 90 901 23 45",
    description: "Проведение занятий по рисованию и лепке с детьми 3-7 лет."
  },
  {
    id: 10,
    title: "Помощник воспитателя",
    company: "Детский сад «Ласточка»",
    location: "Карши, Узбекистан",
    salary: "2 000 000 - 3 000 000 сум/месяц",
    tags: ["Полная занятость", "В офисе"],
    saved: false,
    recommended: false,
    contactPerson: "Мирзаева Гульнара Шавкатовна",
    telegram: "@lastochka_kinder",
    phone: "+998 91 012 34 56",
    description: "Помощь воспитателю в организации режимных моментов и занятий."
  }
];

// Заявки (Applications) - связаны с вакансиями по jobId
export const applications: Application[] = [
  {
    id: 1,
    jobId: 1,
    title: "Воспитатель младшей группы",
    company: "Детский сад «Солнышко»",
    location: "Ташкент, Узбекистан",
    salary: "3 000 000 - 5 000 000 сум/месяц",
    status: "Заявка отправлена",
    statusColor: "bg-blue-50 text-blue-600 border-blue-100",
    filterType: "sent",
    appliedDate: "15 марта 2026",
    coverLetter: "Добрый день! Меня интересует позиция воспитателя в вашем детском саду."
  },
  {
    id: 2,
    jobId: 3,
    title: "Методист дошкольного образования",
    company: "Образовательный центр «Знание»",
    location: "Ташкент, Узбекистан",
    salary: "4 000 000 - 7 000 000 сум/месяц",
    status: "Заявка принята",
    statusColor: "bg-green-50 text-green-600 border-green-100",
    filterType: "accepted",
    appliedDate: "12 марта 2026",
    coverLetter: "Имею опыт работы методистом более 5 лет."
  },
  {
    id: 3,
    jobId: 5,
    title: "Логопед",
    company: "Развивающий центр «Умка»",
    location: "Ташкент, Узбекистан",
    salary: "3 500 000 - 6 000 000 сум/месяц",
    status: "Заявка отклонена",
    statusColor: "bg-red-50 text-red-600 border-red-100",
    filterType: "rejected",
    appliedDate: "10 марта 2026",
    coverLetter: "Хочу работать логопедом в вашем центре."
  },
  {
    id: 4,
    jobId: 8,
    title: "Психолог детского сада",
    company: "Детский сад «Росток»",
    location: "Наманган, Узбекистан",
    salary: "3 800 000 - 6 500 000 сум/месяц",
    status: "Заявка на рассмотрении",
    statusColor: "bg-yellow-50 text-yellow-600 border-yellow-100",
    filterType: "pending",
    appliedDate: "14 марта 2026",
    coverLetter: "Являюсь квалифицированным детским психологом с опытом работы 3 года."
  },
  {
    id: 5,
    jobId: 6,
    title: "Инструктор по физической культуре",
    company: "Детский сад «Здоровье»",
    location: "Фергана, Узбекистан",
    salary: "2 800 000 - 4 500 000 сум/месяц",
    status: "Заявка принята",
    statusColor: "bg-green-50 text-green-600 border-green-100",
    filterType: "accepted",
    appliedDate: "8 марта 2026",
    coverLetter: "Готов приступить к работе в ближайшее время."
  }
];

// ID сохраненных вакансий
export const savedJobIds = [4, 7];

// Профиль пользователя
export const userProfile: UserProfile = {
  name: "Алина Каримова",
  position: "Воспитатель старшей группы",
  company: "Детский сад №25",
  email: "alina.karimova@example.uz",
  phone: "+998 90 123 45 67",
  address: "Ташкент, Узбекистан",
  bio: "Опытный педагог дошкольного образования с 7-летним стажем работы. Люблю детей и стремлюсь создать комфортную развивающую среду для каждого ребенка.",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  jobTitle: "Воспитатель старшей группы",
  jobPeriod: "2019 - настоящее время",
  educationDegree: "Бакалавр",
  educationUniversity: "Узбекский государственный педагогический университет",
  educationPeriod: "2015 - 2019",
  desiredSalary: "4 000 000 - 6 000 000 сум/месяц"
};

// Вспомогательные функции
export const getJobById = (id: number): Job | undefined => {
  return jobs.find(job => job.id === id);
};

export const getSavedJobs = (): Job[] => {
  return jobs.filter(job => savedJobIds.includes(job.id));
};

export const getRecommendedJobs = (): Job[] => {
  return jobs.filter(job => job.recommended);
};

export const getApplicationById = (id: number): Application | undefined => {
  return applications.find(app => app.id === id);
};

export const getApplicationsByStatus = (filterType: string): Application[] => {
  if (filterType === 'all') return applications;
  return applications.filter(app => app.filterType === filterType);
};

// ==============================================
// EMPLOYER PORTAL DATA (Портал работодателя)
// ==============================================

// Вакансии для портала работодателя
export const MOCK_VACANCIES: Vacancy[] = [
  {
    id: 1,
    title: "Воспитатель младшей группы",
    description: "Требуется опытный воспитатель для работы с детьми 2-3 лет",
    location: "Ташкент, Узбекистан",
    employmentType: "Полная занятость",
    salaryRange: "3 000 000 - 5 000 000 сум/месяц",
    requirements: [
      "Высшее педагогическое образование",
      "Опыт работы от 2 лет",
      "Любовь к детям"
    ],
    responsibilities: [
      "Организация образовательного процесса",
      "Проведение развивающих занятий",
      "Взаимодействие с родителями"
    ],
    benefits: [
      "Дружный коллектив",
      "Карьерный рост",
      "Бесплатное питание"
    ],
    status: "active",
    applicantsCount: 12,
    createdAt: "10 марта 2026"
  },
  {
    id: 2,
    title: "Музыкальный руководитель",
    description: "Ищем творческого музыкального руководителя",
    location: "Ташкент, Узбекистан",
    employmentType: "Частичная занятость",
    salaryRange: "2 500 000 - 4 000 000 сум/месяц",
    requirements: [
      "Музыкальное образование",
      "Опыт работы с детьми",
      "Знание современных методик"
    ],
    responsibilities: [
      "Проведение музыкальных занятий",
      "Подготовка праздников",
      "Работа с родителям��"
    ],
    benefits: [
      "Творческая атмосфера",
      "Гибкий график",
      "Профессиональное развитие"
    ],
    status: "active",
    applicantsCount: 8,
    createdAt: "8 марта 2026"
  },
  {
    id: 3,
    title: "Логопед",
    description: "Требуется квалифицированный логопед",
    location: "Самарканд, Узбекистан",
    employmentType: "Полная занятость",
    salaryRange: "3 500 000 - 6 000 000 сум/месяц",
    requirements: [
      "Дефектологическое образование",
      "Сертификаты по логопедии",
      "Опыт от 3 лет"
    ],
    responsibilities: [
      "Диагностика речевых нарушений",
      "Индивидуальные занятия",
      "Консультирование родителей"
    ],
    benefits: [
      "Высокая зарплата",
      "Современное оборудование",
      "Повышение квалификации"
    ],
    status: "active",
    applicantsCount: 5,
    createdAt: "5 марта 2026"
  },
  {
    id: 4,
    title: "Психолог детского сада",
    description: "Ищем детского психолога в команду",
    location: "Бухара, Узбекистан",
    employmentType: "Полная занятость",
    salaryRange: "3 800 000 - 6 500 000 сум/месяц",
    requirements: [
      "Психологическое образование",
      "Специализация на детской психологии",
      "Опыт работы от 2 лет"
    ],
    responsibilities: [
      "Психологическая диагностика",
      "Индивидуальная работа с детьми",
      "Консультирование родителей и педагогов"
    ],
    benefits: [
      "Комфортные условия",
      "Профессиональный рост",
      "Дружный коллектив"
    ],
    status: "paused",
    applicantsCount: 15,
    createdAt: "1 марта 2026"
  },
  {
    id: 5,
    title: "Инструктор по физической культуре",
    description: "Требуется энергичный инструктор по физкультуре",
    location: "Фергана, Узбекистан",
    employmentType: "Частичная занятость",
    salaryRange: "2 800 000 - 4 500 000 сум/месяц",
    requirements: [
      "Физкультурное образование",
      "Опыт работы с дошкольниками",
      "Знание методик физического развития"
    ],
    responsibilities: [
      "Проведение физкультурных занятий",
      "Организация спортивных мероприятий",
      "Мониторинг физического развития детей"
    ],
    benefits: [
      "Спортивный зал",
      "Гибкий график",
      "Дружная команда"
    ],
    status: "active",
    applicantsCount: 6,
    createdAt: "28 февраля 2026"
  },
  {
    id: 6,
    title: "Методист дошкольного образования",
    description: "Ищем опытного методиста для нашего центра",
    location: "Ташкент, Узбекистан",
    employmentType: "Полная занятость",
    salaryRange: "4 000 000 - 7 000 000 сум/месяц",
    requirements: [
      "Высшее педагогическое образование",
      "Опыт методической работы от 5 лет",
      "Знание современных образовательных программ"
    ],
    responsibilities: [
      "Разработка методических материалов",
      "Консультирование воспитателей",
      "Мониторинг качества образования"
    ],
    benefits: [
      "Высокая зарплата",
      "Карьерный рост",
      "Профессиональное развитие"
    ],
    status: "active",
    applicantsCount: 10,
    createdAt: "25 февраля 2026"
  },
  {
    id: 7,
    title: "Воспитатель старшей группы",
    description: "Требуется воспитатель для подготовки детей к школе",
    location: "Андижан, Узбекистан",
    employmentType: "Полная занятость",
    salaryRange: "3 200 000 - 5 500 000 сум/месяц",
    requirements: [
      "Педагогическое образование",
      "Опыт работы с детьми 5-6 лет",
      "Знание программ подготовки к школе"
    ],
    responsibilities: [
      "Подготовка детей к школе",
      "Проведение развивающих занятий",
      "Работа с родителями"
    ],
    benefits: [
      "Современная материальная база",
      "Обучение",
      "Дружный коллектив"
    ],
    status: "closed",
    applicantsCount: 20,
    createdAt: "20 февраля 2026"
  },
  {
    id: 8,
    title: "Педагог дополнительного образования (ИЗО)",
    description: "Ищем педагога по изобразительному искусству",
    location: "Наманган, Узбекистан",
    employmentType: "Частичная занятость",
    salaryRange: "2 500 000 - 4 200 000 сум/месяц",
    requirements: [
      "Художественное или педагогическое образование",
      "Опыт работы с детьми",
      "Портфолио работ"
    ],
    responsibilities: [
      "Проведение занятий по рисованию и лепке",
      "Подготовка к конкурсам",
      "Организация выставок"
    ],
    benefits: [
      "Творческая атмосфера",
      "Материалы для работы",
      "Свободный график"
    ],
    status: "active",
    applicantsCount: 4,
    createdAt: "18 февраля 2026"
  }
];

// Кандидаты (Workers) для портала работодателя
export const MOCK_WORKERS: Worker[] = [
  {
    id: 1,
    name: "Алина Каримова",
    position: "Воспитатель старшей группы",
    location: "Ташкент, Узбекистан",
    experience: "7 лет",
    education: "Узбекский государственный педагогический университет",
    skills: ["Подготовка к школе", "Развивающие игры", "Работа с родителями"],
    salary: "4 000 000 - 6 000 000 сум/месяц",
    phone: "+998 90 123 45 67",
    email: "alina.karimova@example.uz",
    telegram: "@alina_pedagog",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    bio: "Опытный педагог с любовью к детям"
  },
  {
    id: 2,
    name: "Диана Рахимова",
    position: "Музыкальный руководитель",
    location: "Самарканд, Узбекистан",
    experience: "5 лет",
    education: "Государственная консерватория Узбекистана",
    skills: ["Вокал", "Игра на фортепиано", "Постановка праздников"],
    salary: "3 000 000 - 5 000 000 сум/месяц",
    phone: "+998 91 234 56 78",
    email: "diana.rahimova@example.uz",
    telegram: "@diana_music",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    bio: "Творческий музыкант и педагог"
  },
  {
    id: 3,
    name: "Светлана Петрова",
    position: "Логопед",
    location: "Ташкент, Узбекистан",
    experience: "10 лет",
    education: "Московский педагогический государственный университет",
    skills: ["Коррекция речи", "Работа с ОВЗ", "Нейропсихология"],
    salary: "5 000 000 - 7 000 000 сум/месяц",
    phone: "+998 93 345 67 89",
    email: "svetlana.petrova@example.uz",
    telegram: "@svetlana_logoped",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    bio: "Квалифицированный логопед-дефектолог"
  },
  {
    id: 4,
    name: "Малика Усманова",
    position: "Воспитатель младшей группы",
    location: "Бухара, Узбекистан",
    experience: "3 года",
    education: "Бухарский государственный университет",
    skills: ["Работа с малышами", "Раннее развитие", "Адаптация детей"],
    salary: "2 500 000 - 4 000 000 сум/месяц",
    phone: "+998 94 456 78 90",
    email: "malika.usmanova@example.uz",
    telegram: "@malika_vospitatel",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop",
    bio: "Молодой и энергичный педагог"
  },
  {
    id: 5,
    name: "Ольга Николаева",
    position: "Психолог детского сада",
    location: "Ташкент, Узбекистан",
    experience: "8 лет",
    education: "Национальный университет Узбекистана",
    skills: ["Детская психология", "Арт-терапия", "Консультирование"],
    salary: "4 500 000 - 6 500 000 сум/месяц",
    phone: "+998 95 567 89 01",
    email: "olga.nikolaeva@example.uz",
    telegram: "@olga_psycholog",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    bio: "Детский психолог с большим опытом"
  },
  {
    id: 6,
    name: "Фарида Ахмедова",
    position: "Методист дошкольного образования",
    location: "Фергана, Узбекистан",
    experience: "12 лет",
    education: "Ташкентский государственный педагогический университет",
    skills: ["Методическая работа", "Разработка программ", "Обучение педагогов"],
    salary: "5 000 000 - 8 000 000 сум/месяц",
    phone: "+998 97 678 90 12",
    email: "farida.ahmedova@example.uz",
    telegram: "@farida_metodist",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop",
    bio: "Опытный методист с авторскими разработками"
  },
  {
    id: 7,
    name: "Сергей Иванов",
    position: "Инструктор по физической культуре",
    location: "Андижан, Узбекистан",
    experience: "6 лет",
    education: "Узбекский государственный университет физической культуры",
    skills: ["Физическое развитие", "Спортивные игры", "ЛФК"],
    salary: "3 500 000 - 5 000 000 сум/месяц",
    phone: "+998 98 789 01 23",
    email: "sergey.ivanov@example.uz",
    telegram: "@sergey_fizruk",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    bio: "Энергичный тренер и педагог"
  },
  {
    id: 8,
    name: "Нигора Алиева",
    position: "Педагог дополнительного образования (ИЗО)",
    location: "Наманган, Узбекистан",
    experience: "4 года",
    education: "Национальный институт художеств и дизайна",
    skills: ["Рисование", "Лепка", "Декоративно-прикладное искусство"],
    salary: "2 800 000 - 4 500 000 сум/месяц",
    phone: "+998 99 890 12 34",
    email: "nigora.alieva@example.uz",
    telegram: "@nigora_art",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    bio: "Творческий художник и педагог"
  }
];