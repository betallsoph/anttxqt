import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { Layout } from "@/components/layout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { HomePage, ProjectsPage, ProjectDetailPage, ExplorePage, NotFoundPage } from "@/pages";
import { AdminHomePage, AdminProjectsPage, AdminExplorePage } from "@/pages/admin";

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
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/home" replace />} />
            <Route path="home" element={<AdminHomePage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="explore" element={<AdminExplorePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
