// src/pages/OnboardingPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyStores, saveMyStore, deleteMyStore } from "../api/store";
import MainHeader from "../components/MainHeader";

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mode: "products",
    description: "",
    logoUrl: "",
    comuna: "",
    tipoNegocio: "",
    direccion: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const resetForm = () => {
    setForm({
      name: "",
      mode: "products",
      description: "",
      logoUrl: "",
      comuna: "",
      tipoNegocio: "",
      direccion: "",
    });
    setEditingId(null);
  };

  const loadStores = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await listMyStores();
      const arr = Array.isArray(data) ? data : data ? [data] : [];

      setStores(arr);
      setShowForm(arr.length === 0);
    } catch (err) {
      console.error("Error al cargar tiendas:", err?.response || err);

      if (err?.response?.status === 404) {
        setStores([]);
        setShowForm(true);
        setError("");
      } else {
        setError("Error al cargar tus tiendas");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
  };

  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditStore = (store) => {
    navigate(`/negocio/${store._id}`);
  };

  const handleDeleteStore = async (store) => {
    const ok = window.confirm(
      `¿Seguro que quieres eliminar el negocio "${store.name}"?`
    );
    if (!ok) return;

    try {
      await deleteMyStore(store._id);
      await loadStores();
    } catch (err) {
      console.error("Error al eliminar tienda:", err);
      setError("No se pudo eliminar la tienda.");
    }
  };

  const getCoordinates = async (address) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }
      return null;
    } catch (error) {
      console.error("Error al obtener coordenadas:", error);
      return null;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!form.direccion || !form.direccion.trim()) {
        setError(
          "Ingresa una dirección exacta para poder ubicar tu negocio en el mapa."
        );
        return;
      }

      const coords = await getCoordinates(form.direccion.trim());

      if (!coords) {
        setError(
          "No pudimos encontrar la ubicación de esa dirección. Intenta ser más específico (incluye comuna y región)."
        );
        return;
      }

      const payload = {
        ...form,
        lat: coords.lat,
        lng: coords.lng,
      };

      await saveMyStore(payload);

      resetForm();
      await loadStores();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Error al guardar la tienda");
    }
  };

  return (
       <div
  className="min-h-screen flex flex-col"
  style={{
    background: "linear-gradient(to bottom, #e1c0f6 0%, #ffffff 80%)",
  }}
>
      <MainHeader subtitle="Configura tus negocios en la plataforma" />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">
              Mis tiendas
            </h2>
            <p className="text-sm text-slate-500">
              Administra tus negocios y agrega nuevas tiendas fácilmente.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/")}
              className="border border-slate-300 text-slate-700 text-xs md:text-sm px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Volver al mapa
            </button>
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm px-3 py-2 rounded-lg"
            >
              Nueva tienda
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Cargando tiendas...</p>
        ) : stores.length === 0 ? (
          <div className="bg-white border border-dashed rounded-2xl p-4 text-sm text-slate-600">
            No tienes tiendas registradas. Crea la primera con el formulario de
            abajo.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {stores.map((store) => (
              <article
                key={store._id}
                className="bg-white border rounded-2xl p-4 shadow-sm flex gap-3 items-start"
              >
                {/* Logo / imagen del negocio */}
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="h-12 w-12 rounded-xl object-cover border flex-shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold flex-shrink-0">
                    {store.name?.[0]?.toUpperCase() || "N"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm truncate">
                        {store.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {store.comuna || "Sin comuna"} ·{" "}
                        {store.tipoNegocio || "Tipo no especificado"}
                      </p>
                      {store.direccion && (
                        <p className="text-xs text-slate-600 mt-1">
                          📍 {store.direccion}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleEditStore(store)}
                        className="text-[11px] px-2 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store)}
                        className="text-[11px] px-2 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {showForm && (
          <section className="bg-white border rounded-2xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Crear nueva tienda
            </h3>

            <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Nombre
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Tipo de tienda
                </label>
                <select
                  name="mode"
                  value={form.mode}
                  onChange={onChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="products">Productos</option>
                  <option value="bookings">Agendamiento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Comuna
                </label>
                <input
                  name="comuna"
                  value={form.comuna}
                  onChange={onChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Tipo de negocio
                </label>
                <input
                  name="tipoNegocio"
                  value={form.tipoNegocio}
                  onChange={onChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Dirección exacta
                </label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={onChange}
                  placeholder="Ej: La Punta 1702, Renca, Región Metropolitana"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Usamos esta dirección para ubicar tu negocio en el mapa.
                </p>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Guardar tienda
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
