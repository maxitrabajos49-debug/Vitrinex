// src/pages/StoreProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import { getStoreById, updateMyStore } from "../api/store";

import BookingAvailabilityManager from "../components/BookingAvailabilityManager";
import AppointmentsList from "../components/AppointmentsList";
import ProductManager from "../components/ProductManager";
import OrdersList from "../components/OrdersList";
import StoreCalendarManager from "../components/StoreCalendarManager";

// helpers para preview / fondos
const buildBg = (f) => {
  if (f.bgMode === "solid") {
    return { backgroundColor: f.bgColorTop };
  }
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

// 🔹 Degradado para la barra superior (misma idea que en StorePublicPage)
const buildStoreHeaderStyle = (storeLike) => {
  const primary = storeLike?.primaryColor || "#2563eb";
  const accent = storeLike?.accentColor || "#0f172a";

  return {
    backgroundImage: `linear-gradient(90deg, ${primary} 0%, ${accent} 50%, ${primary} 100%)`,
  };
};

export default function StoreProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    mode: "products",
    description: "",
    logoUrl: "",
    comuna: "",
    tipoNegocio: "",
    direccion: "",
    primaryColor: "#2563eb",
    accentColor: "#0f172a",
    heroTitle: "",
    heroSubtitle: "",
    highlight1: "",
    highlight2: "",
    priceFrom: "",
    // fondo
    bgMode: "gradient",
    bgColorTop: "#e8d7ff",
    bgColorBottom: "#ffffff",
    bgPattern: "none",
    bgImageUrl: "",
  });

  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("perfil");

  useEffect(() => {
    loadStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const mapStoreToForm = (s) => ({
    name: s?.name || "",
    mode: s?.mode || "products",
    description: s?.description || "",
    logoUrl: s?.logoUrl || "",
    comuna: s?.comuna || "",
    tipoNegocio: s?.tipoNegocio || "",
    direccion: s?.direccion || "",
    primaryColor: s?.primaryColor || "#2563eb",
    accentColor: s?.accentColor || "#0f172a",
    heroTitle: s?.heroTitle || "",
    heroSubtitle: s?.heroSubtitle || "",
    highlight1: s?.highlight1 || "",
    highlight2: s?.highlight2 || "",
    priceFrom: s?.priceFrom || "",
    // fondo
    bgMode: s?.bgMode || "gradient",
    bgColorTop: s?.bgColorTop || "#e8d7ff",
    bgColorBottom: s?.bgColorBottom || "#ffffff",
    bgPattern: s?.bgPattern || "none",
    bgImageUrl: s?.bgImageUrl || "",
  });

  const loadStore = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getStoreById(id);
      setStoreData(data);
      setForm(mapStoreToForm(data));
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información de la tienda.");
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

  const getCoordinates = async (address) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }
      return null;
    } catch (err) {
      console.error("Error al obtener coordenadas:", err);
      return null;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setSaving(true);

    try {
      if (!form.direccion || !form.direccion.trim()) {
        setError(
          "Ingresa una dirección exacta para posicionar tu negocio en el mapa."
        );
        setSaving(false);
        return;
      }

      const coords = await getCoordinates(form.direccion.trim());
      if (!coords) {
        setError(
          "No pudimos encontrar esa dirección. Intenta ser más específico."
        );
        setSaving(false);
        return;
      }

      const payload = { ...form, lat: coords.lat, lng: coords.lng };
      const { data: updatedStore } = await updateMyStore(id, payload);

      setStoreData(updatedStore);
      setForm(mapStoreToForm(updatedStore));
      setMsg("Tienda actualizada correctamente.");
    } catch (err) {
      console.error(err);
      setError("Error al guardar los cambios de la tienda.");
    } finally {
      setSaving(false);
    }
  };

  const modePendingChange =
    storeData && form?.mode && storeData.mode !== form.mode;

  const isBookingMode = form.mode === "bookings";
  const heroTitlePlaceholder = isBookingMode
    ? "Ej: Agenda tu hora en línea en segundos"
    : "Ej: Encuentra tus productos favoritos aquí";
  const heroSubtitlePlaceholder = isBookingMode
    ? "Ej: Servicios para personas, mascotas o empresas."
    : "Ej: Despacho rápido, medios de pago flexibles.";
  const highlight1Placeholder = isBookingMode
    ? "Ej: Atención personalizada"
    : "Ej: Ofertas todas las semanas";
  const highlight2Placeholder = isBookingMode
    ? "Ej: Cambios o re-agendamiento flexible"
    : "Ej: Stock actualizado";
  const priceFromPlaceholder = isBookingMode
    ? "Ej: Servicios desde $15.000"
    : "Ej: Productos desde $9.990";

  const toolsTabLabel =
    (storeData?.mode || form.mode) === "bookings"
      ? "Agendamiento"
      : "Productos / pedidos";
  const publicUrl = `${window.location.origin}/tienda/${id}`;

  // 🔹 Fondo que se usa en la tarjeta de preview
  const previewStyle = useMemo(
    () => buildBg(form),
    [form.bgMode, form.bgColorTop, form.bgColorBottom, form.bgImageUrl]
  );

  // 🔹 Fondo que se usa para TODA la página de edición (mismo que la tienda)
  const pageBackgroundStyle = previewStyle;

  // 🔹 Estilo del header, usando los colores de la tienda (igual lógica que vista pública)
  const headerStyle = useMemo(
    () => buildStoreHeaderStyle(form),
    [form.primaryColor, form.accentColor]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Cargando tienda..." />
        <p className="p-6 text-sm text-slate-500">Cargando información…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={pageBackgroundStyle}>
      <MainHeader
        subtitle={`Negocio: ${form.name || "Tu tienda"}`}
        variant="store"
        headerStyle={headerStyle}
        logoSrc={form.logoUrl}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[260px,minmax(0,1.8fr)] items-start">
          {/* Sidebar */}
          <aside className="bg-white/95 backdrop-blur border rounded-2xl shadow-sm p-4 space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt={form.name}
                  className="w-20 h-20 rounded-xl object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 text-lg font-semibold">
                  {form.name?.[0]?.toUpperCase() || "N"}
                </div>
              )}
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-800">
                  {form.name || "Tu negocio"}
                </h2>
                <p className="text-xs text-slate-500">
                  {form.comuna || "Comuna no definida"}
                  {form.tipoNegocio ? ` · ${form.tipoNegocio}` : ""}
                </p>
                {storeData?.mode && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                    {storeData.mode === "bookings"
                      ? "Agendamiento de horas"
                      : "Venta de productos"}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate(`/tienda/${id}`)}
                className="w-full bg-slate-900 text-white text-xs md:text-sm px-3 py-2 rounded-lg hover:bg-slate-800"
              >
                Ver página pública
              </button>
              <button
                onClick={() => navigate("/onboarding")}
                className="w-full border border-slate-300 text-slate-700 text-xs md:text-sm px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Volver a mis tiendas
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(publicUrl);
                    setMsg("Enlace público copiado.");
                  } catch {
                    setMsg("Copia el enlace desde la barra del navegador.");
                  }
                }}
                className="w-full text-[11px] text-blue-600 hover:underline"
              >
                Copiar enlace público
              </button>
            </div>

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
              <button
                type="button"
                onClick={() => setActiveTab("tools")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  activeTab === "tools"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {toolsTabLabel}
              </button>
            </div>
          </aside>

          {/* Contenido */}
          <section className="space-y-4">
            {activeTab === "perfil" && (
              <section className="bg-white/95 backdrop-blur border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      Perfil del negocio
                    </h2>
                    <p className="text-xs text-slate-500">
                      Actualiza la información visible de tu negocio en
                      Vitrinex.
                    </p>
                  </div>

                  {/* Preview en miniatura */}
                  <div className="hidden md:block">
                    <div
                      className="w-[300px] rounded-xl border shadow-sm p-3"
                      style={previewStyle}
                    >
                      <div className="bg-white/90 rounded-lg p-3 space-y-2">
                        <div className="h-16 w-full rounded-md bg-slate-200 flex items-center justify-center text-xs">
                          Logo
                        </div>
                        <div className="font-semibold text-slate-800 truncate">
                          {form.name || "Nombre del negocio"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {form.comuna || "Comuna"} ·{" "}
                          {form.tipoNegocio || "Tipo"}
                        </div>
                        <div className="text-xs text-slate-600">
                          {form.heroTitle || "Título principal"}
                        </div>
                        <div className="flex gap-2">
                          <span
                            className="px-2 py-1 rounded-full text-[10px] text-white"
                            style={{ background: form.primaryColor }}
                          >
                            Botón primario
                          </span>
                          <span className="px-2 py-1 rounded-full text-[10px] text-slate-700 bg-slate-100">
                            Botón secundario
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
                      Nombre del negocio
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Tipo de operación
                    </label>
                    <select
                      name="mode"
                      value={form.mode}
                      onChange={onChange}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="products">Venta de productos</option>
                      <option value="bookings">Agendamiento de horas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Comuna
                    </label>
                    <input
                      name="comuna"
                      value={form.comuna}
                      onChange={onChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Tipo de negocio
                    </label>
                    <input
                      name="tipoNegocio"
                      value={form.tipoNegocio}
                      onChange={onChange}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Ej: barbería, tienda de ropa…"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={onChange}
                      rows={3}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Describe brevemente tu negocio"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Logo (URL de imagen)
                    </label>
                    <input
                      name="logoUrl"
                      value={form.logoUrl}
                      onChange={onChange}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Dirección exacta
                    </label>
                    <input
                      name="direccion"
                      value={form.direccion}
                      onChange={onChange}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Ej: Manuel Antonio Caro 1766, Renca, Región Metropolitana"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Usamos esta dirección para posicionar tu negocio en el
                      mapa.
                    </p>
                  </div>

                  {/* Visual */}
                  <div className="md:col-span-2 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">
                      Personalización visual
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

                      {/* Textos */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Título principal (hero)
                        </label>
                        <input
                          name="heroTitle"
                          value={form.heroTitle}
                          onChange={onChange}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder={heroTitlePlaceholder}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Subtítulo
                        </label>
                        <input
                          name="heroSubtitle"
                          value={form.heroSubtitle}
                          onChange={onChange}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder={heroSubtitlePlaceholder}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Punto destacado 1
                        </label>
                        <input
                          name="highlight1"
                          value={form.highlight1}
                          onChange={onChange}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder={highlight1Placeholder}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Punto destacado 2
                        </label>
                        <input
                          name="highlight2"
                          value={form.highlight2}
                          onChange={onChange}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder={highlight2Placeholder}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Referencia de precios (opcional)
                        </label>
                        <input
                          name="priceFrom"
                          value={form.priceFrom}
                          onChange={onChange}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder={priceFromPlaceholder}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                      onClick={() => navigate("/onboarding")}
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

            {activeTab === "tools" && (
              <>
                {modePendingChange && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                    Guarda los cambios para activar las herramientas de "
                    {form.mode === "bookings"
                      ? "agendamiento"
                      : "venta de productos"}
                    ".
                  </div>
                )}

                {!modePendingChange && storeData?.mode === "bookings" && (
                  <>
                    <BookingAvailabilityManager storeId={id} />
                    <StoreCalendarManager storeId={id} />
                    <AppointmentsList storeId={id} />
                  </>
                )}

                {!modePendingChange && storeData?.mode === "products" && (
                  <>
                    <ProductManager storeId={id} />
                    <OrdersList storeId={id} />
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
