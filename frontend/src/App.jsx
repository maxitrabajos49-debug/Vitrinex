import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Páginas
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StoreProfilePage from "./pages/StoreProfilePage";
import StorePublicPage from "./pages/StorePublic";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import CustomerPublicPage from "./pages/CustomerPublicPage";
import ExploreStoresPage from "./pages/ExploreStoresPage";
import OnboardingPage from "./pages/OnboardingPage";

// Ruta protegida
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <div className="text-center py-10 text-slate-600 font-medium">
        Cargando sesión...
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Home = Mapa */}
      <Route path="/" element={<ExploreStoresPage />} />
      <Route path="/explorar" element={<ExploreStoresPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Cliente (privado y público) */}
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <CustomerProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/usuario/:id" element={<CustomerPublicPage />} />

      {/* Negocios (sin cambios) */}
      <Route
        path="/negocio/:id"
        element={
          <ProtectedRoute>
            <StoreProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/tienda/:id" element={<StorePublicPage />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
