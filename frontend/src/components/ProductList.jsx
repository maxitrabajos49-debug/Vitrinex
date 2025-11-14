// src/components/ProductList.jsx
import { useEffect, useState } from "react";
import { listStoreProductsForOwner } from "../api/store";

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0,
});

export default function ProductList({ storeId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await listStoreProductsForOwner(storeId);
      setProducts(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) load();
  }, [storeId]);

  return (
    <section className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">
        Productos registrados
      </h3>

      {loading && <p className="text-sm text-slate-500">Cargando catálogo…</p>}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {products.length === 0 && !loading && (
        <p className="text-sm text-slate-500">
          Aún no has agregado productos.
        </p>
      )}

      <div className="space-y-3">
        {products.map((product) => {
          const imageSrc =
            product.imageUrl ||
            product.image ||
            (product.images?.[0] ?? null);

          return (
            <article
              key={product._id}
              className="border border-slate-200 rounded-2xl overflow-hidden flex bg-slate-50/60"
            >
              <div className="w-32 h-28 bg-slate-100 flex items-center justify-center">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-slate-400">Sin imagen</span>
                )}
              </div>
              <div className="flex-1 p-3 flex flex-col justify-center">
                <p className="font-semibold text-sm text-slate-800">
                  {product.name}
                </p>
                {product.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="font-semibold text-emerald-600">
                    {currencyFormatter.format(product.price || 0)}
                  </span>
                  <span className="text-slate-500">
                    Stock: {product.stock ?? 0}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
