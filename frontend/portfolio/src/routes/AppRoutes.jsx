import { Routes, Route } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/dashboard/DashboardLayout";

// Public
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import BlogDetailPage from "../pages/BlogDetailPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import NotFoundPage from "../pages/NotFoundPage";

// Dashboard pages
import DashboardOverviewPage from "../pages/dashboard/DashboardOverviewPage";
import DashboardPostsPage from "../pages/dashboard/DashboardPostsPage";
import DashboardProjectsPage from "../pages/dashboard/DashboardProjectsPage";
import DashboardSkillsPage from "../pages/dashboard/DashboardSkillsPage";
import DashboardExperiencePage from "../pages/dashboard/DashboardExperiencePage";
import DashboardTaxonomyPage from "../pages/dashboard/DashboardTaxonomyPage";
import DashboardCommentsPage from "../pages/dashboard/DashboardCommentsPage";
import DashboardMessagesPage from "../pages/dashboard/DashboardMessagesPage";
import DashboardProfilePage from "../pages/dashboard/DashboardProfilePage";

export function AppRoutes() {
  return (
    <Routes>
      {/* ── Public layout ───────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        {/* ONE main page – all sections live here */}
        <Route path="/" element={<HomePage />} />

        {/* Detail views for deep linking / sharing */}
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />

        {/* Hidden login (never linked in the public UI – SPEC §0) */}
        <Route path="/login" element={<LoginPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* ── Protected dashboard (owner only) ─────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverviewPage />} />
        <Route path="posts" element={<DashboardPostsPage />} />
        <Route path="posts/new" element={<DashboardPostsPage />} />
        <Route path="posts/:slug/edit" element={<DashboardPostsPage />} />
        <Route path="projects" element={<DashboardProjectsPage />} />
        <Route path="skills" element={<DashboardSkillsPage />} />
        <Route path="experience" element={<DashboardExperiencePage />} />
        <Route path="taxonomy" element={<DashboardTaxonomyPage />} />
        <Route path="comments" element={<DashboardCommentsPage />} />
        <Route path="messages" element={<DashboardMessagesPage />} />
        <Route path="profile" element={<DashboardProfilePage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
