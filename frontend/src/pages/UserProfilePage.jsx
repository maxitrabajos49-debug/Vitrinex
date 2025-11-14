// src/pages/UserProfilePage.jsx
import { useEffect, useState } from "react";
import MainHeader from "../components/MainHeader";
import { getProfile, updateProfile, uploadAvatar } from "../api/user";
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "No se pudo actualizar el perfil."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setMsg("");
    setUploadingAvatar(true);

    try {
      const { data } = await uploadAvatar(file);
      setProfile((prev) => ({
        ...prev,
        avatarUrl: data.avatarUrl || prev.avatarUrl,
      }));
      setMsg("Imagen de perfil actualizada.");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "No se pudo subir la imagen de perfil."
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
       <div
  className="min-h-screen flex flex-col"
  style={{
    background: "linear-gradient(to bottom, #e1c0f6 0%, #ffffff 80%)",
  }}
>
      <MainHeader subtitle="Configura los datos de tu perfil" />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[2fr,1.5fr]">
        {/* Columna izquierda: formulario de perfil */}
        <section className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Datos de tu perfil
          </h2>

          {loading ? (
            <p className="text-sm text-slate-500">Cargando...</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
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
                <div className="h-16 w-16 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500 text-xl">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    profile.username?.[0]?.toUpperCase() || "U"
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Imagen de perfil (URL opcional)
                    </label>
                    <input
                      type="text"
                      name="avatarUrl"
                      value={profile.avatarUrl}
                      onChange={onChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="https://…"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      O sube una imagen
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="w-full text-sm"
                    />
                    {uploadingAvatar && (
                      <p className="text-xs text-slate-500 mt-1">
                        Subiendo imagen...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Nombre de usuario
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
                <label className="block text-sm font-medium text-slate-700">
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
                <label className="block text-sm font-medium text-slate-700">
                  Bio / descripción
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={onChange}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Cuéntale a tus clientes quién eres..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Columna derecha: resumen de tiendas */}
        <section className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Tus negocios en Vitrinex
          </h2>
          <p className="text-sm text-slate-500">
            Vista rápida de las tiendas que tienes creadas con esta cuenta.
          </p>

          {stores.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no tienes tiendas. Crea la primera desde <b>Mis negocios</b>.
            </p>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-auto pr-1">
              {stores.map((store) => (
                <article
                  key={store._id}
                  className="border rounded-xl px-3 py-3 flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden text-xs text-slate-500">
                    {store.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt={store.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      store.name?.[0]?.toUpperCase() || "T"
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-800">
                      {store.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {store.comuna || "Sin comuna"} ·{" "}
                      {store.tipoNegocio || "Tipo no especificado"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
