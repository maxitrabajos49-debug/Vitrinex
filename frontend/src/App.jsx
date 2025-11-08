// frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import TaskFormPage from "./pages/TaskFormPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import ExploreStoresPage from "./pages/ExploreStoresPage";

export default function App() {
  return (
    <Routes>
      {/* Home pública: mapa + filtros + lista de negocios */}
      <Route path="/" element={<ExploreStoresPage />} />

      {/* Auth pública */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas protegidas con layout (panel interno) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/new" element={<TaskFormPage />} />
          <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
        </Route>

        {/* Rutas protegidas SIN layout principal */}
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<h1>404 — Página no encontrada</h1>} />
    </Routes>
  );
}
