// frontend/src/pages/CustomerPublicPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import { getPublicUser } from "../api/user";

// mismo helper que usamos en StoreProfilePage / CustomerProfilePage
const buildBg = (f = {}) => {
  if (f.bgMode === "solid") return { backgroundColor: f.bgColorTop || "#e1c0f6" };
  if (f.bgMode === "image" && f.bgImageUrl) {
    return {
      backgroundImage: `url(${f.bgImageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundColor: f.bgColorTop || "#e1c0f6",
    };
  }
  return {
    background: `linear-gradient(to bottom, ${
      f.bgColorTop || "#e1c0f6"
    } 0%, ${f.bgColorBottom || "#ffffff"} 100%)`,
  };
};

export default function CustomerPublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getPublicUser(id);
      setUser(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el perfil del usuario.");
    } finally {
      setLoading(false);
    }
  };

  const pageStyle = useMemo(
    () => buildBg(user || {}),
    [user?.bgMode, user?.bgColorTop, user?.bgColorBottom, user?.bgImageUrl]
  );

  const avatarSrc =
    user?.avatarUrl ||
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const primaryColor = user?.primaryColor || "#22c55e"; // botón "Contactar"
  const accentColor = user?.accentColor || "#0f172a";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Cargando perfil público..." />
        <p className="p-6 text-sm text-slate-500">Cargando información…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={pageStyle}>
        <MainHeader subtitle="Error al cargar" />
        <p className="p-6 text-sm text-red-600">No se pudo cargar el perfil del usuario.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen" style={pageStyle}>
        <MainHeader subtitle="Perfil no disponible" />
        <p className="p-6 text-sm text-slate-500">Este usuario no existe o fue eliminado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={pageStyle}>
      <MainHeader subtitle="Perfil de usuario" />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row gap-6">
          {/* Avatar + datos básicos */}
          <div className="flex flex-col items-center md:items-start md:w-1/3 gap-4">
            <img
              src={avatarSrc}
              alt={user.username || "Usuario"}
              className="w-24 h-24 rounded-full object-cover border border-slate-200"
            />
            <div className="text-center md:text-left space-y-1">
              <h1
                className="text-xl font-semibold"
                style={{ color: accentColor }}
              >
                {user.username || "Usuario sin nombre"}
              </h1>
              {user.email && (
                <p className="text-xs text-slate-500">{user.email}</p>
              )}
              {user.rut && (
                <p className="text-[11px] text-slate-500">RUT: {user.rut}</p>
              )}
              {user.address && (
                <p className="text-[11px] text-slate-500">{user.address}</p>
              )}
            </div>

            <button
              className="mt-2 inline-flex items-center px-4 py-2 rounded-full text-xs font-medium text-white shadow-sm"
              style={{ background: primaryColor }}
              onClick={() => {
                if (user.email) {
                  window.location.href = `mailto:${user.email}`;
                }
              }}
            >
              Contactar
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-1 text-[11px] text-slate-500 hover:underline"
            >
              Volver atrás
            </button>
          </div>

          {/* Bio + contenido */}
          <div className="md:w-2/3 space-y-4">
            <section>
              <h2 className="text-sm font-semibold text-slate-800 mb-1">
                Sobre este usuario
              </h2>
              <p className="text-sm text-slate-600 whitespace-pre-line">
                {user.bio ||
                  "Este usuario aún no ha agregado una biografía en su perfil."}
              </p>
            </section>

            {/* podrías agregar más secciones aquí, como sus tiendas, reseñas, etc. */}
          </div>
        </div>
      </main>
    </div>
  );
}
