// src/pages/DashboardPage.jsx
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    // la ruta protegida te enviará a /login al perder el user
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Bienvenido, {user?.username}</h1>
      <button onClick={onLogout}>Cerrar sesión</button>
    </div>
  );
}
