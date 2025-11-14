// frontend/src/pages/ExploreStoresPage.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MainHeader from "../components/MainHeader";
import { listPublicStores } from "../api/store";

const INITIAL_CENTER = [-33.4489, -70.6693]; // Santiago
const INITIAL_ZOOM = 12;

export default function ExploreStoresPage() {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    comuna: "",
    tipoNegocio: "",
    mode: "",
  });

  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);
  const [mapZoom, setMapZoom] = useState(INITIAL_ZOOM);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (filters.comuna) params.comuna = filters.comuna;
      if (filters.tipoNegocio) params.tipoNegocio = filters.tipoNegocio;
      if (filters.mode) params.mode = filters.mode;

      const { data } = await listPublicStores(params);
      setStores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los negocios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.comuna, filters.tipoNegocio, filters.mode]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocusOnStore = (store) => {
    if (!store.lat || !store.lng) return;
    setSelectedStoreId(store._id);
    setMapCenter([store.lat, store.lng]);
    setMapZoom(16);
  };

  const handleOpenProfile = (storeId) => {
    navigate(`/tienda/${storeId}`);
  };

  const comunasOptions = useMemo(() => {
    const set = new Set();
    stores.forEach((s) => s.comuna && set.add(s.comuna));
    return Array.from(set);
  }, [stores]);

  const tiposOptions = useMemo(() => {
    const set = new Set();
    stores.forEach((s) => s.tipoNegocio && set.add(s.tipoNegocio));
    return Array.from(set);
  }, [stores]);

  return (
    <div
  className="min-h-screen flex flex-col"
  style={{
    background: "linear-gradient(to bottom, #e1c0f6 0%, #ffffff 80%)",
  }}
>

      <MainHeader subtitle="Explora negocios dentro de la plataforma" />

      <main className="flex-1 w-full px-2 md:px-4 py-4">
        {/* Contenedor amplio */}
        <div className="mx-auto w-full max-w-7xl lg:max-w-6xl xl:max-w-7xl space-y-4">
          {/* Grid principal: filtros / mapa ancho / lista */}
          <div className="grid gap-4 lg:grid-cols-[260px,minmax(0,2.5fr),320px]">
            {/* Filtros a la izquierda */}
            <aside className="bg-white border rounded-2xl p-4 shadow-sm h-fit">
              <h2 className="text-base font-semibold text-slate-800 mb-3">
                Filtros
              </h2>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Comuna
                  </label>
                  <select
                    name="comuna"
                    value={filters.comuna}
                    onChange={handleFilterChange}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  >
                    <option value="">Todas</option>
                    {comunasOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Tipo de negocio
                  </label>
                  <select
                    name="tipoNegocio"
                    value={filters.tipoNegocio}
                    onChange={handleFilterChange}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  >
                    <option value="">Todos</option>
                    {tiposOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Tipo de operación
                  </label>
                  <select
                    name="mode"
                    value={filters.mode}
                    onChange={handleFilterChange}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  >
                    <option value="">Todos</option>
                    <option value="products">Venta de productos</option>
                    <option value="bookings">Agendamiento de citas</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={loadStores}
                  className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg"
                >
                  Aplicar filtros
                </button>
              </div>
            </aside>

            {/* Mapa MUCHO más ancho en el centro */}
            <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b px-4 py-2">
                <h2 className="text-base font-semibold text-slate-800">
                  Mapa de negocios
                </h2>
                <p className="text-xs text-slate-500">
                  Visualiza los negocios registrados en Vitrinex.
                </p>
              </div>

              <div className="h-[420px] md:h-[480px] lg:h-[520px]">
                <MapContainer
                  key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                  center={mapCenter}
                  zoom={mapZoom}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {stores
                    .filter((s) => s.lat && s.lng)
                    .map((store) => (
                      <Marker
                        key={store._id}
                        position={[store.lat, store.lng]}
                        eventHandlers={{
                          click: () => handleFocusOnStore(store),
                        }}
                      >
                        <Popup>
                          <div className="text-xs">
                            <div className="font-semibold mb-1">
                              {store.name}
                            </div>
                            {store.comuna && (
                              <div className="text-slate-600 mb-1">
                                {store.comuna}
                              </div>
                            )}
                            <button
                              className="text-blue-600 underline text-[11px]"
                              onClick={() => handleOpenProfile(store._id)}
                            >
                              Ver perfil
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>
              </div>
            </section>

            {/* Lista de negocios a la derecha */}
            <aside className="bg-white border rounded-2xl p-4 shadow-sm h-[420px] md:h-[480px] lg:h-[520px] flex flex-col">
              <div className="mb-2">
                <h2 className="text-base font-semibold text-slate-800">
                  Negocios encontrados
                </h2>
                <p className="text-xs text-slate-500">
                  {loading
                    ? "Cargando negocios…"
                    : `${stores.length} negocio(s) encontrados`}
                </p>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1 mb-2">
                  {error}
                </p>
              )}

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {!loading && stores.length === 0 && !error && (
                  <p className="text-xs text-slate-500">
                    No se encontraron negocios con esos filtros.
                  </p>
                )}

                {stores.map((store) => (
                  <article
                    key={store._id}
                    className={`border rounded-xl px-3 py-2 text-xs cursor-pointer transition-colors ${
                      selectedStoreId === store._id
                        ? "border-blue-500 bg-blue-50/60"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                    onClick={() => handleFocusOnStore(store)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">
                          {store.name}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {store.tipoNegocio || "Sin categoría"}{" "}
                          {store.comuna ? `· ${store.comuna}` : ""}
                        </p>
                      </div>
                    </div>

                    {store.direccion && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {store.direccion}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                        {store.mode === "bookings"
                          ? "Agendamiento de citas"
                          : "Venta de productos"}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProfile(store._id);
                        }}
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        Ver perfil
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
