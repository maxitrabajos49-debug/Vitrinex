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
  stock: "",
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
      const { data } = await listStoreProductsForOwner(storeId);
      setProducts(data || []);
    } catch (err) {
      setError("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) load();
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

    if (!form.name.trim()) return setFormError("Ingresa el nombre del producto");

    const priceValue = Number(form.price);
    if (Number.isNaN(priceValue) || priceValue < 0)
      return setFormError("Ingresa un precio válido");

    const stockValue = Number(form.stock);
    if (Number.isNaN(stockValue) || stockValue < 0)
      return setFormError("Ingresa un stock válido");

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
      stock: stockValue,
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
      console.log(err);
      setFormError("No se pudo guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ? String(product.price) : "",
      stock: product.stock ? String(product.stock) : "",
      images: formatImagesForInput(product.images),
      isActive: Boolean(product.isActive),
    });
  };

  const onDelete = async (productId) => {
    if (!window.confirm("¿Eliminar este producto?")) return;

    try {
      await deleteStoreProduct(storeId, productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert("No se pudo eliminar el producto");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

      if (!data.imageUrl) {
        alert("Error: no llegó URL desde el backend");
        return;
      }

      setForm((prev) => ({
        ...prev,
        images: prev.images ? prev.images + "\n" + data.imageUrl : data.imageUrl,
      }));
    } catch (err) {
      alert("No se pudo subir la imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <section className="bg-white border rounded-2xl p-5 shadow-sm space-y-5">

      {/* ================================
          PANEL DE PRODUCTOS REGISTRADOS
      ================================= */}
      <h3 className="text-lg font-semibold text-slate-800">
        Productos registrados
      </h3>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-3">
        {products.map((product) => (
          <article
            key={product._id}
            className="border bg-slate-50 rounded-xl p-3 flex gap-4"
          >

            {/* Imagen */}
            <div className="w-20 h-20 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-contain w-full h-full"
                />
              ) : (
                <span className="text-xs text-slate-400">Sin imagen</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="font-semibold">{product.name}</p>
              <p className="text-xs text-slate-500">
                Precio: ${product.price.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">
                Stock: {product.stock}
              </p>
              {!product.isActive && (
                <span className="text-[10px] text-red-500">
                  (Oculto en la tienda pública)
                </span>
              )}
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-1 text-right">
              <button
                onClick={() => onEdit(product)}
                className="text-blue-600 text-xs"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(product._id)}
                className="text-red-600 text-xs"
              >
                Eliminar
              </button>
            </div>

          </article>
        ))}
      </div>

      {/* ================================
          FORMULARIO AGREGAR / EDITAR
      ================================= */}
      <h3 className="text-lg font-semibold text-slate-800">
        {editingId ? "Editar producto" : "Agregar producto"}
      </h3>

      <form onSubmit={onSubmit} className="grid gap-3">

        <div>
          <label className="text-xs text-slate-600">Nombre</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600">Precio</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600">Stock</label>
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={onChange}
          />
          <span className="text-xs text-slate-600">Mostrar en tienda pública</span>
        </div>

        <div>
          <label className="text-xs text-slate-600">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600">Imágenes</label>
          <input type="file" onChange={handleImageUpload} />
          <textarea
            name="images"
            value={form.images}
            onChange={onChange}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 mt-2"
            placeholder="https://..."
          />
        </div>

        {formError && <p className="text-red-600 text-sm">{formError}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Agregar producto"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-300 text-slate-800 px-4 py-2 rounded-lg"
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

    </section>
  );
}
