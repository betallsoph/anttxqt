import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { Layout } from "@/components/layout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { HomePage, ProjectsPage, ProjectDetailPage, ExplorePage, NotFoundPage } from "@/pages";
import { AdminHomePage, AdminProjectsPage, AdminExplorePage, AdminNotesPage, AdminPlannerPage } from "@/pages/admin";

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
          {/* key forces a remount so fetch state resets when switching collections */}
          <Route path="products" element={<ProjectsPage key="products" type="products" />} />
          <Route path="products/:id" element={<ProjectDetailPage type="products" />} />
          <Route path="projects" element={<ProjectsPage key="projects" type="projects" />} />
          <Route path="projects/:id" element={<ProjectDetailPage type="projects" />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/home" replace />} />
            <Route path="home" element={<AdminHomePage />} />
            <Route path="products" element={<AdminProjectsPage type="products" />} />
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
