// src/pages/UserProfilePage.jsx
import { useEffect, useState } from "react";
import MainHeader from "../components/MainHeader";
import { getProfile, updateProfile } from "../api/user";
import { listMyStores } from "../api/store";

export default function UserProfilePage() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    avatarUrl: "",
    bio: "",
  });

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");

      const [pRes, sRes] = await Promise.all([
        getProfile(),
        listMyStores().catch(() => ({ data: [] })),
      ]);

      const p = pRes.data || {};
      setProfile({
        username: p.username || "",
        email: p.email || "",
        avatarUrl: p.avatarUrl || "",
        bio: p.bio || "",
      });

      const storesData = Array.isArray(sRes.data)
        ? sRes.data
        : sRes.data
        ? [sRes.data]
        : [];
      setStores(storesData);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar tu información.");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setSaving(true);

    try {
      const { username, email, avatarUrl, bio } = profile;
      const { data } = await updateProfile({
        username,
        email,
        avatarUrl,
        bio,
      });

      setProfile((prev) => ({
        ...prev,
        username: data.username,
        email: data.email,
        avatarUrl: data.avatarUrl || "",
        bio: data.bio || "",
      }));

      setMsg("Perfil actualizado correctamente.");
      // Si quieres que el header se actualice al tiro:
      // setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "No se pudo actualizar el perfil."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <MainHeader subtitle="Configura los datos de tu perfil" />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[2fr,1.5fr]">
        {/* Columna izquierda: formulario de perfil */}
        <section className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Datos de tu perfil
          </h2>

          {loading ? (
            <p className="text-sm text-slate-500">Cargando…</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4 text-sm">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              {msg && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {msg}
                </p>
              )}

              <div className="flex items-center gap-4">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xl font-semibold">
                    {profile.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}

                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    URL de imagen de perfil
                  </label>
                  <input
                    name="avatarUrl"
                    value={profile.avatarUrl}
                    onChange={onChange}
                    placeholder="https://…"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Puedes pegar aquí una URL de imagen (por ejemplo,
                    subida a Cloudinary o similar).
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nombre
                </label>
                <input
                  name="username"
                  value={profile.username}
                  onChange={onChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={onChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Descripción / bio
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={onChange}
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Cuenta algo sobre ti, qué tipo de negocios manejas, experiencia, etc."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {saving ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Columna derecha: negocios del usuario */}
        <section className="space-y-3">
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              Mis negocios
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Estos son los negocios que tienes registrados en Vitrinex.
              Puedes gestionarlos desde la sección “Mis tiendas”.
            </p>

            {loading ? (
              <p className="text-sm text-slate-500">Cargando negocios…</p>
            ) : stores.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aún no tienes negocios registrados. Puedes crear tu primera
                tienda desde <span className="font-medium">Mis tiendas</span>.
              </p>
            ) : (
              <div className="space-y-2">
                {stores.map((store) => (
                  <article
                    key={store._id}
                    className="border rounded-xl px-3 py-2 text-sm flex flex-col gap-0.5"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-slate-800">
                        {store.name}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                        {store.mode === "bookings"
                          ? "Agendamiento"
                          : "Productos"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {store.comuna || "Sin comuna"} ·{" "}
                      {store.tipoNegocio || "Tipo no especificado"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
