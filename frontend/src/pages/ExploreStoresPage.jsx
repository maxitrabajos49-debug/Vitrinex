import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

import { listPublicStores } from "../api/store";
import MainHeader from "../components/MainHeader";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix íconos Leaflet con Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const comunasMock = ["", "Renca", "Independencia", "Santiago", "Quilicura"];
const tiposMock = ["", "Comida", "Almacén", "Supermercado", "Plantas"];
const modesMock = [
  { value: "", label: "Todos" },
  { value: "products", label: "Productos" },
  { value: "bookings", label: "Agendamiento" },
];

// 🔹 Componente auxiliar para centrar el mapa en una tienda seleccionada
function FlyToStore({ selectedStore }) {
  const map = useMap();
  useEffect(() => {
    if (selectedStore?.lat && selectedStore?.lng) {
      map.flyTo([selectedStore.lat, selectedStore.lng], 16, {
        duration: 1.5,
      });
    }
  }, [selectedStore, map]);
  return null;
}

export default function ExploreStoresPage() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({
    comuna: "",
    tipoNegocio: "",
    mode: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
  const navigate = useNavigate();
  const mapRef = useRef(null);

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
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const onChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const onApplyFilters = (e) => {
    e.preventDefault();
    loadStores();
  };

  const center = [-33.4372, -70.6506]; // Santiago

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <MainHeader subtitle="Explora negocios dentro de la plataforma" />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 grid gap-4 md:grid-cols-[260px,minmax(0,1.5fr),minmax(0,1.2fr)]">
        {/* Filtros */}
        <aside className="bg-white border rounded-2xl shadow-sm p-4 space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Filtros</h2>
          <form onSubmit={onApplyFilters} className="space-y-3 text-sm">
            <div>
              <label className="block mb-1 text-slate-600">Comuna</label>
              <select
                name="comuna"
                value={filters.comuna}
                onChange={onChangeFilter}
                className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {comunasMock.map((c) => (
                  <option key={c || "todas"} value={c}>
                    {c || "Todas"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-slate-600">Tipo de negocio</label>
              <select
                name="tipoNegocio"
                value={filters.tipoNegocio}
                onChange={onChangeFilter}
                className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {tiposMock.map((t) => (
                  <option key={t || "todos"} value={t}>
                    {t || "Todos"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-slate-600">Tipo de operación</label>
              <select
                name="mode"
                value={filters.mode}
                onChange={onChangeFilter}
                className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {modesMock.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-3 py-2"
            >
              Aplicar filtros
            </button>
          </form>
        </aside>

        {/* Mapa */}
        <section className="bg-white border rounded-2xl shadow-sm p-4 flex flex-col">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Mapa de negocios
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Visualiza los negocios registrados en Vitrinex.
          </p>

          <div className="flex-1 overflow-hidden rounded-xl border">
            <MapContainer
              ref={mapRef}
              center={center}
              zoom={13}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FlyToStore selectedStore={selectedStore} />

              {stores.map((store) =>
                store.lat && store.lng ? (
                  <Marker
                    key={store._id}
                    position={[store.lat, store.lng]}
                    eventHandlers={{
                      click: () => navigate(`/tienda/${store._id}`),
                    }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <strong>{store.name}</strong>
                        <br />
                        {store.tipoNegocio || "Negocio"} ·{" "}
                        {store.comuna || "Sin comuna"}
                        {store.ownerName && (
                          <>
                            <br />
                            <span className="text-slate-600">
                              Dueño:{" "}
                              <span className="font-medium">
                                {store.ownerName}
                              </span>
                            </span>
                          </>
                        )}
                        {store.direccion && (
                          <>
                            <br />
                            <span>{store.direccion}</span>
                          </>
                        )}
                        <br />
                        <button
                          onClick={() => navigate(`/tienda/${store._id}`)}
                          className="mt-1 text-[11px] text-blue-600 hover:underline"
                        >
                          Ver perfil
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>
        </section>

        {/* Listado de negocios */}
        <section className="bg-white border rounded-2xl shadow-sm p-4 flex flex-col">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-base font-semibold text-slate-800">
              Negocios encontrados
            </h2>
            <span className="text-xs text-slate-500">
              {stores.length} negocio(s) encontrados
            </span>
          </div>

          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

          {loading ? (
            <p className="text-xs text-slate-500">Cargando negocios…</p>
          ) : stores.length === 0 ? (
            <p className="text-xs text-slate-500">
              No se encontraron negocios con los filtros actuales.
            </p>
          ) : (
            <div className="mt-2 space-y-2 overflow-auto">
              {stores.map((store) => (
                <article
                  key={store._id}
                  className="border rounded-xl px-3 py-2 text-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {store.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt={store.name}
                        className="h-10 w-10 rounded-full object-cover border flex-shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold flex-shrink-0">
                        {store.name?.[0]?.toUpperCase() || "N"}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-slate-800 text-sm truncate">
                          {store.name}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                          {store.mode === "bookings"
                            ? "Agendamiento"
                            : "Productos"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500">
                        {store.comuna || "Sin comuna"} ·{" "}
                        {store.tipoNegocio || "Tipo no especificado"}
                      </p>

                      {store.ownerName && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Dueño:{" "}
                          <span className="font-medium text-slate-700">
                            {store.ownerName}
                          </span>
                        </p>
                      )}

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setSelectedStore(store)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Ver en mapa
                        </button>
                        <button
                          onClick={() => navigate(`/tienda/${store._id}`)}
                          className="text-xs text-slate-600 hover:text-blue-700"
                        >
                          Ir al perfil →
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
