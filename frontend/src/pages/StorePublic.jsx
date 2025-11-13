// src/pages/StorePublicPage.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStoreById,
  getStoreAvailability,
  createAppointment,
  listStoreProducts,
  createStoreOrder,
} from "../api/store";
import MainHeader from "../components/MainHeader";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// ---------- Diccionarios ----------
const DAY_LABELS = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};
const DAY_FROM_INDEX = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};
const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0,
});

// ---------- helpers de estilo ----------
function hexToRgba(hex, alpha = 0.15) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildBackgroundStyle(store) {
  const mode = store?.bgMode || "gradient";
  const top = store?.bgColorTop || "#e8d7ff";
  const bottom = store?.bgColorBottom || "#ffffff";
  const img = store?.bgImageUrl || "";

  if (mode === "solid") {
    return {
      backgroundColor: top,
      backgroundAttachment: "fixed",
    };
  }

  if (mode === "image" && img) {
    return {
      backgroundImage: `linear-gradient(to bottom, ${hexToRgba(
        "#000",
        0.5
      )} 0%, ${hexToRgba("#000", 0.7)} 60%), url(${img})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: top,
    };
  }

  // Degradado + pequeño radial para que se vea más "pro"
  return {
    backgroundImage: `
      radial-gradient(circle at top, ${hexToRgba(
        top,
        0.7
      )} 0, ${hexToRgba(bottom, 0)} 55%),
      linear-gradient(to bottom, ${top} 0%, ${bottom} 100%)
    `,
    backgroundAttachment: "fixed",
  };
}

function buildPatternStyle(store) {
  const pattern = store?.bgPattern || "none";
  const color = hexToRgba(store?.accentColor || "#0f172a", 0.12);
  const base = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  };

  if (pattern === "dots") {
    return {
      ...base,
      backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
      backgroundSize: "14px 14px",
    };
  }
  if (pattern === "grid") {
    return {
      ...base,
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: "28px 28px",
    };
  }
  if (pattern === "noise") {
    return {
      ...base,
      opacity: 0.15,
      backgroundImage: `radial-gradient(${color} 0.7px, transparent 0.7px)`,
      backgroundSize: "6px 6px",
    };
  }
  return null;
}

function buildStoreHeaderStyle(store) {
  const primary = store?.primaryColor || "#2563eb";
  const accent = store?.accentColor || "#0f172a";

  return {
    backgroundImage: `linear-gradient(90deg, ${primary} 0%, ${accent} 50%, ${primary} 100%)`,
  };
}

export default function StorePublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const bookingSectionRef = useRef(null);
  const productsSectionRef = useRef(null);
  const scrollToSection = (ref) =>
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    date: "",
    slot: "",
    notes: "",
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");

  const [orderItems, setOrderItems] = useState([]);
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderMsg, setOrderMsg] = useState("");

  // reset al cambiar tienda
  useEffect(() => {
    setAvailability([]);
    setAvailabilityError("");
    setBookingForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      date: "",
      slot: "",
      notes: "",
    });
    setBookingError("");
    setBookingMsg("");

    setProducts([]);
    setProductsError("");
    setOrderItems([]);
    setOrderForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      notes: "",
    });
    setOrderError("");
    setOrderMsg("");
  }, [id]);

  // cargar tienda
  useEffect(() => {
    const loadStore = async () => {
      try {
        if (!id) {
          setError("No se encontró el identificador de la tienda.");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");
        const { data } = await getStoreById(id);
        setStore(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del negocio.");
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [id]);

  // cargar según modo
  useEffect(() => {
    if (!store?.mode) return;
    if (store.mode === "bookings") loadAvailability();
    if (store.mode === "products") loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.mode, id]);

  const loadAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      const { data } = await getStoreAvailability(id);
      setAvailability(
        Array.isArray(data?.availability) ? data.availability : []
      );
    } catch (err) {
      console.error(err);
      setAvailability([]);
      setAvailabilityError(
        err?.response?.data?.message ||
          "No se pudo cargar la disponibilidad"
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");
      const { data } = await listStoreProducts(id);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setProductsError(
        err?.response?.data?.message || "No se pudo cargar el catálogo"
      );
    } finally {
      setProductsLoading(false);
    }
  };

  // --------- AGENDAMIENTO ----------
  const onBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((p) => ({ ...p, [name]: value }));
    setBookingError("");
    setBookingMsg("");
  };

  const handleCalendarChange = (value) => {
    if (!value) return;
    const iso = value.toISOString().slice(0, 10);
    setBookingForm((p) => ({ ...p, date: iso, slot: "" }));
    setBookingError("");
    setBookingMsg("");
  };

  const calendarValue = useMemo(() => {
    if (!bookingForm.date) return new Date();
    const d = new Date(bookingForm.date);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }, [bookingForm.date]);

  const selectedDayKey = useMemo(() => {
    if (!bookingForm.date) return null;
    const date = new Date(bookingForm.date);
    if (Number.isNaN(date.getTime())) return null;
    return DAY_FROM_INDEX[date.getUTCDay()] || null;
  }, [bookingForm.date]);

  const sortedAvailability = useMemo(() => {
    const order = Object.fromEntries(
      DAY_ORDER.map((day, idx) => [day, idx])
    );
    return [...availability].sort(
      (a, b) =>
        (order[a.dayOfWeek] || 0) - (order[b.dayOfWeek] || 0)
    );
  }, [availability]);

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDayKey) return [];
    const entry = availability.find(
      (it) => it.dayOfWeek === selectedDayKey
    );
    return entry ? entry.slots || [] : [];
  }, [availability, selectedDayKey]);

  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingMsg("");
    if (!bookingForm.customerName.trim())
      return setBookingError("Ingresa tu nombre para agendar");
    if (!bookingForm.date)
      return setBookingError("Selecciona una fecha en el calendario");
    if (!bookingForm.slot)
      return setBookingError("Selecciona un horario disponible");

    try {
      setBookingSubmitting(true);
      await createAppointment(id, {
        customerName: bookingForm.customerName.trim(),
        customerEmail: bookingForm.customerEmail,
        customerPhone: bookingForm.customerPhone,
        date: bookingForm.date,
        slot: bookingForm.slot,
        notes: bookingForm.notes,
      });
      setBookingMsg(
        "Tu solicitud fue enviada. El negocio se pondrá en contacto para confirmar la cita."
      );
      setBookingForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        date: "",
        slot: "",
        notes: "",
      });
    } catch (err) {
      console.error(err);
      setBookingError(
        err?.response?.data?.message ||
          "No pudimos reservar tu cita. Intenta nuevamente"
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  const hasAvailabilityForDate = (date) => {
    const key = DAY_FROM_INDEX[date.getUTCDay()];
    const entry = availability.find((item) => item.dayOfWeek === key);
    return entry && entry.slots && entry.slots.length > 0;
  };

  const getCalendarTileClass = ({ date, view }) => {
    if (view !== "month") return null;
    return hasAvailabilityForDate(date)
      ? "react-calendar__tile--has-availability"
      : "react-calendar__tile--no-availability";
  };

  // --------- PEDIDOS ----------
  const onOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((p) => ({ ...p, [name]: value }));
    setOrderError("");
    setOrderMsg("");
  };

  const addOrderItem = (productId, quantityValue) => {
    const product = products.find((item) => item._id === productId);
    if (!product) return setOrderError("Selecciona un producto válido");

    const quantity = Math.max(1, Math.floor(Number(quantityValue) || 0));
    if (!quantity || quantity <= 0)
      return setOrderError("Ingresa una cantidad válida");

    setOrderItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          productId,
          name: product.name,
          price: Number(product.price) || 0,
          quantity,
        },
      ];
    });
    setOrderError("");
    setOrderMsg("");
  };

  const handleQuickAdd = (productId) => addOrderItem(productId, 1);
  const removeOrderItem = (productId) =>
    setOrderItems((prev) =>
      prev.filter((i) => i.productId !== productId)
    );

  const orderTotal = useMemo(
    () =>
      orderItems.reduce(
        (sum, i) =>
          sum + (Number(i.price) || 0) * i.quantity,
        0
      ),
    [orderItems]
  );

  const submitOrder = async (e) => {
    e.preventDefault();
    setOrderError("");
    setOrderMsg("");
    if (orderItems.length === 0)
      return setOrderError("Agrega al menos un producto a tu pedido");
    if (!orderForm.customerName.trim())
      return setOrderError("Ingresa tu nombre para enviar el pedido");

    try {
      setOrderSubmitting(true);
      await createStoreOrder(id, {
        customerName: orderForm.customerName.trim(),
        customerEmail: orderForm.customerEmail,
        customerPhone: orderForm.customerPhone,
        customerAddress: orderForm.customerAddress,
        notes: orderForm.notes,
        items: orderItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });
      setOrderMsg(
        "Tu pedido fue enviado. El negocio se pondrá en contacto para coordinar el pago y la entrega."
      );
      setOrderItems([]);
      setOrderForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        notes: "",
      });
    } catch (err) {
      console.error(err);
      setOrderError(
        err?.response?.data?.message ||
          "No pudimos enviar tu pedido. Intenta nuevamente"
      );
    } finally {
      setOrderSubmitting(false);
    }
  };

  // --------- Colores ----------
  const primaryColor = store?.primaryColor || "#2563eb";
  const accentColor = store?.accentColor || "#0f172a";

  // --------- Estados iniciales ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Cargando tienda..." />
        <p className="p-6 text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Error al cargar" />
        <p className="p-6 text-sm text-red-600">{error}</p>
      </div>
    );
  }
  if (!store) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Tienda no encontrada" />
        <p className="p-6 text-sm text-slate-500">
          No se encontró la tienda solicitada.
        </p>
      </div>
    );
  }

  const patternStyle = buildPatternStyle(store);
  const bgStyle = buildBackgroundStyle(store);
  const headerStyle = buildStoreHeaderStyle(store);

  return (
    <div className="relative min-h-screen flex flex-col" style={bgStyle}>
      {/* patrón */}
      {patternStyle && <div aria-hidden style={patternStyle} />}

      <div style={{ position: "relative", zIndex: 1 }}>
        <MainHeader
          subtitle={`Negocio: ${store.name}`}
          variant="store"
          headerStyle={headerStyle}
          logoSrc={store.logoUrl}
        />

        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* HERO */}
          <section
            className="bg-white/90 backdrop-blur rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row gap-6 items-start"
            style={{ borderColor: primaryColor }}
          >
            <div className="flex-shrink-0">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl border shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-600 text-2xl font-semibold border">
                  {store.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="text-2xl md:text-3xl font-semibold"
                  style={{ color: accentColor }}
                >
                  {store.name}
                </h2>
                {store.mode && (
                  <span
                    className="inline-flex text-[11px] uppercase tracking-wide px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                  >
                    {store.mode === "bookings"
                      ? "Agendamiento de citas"
                      : "Venta de productos"}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500">
                {store.tipoNegocio || "Negocio"} ·{" "}
                {store.comuna || "Ubicación desconocida"}
              </p>

              {store.direccion && (
                <p className="text-sm text-slate-700 flex items-center gap-1">
                  <span>📍</span>
                  <span>{store.direccion}</span>
                </p>
              )}

              {store.heroTitle || store.heroSubtitle ? (
                <div className="space-y-1">
                  {store.heroTitle && (
                    <p className="text-sm md:text-base text-slate-900 font-semibold">
                      {store.heroTitle}
                    </p>
                  )}
                  {store.heroSubtitle && (
                    <p className="text-sm text-slate-600">
                      {store.heroSubtitle}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  {store.description || "Sin descripción."}
                </p>
              )}

              {(store.highlight1 ||
                store.highlight2 ||
                store.priceFrom) && (
                <div className="flex flex-wrap gap-2 mt-1 text-xs">
                  {store.highlight1 && (
                    <span
                      className="px-2 py-1 rounded-full border text-slate-700"
                      style={{ borderColor: primaryColor }}
                    >
                      {store.highlight1}
                    </span>
                  )}
                  {store.highlight2 && (
                    <span
                      className="px-2 py-1 rounded-full border text-slate-700"
                      style={{ borderColor: primaryColor }}
                    >
                      {store.highlight2}
                    </span>
                  )}
                  {store.priceFrom && (
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-800">
                      {store.priceFrom}
                    </span>
                  )}
                </div>
              )}

              {store.ownerName && (
                <div className="flex items-center gap-2 mt-2">
                  {store.ownerAvatar ? (
                    <img
                      src={store.ownerAvatar}
                      alt={store.ownerName}
                      className="h-8 w-8 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">
                      {store.ownerName[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <p className="text-xs text-slate-600">
                    Dueño:{" "}
                    <span className="font-medium text-slate-800">
                      {store.ownerName}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {store.mode === "bookings" && (
                  <button
                    type="button"
                    onClick={() => scrollToSection(bookingSectionRef)}
                    className="px-4 py-2 rounded-lg text-xs md:text-sm font-medium text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Agendar cita
                  </button>
                )}
                {store.mode === "products" && (
                  <button
                    type="button"
                    onClick={() => scrollToSection(productsSectionRef)}
                    className="px-4 py-2 rounded-lg text-xs md:text-sm font-medium text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Ver catálogo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-3 py-2 rounded-lg text-xs md:text-sm border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  ← Volver al inicio
                </button>
              </div>
            </div>
          </section>

          {/* AGENDAMIENTO */}
          {store.mode === "bookings" && (
            <section
              ref={bookingSectionRef}
              className="bg-white rounded-2xl shadow-sm border p-6 grid gap-6 md:grid-cols-[1.1fr,1.4fr]"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-800">
                  Horarios disponibles esta semana
                </h3>
                {availabilityLoading ? (
                  <p className="text-sm text-slate-500">
                    Cargando horarios…
                  </p>
                ) : availabilityError ? (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {availabilityError}
                  </p>
                ) : sortedAvailability.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    El negocio aún no ha publicado horarios disponibles.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sortedAvailability.map((entry) => (
                      <div
                        key={entry.dayOfWeek}
                        className="border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/60"
                      >
                        <h4 className="font-semibold text-slate-700 mb-2">
                          {DAY_LABELS[entry.dayOfWeek] ||
                            entry.dayOfWeek}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(entry.slots || []).map((slot) => (
                            <span
                              key={`${entry.dayOfWeek}-${slot}`}
                              className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full"
                            >
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-800">
                  Agenda tu cita
                </h3>
                <p className="text-sm text-slate-500">
                  Elige una fecha y un horario disponible.
                </p>

                {bookingError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {bookingError}
                  </p>
                )}
                {bookingMsg && (
                  <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    {bookingMsg}
                  </p>
                )}

                <form
                  onSubmit={submitBooking}
                  className="space-y-4 text-sm"
                >
                  <div className="grid gap-4 md:grid-cols-2 items-start">
                    <div className="space-y-2">
                      <Calendar
                        onChange={handleCalendarChange}
                        value={calendarValue}
                        tileClassName={getCalendarTileClass}
                        className="rounded-2xl border border-slate-200 shadow-sm p-2 bg-slate-50/60"
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Nombre completo
                        </label>
                        <input
                          name="customerName"
                          value={bookingForm.customerName}
                          onChange={onBookingChange}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Correo electrónico
                        </label>
                        <input
                          name="customerEmail"
                          value={bookingForm.customerEmail}
                          onChange={onBookingChange}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="tucorreo@example.com"
                          type="email"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Teléfono
                        </label>
                        <input
                          name="customerPhone"
                          value={bookingForm.customerPhone}
                          onChange={onBookingChange}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="+56 9 ..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Horarios disponibles para el día elegido
                    </label>
                    {bookingForm.date ? (
                      slotsForSelectedDay.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No hay horarios configurados.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {slotsForSelectedDay.map((slot) => (
                            <button
                              type="button"
                              key={slot}
                              onClick={() =>
                                setBookingForm((p) => ({
                                  ...p,
                                  slot,
                                }))
                              }
                              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                                bookingForm.slot === slot
                                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-xs text-slate-500">
                        Elige primero una fecha.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Comentarios
                    </label>
                    <textarea
                      name="notes"
                      value={bookingForm.notes}
                      onChange={onBookingChange}
                      rows={3}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Cuéntanos qué necesitas"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
                  >
                    {bookingSubmitting ? "Enviando…" : "Solicitar cita"}
                  </button>
                </form>
              </div>
            </section>
          )}

          {/* PRODUCTOS */}
          {store.mode === "products" && (
            <section
              ref={productsSectionRef}
              className="bg-white rounded-2xl shadow-sm border p-6 space-y-8"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Catálogo de productos
                  </h3>
                  <p className="text-sm text-slate-500">
                    Agrega lo que quieras comprar a tu pedido.
                  </p>
                </div>

                {productsLoading ? (
                  <p className="text-sm text-slate-500">
                    Cargando catálogo…
                  </p>
                ) : productsError ? (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {productsError}
                  </p>
                ) : products.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Aún no hay productos.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {products.map((product) => {
                      const imageSrc =
                        product.imageUrl ||
                        product.image ||
                        (product.images?.[0] ?? null);
                      return (
                        <article
                          key={product._id}
                          className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-slate-50/60"
                        >
                          <div className="h-56 bg-slate-100 flex items-center justify-center">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                                Sin imagen
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-1 flex-1 flex flex-col">
                            <h4 className="font-semibold text-slate-800 text-sm">
                              {product.name}
                            </h4>
                            {product.description && (
                              <p className="text-xs text-slate-500 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            <p className="mt-2 font-semibold text-emerald-600 text-sm">
                              {currencyFormatter.format(
                                product.price || 0
                              )}
                            </p>
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickAdd(product._id)
                                }
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                              >
                                Agregar al pedido
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pedido */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Completa tu pedido
                </h3>

                {orderError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {orderError}
                  </p>
                )}
                {orderMsg && (
                  <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    {orderMsg}
                  </p>
                )}

                <div className="grid gap-6 md:grid-cols-[1.2fr,1fr] items-start">
                  <div className="space-y-3">
                    {orderItems.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Aún no has agregado productos.
                      </p>
                    ) : (
                      <>
                        <ul className="space-y-2">
                          {orderItems.map((item) => (
                            <li
                              key={item.productId}
                              className="flex items-center justify-between gap-3 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {item.quantity} x{" "}
                                  {currencyFormatter.format(
                                    item.price || 0
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="text-sm font-semibold text-slate-800">
                                  {currencyFormatter.format(
                                    (item.price || 0) *
                                      item.quantity
                                  )}
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeOrderItem(item.productId)
                                  }
                                  className="text-xs text-red-500 hover:text-red-600"
                                >
                                  Quitar
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                          <span className="text-sm font-medium text-slate-700">
                            Total estimado
                          </span>
                          <span className="text-lg font-semibold text-emerald-600">
                            {currencyFormatter.format(orderTotal)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <form
                    onSubmit={submitOrder}
                    className="space-y-3 text-sm"
                  >
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Nombre completo
                      </label>
                      <input
                        name="customerName"
                        value={orderForm.customerName}
                        onChange={onOrderFormChange}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Correo electrónico
                      </label>
                      <input
                        name="customerEmail"
                        value={orderForm.customerEmail}
                        onChange={onOrderFormChange}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="tucorreo@example.com"
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Teléfono
                      </label>
                      <input
                        name="customerPhone"
                        value={orderForm.customerPhone}
                        onChange={onOrderFormChange}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="+56 9 ..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Dirección (si aplica)
                      </label>
                      <input
                        name="customerAddress"
                        value={orderForm.customerAddress}
                        onChange={onOrderFormChange}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Calle, número, comuna"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Comentarios
                      </label>
                      <textarea
                        name="notes"
                        value={orderForm.notes}
                        onChange={onOrderFormChange}
                        rows={3}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Detalles de tu pedido"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        orderSubmitting || orderItems.length === 0
                      }
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                    >
                      {orderSubmitting
                        ? "Enviando pedido…"
                        : "Enviar pedido"}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Volver al inicio
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
