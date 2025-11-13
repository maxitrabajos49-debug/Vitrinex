// frontend/src/pages/CustomerProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import { getProfile, updateProfile } from "../api/user";
import { listMyStores } from "../api/store";

// mismo helper de StoreProfilePage para el PREVIEW
const buildBg = (f) => {
  if (f.bgMode === "solid") return { backgroundColor: f.bgColorTop };
  if (f.bgMode === "image" && f.bgImageUrl) {
    return {
      backgroundImage: `url(${f.bgImageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundColor: f.bgColorTop,
    };
  }
  return {
    background: `linear-gradient(to bottom, ${f.bgColorTop} 0%, ${f.bgColorBottom} 100%)`,
  };
};

export default function CustomerProfilePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    rut: "",
    phone: "",
    address: "",
    bio: "",
    avatarUrl: "",

    primaryColor: "#2563eb",
    accentColor: "#0f172a",

    bgMode: "gradient",
    bgColorTop: "#e8d7ff",
    bgColorBottom: "#ffffff",
    bgPattern: "none",
    bgImageUrl: "",
  });

  const [userData, setUserData] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("perfil");

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapUserToForm = (u) => ({
    username: u?.username || "",
    email: u?.email || "",
    rut: u?.rut || "",
    phone: u?.phone || "",
    address: u?.address || "",
    bio: u?.bio || "",
    avatarUrl: u?.avatarUrl || "",

    primaryColor: u?.primaryColor || "#2563eb",
    accentColor: u?.accentColor || "#0f172a",

    bgMode: u?.bgMode || "gradient",
    bgColorTop: u?.bgColorTop || "#e8d7ff",
    bgColorBottom: u?.bgColorBottom || "#ffffff",
    bgPattern: u?.bgPattern || "none",
    bgImageUrl: u?.bgImageUrl || "",
  });

  const loadUser = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getProfile();
      setUserData(data);
      setForm(mapUserToForm(data));

      const storesRes = await listMyStores();
      setStores(storesRes.data || []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información del perfil.");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
    setMsg("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setSaving(true);

    try {
      const payload = { ...form };
      await updateProfile(payload);
      await loadUser();
      setMsg("Perfil actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setError("Error al guardar los cambios del perfil.");
    } finally {
      setSaving(false);
    }
  };

  // 🎨 Estilo para el PREVIEW, NO para todo el fondo
  const previewStyle = useMemo(
    () => buildBg(form),
    [form.bgMode, form.bgColorTop, form.bgColorBottom, form.bgImageUrl]
  );

  // 🎨 Estilo oficial Vitrinex para la página
  const pageBackgroundStyle = {
    background:
      "radial-gradient(circle at top, #f4e6ff 0%, #f6edff 30%, #ffffff 70%)",
  };

  const userId = userData?._id || userData?.id;
  const publicUrl = userId
    ? `${window.location.origin}/usuario/${userId}`
    : "";

  const avatarSrc =
    form.avatarUrl ||
    userData?.avatarUrl ||
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Cargando perfil..." />
        <p className="p-6 text-sm text-slate-500">Cargando información…</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={pageBackgroundStyle} // 🔹 Fondo fijo Vitrinex
    >
      <MainHeader subtitle="Editar perfil de usuario" />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[260px,minmax(0,1.8fr)] items-start">
          {/* Sidebar */}
          <aside className="bg-white/95 border border-violet-100 rounded-2xl shadow-md p-4 space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={form.username || "Usuario"}
                  className="w-20 h-20 rounded-full object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-lg font-semibold">
                  {form.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-800">
                  {form.username || "Tu nombre"}
                </h2>
                <p className="text-xs text-slate-500">
                  {form.email || "Correo no definido"}
                </p>
                {form.rut && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                    {form.rut}
                  </span>
                )}
              </div>
            </div>

            {userId && (
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/usuario/${userId}`)}
                  className="w-full bg-slate-900 text-white text-xs md:text-sm px-3 py-2 rounded-lg hover:bg-slate-800"
                >
                  Ver perfil público
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!publicUrl) return;
                    try {
                      await navigator.clipboard.writeText(publicUrl);
                      setMsg("Enlace público copiado.");
                    } catch {
                      setMsg(
                        "Si no se copió, copia el enlace desde la barra del navegador."
                      );
                    }
                  }}
                  className="w-full text-[11px] text-blue-600 hover:underline"
                >
                  Copiar enlace público
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full border border-slate-300 text-slate-700 text-xs md:text-sm px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  Volver al inicio
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Secciones
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("perfil")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  activeTab === "perfil"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Perfil
              </button>
            </div>
          </aside>

          {/* Contenido principal */}
          <section className="space-y-4">
            {activeTab === "perfil" && (
              <section className="bg-white/95 border border-violet-100 rounded-2xl p-5 shadow-md space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      Perfil del usuario
                    </h2>
                    <p className="text-xs text-slate-500">
                      Actualiza la información visible en tu perfil de Vitrinex.
                    </p>
                  </div>

                  {/* Preview mini con los colores del usuario */}
                  <div className="hidden md:block">
                    <div
                      className="w-[300px] rounded-xl border shadow-sm p-3"
                      style={previewStyle}
                    >
                      <div className="bg-white/90 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-3">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={form.username || "Usuario"}
                              className="h-10 w-10 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                              {form.username?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 truncate">
                              {form.username || "Nombre del usuario"}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {form.email || "correo@ejemplo.com"}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 line-clamp-3">
                          {form.bio ||
                            "Aquí se mostrará tu biografía o descripción personal."}
                        </div>

                        <div className="flex gap-2">
                          <span
                            className="px-2 py-1 rounded-full text-[10px] text-white"
                            style={{ background: form.primaryColor }}
                          >
                            Contactar
                          </span>
                          <span className="px-2 py-1 rounded-full text-[10px] text-slate-700 bg-slate-100">
                            Ver más
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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

                <form
                  onSubmit={onSubmit}
                  className="grid gap-4 md:grid-cols-2 text-sm"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nombre de usuario
                    </label>
                    <input
                      name="username"
                      value={form.username}
                      onChange={onChange}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      RUT
                    </label>
                    <input
                      name="rut"
                      value={form.rut}
                      onChange={onChange}
                      placeholder="12.345.678-9"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Teléfono
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="+56 9 1234 5678"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Dirección
                    </label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      placeholder="Calle, número, comuna"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  {/* Avatar URL */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Foto de perfil (URL de imagen)
                    </label>
                    <input
                      name="avatarUrl"
                      value={form.avatarUrl}
                      onChange={onChange}
                      placeholder="https://..."
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Pega aquí la URL de tu imagen, igual que el logo de la
                      tienda.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Biografía
                    </label>
                    <textarea
                      name="bio"
                      rows={3}
                      value={form.bio}
                      onChange={onChange}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Cuenta algo sobre ti, tus servicios o tu emprendimiento."
                    />
                  </div>

                  {/* Personalización visual (solo afecta el perfil público / preview) */}
                  <div className="md:col-span-2 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">
                      Personalización visual del perfil
                    </h3>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Color principal (botones, acentos)
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            name="primaryColor"
                            value={form.primaryColor}
                            onChange={onChange}
                            className="h-9 w-9 rounded-md border cursor-pointer"
                          />
                          <input
                            name="primaryColor"
                            value={form.primaryColor}
                            onChange={onChange}
                            className="flex-1 border rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Color de encabezados
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            name="accentColor"
                            value={form.accentColor}
                            onChange={onChange}
                            className="h-9 w-9 rounded-md border cursor-pointer"
                          />
                          <input
                            name="accentColor"
                            value={form.accentColor}
                            onChange={onChange}
                            className="flex-1 border rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Fondo */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Tipo de fondo
                        </label>
                        <select
                          name="bgMode"
                          value={form.bgMode}
                          onChange={onChange}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="gradient">Degradado</option>
                          <option value="solid">Sólido</option>
                          <option value="image">Imagen</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Patrón
                        </label>
                        <select
                          name="bgPattern"
                          value={form.bgPattern}
                          onChange={onChange}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="none">Ninguno</option>
                          <option value="dots">Puntos</option>
                          <option value="grid">Grilla</option>
                          <option value="noise">Ruido sutil</option>
                        </select>
                      </div>

                      {(form.bgMode === "gradient" ||
                        form.bgMode === "solid") && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Color superior (degradado) / sólido
                            </label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="color"
                                name="bgColorTop"
                                value={form.bgColorTop}
                                onChange={onChange}
                                className="h-9 w-9 rounded-md border cursor-pointer"
                              />
                              <input
                                name="bgColorTop"
                                value={form.bgColorTop}
                                onChange={onChange}
                                className="flex-1 border rounded-lg px-3 py-2 text-xs font-mono"
                              />
                            </div>
                          </div>

                          {form.bgMode === "gradient" && (
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Color inferior (degradado)
                              </label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="color"
                                  name="bgColorBottom"
                                  value={form.bgColorBottom}
                                  onChange={onChange}
                                  className="h-9 w-9 rounded-md border cursor-pointer"
                                />
                                <input
                                  name="bgColorBottom"
                                  value={form.bgColorBottom}
                                  onChange={onChange}
                                  className="flex-1 border rounded-lg px-3 py-2 text-xs font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {form.bgMode === "image" && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            URL de imagen de fondo
                          </label>
                          <input
                            name="bgImageUrl"
                            value={form.bgImageUrl}
                            onChange={onChange}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="https://..."
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                      onClick={() => navigate("/")}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
                    >
                      {saving ? "Guardando…" : "Guardar cambios"}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </section>
        </div>

        {/* Mis tiendas relacionadas (se mantiene look Vitrinex, tarjetas blancas) */}
        <section className="mt-10 bg-white/95 rounded-2xl p-6 shadow-md border border-violet-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">
            Mis Tiendas Relacionadas
          </h3>
          {stores.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No tienes tiendas registradas aún.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stores.map((store) => {
                const logo =
                  store.logoUrl ||
                  "https://cdn-icons-png.flaticon.com/512/869/869636.png";
                const direccion = store.direccion || store.address || "";
                return (
                  <li
                    key={store._id}
                    className="py-3 flex items-center gap-3"
                  >
                    <img
                      src={logo}
                      alt={store.name}
                      className="h-10 w-10 rounded-lg object-cover border bg-slate-100"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-700">
                        {store.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {store.category ||
                          store.tipoNegocio ||
                          "Sin categoría"}
                      </p>
                      {direccion && (
                        <p className="text-[11px] text-slate-500 truncate">
                          {direccion}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
