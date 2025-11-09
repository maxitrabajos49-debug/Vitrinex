import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MainHeader({ subtitle }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } finally {
      setOpenMenu(false);
    }
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO → vuelve al inicio */}
        <div
          className="cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          <h1 className="text-xl font-bold text-slate-800 hover:text-blue-600 transition">
            Vitrinex
          </h1>
          {subtitle && (
            <span className="text-sm text-slate-500">{subtitle}</span>
          )}
        </div>

        {/* DERECHA: sesión y menú */}
        <div className="flex items-center gap-3 relative">
          {!isAuthenticated && (
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition"
            >
              Iniciar sesión
            </Link>
          )}

          {isAuthenticated && (
            <>
              {/* Avatar + nombre */}
              <div className="flex items-center gap-2">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700">
                  {user?.username}
                </span>
              </div>

              {/* Botón Ajustes + menú */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((prev) => !prev)}
                  className="border border-slate-300 text-slate-700 text-xs md:text-sm rounded-lg px-3 py-2 hover:bg-slate-50 flex items-center gap-1"
                >
                  <span>Ajustes</span>
                  <span className="text-xs">▾</span>
                </button>

                {openMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg text-sm z-20">
                    <Link
                      to="/perfil"
                      onClick={() => setOpenMenu(false)}
                      className="block px-4 py-2 hover:bg-slate-50 border-b"
                    >
                      Editar perfil
                    </Link>
                    <Link
                      to="/onboarding"
                      onClick={() => setOpenMenu(false)}
                      className="block px-4 py-2 hover:bg-slate-50 border-b"
                    >
                      Ver / editar mis tiendas
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
