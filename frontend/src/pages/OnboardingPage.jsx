// src/pages/OnboardingPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveMyStore } from "../api/store";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    mode: "products", // "products" = catálogo/ventas, "bookings" = agenda de horas
    description: "",
    logoUrl: "",
  });
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await saveMyStore(form);
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "No se pudo guardar la configuración.";
      setError(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Configura tu tienda</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre de la tienda</label>
          <input
            className="border rounded w-full p-2"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Ej: Vitrinex de Maxi"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Tipo de tienda</label>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="products"
                checked={form.mode === "products"}
                onChange={onChange}
              />
              Productos (catálogo/ventas)
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="bookings"
                checked={form.mode === "bookings"}
                onChange={onChange}
              />
              Agendamiento de horas
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Descripción (opcional)</label>
          <textarea
            className="border rounded w-full p-2"
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Logo (URL opcional)</label>
          <input
            className="border rounded w-full p-2"
            name="logoUrl"
            value={form.logoUrl}
            onChange={onChange}
            placeholder="https://…"
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Guardar y continuar
        </button>
      </form>
    </div>
  );
}
