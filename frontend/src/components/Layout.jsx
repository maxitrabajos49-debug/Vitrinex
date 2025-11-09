// src/components/Layout.jsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white flex justify-between items-center px-6 py-3">
        <Link to="/dashboard" className="font-bold text-lg">
          Vitrinex
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="hover:underline">
            Inicio
          </Link>
          <Link to="/tasks" className="hover:underline">
            Tareas
          </Link>
          <Link to="/onboarding" className="hover:underline">
            Mis negocios
          </Link>

          <div className="relative group">
            <button className="hover:underline">⚙️ Ajustes</button>
            <div className="hidden group-hover:block absolute right-0 bg-white text-gray-900 mt-2 rounded shadow-md w-44 z-10">
              <Link
                to="/perfil"
                className="block px-4 py-2 hover:bg-gray-100 border-b text-sm"
              >
                Editar perfil
              </Link>
              <Link
                to="/negocio"
                className="block px-4 py-2 hover:bg-gray-100 border-b text-sm"
              >
                Editar negocio
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Contenido */}
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
