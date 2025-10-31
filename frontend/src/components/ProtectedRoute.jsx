import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loadingProfile } = useAuth();

  if (loadingProfile) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        Cargando…
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
