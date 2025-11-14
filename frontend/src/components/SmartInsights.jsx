// frontend/src/components/SmartInsights.jsx
import { useEffect, useState } from "react";
import {
  fetchProductInsights,
  fetchBookingInsights,
} from "../api/insights";

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

  const { summary, suggestions } = data;

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

        <span className="inline-flex items-center px-2 py-1 text-[11px] rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          {mode === "bookings"
            ? "Agendamiento y servicios"
            : "Productos e inventario"}
        </span>
      </div>

      {/* RESUMEN PRINCIPAL */}
      {mode === "products" && (
        <div className="grid gap-3 md:grid-cols-4 text-xs">
          <MetricCard
            label="Pedidos en el período"
            value={summary?.totalOrders ?? 0}
          />
          <MetricCard
            label="Unidades vendidas"
            value={summary?.totalItemsSold ?? 0}
          />
          <MetricCard
            label="Ingresos estimados"
            value={
              summary?.totalRevenue
                ? `$${summary.totalRevenue.toLocaleString("es-CL")}`
                : "$0"
            }
          />
          <MetricCard
            label="Productos distintos vendidos"
            value={summary?.uniqueProducts ?? 0}
          />
        </div>
      )}

      {mode === "bookings" && (
        <div className="grid gap-3 md:grid-cols-4 text-xs">
          <MetricCard
            label="Citas totales"
            value={summary?.totalAppointments ?? 0}
          />
          <MetricCard label="Confirmadas" value={summary?.confirmed ?? 0} />
          <MetricCard label="Canceladas" value={summary?.cancelled ?? 0} />
          <MetricCard
            label="Tasa de cumplimiento"
            value={`${summary?.completionRate ?? 0}%`}
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
  const { topProducts = [], lowProducts = [], inventoryAlerts = [] } = data;

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
              <span className="font-semibold">{p.totalSold} uds.</span>
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
              <span className="font-semibold">{p.totalSold} uds.</span>
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
  const { busySlots = [], services = [] } = data;

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
        {services.length === 0 && (
          <p className="text-slate-500">
            Aún no hay servicios suficientes en el período seleccionado.
          </p>
        )}
        <ul className="space-y-1">
          {services.map((s) => (
            <li
              key={s.name}
              className="flex justify-between items-center border rounded-lg px-2 py-1 bg-slate-50"
            >
              <div className="flex flex-col">
                <span className="font-medium">{s.name}</span>
                {s.avgRating && (
                  <span className="text-[11px] text-slate-500">
                    Satisfacción promedio: {s.avgRating.toFixed(1)} / 5
                  </span>
                )}
              </div>
              <span className="font-semibold">{s.total} citas</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
