// src/components/MainHeader.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MainHeader({ subtitle }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Vitrinex</h1>
          {subtitle && (
            <span className="text-sm text-slate-500">{subtitle}</span>
          )}
        </div>

        {/* Zona derecha: login o ajustes */}
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
              {/* Indicador sesión iniciada */}
              <button
                type="button"
                className="bg-green-50 text-green-700 border border-green-200 text-xs md:text-sm font-medium rounded-lg px-3 py-2 cursor-default flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {user?.username || "Sesión iniciada"}
              </button>

              {/* Botón Ajustes + menú */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((prev) => !prev)}
                  className="border border-slate-300 text-slate-700 text-xs md:text-sm rounded-lg px-3 py-2 hover:bg-slate-50 flex items-center gap-1"
                >
                  Ajustes
                  <span className="text-[10px]">▼</span>
                </button>

                {openMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg text-sm z-20">
                    <Link
                      to="/onboarding"
                      onClick={() => setOpenMenu(false)}
                      className="block w-full text-left px-3 py-2 hover:bg-slate-50"
                    >
                      Ver / editar mis tiendas
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
