import { IconSettings, IconMail, IconPhone, IconMapPin, IconBriefcase, IconSchool, IconFolder, IconAward, IconHeart, IconBook, IconStar, IconTarget, IconBuilding, IconWorld, IconBolt, IconLink, IconUsers, IconFile } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useEffect, useCallback } from "react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";
import { ProfileSkeleton } from "../components/Skeleton";
import { IconPlus } from "@tabler/icons-react";

interface Skill {
  id: number;
  skill_name: string;
}

interface Education {
  id: number;
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  is_current: boolean;
}

interface Experience {
  id: number;
  position: string;
  company_name: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

interface Language {
  name: string;
  level: string;
}

interface Project {
  title: string;
  description: string;
}

interface Certificate {
  name: string;
  organization: string;
  year: string | number;
}

interface JobSeekerProfileData {
  full_name: string;
  photo_url?: string;
  bio?: string;
  phone?: string;
  email?: string;
  district?: string;
  address?: string;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  desired_position?: string;
  desired_salary?: string;
  languages?: LanguageRecord[];
  certificates?: CertificateRecord[];
  has_medical_book: boolean;
  medical_book_expires_at?: string;
}

interface LanguageRecord {
  id: number;
  language_name: string;
  level: string;
}

interface CertificateRecord {
  id: number;
  name: string;
  organization: string;
  issue_date?: string;
  expiration_date?: string;
}

interface EmployerProfileData {
  employer: {
    full_name: string;
    position?: string;
    photo_url?: string;
  };
  kindergarten: {
    name: string;
    address?: string;
    description?: string;
    logo_url?: string;
    phone?: string;
  };
}

export function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchFunc = useCallback(() => api.get("/profile"), []);
  const { data, loading, error, execute: fetchProfile } = useApi<JobSeekerProfileData | EmployerProfileData>(fetchFunc);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <ProfileSkeleton />;
  if (error) return <div className="text-center py-20 text-red-500 uppercase font-bold">{error}</div>;
  if (!data) return <div className="text-center py-20">{t('not_found')}</div>;

  const isEmployer = 'employer' in data;

