// frontend/src/components/SmartInsights.jsx
import { useEffect, useMemo, useState } from "react";
import {
  fetchProductInsights,
  fetchBookingInsights,
} from "../api/insights";

const formatCurrency = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "0";
  return value.toLocaleString("es-CL");
};

export default function SmartInsights({ storeId, mode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!storeId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, mode]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const res =
        mode === "bookings"
          ? await fetchBookingInsights(storeId)
          : await fetchProductInsights(storeId);

      setData(res.data);
    } catch (err) {
      console.error("Error cargando SmartInsights:", err);
      setError("No se pudo cargar el análisis inteligente.");
    } finally {
      setLoading(false);
    }
  };

  const summary =
    data && typeof data.summary === "object" && data.summary !== null
      ? data.summary
      : {};
  const suggestions = Array.isArray(data?.suggestions)
    ? data.suggestions
    : Array.isArray(data?.tips)
    ? data.tips
    : [];

  const normalizedSummary = useMemo(() => {
    if (!summary || typeof summary !== "object") return {};
    return {
      ...summary,
      totalOrders:
        summary.totalOrders ?? summary.orders ?? summary.total ?? 0,
      totalItemsSold:
        summary.totalItemsSold ?? summary.itemsSold ?? summary.units ?? 0,
      totalRevenue:
        summary.totalRevenue ?? summary.revenue ?? summary.totalSales ?? 0,
      averageOrderValue:
        summary.averageOrderValue ?? summary.averageTicket ?? summary.ticket ?? 0,
      uniqueProducts:
        summary.uniqueProducts ?? summary.totalProducts ?? summary.products ?? 0,
      totalProducts:
        summary.totalProducts ?? summary.uniqueProducts ?? summary.products ?? 0,
      totalAppointments:
        summary.totalAppointments ?? summary.totalBookings ?? summary.totalCitas ?? 0,
      confirmed: summary.confirmed ?? summary.completed ?? summary.approved ?? 0,
      cancelled: summary.cancelled ?? summary.canceled ?? 0,
      completionRate:
        summary.completionRate ?? summary.confirmationRate ?? summary.successRate ?? 0,
      windowInDays: summary.windowInDays ?? summary.days ?? null,
    };
  }, [summary]);

  const summaryWindowLabel = useMemo(() => {
    if (!normalizedSummary?.windowInDays) return null;
    if (normalizedSummary.windowInDays === 1) return "Últimas 24h";
    if (normalizedSummary.windowInDays === 7) return "Últimos 7 días";
    if (normalizedSummary.windowInDays === 30) return "Últimos 30 días";
    return `Últimos ${normalizedSummary.windowInDays} días`;
  }, [normalizedSummary.windowInDays]);

  if (loading) {
    return (
      <div className="bg-white/95 border rounded-2xl p-4 shadow-sm text-sm text-slate-500">
        Cargando análisis inteligente…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <section className="bg-white/95 border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Análisis inteligente
          </h2>
          <p className="text-xs text-slate-500">
            Recomendaciones basadas en el comportamiento de tu tienda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {summaryWindowLabel && (
            <span className="inline-flex items-center px-2 py-1 text-[11px] rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {summaryWindowLabel}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-1 text-[11px] rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            {mode === "bookings"
              ? "Agendamiento y servicios"
              : "Productos e inventario"}
          </span>
        </div>
      </div>

      {/* RESUMEN PRINCIPAL */}
      {mode === "products" && (
        <div className="grid gap-3 md:grid-cols-5 text-xs">
          <MetricCard
            label="Pedidos en el período"
            value={formatNumber(normalizedSummary?.totalOrders ?? 0)}
          />
          <MetricCard
            label="Unidades vendidas"
            value={formatNumber(normalizedSummary?.totalItemsSold ?? 0)}
          />
          <MetricCard
            label="Ingresos estimados"
            value={formatCurrency(normalizedSummary?.totalRevenue ?? 0)}
          />
          <MetricCard
            label="Ticket promedio"
            value={formatCurrency(normalizedSummary?.averageOrderValue ?? 0)}
          />
          <MetricCard
            label="Productos distintos vendidos"
            value={formatNumber(normalizedSummary?.uniqueProducts ?? 0)}
          />
        </div>
      )}

      {mode === "bookings" && (
        <div className="grid gap-3 md:grid-cols-4 text-xs">
          <MetricCard
            label="Citas totales"
            value={formatNumber(normalizedSummary?.totalAppointments ?? 0)}
          />
          <MetricCard
            label="Confirmadas"
            value={formatNumber(normalizedSummary?.confirmed ?? 0)}
          />
          <MetricCard
            label="Canceladas"
            value={formatNumber(normalizedSummary?.cancelled ?? 0)}
          />
          <MetricCard
            label="Tasa de cumplimiento"
            value={`${normalizedSummary?.completionRate ?? 0}%`}
          />
        </div>
      )}

      {/* DETALLE */}
      {mode === "products" ? (
        <ProductsDetail data={data} />
      ) : (
        <BookingsDetail data={data} />
      )}

      {/* SUGERENCIAS */}
      {suggestions?.length > 0 && (
        <div className="mt-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            Sugerencias para tu negocio
          </h3>
          <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="border rounded-xl px-3 py-2 bg-slate-50/60">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function ProductsDetail({ data }) {
  const topProducts = useMemo(() => {
    if (Array.isArray(data?.topProducts) && data.topProducts.length)
      return data.topProducts;
    if (Array.isArray(data?.bestSellers) && data.bestSellers.length)
      return data.bestSellers.map((item) => ({
        productId: item.id,
        name: item.name,
        totalSold: item.sold ?? 0,
        totalRevenue: item.revenue ?? 0,
        price: item.price ?? null,
        stock: item.stock ?? null,
      }));
    return [];
  }, [data]);

  const lowProducts = useMemo(() => {
    if (Array.isArray(data?.lowProducts) && data.lowProducts.length)
      return data.lowProducts;
    if (Array.isArray(data?.slowMovers) && data.slowMovers.length)
      return data.slowMovers.map((item) => ({
        productId: item.id,
        name: item.name,
        totalSold: item.sold ?? 0,
        totalRevenue: item.revenue ?? 0,
        price: item.price ?? null,
        stock: item.stock ?? null,
      }));
    return [];
  }, [data]);

  const inventoryAlerts = useMemo(() => {
    if (Array.isArray(data?.inventoryAlerts) && data.inventoryAlerts.length)
      return data.inventoryAlerts;
    if (Array.isArray(data?.lowStock) && data.lowStock.length)
      return data.lowStock.map((item) => ({
        level: "warning",
        message: `Stock crítico en "${item.name}" (quedan ${formatNumber(
          item.stock ?? 0
        )} uds.).`,
      }));
    return [];
  }, [data]);

  return (
    <div className="grid gap-4 md:grid-cols-3 text-xs">
      {/* Top productos */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-1 text-sm">
          Productos más vendidos
        </h3>
        {topProducts.length === 0 && (
          <p className="text-slate-500">Aún no hay ventas registradas.</p>
        )}
        <ul className="space-y-1">
          {topProducts.map((p) => (
            <li
              key={p.productId}
              className="flex justify-between items-center border rounded-lg px-2 py-1 bg-slate-50"
            >
              <span className="truncate max-w-[130px]">{p.name}</span>
              <span className="font-semibold text-right">
                {formatNumber(p.totalSold)} uds.
                <br />
                <span className="text-[11px] text-slate-500">
                  {formatCurrency(p.totalRevenue ?? 0)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Baja rotación */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-1 text-sm">
          Productos con baja rotación
        </h3>
        {lowProducts.length === 0 && (
          <p className="text-slate-500">
            Por ahora no hay productos de baja rotación con ventas en el
            período.
          </p>
        )}
        <ul className="space-y-1">
          {lowProducts.map((p) => (
            <li
              key={p.productId}
              className="flex justify-between items-center border rounded-lg px-2 py-1 bg-slate-50"
            >
              <span className="truncate max-w-[130px]">{p.name}</span>
              <span className="font-semibold">
                {formatNumber(p.totalSold)} uds.
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Alertas inventario */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-1 text-sm">
          Alertas de inventario
        </h3>
        {inventoryAlerts.length === 0 && (
          <p className="text-slate-500">
            No se detectan alertas fuertes de inventario en este período.
          </p>
        )}
        <ul className="space-y-1">
          {inventoryAlerts.map((a, i) => (
            <li
              key={i}
              className={`border rounded-lg px-2 py-1 ${
                a.level === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              {a.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BookingsDetail({ data }) {
  const busySlots = useMemo(() => {
    if (Array.isArray(data?.busySlots) && data.busySlots.length)
      return data.busySlots;
    if (Array.isArray(data?.peakHours) && data.peakHours.length)
      return data.peakHours;
    return [];
  }, [data]);

  const services = useMemo(() => {
    if (Array.isArray(data?.services) && data.services.length)
      return data.services.map((service) => ({
        ...service,
        total: service.total ?? service.count ?? 0,
        name: service.name ?? service.service ?? "Servicio",
      }));
    if (Array.isArray(data?.popularServices) && data.popularServices.length)
      return data.popularServices.map((service, idx) => ({
        name: service.name ?? service.service ?? `Servicio ${idx + 1}`,
        total: service.total ?? service.count ?? 0,
      }));
    return [];
  }, [data]);

  return (
    <div className="grid gap-4 md:grid-cols-2 text-xs">
      {/* Horarios más ocupados */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-1 text-sm">
          Horarios con más demanda
        </h3>
        {busySlots.length === 0 && (
          <p className="text-slate-500">
            No hay suficientes citas para estimar horarios pico.
          </p>
        )}
        <ul className="space-y-1">
          {busySlots.map((s) => (
            <li
              key={s.hour}
              className="flex justify-between items-center border rounded-lg px-2 py-1 bg-slate-50"
            >
              <span>{s.hour}</span>
              <span className="font-semibold">{s.count} citas</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Servicios más usados */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-1 text-sm">
          Servicios más solicitados
        </h3>
        {services.length === 0 ? (
          <p className="text-slate-500">
            Aún no hay servicios suficientes en el período seleccionado.
          </p>
        ) : (
          <ul className="space-y-1">
            {services.map((s, idx) => (
              <li
                key={s.name || s.service || idx}
                className="flex justify-between items-center border rounded-lg px-2 py-1 bg-slate-50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{s.name || s.service}</span>
                  {typeof s.avgRating === "number" && (
                    <span className="text-[11px] text-slate-500">
                      Satisfacción promedio: {s.avgRating.toFixed(1)} / 5
                    </span>
                  )}
                </div>
                <span className="font-semibold">{formatNumber(s.total ?? 0)} citas</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
