import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { Root } from "./Root";
import { Home } from "./pages/Home";
import { SavedJobs } from "./pages/SavedJobs";
import { Applications } from "./pages/Applications";
import { Messages } from "./pages/Messages";
import { Profile } from "./pages/Profile";
import { Landing } from "./pages/Landing";
import { Vacancies } from "./pages/Vacancies";
import { Workers } from "./pages/Workers";
import { Auth } from "./pages/Auth";
import { OnboardingRole } from "./pages/OnboardingRole";
import { KindergartenProfile } from "./pages/KindergartenProfile";
import { KindergartenVacancies } from "./pages/KindergartenVacancies";
import { KindergartenVacancyForm } from "./pages/KindergartenVacancyForm";
import { KindergartenApplications } from "./pages/KindergartenApplications";
import { KindergartenHome } from "./pages/KindergartenHome";
import { KindergartenMessages } from "./pages/KindergartenMessages";
import { KindergartenSettings } from "./pages/KindergartenSettings";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NotFound } from "./pages/NotFound";
import { JobDetail } from "./pages/JobDetail";
import { FilterOptions } from "./pages/FilterOptions";
import { Settings } from "./pages/Settings";
import { ChatDetail } from "./pages/ChatDetail";
import { LanguageSettings } from "./pages/LanguageSettings";
import { ContactInformation } from "./pages/ContactInformation";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { InviteFriends } from "./pages/InviteFriends";
import { CandidateDetail } from "./pages/CandidateDetail";
import { ApplicationDetail } from "./pages/ApplicationDetail";
import { KindergartenApplicationDetail } from "./pages/KindergartenApplicationDetail";
import { EditProfile } from "./pages/EditProfile";
import { KindergartenEditProfile } from "./pages/KindergartenEditProfile";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminKindergartens } from "./pages/admin/AdminKindergartens";
import { AdminVacancies } from "./pages/admin/AdminVacancies";
import { AdminSettings } from "./pages/admin/AdminSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: ErrorBoundary,
    children: [
      {
        index: true,
        Component: Landing,
      },
      {
        path: "vacancies",
        Component: Vacancies,
      },
      {
        path: "workers",
        Component: Workers,
      },
      {
        path: "auth",
        Component: Auth,
      },
      {
        path: "terms",
        Component: Terms,
      },
      {
        path: "privacy",
        Component: Privacy,
      },
      {
        path: "onboarding/role",
        Component: OnboardingRole,
      },
      {
        path: "job/:id",
        Component: JobDetail,
      },
      {
        path: "filter",
        Component: FilterOptions,
      },
      {
        path: "app",
        Component: Root,
        children: [
          { 
            index: true, 
            Component: Home,
          },
          { 
            path: "saved-jobs", 
            Component: SavedJobs,
          },
          { 
            path: "applications", 
            Component: Applications,
          },
          { 
            path: "applications/:id", 
            Component: ApplicationDetail,
          },
          { 
            path: "messages", 
            Component: Messages,
          },
          { 
            path: "messages/:id", 
            Component: ChatDetail,
          },
          { 
            path: "profile", 
            Component: Profile,
          },
          { 
            path: "profile/edit", 
            Component: EditProfile,
          },
          { 
            path: "profile/contact", 
            Component: ContactInformation,
          }, 
          { 
            path: "settings", 
            Component: Settings,
          },
          { 
            path: "settings/language", 
            Component: LanguageSettings,
          },
          { 
            path: "invite-friends", 
            Component: InviteFriends,
          },
        ],
      },
      {
        path: "kindergarten",
        Component: Root,
        children: [
          { 
            index: true, 
            Component: KindergartenHome,
          },
          { 
            path: "profile", 
            Component: KindergartenProfile,
          },
          { 
            path: "vacancies", 
            Component: KindergartenVacancies,
          },
          { 
            path: "vacancies/new", 
            Component: KindergartenVacancyForm,
          },
          { 
            path: "vacancies/:id/edit", 
            Component: KindergartenVacancyForm,
          },
          { 
            path: "applications", 
            Component: KindergartenApplications,
          },
          { 
            path: "messages", 
            Component: KindergartenMessages,
          },
          { 
            path: "messages/:id", 
            Component: ChatDetail,
          },
          { 
            path: "settings", 
            Component: KindergartenSettings,
          },
          { 
            path: "candidate/:id", 
            Component: CandidateDetail,
          },
          { 
            path: "application/:id", 
            Component: KindergartenApplicationDetail,
          },
          { 
            path: "profile/edit", 
            Component: KindergartenEditProfile,
          },
        ],
      },
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          {
            index: true,
            Component: AdminDashboard,
          },
          {
            path: "users",
            Component: AdminUsers,
          },
          {
            path: "kindergartens",
            Component: AdminKindergartens,
          },
          {
            path: "vacancies",
            Component: AdminVacancies,
          },
          {
            path: "settings",
            Component: AdminSettings,
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);