  if (isEmployer) {
    const employerData = data as EmployerProfileData;
    return (
      <div className="bg-white min-h-screen pb-24 lg:pb-8">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between lg:px-8 lg:pt-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("profile")}</h1>
            <p className="text-gray-600 mt-1 hidden lg:block">{t('representative_profile')}</p>
          </div>
          <button onClick={() => navigate("/app/settings")} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <IconSettings className="w-6 h-6 text-gray-900" stroke={2} />
          </button>
        </div>

        <div className="px-5 lg:px-8">
          <div className="border border-gray-100 rounded-2xl p-4 mb-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
              {employerData.employer.photo_url ? (
                <img src={employerData.employer.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-600 font-bold text-xl">{employerData.employer.full_name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{employerData.employer.full_name}</h2>
              <p className="text-sm text-gray-600">{employerData.employer.position || t('representative')}</p>
              <p className="text-sm text-gray-500">{employerData.kindergarten.name}</p>
            </div>
            <button onClick={() => navigate("/kindergarten/profile/edit")} className="text-blue-600 font-medium">{t('save')}</button>
          </div>

          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">{t('organization')}</h3>
            <div className="border border-gray-100 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                   <IconMapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-900">{employerData.kindergarten.name}</p>
                   <p className="text-xs text-gray-500">{employerData.kindergarten.address || t('not_specified')}</p>
                </div>
              </div>
              {employerData.kindergarten.description && (
                <p className="text-sm text-gray-600">{employerData.kindergarten.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Job Seeker Profile
  const profile = data as JobSeekerProfileData;

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-8">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between lg:px-8 lg:pt-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("profile")}</h1>
          <p className="text-gray-600 mt-1 hidden lg:block">{t("professionalProfile")}</p>
        </div>
        <button
          onClick={() => navigate("/app/settings")}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <IconSettings className="w-6 h-6 text-gray-900" stroke={2} />
        </button>
      </div>

      <div className="px-5 lg:px-8">
        {/* Profile Header Card */}
        <div className="border border-gray-100 rounded-2xl p-4 mb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-600 font-bold text-xl">{profile.full_name?.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
            <p className="text-sm text-gray-600">{profile.desired_position || t("teacher")}</p>
            <p className="text-sm text-gray-500">{profile.district || "Ташкент"}</p>
          </div>
          <button 
            onClick={() => navigate("/app/profile/edit")}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="#2563EB"/>
            </svg>
          </button>
        </div>

        {/* Contact Information Section */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">{t("contact_information")}</h3>
          <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <IconMail className="w-5 h-5 text-blue-600" stroke={2} />
              <div>
                <p className="text-xs text-gray-500">{t('email')}</p>
                <p className="text-sm text-gray-900">{profile.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IconPhone className="w-5 h-5 text-blue-600" stroke={2} />
              <div>
                <p className="text-xs text-gray-500">{t('phone')}</p>
                <p className="text-sm text-gray-900">{profile.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IconMapPin className="w-5 h-5 text-blue-600" stroke={2} />
              <div>
                <p className="text-xs text-gray-500">{t('address')}</p>
                <p className="text-sm text-gray-900">{profile.district ? `${profile.district}${profile.address ? ', ' + profile.address : ''}` : (profile.address || "—")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Book Section */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">{t("medical_book")}</h3>
          <div className="border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconStar className={`w-5 h-5 ${profile.has_medical_book ? 'text-green-500' : 'text-gray-300'}`} stroke={2} />
                <span className="text-sm text-gray-900">{profile.has_medical_book ? t('verified') : t('not_specified')}</span>
              </div>
              {profile.has_medical_book && profile.medical_book_expires_at && (
                <span className="text-xs text-gray-500">{t('medical_book_expires')}: {profile.medical_book_expires_at}</span>
              )}
            </div>
          </div>
        </div>

        {/* Опыт работы Section */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">{t("work_experience")}</h3>
          <div className="space-y-3">
            {profile.experience && profile.experience.length > 0 ? (
              profile.experience.map(exp => (
                <div key={exp.id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <IconBriefcase className="w-5 h-5 text-blue-600" stroke={2} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{exp.position}</p>
                      <p className="text-sm text-gray-600">{exp.company_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(exp.start_date).getFullYear()} - {exp.is_current ? t('present') : (exp.end_date ? new Date(exp.end_date).getFullYear() : "")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <button 
                onClick={() => navigate("/app/profile/edit")}
                className="w-full border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <IconPlus className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">{t('work_experience')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Образование Section */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">{t("education")}</h3>
          <div className="space-y-3">
            {profile.education && profile.education.length > 0 ? (
              profile.education.map(edu => (
                <div key={edu.id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <IconSchool className="w-5 h-5 text-blue-600" stroke={2} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{edu.degree || edu.field_of_study}</p>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-500">
                        {edu.start_year} - {edu.is_current ? t('present') : edu.end_year}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <button 
                onClick={() => navigate("/app/profile/edit")}
                className="w-full border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <IconPlus className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">{t('education')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Desired Salary Section */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">{t("desired_salary")}</h3>
          <div className="border border-gray-100 rounded-2xl p-4">
            <p className="text-sm text-gray-900">{profile.desired_salary || "—"}</p>
          </div>
        </div>

        {/* Навыки Section */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">{t("skills")}</h3>
          <div className="border border-gray-100 rounded-2xl p-4">
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map(skill => (
                  <span key={skill.id} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm border border-blue-100">
                    {skill.skill_name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Языки Section */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">{t("languages")}</h3>
          <div className="border border-gray-100 rounded-2xl p-4 space-y-2">
            {profile.languages && profile.languages.length > 0 ? (
              profile.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">{lang.language_name}</span>
                  <span className="text-xs text-gray-500">{lang.level}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">—</p>
            )}
          </div>
        </div>

        {/* Проекты Section */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">{t("projects")}</h3>
          <div className="space-y-3">
            {profile.projects && profile.projects.length > 0 ? (
              profile.projects.map((project, idx) => (
                <div key={idx} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <IconFolder className="w-5 h-5 text-blue-600" stroke={2} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{project.title}</p>
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-gray-100 rounded-2xl p-4 text-center text-sm text-gray-500">
                —
              </div>
            )}
          </div>
        </div>

        {/* Сертификаты Section */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">{t("certificates_licenses")}</h3>
          <div className="space-y-3">
            {profile.certificates && profile.certificates.length > 0 ? (
              profile.certificates.map((cert, idx) => (
                <div key={idx} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <IconAward className="w-5 h-5 text-blue-600" stroke={2} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{cert.name}</p>
                      <p className="text-sm text-gray-600">{cert.organization}</p>
                      <p className="text-xs text-gray-500">{cert.year}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-gray-100 rounded-2xl p-4 text-center text-sm text-gray-500">
                —
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}