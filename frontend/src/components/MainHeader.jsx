// src/components/MainHeader.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MainHeader({ subtitle }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header
      className="shadow-lg border-b transition-all duration-300"
      style={{
        background: "linear-gradient(90deg, #e1c0f6 0%, #f0e2fb 100%)", // 💜 tono lavanda con degradado suave
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center">
            <img
              src="/logo-vitrinex.png"
              alt="Vitrinex"
              className="h-24 w-auto object-contain drop-shadow-lg transition-transform duration-300 hover:scale-105"
            />
          </Link>

          {subtitle && (
            <span className="text-base md:text-lg font-semibold text-violet-800 tracking-wide">
              {subtitle}
            </span>
          )}
        </div>

        {/* Panel derecho */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 text-sm">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-white/90 text-violet-700 font-medium hover:bg-white transition"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-violet-700 text-white font-medium hover:bg-violet-800 transition"
              >
                Crear cuenta
              </Link>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-white/90 hover:bg-white transition"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="h-9 w-9 rounded-full bg-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-violet-800 font-medium">{user?.username}</span>
              </button>

              {/* Menú desplegable */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((prev) => !prev)}
                  className="border border-violet-300 text-violet-800 rounded-lg px-3 py-2 bg-white/50 hover:bg-white/70 flex items-center gap-1 text-sm"
                >
                  Ajustes
                  <span className="text-[10px]">▼</span>
                </button>

                {openMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-violet-200 rounded-lg shadow-lg text-sm z-20">
                    <Link
                      to="/perfil"
                      onClick={() => setOpenMenu(false)}
                      className="block w-full text-left px-3 py-2 hover:bg-violet-50 border-b"
                    >
                      Editar perfil
                    </Link>
                    <Link
                      to="/onboarding"
                      onClick={() => setOpenMenu(false)}
                      className="block w-full text-left px-3 py-2 hover:bg-violet-50"
                    >
                      Mis tiendas
                    </Link>
                    <button
                      onClick={() => {
                        setOpenMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 border-t"
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
