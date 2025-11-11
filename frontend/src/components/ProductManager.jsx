// src/components/ProductManager.jsx
import { useEffect, useState } from "react";
import {
  listStoreProductsForOwner,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
} from "../api/store";
import axios from "axios";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  images: "",
  isActive: true,
};

const formatImagesForInput = (images) => (images || []).join("\n");

export default function ProductManager({ storeId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await listStoreProductsForOwner(storeId);

      // ⬇️ IMPORTANTE: ignoramos productos marcados como eliminados
      const cleaned = Array.isArray(data)
        ? data.filter((p) => !p.isDeleted)
        : [];

      setProducts(cleaned);
    } catch (err) {
      console.error("Error al cargar productos", err?.response || err);
      setError(
        err?.response?.data?.message || "No se pudieron cargar los productos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError("");
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Ingresa el nombre del producto");
      return;
    }

    const priceValue = Number(form.price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      setFormError("Ingresa un precio válido");
      return;
    }

    const images =
      typeof form.images === "string"
        ? form.images
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const payload = {
      name: form.name.trim(),
      description: form.description,
      price: priceValue,
      images,
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      if (editingId) {
        await updateStoreProduct(storeId, editingId, payload);
      } else {
        await createStoreProduct(storeId, payload);
      }
      resetForm();
      await load();
    } catch (err) {
      console.error("Error al guardar producto", err?.response || err);
      setFormError(
        err?.response?.data?.message || "No se pudo guardar el producto"
      );
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price:
        product.price !== undefined && product.price !== null
          ? String(product.price)
          : "",
      images: formatImagesForInput(product.images),
      isActive: Boolean(product.isActive),
    });
  };

  // 🗑 ELIMINAR (DELETE real hacia el backend)
  const onDelete = async (productId) => {
    if (!window.confirm("¿Eliminar este producto?")) return;

    try {
      await deleteStoreProduct(storeId, productId);
      // Lo sacamos del estado
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error("Error al eliminar producto", err?.response || err);
      alert(
        err?.response?.data?.message || "No se pudo eliminar el producto"
      );
    }
  };

  // 📸 Subir imagen local para el producto
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !storeId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeId", storeId);

    try {
      setUploading(true);
      const { data } = await axios.post(
        "http://localhost:3000/api/upload/product-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      const imageUrl = data.imageUrl;
      if (!imageUrl) {
        alert("No se recibió URL de la imagen");
        return;
      }

      setForm((prev) => ({
        ...prev,
        images: prev.images ? `${prev.images}\n${imageUrl}` : imageUrl,
      }));
    } catch (err) {
      console.error("Error al subir imagen de producto", err?.response || err);
      alert(
        err?.response?.data?.message ||
          "Error al subir la imagen de producto"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <section className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Catálogo de productos
          </h3>
          <p className="text-sm text-slate-500">
            Gestiona los productos que ofreces en tu tienda.
          </p>
        </div>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="text-sm text-blue-600 hover:underline"
          >
            Cancelar edición
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Nombre del producto
          </label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Ej: Servicio de manicure"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Precio
          </label>
          <input
            name="price"
            value={form.price}
            onChange={onChange}
            type="number"
            step="0.01"
            min="0"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={onChange}
          />
          <label htmlFor="isActive" className="text-xs text-slate-600">
            Mostrar producto en la tienda pública
          </label>
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
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Describe los beneficios de tu producto"
          />
        </div>

        {/* Imágenes: archivo + links */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Imágenes
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">
              Sube una imagen desde tu dispositivo
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-xs"
            />
            {uploading && (
              <p className="text-xs text-slate-500">Subiendo imagen…</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 mt-1">
              O pega enlaces (una por línea o separadas por coma)
            </label>
            <textarea
              name="images"
              value={form.images}
              onChange={onChange}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
        </div>

        {formError && (
          <p className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {formError}
          </p>
        )}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {saving
              ? "Guardando…"
              : editingId
              ? "Actualizar producto"
              : "Agregar producto"}
          </button>
        </div>
      </form>

      <div className="border-t border-slate-200 pt-4 space-y-3">
        <h4 className="font-semibold text-slate-700">
          Productos registrados
        </h4>

        {loading && (
          <p className="text-sm text-slate-500">Cargando productos…</p>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {!loading && products.length === 0 && !error && (
          <p className="text-sm text-slate-500">
            Aún no tienes productos publicados. Agrega tu primer
            producto usando el formulario superior.
          </p>
        )}

        <div className="grid gap-3">
          {products
            // por si acaso, también filtramos aquí por si en algún momento cambian el backend
            .filter((product) => !product.isDeleted)
            .map((product) => (
              <article
                key={product._id}
                className="border border-slate-200 rounded-xl px-4 py-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-800">
                      {product.name}
                    </h5>
                    <p className="text-xs text-slate-500">
                      {Number(product.price).toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                        minimumFractionDigits: 0,
                      })}
                    </p>
                    {!product.isActive && (
                      <span className="text-xs text-amber-600">
                        Oculto en la tienda
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {product.description && (
                  <p className="text-xs text-slate-600">
                    {product.description}
                  </p>
                )}

                {Array.isArray(product.images) && product.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-1">
                    {product.images.map((img) => (
                      <img
                        key={img}
                        src={img}
                        alt={product.name}
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                    ))}
                  </div>
                )}
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}
