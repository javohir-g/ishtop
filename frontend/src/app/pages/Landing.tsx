import { Search, MapPin, Clock, TrendingUp, Users, Briefcase, CheckCircle2, ChevronRight, ArrowRight, BadgeCheck, Star, ChevronDown, Sparkles, GraduationCap, Building2, ExternalLink, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { Language } from "@/app/i18n/translations";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";
import { Globe } from "lucide-react";

interface Vacancy {
  id: number;
  title: string;
  kindergarten?: { name: string };
  district: string;
  salary_min?: number;
  salary_max?: number;
  published_at?: string;
  is_featured?: boolean;
}

interface PublicStats {
  vacancies_count: number;
  workers_count: number;
  kindergartens_count: number;
}

export function Landing() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();

  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: "uz-latn", label: "O'zbek (Lotin)" },
    { code: "uz-cyrl", label: "Ўзбек (Кирилл)" },
    { code: "ru", label: "Русский" },
  ];

  const fetchVacanciesFunc = useCallback(() => 
    api.get("/vacancies", { params: { per_page: 6, is_featured: true } }), []);
  
  const { data: vacancyResponse, loading, execute: fetchVacancies } = useApi<{ items: Vacancy[] }>(fetchVacanciesFunc);

  const fetchStatsFunc = useCallback(() => api.get("/stats"), []);
  const { data: stats, execute: fetchStats } = useApi<PublicStats>(fetchStatsFunc);

  useEffect(() => {
    fetchVacancies();
    fetchStats();
  }, [fetchVacancies, fetchStats]);

  const recentVacancies = vacancyResponse?.items || [];

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Kelishiladi";
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} so'm`;
    if (min) return `${min.toLocaleString()} so'mdan`;
    if (max) return `${max.toLocaleString()} so'mgacha`;
    return "Kelishiladi";
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/10">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto font-body">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-primary font-headline cursor-pointer" onClick={() => navigate("/")}>
              Ish-Top
            </span>
            <div className="hidden md:flex gap-6 items-center">
              <button 
                onClick={() => navigate("/vacancies")}
                className="text-primary font-semibold border-b-2 border-primary transition-colors duration-200"
              >
                Ish topish
              </button>
              <button 
                onClick={() => navigate("/workers")}
                className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-medium"
              >
                Bog'chalar uchun
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-medium">
                Biz haqimizda
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant font-medium"
              >
                <Globe className="w-5 h-5 text-primary" />
                <span className="hidden sm:inline">{languages.find(l => l.code === language)?.label.split(' ')[0]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 py-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5 ${
                          language === lang.code ? 'text-primary bg-primary/5' : 'text-on-surface-variant'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => navigate("/auth")}
              className="text-on-surface-variant font-medium px-4 py-2 hover:text-primary transition-colors duration-200"
            >
              {t("logout") === "Chiqish" ? "Kirish" : t("logout") === "Выйти" ? "Вход" : "Кириш"}
            </button>
            <button 
              onClick={() => navigate("/auth")}
              className="bg-primary text-white px-5 md:px-6 py-2.5 rounded-xl font-semibold transition-transform active:scale-95 duration-150 ease-in-out shadow-lg shadow-primary/20"
            >
              {t("registerNow")}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* 1. Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              <Sparkles className="text-primary w-4 h-4" />
              <span className="text-primary font-bold text-sm">{t("heroBadge")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight font-headline">
              {t("heroTitle")}
            </h1>
            <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => navigate("/vacancies")}
                className="w-full sm:w-auto bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/25 active:scale-95"
              >
                {t("startJobSearch")}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate("/kindergarten/vacancies/new")}
                className="w-full sm:w-auto bg-surface-container-high text-primary px-8 py-4 rounded-xl font-bold hover:bg-surface-container transition-all active:scale-95"
              >
                {t("addKindergarten")}
              </button>
            </div>
          </div>
          <div className="relative group perspective-1000">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary-container/30 rounded-full blur-3xl -z-10 group-hover:bg-secondary-container/40 transition-colors"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -z-10 group-hover:bg-primary-container/30 transition-colors"></div>
            <img 
              className="rounded-3xl shadow-2xl w-full aspect-square object-cover transform transition-transform duration-500 group-hover:scale-[1.02]" 
              src="https://paristeachersclub.com/wp-content/uploads/2022/11/childrens-books.png" 
              alt="Kindergarten teacher"
            />
            {/* Floating Card 1 */}
            <div className="absolute top-8 -right-4 md:-right-8 bg-white/70 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce-slow border border-white/50">
              <div className="w-10 h-10 bg-tertiary rounded-full flex items-center justify-center text-white shadow-lg shadow-tertiary/20">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{t("verified")}</p>
                <p className="font-bold text-sm text-on-surface">{t("premiumKindergarten")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Statistics bar */}
        <section className="bg-primary py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/20 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            <div className="text-center text-white">
              <p className="text-4xl font-extrabold mb-1 font-headline text-white">
                {stats?.workers_count !== undefined ? `${stats.workers_count}+` : "1500+"}
              </p>
              <p className="text-white/80 font-medium text-sm md:text-base">{t("statsCandidates")}</p>
            </div>
            <div className="text-center text-white">
              <p className="text-4xl font-extrabold mb-1 font-headline text-white">
                {stats?.kindergartens_count !== undefined ? `${stats.kindergartens_count}+` : "450+"}
              </p>
              <p className="text-white/80 font-medium text-sm md:text-base">{t("statsPartners")}</p>
            </div>
            <div className="text-center text-white">
              <p className="text-4xl font-extrabold mb-1 font-headline text-white">
                {stats?.vacancies_count !== undefined ? `${stats.vacancies_count}+` : "800+"}
              </p>
              <p className="text-white/80 font-medium text-sm md:text-base">{t("statsVacancies")}</p>
            </div>
            <div className="text-center text-white">
              <p className="text-4xl font-extrabold mb-1 font-headline text-white">98%</p>
              <p className="text-white/80 font-medium text-sm md:text-base">{t("statsSuccess")}</p>
            </div>
          </div>
        </section>

        {/* 3. 'Kimlar uchun?' section */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold mb-4 font-headline text-on-surface">{t("forWho")}</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">{t("forWhoSubtitle")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Candidates */}
              <div className="bg-white/40 backdrop-blur-md p-10 rounded-3xl group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/60 hover:border-primary/20">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/30">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-headline text-on-surface">{t("forJobSeekers")}</h3>
                <p className="text-on-surface-variant mb-6 leading-relaxed">{t("forJobSeekersDesc")}</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary w-5 h-5 transition-colors group-hover:text-primary/70" />
                    <span className="font-medium text-on-surface transition-colors">{t("professionalProfile")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary w-5 h-5 transition-colors group-hover:text-primary/70" />
                    <span className="font-medium text-on-surface transition-colors">{t("trackApplicationStatus")}</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate("/vacancies")}
                  className="text-primary font-bold inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                >
                  {t("learnMore")} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              {/* Employers */}
              <div className="bg-white/40 backdrop-blur-md p-10 rounded-3xl group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/60 hover:border-secondary/20">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-8 group-hover:bg-secondary group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-secondary/30">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-headline text-on-surface">{t("forEmployers")}</h3>
                <p className="text-on-surface-variant mb-6 leading-relaxed">{t("forEmployersDesc")}</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-secondary w-5 h-5 transition-colors group-hover:text-white" />
                    <span className="font-medium text-on-surface group-hover:text-secondary transition-colors">{t("findBestCandidates")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-secondary w-5 h-5 transition-colors group-hover:text-white" />
                    <span className="font-medium text-on-surface group-hover:text-secondary transition-colors">{t("communicateWithEmployers")}</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate("/workers")}
                  className="text-secondary font-bold inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                >
                  {t("learnMore")} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 'Faol vakansiyalar' list */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div className="animate-in fade-in slide-in-from-bottom duration-500">
                <h2 className="text-4xl font-extrabold mb-2 font-headline text-on-surface">{t("activeVacanciesTitle")}</h2>
                <p className="text-on-surface-variant text-lg">{t("activeVacanciesSubtitle")}</p>
              </div>
              <button 
                onClick={() => navigate("/vacancies")}
                className="text-primary font-bold flex items-center gap-2 hover:underline transition-all group"
              >
                {t("viewAllVacancies")} 
                <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-surface-container-low h-64 rounded-3xl animate-pulse"></div>
                ))
              ) : recentVacancies.length > 0 ? (
                recentVacancies.map((vacancy) => (
                  <div 
                    key={vacancy.id} 
                    onClick={() => navigate(`/job/${vacancy.id}`)}
                    className="bg-white/60 backdrop-blur-md p-6 rounded-3xl flex flex-col gap-4 hover:shadow-2xl transition-all border border-white/80 hover:border-primary/20 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-16 h-16 rounded-2xl bg-surface-container-high overflow-hidden shadow-sm">
                         <img 
                          src={vacancy.is_featured ? "https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?q=40&w=200" : "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=40&w=200"} 
                          alt="Kindergarten logo" 
                          className="w-full h-full object-cover transform transition-transform group-hover:scale-110"
                        />
                      </div>
                      {vacancy.is_featured && (
                        <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Top</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors text-on-surface">{vacancy.title}</h4>
                      <p className="text-on-surface-variant text-sm mb-4 line-clamp-1">{vacancy.kindergarten?.name || "Nomsiz bog'cha"} • {vacancy.district}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-surface-container px-3 py-1 rounded-lg text-xs font-medium text-on-surface-variant">To'liq stavka</span>
                        <span className="bg-primary/5 text-primary px-3 py-1 rounded-lg text-xs font-bold">{formatSalary(vacancy.salary_min, vacancy.salary_max)}</span>
                      </div>
                    </div>
                    <button className="w-full bg-primary/5 group-hover:bg-primary group-hover:text-white text-primary font-bold py-3 rounded-xl transition-all active:scale-95 shadow-sm group-hover:shadow-primary/20">
                      Batafsil
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-on-surface-variant font-medium bg-surface-container-low rounded-3xl">
                  Hozircha faol vakansiyalar mavjud emas.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. Benefits */}
        <section className="py-24 bg-surface-container-low overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="animate-in fade-in slide-in-from-left duration-700">
                <h2 className="text-4xl font-extrabold mb-8 font-headline text-on-surface">{t("whyUs")}</h2>
                <div className="space-y-8">
                  {[
                    { icon: ShieldCheck, title: "Ishonchli bog'chalar", desc: "Barcha ish beruvchilar va muassasalar platformamiz tomonidan sinchkovlik bilan tekshiriladi.", color: "primary" },
                    { icon: Clock, title: "Tezkor aloqa", desc: "To'g'ridan-to'g'ri chat orqali ish beruvchi bilan tezkor bog'lanish va suhbat tayinlash imkoniyati.", color: "tertiary" },
                    { icon: TrendingUp, title: "Professional rivojlanish", desc: "Platforma foydalanuvchilari uchun eksklyuziv master-klasslar va sertifikatlash dasturlari.", color: "secondary" }
                  ].map((benefit, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className={`w-12 h-12 bg-${benefit.color}/10 rounded-2xl flex items-center justify-center text-${benefit.color} shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                        <benefit.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1 text-on-surface">{benefit.title}</h4>
                        <p className="text-on-surface-variant leading-relaxed">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="bg-primary/5 rounded-[48px] p-8 md:p-12 relative overflow-hidden backdrop-blur-md border border-white/50 shadow-inner">
                  <div className="relative z-10 space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl max-w-sm ml-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500 border border-white/10">
                      <div className="flex text-tertiary mb-4">
                        {Array.from({length: 5}).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                      </div>
                      <p className="text-sm font-medium mb-4 italic text-on-surface-variant leading-relaxed">"Ish-Top orqali 2 hafta ichida o'zim orzu qilgan ishni topdim. Rahmat!"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center text-primary font-bold">N</div>
                        <div>
                          <p className="font-bold text-sm text-on-surface">Nilufar A.</p>
                          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Tarbiyachi</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-primary/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-white max-w-sm transform rotate-1 hover:rotate-0 transition-transform duration-500 relative border border-white/20">
                      <div className="absolute top-4 right-4 text-white/20">
                        <Users className="w-12 h-12" />
                      </div>
                      <h4 className="text-4xl font-extrabold mb-1 font-headline">100%</h4>
                      <p className="text-white/80 font-medium">Ma'lumotlar xavfsizligi kafolati va professional yondashuv.</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-6 md:px-8">
            <h2 className="text-4xl font-extrabold mb-12 text-center font-headline text-on-surface">{t("faqTitle")}</h2>
            <div className="space-y-4">
              {[
                { q: t("faq1Q"), a: t("faq1A") },
                { q: t("faq2Q"), a: t("faq2A") },
                { q: t("faq3Q"), a: t("faq3A") }
              ].map((faq, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/60 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <details className="group">
                    <summary className="w-full px-8 py-6 text-left flex justify-between items-center cursor-pointer list-none font-bold text-lg text-on-surface">
                      {faq.q}
                      <ChevronDown className="w-6 h-6 transition-transform group-open:rotate-180 text-primary" />
                    </summary>
                    <div className="px-8 pb-6 text-on-surface-variant leading-relaxed text-base italic">
                      {faq.a}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Final CTA */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-24">
          <div className="bg-primary rounded-[48px] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-primary-container/80 transition-all duration-700 group-hover:scale-105"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 font-headline leading-tight text-white">{t("finalCtaTitle")}</h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">{t("finalCtaSubtitle")}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
                <button 
                  onClick={() => navigate("/auth")}
                  className="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95"
                >
                  {t("registerNow")}
                </button>
                <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-bold text-lg transition-transform hover:scale-105 active:scale-95">
                  {t("contactUs")}
                </button>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-high w-full pt-20 pb-10 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1">
            <span className="text-2xl font-extrabold text-primary font-headline block mb-4 cursor-pointer" onClick={() => navigate("/")}>Ish-Top</span>
            <p className="text-on-surface-variant text-sm mb-8 leading-relaxed max-w-xs font-medium">{t("footerDesc")}</p>
            <div className="flex gap-4">
              {["facebook", "instagram", "send"].map(icon => (
                <div key={icon} className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <ExternalLink className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h5 className="font-bold text-on-surface text-lg">{t("platform")}</h5>
            <ul className="space-y-4">
              <li><button onClick={() => navigate("/vacancies")} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">{t("findJob")}</button></li>
              <li><button onClick={() => navigate("/workers")} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">{t("forKindergartens")}</button></li>
              <li><button className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">{t("searchOnMap")}</button></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="font-bold text-on-surface text-lg">{t("company")}</h5>
            <ul className="space-y-4">
              <li><button className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">{t("aboutUs")}</button></li>
              <li><button className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">{t("helpCenter")}</button></li>
              <li><button className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">{t("blog")}</button></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="font-bold text-on-surface text-lg">{t("legal")}</h5>
            <ul className="space-y-4">
              <li><button onClick={() => navigate("/privacy")} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">{t("privacyPolicy")}</button></li>
              <li><button onClick={() => navigate("/terms")} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">{t("termsOfUse")}</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-10 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center text-sm text-on-surface-variant font-medium gap-6">
          <span className="opacity-80">© 2026 Ish-Top Platform. {t("rightsReserved")}</span>
          <div className="flex gap-8 items-center">
            <span className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors py-2 px-3 bg-white rounded-lg shadow-sm" onClick={() => setIsLangOpen(!isLangOpen)}>
              <Globe className="w-4 h-4 text-primary" /> {languages.find(l => l.code === language)?.label}
            </span>
            <span className="flex items-center gap-2 py-2 px-3 bg-primary/5 text-primary rounded-lg">
              <CheckCircle2 className="w-4 h-4" /> {t("secureSystem")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}