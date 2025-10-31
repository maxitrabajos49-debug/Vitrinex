import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTask, getTask, updateTask } from "../api/tasks";

export default function TaskFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "product",
    price: "",
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const editing = Boolean(id);

  useEffect(() => {
    (async () => {
      if (!editing) return;
      const { data } = await getTask(id);
      setForm({
        title: data.title,
        description: data.description || "",
        type: data.type || "product",
        price: data.price ?? "",
      });
    })();
  }, [id, editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      if (image) fd.append("image", image);

      if (editing) await updateTask(id, fd);
      else await createTask(fd);

      navigate("/tasks");
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo guardar");
    }
  };

  return (
    <section style={styles.wrap}>
      <h1 style={styles.h1}>{editing ? "Editar" : "Nueva"} tarea</h1>
      {error && <div style={styles.err}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Título *</label>
        <input
          style={styles.input}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <label style={styles.label}>Descripción</label>
        <textarea
          style={{ ...styles.input, minHeight: 90 }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label style={styles.label}>Tipo</label>
        <select
          style={styles.input}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="product">Producto</option>
          <option value="service">Servicio</option>
        </select>

        {form.type === "product" && (
          <>
            <label style={styles.label}>Precio (CLP)</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </>
        )}

        <label style={styles.label}>Imagen (opcional)</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

        <div style={{ display: "flex", gap: 12 }}>
          <button style={styles.btnPri} type="submit">
            {editing ? "Guardar cambios" : "Crear"}
          </button>
          <button style={styles.btnSec} type="button" onClick={() => navigate("/tasks")}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

const styles = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: 16, fontFamily: "system-ui" },
  h1: { fontSize: 24, margin: "8px 0 16px" },
  err: { background: "#fee2e2", color: "#991b1b", padding: 10, borderRadius: 8, marginBottom: 12 },
  form: { display: "grid", gap: 10 },
  label: { fontWeight: 600 },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb",
    outline: "none"
  },
  btnPri: { background: "#0d6efd", color: "#fff", border: 0, padding: "10px 14px", borderRadius: 10, fontWeight: 700 },
  btnSec: { background: "#f3f4f6", color: "#111", border: 0, padding: "10px 14px", borderRadius: 10, fontWeight: 700 },
};
