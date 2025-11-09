// src/pages/StorePublic.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStoreById } from "../api/store";
import MainHeader from "../components/MainHeader";

export default function StorePublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadStore = async () => {
    try {
      setLoading(true);
      const { data } = await getStoreById(id);
      setStore(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información del negocio.");
    } finally {
      setLoading(false);
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
        {/* ENCABEZADO */}
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
            <h2 className="text-2xl font-semibold text-slate-800">
              {store.name}
            </h2>
            <p className="text-slate-600 text-sm">
              {store.description || "Sin descripción."}
            </p>
            <p className="text-xs text-slate-500">
              {store.tipoNegocio || "Negocio"} ·{" "}
              {store.comuna || "Ubicación desconocida"}
            </p>

            {store.direccion && (
              <p className="text-sm text-slate-700 mt-1">📍 {store.direccion}</p>
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
                  Dueño:{" "}
                  <span className="font-medium text-slate-800">
                    {store.ownerName}
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SECCIÓN: productos (placeholder) */}
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Productos del negocio
          </h3>
          <p className="text-sm text-slate-500">
            Aquí se mostrarán los productos de esta tienda.
          </p>
        </section>

        {/* SECCIÓN: comentarios (placeholder) */}
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Comentarios de clientes
          </h3>
          <p className="text-sm text-slate-500">
            Aquí los usuarios podrán dejar sus opiniones sobre este negocio.
          </p>
        </section>

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
