// src/pages/StorePublic.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStoreById,
  getStoreAvailability,
  createAppointment,
  listStoreProductsPublic,
  createStoreOrder,
} from "../api/store";
import MainHeader from "../components/MainHeader";

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

export default function StorePublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
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
    setSelectedProductId("");
    setSelectedQuantity(1);
  }, [id]);

  useEffect(() => {
    const loadStore = async () => {
      try {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!store?.mode) return;

    if (store.mode === "bookings") {
      loadAvailability();
    } else if (store.mode === "products") {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.mode, id]);

  const loadAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      const { data } = await getStoreAvailability(id);
      setAvailability(Array.isArray(data?.availability) ? data.availability : []);
    } catch (err) {
      console.error(err);
      setAvailability([]);
      setAvailabilityError(
        err?.response?.data?.message || "No se pudo cargar la disponibilidad"
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");
      const { data } = await listStoreProductsPublic(id);
      setProducts(Array.isArray(data) ? data : []);
      setSelectedProductId((Array.isArray(data) && data[0]?._id) || "");
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

  const onBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: name === "date" ? value : value,
      ...(name === "date" ? { slot: "" } : {}),
    }));
    setBookingError("");
    setBookingMsg("");
  };

  const selectedDayKey = useMemo(() => {
    if (!bookingForm.date) return null;
    const date = new Date(bookingForm.date);
    if (Number.isNaN(date.getTime())) return null;
    const key = DAY_FROM_INDEX[date.getUTCDay()];
    return key || null;
  }, [bookingForm.date]);

  const sortedAvailability = useMemo(() => {
    const order = Object.fromEntries(DAY_ORDER.map((day, index) => [day, index]));
    return [...availability].sort(
      (a, b) => (order[a.dayOfWeek] || 0) - (order[b.dayOfWeek] || 0)
    );
  }, [availability]);

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDayKey) return [];
    const entry = availability.find((item) => item.dayOfWeek === selectedDayKey);
    return entry ? entry.slots || [] : [];
  }, [availability, selectedDayKey]);

  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingMsg("");

    if (!bookingForm.customerName.trim()) {
      setBookingError("Ingresa tu nombre para agendar");
      return;
    }
    if (!bookingForm.date) {
      setBookingError("Selecciona una fecha");
      return;
    }
    if (!bookingForm.slot) {
      setBookingError("Selecciona un horario disponible");
      return;
    }

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
        err?.response?.data?.message || "No pudimos reservar tu cita. Intenta nuevamente"
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  const onOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
    setOrderError("");
    setOrderMsg("");
  };

  const addOrderItem = (productId, quantityValue) => {
    const product = products.find((item) => item._id === productId);
    if (!product) {
      setOrderError("Selecciona un producto válido");
      return;
    }

    const quantity = Math.max(1, Math.floor(Number(quantityValue) || 0));
    if (!quantity || quantity <= 0) {
      setOrderError("Ingresa una cantidad válida");
      return;
    }

    setOrderItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
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

  const handleAddToOrder = (e) => {
    e.preventDefault();
    addOrderItem(selectedProductId, selectedQuantity);
  };

  const handleQuickAdd = (productId) => {
    addOrderItem(productId, 1);
  };

  const removeOrderItem = (productId) => {
    setOrderItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const orderTotal = useMemo(
    () =>
      orderItems.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
        0
      ),
    [orderItems]
  );

  const submitOrder = async (e) => {
    e.preventDefault();
    setOrderError("");
    setOrderMsg("");

    if (!orderForm.customerName.trim()) {
      setOrderError("Ingresa tu nombre para realizar el pedido");
      return;
    }

    if (orderItems.length === 0) {
      setOrderError("Agrega al menos un producto a tu pedido");
      return;
    }

    try {
      setOrderSubmitting(true);
      await createStoreOrder(id, {
        customerName: orderForm.customerName.trim(),
        customerEmail: orderForm.customerEmail,
        customerPhone: orderForm.customerPhone,
        customerAddress: orderForm.customerAddress,
        notes: orderForm.notes,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      setOrderMsg(
        "Tu pedido fue enviado. El negocio te contactará para coordinar la entrega."
      );
      setOrderItems([]);
      setOrderForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        notes: "",
      });
      setSelectedProductId(products[0]?._id || "");
      setSelectedQuantity(1);
    } catch (err) {
      console.error(err);
      setOrderError(
        err?.response?.data?.message || "No pudimos registrar tu pedido. Intenta nuevamente"
      );
    } finally {
      setOrderSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Cargando tienda..." />
        <p className="p-6 text-sm text-slate-500">Cargando...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Error al cargar" />
        <p className="p-6 text-sm text-red-600">{error}</p>
      </div>
    );

  if (!store)
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Tienda no encontrada" />
        <p className="p-6 text-sm text-slate-500">
          No se encontró la tienda solicitada.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <MainHeader subtitle={`Negocio: ${store.name}`} />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 space-y-6">
        <section className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-40 h-40 object-cover rounded-xl border"
              />
            ) : (
              <div className="w-40 h-40 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 text-lg font-semibold">
                {store.name[0]}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-semibold text-slate-800">{store.name}</h2>
            <p className="text-slate-600 text-sm">
              {store.description || "Sin descripción."}
            </p>
            <p className="text-xs text-slate-500">
              {store.tipoNegocio || "Negocio"} · {store.comuna || "Ubicación desconocida"}
            </p>

            {store.direccion && (
              <p className="text-sm text-slate-700 mt-1">📍 {store.direccion}</p>
            )}

            {store.mode && (
              <span className="inline-block text-xs uppercase tracking-wide bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                {store.mode === "bookings"
                  ? "Agendamiento de citas"
                  : "Venta de productos"}
              </span>
            )}

            {store.ownerName && (
              <div className="flex items-center gap-2 mt-3">
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
                <p className="text-sm text-slate-600">
                  Dueño: <span className="font-medium text-slate-800">{store.ownerName}</span>
                </p>
              </div>
            )}
          </div>
        </section>

        {store.mode === "bookings" && (
          <section className="bg-white rounded-2xl shadow-sm border p-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800">
                Horarios disponibles
              </h3>

              {availabilityLoading ? (
                <p className="text-sm text-slate-500">Cargando horarios…</p>
              ) : availabilityError ? (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {availabilityError}
                </p>
              ) : sortedAvailability.length === 0 ? (
                <p className="text-sm text-slate-500">
                  El negocio aún no ha publicado horarios disponibles. Intenta nuevamente más tarde.
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedAvailability.map((entry) => (
                    <div
                      key={entry.dayOfWeek}
                      className="border border-slate-200 rounded-xl px-4 py-3"
                    >
                      <h4 className="font-semibold text-slate-700 mb-2">
                        {DAY_LABELS[entry.dayOfWeek] || entry.dayOfWeek}
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
                Completa el formulario y nos pondremos en contacto para confirmar tu reserva.
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

              <form onSubmit={submitBooking} className="space-y-3 text-sm">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={bookingForm.date}
                      onChange={onBookingChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Horario disponible
                    </label>
                    <select
                      name="slot"
                      value={bookingForm.slot}
                      onChange={onBookingChange}
                      className="w-full border rounded-lg px-3 py-2"
                      disabled={!bookingForm.date || slotsForSelectedDay.length === 0}
                    >
                      <option value="">
                        {bookingForm.date
                          ? slotsForSelectedDay.length > 0
                            ? "Selecciona un horario"
                            : "No hay horarios disponibles"
                          : "Elige una fecha"}
                      </option>
                      {slotsForSelectedDay.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
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

        {store.mode === "products" && (
          <>
            <section className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Catálogo de productos
                  </h3>
                  <p className="text-sm text-slate-500">
                    Revisa los productos disponibles y agrega los que quieras comprar a tu pedido.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadProducts}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Actualizar catálogo
                </button>
              </div>

              {productsLoading ? (
                <p className="text-sm text-slate-500">Cargando productos…</p>
              ) : productsError ? (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {productsError}
                </p>
              ) : products.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Este negocio aún no ha publicado productos. Vuelve pronto.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {products.map((product) => (
                    <article
                      key={product._id}
                      className="border border-slate-200 rounded-xl p-4 space-y-2"
                    >
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-40 w-full object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="h-40 w-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-sm">
                          Sin imagen
                        </div>
                      )}

                      <div className="space-y-1">
                        <h4 className="font-semibold text-slate-800">
                          {product.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {product.description || "Sin descripción"}
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {currencyFormatter.format(Number(product.price) || 0)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product._id)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Agregar al pedido
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Completa tu pedido
              </h3>
              <p className="text-sm text-slate-500">
                Selecciona los productos que deseas y deja tus datos para que el negocio te contacte.
              </p>

              <form onSubmit={handleAddToOrder} className="grid gap-3 md:grid-cols-3 text-sm">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Producto
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={products.length === 0}
                  >
                    {products.length === 0 ? (
                      <option value="">No hay productos disponibles</option>
                    ) : (
                      products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} · {currencyFormatter.format(Number(product.price) || 0)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) =>
                      setSelectedQuantity(
                        Math.max(1, Math.floor(Number(e.target.value) || 1))
                      )
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={products.length === 0}
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg disabled:opacity-60"
                    disabled={products.length === 0}
                  >
                    Agregar al pedido
                  </button>
                </div>
              </form>

              <div className="border border-slate-200 rounded-xl px-4 py-3 space-y-2">
                <h4 className="font-semibold text-slate-700 text-sm">
                  Resumen de tu pedido
                </h4>
                {orderItems.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Aún no agregas productos. Selecciona uno del catálogo para comenzar.
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm text-slate-600">
                    {orderItems.map((item) => (
                      <li
                        key={item.productId}
                        className="flex items-center justify-between gap-3"
                      >
                        <span>
                          {item.quantity} × {item.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-800">
                            {currencyFormatter.format((Number(item.price) || 0) * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeOrderItem(item.productId)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Quitar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>Total estimado</span>
                  <span>{currencyFormatter.format(orderTotal)}</span>
                </div>
              </div>

              <form onSubmit={submitOrder} className="grid gap-3 md:grid-cols-2 text-sm">
                <div className="md:col-span-2">
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

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Dirección o instrucciones de entrega
                  </label>
                  <textarea
                    name="customerAddress"
                    value={orderForm.customerAddress}
                    onChange={onOrderFormChange}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Ej: Calle Falsa 123, depto 4"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Comentarios adicionales
                  </label>
                  <textarea
                    name="notes"
                    value={orderForm.notes}
                    onChange={onOrderFormChange}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Cuéntanos si tienes alguna instrucción especial"
                  />
                </div>

                {orderError && (
                  <p className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {orderError}
                  </p>
                )}

                {orderMsg && (
                  <p className="md:col-span-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    {orderMsg}
                  </p>
                )}

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
                  >
                    {orderSubmitting ? "Enviando…" : "Enviar pedido"}
                  </button>
                </div>
              </form>
            </section>
          </>
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
  );
}
