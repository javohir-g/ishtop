import { IconSettings, IconMail, IconPhone, IconMapPin, IconBriefcase, IconSchool, IconFolder, IconAward } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useEffect, useCallback } from "react";
import { useTranslation } from "@/app/i18n/useTranslation";
import { useApi } from "@/hooks/useApi";
import api from "@/services/api";

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

interface JobSeekerProfileData {
  full_name: string;
  photo_url?: string;
  bio?: string;
  phone?: string;
  district?: string;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  desired_position?: string;
  desired_salary?: string;
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

  if (loading) return <div className="text-center py-20">Загрузка профиля...</div>;
  if (error) return <div className="text-center py-20 text-red-500 uppercase font-bold">{error}</div>;
  if (!data) return <div className="text-center py-20">Профиль не найден</div>;

  const isEmployer = 'employer' in data;

  if (isEmployer) {
    const employerData = data as EmployerProfileData;
    return (
      <div className="bg-white min-h-screen pb-24 lg:pb-8">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between lg:px-8 lg:pt-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("profile")}</h1>
            <p className="text-gray-600 mt-1 hidden lg:block">Профиль представителя организации</p>
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
              <p className="text-sm text-gray-600">{employerData.employer.position || "Представитель"}</p>
              <p className="text-sm text-gray-500">{employerData.kindergarten.name}</p>
            </div>
            <button onClick={() => navigate("/kindergarten/profile/edit")} className="text-blue-600 font-medium">Изм.</button>
          </div>

          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">Организация</h3>
            <div className="border border-gray-100 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                   <IconMapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-900">{employerData.kindergarten.name}</p>
                   <p className="text-xs text-gray-500">{employerData.kindergarten.address || "Адрес не указан"}</p>
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
      <div className="px-5 pt-6 pb-4 flex items-center justify-between lg:px-8 lg:pt-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("profile")}</h1>
          <p className="text-gray-600 mt-1 hidden lg:block">{t("professionalProfile")}</p>
        </div>
        <button onClick={() => navigate("/app/settings")} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <IconSettings className="w-6 h-6 text-gray-900" stroke={2} />
        </button>
      </div>

      <div className="px-5 lg:px-8">
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
            <p className="text-sm text-gray-600">{profile.desired_position || "Воспитатель"}</p>
            <p className="text-sm text-gray-500">{profile.district || "Ташкент"}</p>
          </div>
          <button onClick={() => navigate("/app/profile/edit")} className="text-blue-600 font-medium">Изм.</button>
        </div>

        {/* Contact Info */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">{t("contact_information")}</h3>
          <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
            {profile.phone && (
              <div className="flex items-center gap-3">
                <IconPhone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Телефон</p>
                  <p className="text-sm text-gray-900">{profile.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <IconMapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Район</p>
                <p className="text-sm text-gray-900">{profile.district || "Не указан"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Experience */}
        {profile.experience?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">{t("work_experience")}</h3>
            <div className="space-y-3">
              {profile.experience.map(exp => (
                <div key={exp.id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <IconBriefcase className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{exp.position}</p>
                      <p className="text-sm text-gray-600">{exp.company_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(exp.start_date).getFullYear()} - {exp.is_current ? "Наст. время" : (exp.end_date ? new Date(exp.end_date).getFullYear() : "")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">{t("skills")}</h3>
            <div className="border border-gray-100 rounded-2xl p-4 flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill.id} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm border border-blue-100">
                  {skill.skill_name}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}