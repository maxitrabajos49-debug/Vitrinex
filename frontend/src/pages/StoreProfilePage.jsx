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
import SmartInsights from "../components/SmartInsights"; // 👈 IMPORTANTE

/* ========= Helpers =========== */
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
    background: `linear-gradient(to bottom, ${f.bgColorTop}, ${f.bgColorBottom})`,
  };
};

const buildStoreHeaderStyle = (storeLike) => {
  const primary = storeLike?.primaryColor || "#2563eb";
  const accent = storeLike?.accentColor || "#0f172a";

  return {
    backgroundImage: `linear-gradient(90deg, ${primary}, ${accent}, ${primary})`,
  };
};

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
   ───────────────────────────────────────────── */

export default function StoreProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ========= Estados principales ===========
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

  // pestañas internas
  const [productsPanel, setProductsPanel] = useState("catalog"); // catalog | orders | insights
  const [bookingsPanel, setBookingsPanel] = useState("availability"); // availability | calendar | appointments | insights

  // ========= Cargar tienda ===========
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
    bgMode: s?.bgMode || "gradient",
    bgColorTop: s?.bgColorTop || "#e8d7ff",
    bgColorBottom: s?.bgColorBottom || "#ffffff",
    bgPattern: s?.bgPattern || "none",
    bgImageUrl: s?.bgImageUrl || "",
  });

  const loadStore = async () => {
    try {
      setLoading(true);
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

  // ========= Handlers ===========

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      if (!data.length) return null;
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
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
      if (!form.direccion.trim()) {
        setError("Ingresa una dirección exacta.");
        setSaving(false);
        return;
      }

      const coords = await getCoordinates(form.direccion.trim());
      if (!coords) {
        setError("No pudimos encontrar esa dirección.");
        setSaving(false);
        return;
      }

      const payload = { ...form, lat: coords.lat, lng: coords.lng };
      const { data } = await updateMyStore(id, payload);

      setStoreData(data);
      setForm(mapStoreToForm(data));
      setMsg("Tienda actualizada correctamente.");
    } catch (err) {
      console.error(err);
      setError("Error al guardar la tienda.");
    } finally {
      setSaving(false);
    }
  };

  // ========= Valores derivados ===========

  const modePendingChange =
    storeData && form.mode && storeData.mode !== form.mode;

  const publicUrl = `${window.location.origin}/tienda/${id}`;

  const previewStyle = useMemo(
    () => buildBg(form),
    [form.bgMode, form.bgColorTop, form.bgColorBottom, form.bgImageUrl]
  );

  const pageBackgroundStyle = previewStyle;
  const headerStyle = useMemo(
    () => buildStoreHeaderStyle(form),
    [form.primaryColor, form.accentColor]
  );

  const effectiveMode = storeData?.mode || form.mode;

  const isProductsToolsView =
    activeTab === "tools" && effectiveMode === "products";

  const isBookingsToolsView =
    activeTab === "tools" && effectiveMode === "bookings";

  const gridColsClass =
    isProductsToolsView || isBookingsToolsView
      ? "grid gap-8 md:grid-cols-[260px,200px,1fr] items-start justify-center"
      : "grid gap-8 md:grid-cols-[260px,1fr] items-start justify-center";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Cargando tienda..." />
        <p className="p-6 text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────── */

  return (
    <div className="min-h-screen flex flex-col" style={pageBackgroundStyle}>
      {/* HEADER */}
      <MainHeader
        subtitle={`Negocio: ${form.name || "Tu tienda"}`}
        variant="store"
        headerStyle={headerStyle}
        logoSrc={form.logoUrl}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6">
        <div className={gridColsClass}>
          {/* ╔════════════════════════════╗
             ║   SIDEBAR IZQUIERDO       ║
             ╚════════════════════════════╝ */}
          <aside className="bg-white/95 backdrop-blur border rounded-2xl shadow-sm p-4 space-y-4">
            {/* Avatar / Logo */}
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

            {/* Botones principales */}
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
                    setMsg("No se pudo copiar automáticamente.");
                  }
                }}
                className="w-full text-[11px] text-blue-600 hover:underline"
              >
                Copiar enlace público
              </button>
            </div>

            {/* Secciones */}
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
                {effectiveMode === "bookings"
                  ? "Agendamiento"
                  : "Productos / pedidos"}
              </button>
            </div>
          </aside>

          {/* ╔════════════════════════════╗
             ║   BARRA CENTRAL (NAV)     ║
             ╚════════════════════════════╝ */}
          {(isProductsToolsView || isBookingsToolsView) && (
            <nav className="hidden md:flex flex-col gap-2 bg-white/90 backdrop-blur border rounded-2xl shadow-sm p-4">
              {isProductsToolsView && (
                <>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Gestión de productos
                  </p>

                  <button
                    onClick={() => setProductsPanel("catalog")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      productsPanel === "catalog"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Catálogo de productos
                  </button>

                  <button
                    onClick={() => setProductsPanel("orders")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      productsPanel === "orders"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Pedidos
                  </button>

                  {/* 👇 NUEVO: botón de análisis inteligente (productos) */}
                  <button
                    onClick={() => setProductsPanel("insights")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      productsPanel === "insights"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Análisis inteligente
                  </button>
                </>
              )}

              {isBookingsToolsView && (
                <>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Gestión de agendamiento
                  </p>

                  <button
                    onClick={() => setBookingsPanel("availability")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      bookingsPanel === "availability"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Disponibilidad de horarios
                  </button>

                  <button
                    onClick={() => setBookingsPanel("calendar")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      bookingsPanel === "calendar"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Calendario
                  </button>

                  <button
                    onClick={() => setBookingsPanel("appointments")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      bookingsPanel === "appointments"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Reservas / citas
                  </button>

                  {/* 👇 NUEVO: botón de análisis inteligente (agendamiento) */}
                  <button
                    onClick={() => setBookingsPanel("insights")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      bookingsPanel === "insights"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Análisis inteligente
                  </button>
                </>
              )}
            </nav>
          )}

          {/* ╔════════════════════════════╗
             ║   CONTENIDO PRINCIPAL      ║
             ╚════════════════════════════╝ */}
          <section className="space-y-4">
            {/* TAB PERFIL */}
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

                  {/* PREVIEW MINI */}
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

                {/* Mensajes */}
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

                {/* FORMULARIO DEL PERFIL */}
                <form
                  onSubmit={onSubmit}
                  className="grid gap-4 md:grid-cols-2 text-sm"
                >
                  {/* Nombre */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nombre del negocio
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      required
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  {/* Tipo operación */}
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

                  {/* Comuna */}
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

                  {/* Tipo de negocio */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Tipo de negocio
                    </label>
                    <input
                      name="tipoNegocio"
                      value={form.tipoNegocio}
                      onChange={onChange}
                      placeholder="Ej: barbería, tienda de ropa…"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  {/* Descripción */}
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

                  {/* Logo */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Logo (URL)
                    </label>
                    <input
                      name="logoUrl"
                      value={form.logoUrl}
                      onChange={onChange}
                      placeholder="https://..."
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  {/* Dirección */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Dirección exacta
                    </label>
                    <input
                      name="direccion"
                      value={form.direccion}
                      onChange={onChange}
                      placeholder="Ej: Manuel Antonio Caro 1766, Renca"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Usamos la dirección para posicionar tu negocio en el
                      mapa.
                    </p>
                  </div>

                  {/* Colores y fondo */}
                  <div className="md:col-span-2 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">
                      Personalización visual
                    </h3>

                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Color primario */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Color principal
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            name="primaryColor"
                            value={form.primaryColor}
                            onChange={onChange}
                            className="h-9 w-9 border rounded-md cursor-pointer"
                          />
                          <input
                            name="primaryColor"
                            value={form.primaryColor}
                            onChange={onChange}
                            className="flex-1 border rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Color acento */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Color de encabezados
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            name="accentColor"
                            value={form.accentColor}
                            onChange={onChange}
                            className="h-9 w-9 border rounded-md cursor-pointer"
                          />
                          <input
                            name="accentColor"
                            value={form.accentColor}
                            onChange={onChange}
                            className="flex-1 border rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Tipo de fondo */}
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

                      {/* Patrón */}
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

                      {/* Color superior */}
                      {(form.bgMode === "gradient" ||
                        form.bgMode === "solid") && (
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Color superior / sólido
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              name="bgColorTop"
                              value={form.bgColorTop}
                              onChange={onChange}
                              className="h-9 w-9 border rounded-md cursor-pointer"
                            />
                            <input
                              name="bgColorTop"
                              value={form.bgColorTop}
                              onChange={onChange}
                              className="flex-1 border rounded-lg px-3 py-2 text-xs font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {/* Color inferior (solo gradient) */}
                      {form.bgMode === "gradient" && (
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Color inferior (degradado)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              name="bgColorBottom"
                              value={form.bgColorBottom}
                              onChange={onChange}
                              className="h-9 w-9 border rounded-md cursor-pointer"
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

                      {/* Imagen de fondo (solo image) */}
                      {form.bgMode === "image" && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            URL de imagen de fondo
                          </label>
                          <input
                            name="bgImageUrl"
                            value={form.bgImageUrl}
                            onChange={onChange}
                            placeholder="https://..."
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                      )}

                      {/* Título principal */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Título principal
                        </label>
                        <input
                          name="heroTitle"
                          value={form.heroTitle}
                          onChange={onChange}
                          placeholder="Ej: Encuentra lo mejor aquí"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>

                      {/* Subtítulo */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Subtítulo
                        </label>
                        <input
                          name="heroSubtitle"
                          value={form.heroSubtitle}
                          onChange={onChange}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>

                      {/* Highlights */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Punto destacado 1
                        </label>
                        <input
                          name="highlight1"
                          value={form.highlight1}
                          onChange={onChange}
                          className="w-full border rounded-lg px-3 py-2"
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
                        />
                      </div>

                      {/* PriceFrom */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Referencia de precios
                        </label>
                        <input
                          name="priceFrom"
                          value={form.priceFrom}
                          onChange={onChange}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BOTONES GUARDAR */}
                  <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate("/onboarding")}
                      className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
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

            {/* TAB HERRAMIENTAS */}
            {activeTab === "tools" && (
              <>
                {modePendingChange && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                    Guarda los cambios para activar herramientas de "
                    {form.mode === "bookings"
                      ? "agendamiento"
                      : "venta de productos"}
                    ".
                  </div>
                )}

                {/* Herramientas AGENDAMIENTO */}
                {!modePendingChange && effectiveMode === "bookings" && (
                  <>
                    {bookingsPanel === "availability" && (
                      <BookingAvailabilityManager storeId={id} />
                    )}

                    {bookingsPanel === "calendar" && (
                      <StoreCalendarManager storeId={id} />
                    )}

                    {bookingsPanel === "appointments" && (
                      <AppointmentsList storeId={id} />
                    )}

                    {bookingsPanel === "insights" && (
                      <SmartInsights storeId={id} mode="bookings" />
                    )}
                  </>
                )}

                {/* Herramientas PRODUCTOS */}
                {!modePendingChange && effectiveMode === "products" && (
                  <>
                    {productsPanel === "catalog" && (
                      <>
                        <ProductManager storeId={id} panel="catalog" />
                        <ProductManager storeId={id} panel="add" />
                      </>
                    )}

                    {productsPanel === "orders" && (
                      <OrdersList storeId={id} />
                    )}

                    {productsPanel === "insights" && (
                      <SmartInsights storeId={id} mode="products" />
                    )}
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
