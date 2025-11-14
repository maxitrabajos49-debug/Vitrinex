// frontend/src/components/StoreInsightsPanel.jsx
import { useEffect, useState } from "react";
import { getProductInsights } from "../api/insights";

export default function StoreInsightsPanel({ storeId }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      const insights = await getProductInsights(storeId);
      setData(insights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) load();
  }, [storeId]);

  if (loading) return <p>Cargando análisis inteligente...</p>;
  if (!data) return <p>No hay datos suficientes.</p>;

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-5 space-y-6">
      <h2 className="text-xl font-bold text-slate-800">
        📊 Análisis Inteligente de Tu Tienda
      </h2>

      {/* ======== Sección 1: Productos más vendidos ========= */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-2">🔥 Productos más vendidos</h3>
        {data.topProducts.length === 0 && <p className="text-sm text-slate-500">Sin ventas aún.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.topProducts.map((p) => (
            <div key={p._id} className="border p-3 rounded-lg bg-slate-50">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-slate-500">
                Unidades vendidas: {p.totalSold}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ======== Sección 2: Rotación baja ========= */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-2">📉 Productos con baja rotación</h3>
        {data.lowRotation.length === 0 && (
          <p className="text-sm text-slate-500">Todos los productos tienen movimiento.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.lowRotation.map((p) => (
            <div key={p._id} className="border p-3 rounded-lg bg-yellow-50">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-slate-500">Sin ventas recientes</p>
            </div>
          ))}
        </div>
      </div>

      {/* ======== Sección 3: Stock bajo ========= */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-2">⚠️ Productos con stock bajo</h3>
        {data.lowStock.length === 0 && (
          <p className="text-sm text-slate-500">No hay productos con stock crítico.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.lowStock.map((p) => (
            <div key={p._id} className="border p-3 rounded-lg bg-red-50">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-slate-500">Stock actual: {p.stock}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ======== Sección 4: Recomendaciones IA ========= */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-2">🤖 Recomendaciones inteligentes</h3>

        <ul className="list-disc ml-6 text-slate-700 space-y-1">
          {data.recommendations.map((r, index) => (
            <li key={index}>{r}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
