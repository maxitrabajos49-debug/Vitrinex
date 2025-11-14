// src/components/MainHeader.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Props:
 *  - subtitle: texto a la derecha del logo
 *  - variant: "vitrinex" (por defecto) | "store"
 *  - headerStyle: estilos extra para el fondo (se usan en variant="store")
 *  - logoSrc: logo opcional (para tiendas). Si no se pasa, usa el logo de Vitrinex.
 */
export default function MainHeader({
  subtitle,
  variant = "vitrinex",
  headerStyle,
  logoSrc,
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);

  const isStore = variant === "store";

  // Fondo por defecto de Vitrinex
  const vitrInexStyle = {
    background: "linear-gradient(90deg, #f3e8ff 0%, #e9d5ff 40%, #ddd6fe 100%)",
  };

  // Fondo por defecto para tiendas (si no se pasa headerStyle)
  const defaultStoreStyle = {
    backgroundImage:
      "linear-gradient(90deg, #0f172a 0%, #1d4ed8 50%, #0f172a 100%)",
  };

  const finalStyle = isStore
    ? { ...(defaultStoreStyle || {}), ...(headerStyle || {}) }
    : vitrInexStyle;

  const finalLogoSrc = logoSrc || "/logo-vitrinex.png";

  const logoClassName = isStore
    ? "h-14 w-14 rounded-xl object-cover bg-white shadow-md border border-slate-200"
    : "h-24 w-auto object-contain drop-shadow-lg";

  return (
    <header
      className="shadow-lg border-b transition-all duration-300"
      style={finalStyle}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + subtítulo */}
        <div className="flex items-center gap-5">
          <Link to={isStore ? "/" : "/"} className="flex items-center">
            <img
              src={finalLogoSrc}
              alt={isStore ? "Logo del negocio" : "Vitrinex"}
              className={logoClassName}
            />
          </Link>

          {subtitle && (
            <span
              className={`text-base md:text-lg font-semibold ${
                isStore ? "text-white" : "text-violet-800"
              } tracking-wide`}
            >
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
                <span className="text-slate-800 font-medium">
                  {user?.username}
                </span>
              </button>

              {/* Menú desplegable */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((prev) => !prev)}
                  className="border border-violet-300 text-slate-800 rounded-lg px-3 py-2 bg-white/70 hover:bg-white flex items-center gap-1 text-sm"
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
