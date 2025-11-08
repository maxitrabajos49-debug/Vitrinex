// src/pages/ExploreStoresPage.jsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

const comunasMock = [
  "",
  "Renca",
  "Quilicura",
  "Independencia",
  "Santiago",
  "Providencia",
  "Ñuñoa",
];

const tiposMock = [
  "",
  "barberia",
  "restaurante",
  "tienda de ropa",
  "servicios",
];

const DEFAULT_CENTER = [-33.45, -70.66];
const DEFAULT_ZOOM = 13;

export default function ExploreStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    comuna: "",
    tipoNegocio: "",
    mode: "",
  });

  const [error, setError] = useState("");

  const loadStores = async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const { comuna, tipoNegocio, mode } = currentFilters;

      const params = {};
      if (comuna) params.comuna = comuna;
      if (tipoNegocio) params.tipoNegocio = tipoNegocio;
      if (mode) params.mode = mode;

      const { data } = await listPublicStores(params);
      setStores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "No se pudieron cargar los negocios."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeFilter = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  const onSubmitFilters = (e) => {
    e.preventDefault();
    loadStores(filters);
  };

  // Aceptamos lat/lng como string o number, sólo excluimos null/NaN
  const storesWithCoords = stores.filter((s) => {
    if (
      s.lat === null ||
      s.lng === null ||
      s.lat === undefined ||
      s.lng === undefined
    )
      return false;
    const latNum = Number(s.lat);
    const lngNum = Number(s.lng);
    return !Number.isNaN(latNum) && !Number.isNaN(lngNum);
  });

  const mapCenter =
    storesWithCoords.length > 0
      ? [Number(storesWithCoords[0].lat), Number(storesWithCoords[0].lng)]
      : DEFAULT_CENTER;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <MainHeader subtitle="Explora negocios dentro de la plataforma" />

      {/* Layout principal: 3 columnas en desktop */}
<main className="flex-1 max-w-[1600px] mx-auto px-4 py-6 grid gap-4 md:gap-6 md:grid-cols-[260px,minmax(0,2.6fr),minmax(0,1.4fr)]">
        {/* Columna izquierda: filtros */}
        <aside className="bg-white border rounded-2xl shadow-sm p-4 h-fit space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Filtros</h2>

          <form onSubmit={onSubmitFilters} className="space-y-3 text-sm">
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
              <label className="block mb-1 text-slate-600">
                Tipo de negocio
              </label>
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
              <label className="block mb-1 text-slate-600">
                Tipo de operación
              </label>
              <select
                name="mode"
                value={filters.mode}
                onChange={onChangeFilter}
                className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="products">Productos</option>
                <option value="bookings">Agendamiento</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5 text-sm font-medium transition"
            >
              Aplicar filtros
            </button>
          </form>
        </aside>

        {/* Columna central: MAPA grande */}
        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 pt-3 pb-2 border-b">
            <h2 className="text-sm font-semibold text-slate-800">
              Mapa de negocios
            </h2>
            <p className="text-xs text-slate-500">
              Visualiza los negocios registrados en Vitrinex.
            </p>
          </div>

          <div className="flex-1">
            <MapContainer
              center={mapCenter}
              zoom={DEFAULT_ZOOM}
              style={{ height: "720px", width: "100%" }}
              scrollWheelZoom={true}
            >
              {/* 🎨 Tile más bonito (Carto Light) */}
              <TileLayer
                attribution="© OpenStreetMap contributors · © CARTO"
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {storesWithCoords.map((store) => (
                <Marker
                  key={store._id}
                  position={[Number(store.lat), Number(store.lng)]}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{store.name}</strong>
                      <br />
                      {store.comuna || "Comuna no especificada"}
                      <br />
                      {store.tipoNegocio || "Tipo no especificado"}
                      {store.user?.username && (
                        <>
                          <br />
                          <span className="text-xs text-slate-600">
                            Propietario: {store.user.username}
                          </span>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>

        {/* Columna derecha: lista de negocios */}
        <section className="bg-white border rounded-2xl shadow-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-800">
              Negocios encontrados
            </h2>
            <span className="text-xs text-slate-500">
              {loading
                ? "Cargando..."
                : `${stores.length} negocio(s) encontrados`}
            </span>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-2">{error}</p>
          )}

          {!loading && stores.length === 0 && !error && (
            <p className="text-sm text-slate-500">
              No se encontraron negocios con los filtros seleccionados.
            </p>
          )}

          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1">
            {stores.map((store) => (
              <article
                key={store._id}
                className="border rounded-xl px-3 py-3 flex gap-3 items-start hover:border-slate-300 transition bg-white"
              >
                {store.logoUrl && (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-12 h-12 rounded-lg object-cover border"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">
                      {store.name}
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {store.mode === "bookings"
                        ? "Agendamiento"
                        : "Productos"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {store.comuna || "Comuna no especificada"} ·{" "}
                    {store.tipoNegocio || "Tipo no especificado"}
                  </p>
                  {store.user?.username && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Propietario:{" "}
                      <span className="font-medium text-slate-700">
                        {store.user.username}
                      </span>
                    </p>
                  )}

                  {store.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {store.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
