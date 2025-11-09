// src/App.jsx
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import TaskFormPage from "./pages/TaskFormPage";
import OnboardingPage from "./pages/OnboardingPage";
import ExploreStoresPage from "./pages/ExploreStoresPage";
import UserProfilePage from "./pages/UserProfilePage";
import StorePublicPage from "./pages/StorePublic";
import StoreProfilePage from "./pages/StoreProfilePage";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

export default function App() {
  return (
    <Routes>
      {/* Home pública */}
      <Route path="/" element={<ExploreStoresPage />} />

      {/* Página pública de tienda */}
      <Route path="/tienda/:id" element={<StorePublicPage />} />

      {/* Auth pública */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        {/* Panel interno con Layout (dashboard, tareas) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/new" element={<TaskFormPage />} />
          <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
        </Route>

        {/* Rutas con MainHeader */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/perfil" element={<UserProfilePage />} />
        <Route path="/negocio/:id" element={<StoreProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<h1>404 — Página no encontrada</h1>} />
    </Routes>
  );
}
