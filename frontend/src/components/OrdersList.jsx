// src/components/OrdersList.jsx
import { useEffect, useState } from "react";
import { listStoreOrders } from "../api/store";

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0,
});

export default function OrdersList({ storeId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await listStoreOrders(storeId);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar pedidos", err?.response || err);
      setError(err?.response?.data?.message || "No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  return (
    <section className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Pedidos recibidos</h3>
          <p className="text-sm text-slate-500">
            Administra las compras realizadas por tus clientes.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="text-sm text-blue-600 hover:underline"
        >
          Actualizar
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Cargando pedidos…</p>}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!loading && orders.length === 0 && !error && (
        <p className="text-sm text-slate-500">
          Aún no tienes pedidos registrados. Comparte tu catálogo para recibir
          compras.
        </p>
      )}

      <div className="grid gap-3">
        {orders.map((order) => (
          <article
            key={order._id}
            className="border border-slate-200 rounded-xl px-4 py-3 space-y-2"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-semibold text-slate-700">
                {order.customerName}
              </h4>
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {order.status === "pending"
                  ? "Pendiente"
                  : order.status === "confirmed"
                  ? "Confirmado"
                  : order.status === "fulfilled"
                  ? "Completado"
                  : "Cancelado"}
              </span>
            </div>

            <p className="text-sm text-slate-600">
              Total {currencyFormatter.format(Number(order.total) || 0)}
            </p>

            {order.customerEmail && (
              <p className="text-xs text-slate-500">📧 {order.customerEmail}</p>
            )}

            {order.customerPhone && (
              <p className="text-xs text-slate-500">📞 {order.customerPhone}</p>
            )}

            {order.customerAddress && (
              <p className="text-xs text-slate-500">📍 {order.customerAddress}</p>
            )}

            <div className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 space-y-2">
              <p className="text-xs font-semibold text-slate-600">Productos</p>
              <ul className="space-y-1">
                {(order.items || []).map((item, idx) => (
                  <li key={`${order._id}-${idx}`} className="text-xs text-slate-600">
                    {item.quantity} × {item.productName} · {" "}
                    {currencyFormatter.format(Number(item.subtotal) || 0)}
                  </li>
                ))}
              </ul>
            </div>

            {order.notes && (
              <p className="text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2">
                {order.notes}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
