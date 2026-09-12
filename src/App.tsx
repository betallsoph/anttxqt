import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { Layout } from "@/components/layout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { HomePage, ProjectsPage, ProjectDetailPage, ExplorePage, NotFoundPage } from "@/pages";
import { AdminHomePage, AdminProjectsPage, AdminExplorePage, AdminNotesPage, AdminPlannerPage } from "@/pages/admin";

function LegacyProductRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/playground/${id}` : "/playground"} replace />;
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out",
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="playground" element={<ProjectsPage type="playground" />} />
          <Route path="playground/:id" element={<ProjectDetailPage type="playground" />} />
          <Route path="products" element={<Navigate to="/playground" replace />} />
          <Route path="products/:id" element={<LegacyProductRedirect />} />
          <Route path="projects" element={<ProjectsPage type="projects" />} />
          <Route path="projects/:id" element={<ProjectDetailPage type="projects" />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/home" replace />} />
            <Route path="home" element={<AdminHomePage />} />
            <Route path="playground" element={<AdminProjectsPage type="playground" />} />
            <Route path="products" element={<Navigate to="/admin/playground" replace />} />
            <Route path="projects" element={<AdminProjectsPage type="projects" />} />
            <Route path="explore" element={<AdminExplorePage />} />
            <Route path="notes" element={<AdminNotesPage />} />
            <Route path="planner" element={<AdminPlannerPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
