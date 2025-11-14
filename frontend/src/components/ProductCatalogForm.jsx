// src/components/ProductCatalogForm.jsx
import { useState } from "react";
import axios from "../api/axiosInstance";

export default function ProductCatalogForm({ storeId, onProductCreated }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    showPublic: true,
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");

    try {
      const { data } = await axios.post(`/stores/${storeId}/products`, form);

      onProductCreated?.(data); // Notifica al padre
      
      setMsg("Producto agregado correctamente.");
      setForm({
        name: "",
        price: "",
        description: "",
        imageUrl: "",
        showPublic: true,
      });

    } catch (err) {
      setError("Error al agregar producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">Catálogo de productos</h2>
      <p className="text-sm text-slate-500 mb-4">
        Agrega productos y aparecerán de inmediato en tu tienda.
      </p>

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {msg && <p className="text-green-600 text-sm mb-2">{msg}</p>}

      <form onSubmit={submit} className="space-y-4 text-sm">

        <div>
          <label className="block text-xs font-medium text-slate-600">Nombre</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            className="border rounded-lg w-full px-3 py-2"
            placeholder="Ej: Servicio de manicure"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600">Precio</label>
          <input
            name="price"
            value={form.price}
            onChange={onChange}
            required
            type="number"
            className="border rounded-lg w-full px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            className="border rounded-lg w-full px-3 py-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600">Imagen (URL)</label>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={onChange}
            className="border rounded-lg w-full px-3 py-2"
            placeholder="https://..."
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="showPublic"
            checked={form.showPublic}
            onChange={onChange}
          />
          Mostrar producto en la tienda pública
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Guardando..." : "Agregar producto"}
        </button>
      </form>
    </div>
  );
}
