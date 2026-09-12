import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { Layout } from "@/components/layout/Layout";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HomePage, ProjectsPage, ProjectDetailPage, ExplorePage, NotFoundPage } from "@/pages";

// Admin is one person's tool behind a login, but it was shipping to every
// visitor in the same bundle as the portfolio. Lazy so the public site stops
// paying for it — this also keeps firebase/auth out of the first load.
const AdminLayout = lazy(() =>
  import("@/components/layout/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);
const AdminHomePage = lazy(() =>
  import("@/pages/admin/AdminHomePage").then((m) => ({ default: m.AdminHomePage })),
);
const AdminProjectsPage = lazy(() =>
  import("@/pages/admin/AdminProjectsPage").then((m) => ({ default: m.AdminProjectsPage })),
);
const AdminExplorePage = lazy(() =>
  import("@/pages/admin/AdminExplorePage").then((m) => ({ default: m.AdminExplorePage })),
);
const AdminNotesPage = lazy(() =>
  import("@/pages/admin/AdminNotesPage").then((m) => ({ default: m.AdminNotesPage })),
);
const AdminPlannerPage = lazy(() =>
  import("@/pages/admin/AdminPlannerPage").then((m) => ({ default: m.AdminPlannerPage })),
);

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
          <Route
            path="admin"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <AdminLayout />
              </Suspense>
            }
          >
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
