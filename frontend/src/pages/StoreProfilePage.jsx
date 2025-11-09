// src/pages/StoreProfilePage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import { getStoreById, updateMyStore } from "../api/store";

export default function StoreProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    mode: "products",
    description: "",
    logoUrl: "",
    comuna: "",
    tipoNegocio: "",
    direccion: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadStore = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getStoreById(id);
      setForm({
        name: data.name || "",
        mode: data.mode || "products",
        description: data.description || "",
        logoUrl: data.logoUrl || "",
        comuna: data.comuna || "",
        tipoNegocio: data.tipoNegocio || "",
        direccion: data.direccion || "",
      });
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información de la tienda.");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMsg("");
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
    setMsg("");
    setSaving(true);

    try {
      if (!form.direccion || !form.direccion.trim()) {
        setError(
          "Ingresa una dirección exacta para poder ubicar tu negocio en el mapa."
        );
        setSaving(false);
        return;
      }

      const coords = await getCoordinates(form.direccion.trim());

      if (!coords) {
        setError(
          "No pudimos encontrar la ubicación de esa dirección. Intenta ser más específico (incluye comuna y región)."
        );
        setSaving(false);
        return;
      }

      const payload = {
        ...form,
        lat: coords.lat,
        lng: coords.lng,
      };

      await updateMyStore(id, payload);

      setMsg("Tienda actualizada correctamente.");
    } catch (err) {
      console.error(err);
      setError("Error al guardar los cambios de la tienda.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Cargando tienda..." />
        <p className="p-6 text-sm text-slate-500">Cargando información…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <MainHeader subtitle="Editar perfil de la tienda" />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">
              {form.name || "Editar tienda"}
            </h2>
            <p className="text-sm text-slate-500">
              Actualiza la información visible de tu negocio en Vitrinex.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/tienda/${id}`)}
              className="border border-slate-300 text-slate-700 text-xs md:text-sm px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Ver perfil público
            </button>
            <button
              onClick={() => navigate("/onboarding")}
              className="border border-slate-300 text-slate-700 text-xs md:text-sm px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Volver a mis tiendas
            </button>
          </div>
        </div>

        <section className="bg-white border rounded-2xl p-5 shadow-sm">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
              {error}
            </p>
          )}

          {msg && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
              {msg}
            </p>
          )}

          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nombre del negocio
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tipo de tienda
              </label>
              <select
                name="mode"
                value={form.mode}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="products">Productos</option>
                <option value="bookings">Agendamiento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Comuna
              </label>
              <input
                name="comuna"
                value={form.comuna}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tipo de negocio
              </label>
              <input
                name="tipoNegocio"
                value={form.tipoNegocio}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={3}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Describe brevemente tu negocio"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Logo (URL de imagen)
              </label>
              <input
                name="logoUrl"
                value={form.logoUrl}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Dirección exacta
              </label>
              <input
                name="direccion"
                value={form.direccion}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Ej: La Punta 1702, Renca, Región Metropolitana"
              />
              <p className="text-xs text-slate-500 mt-1">
                Usamos esta dirección para posicionar tu negocio en el mapa.
              </p>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                onClick={() => navigate("/onboarding")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
