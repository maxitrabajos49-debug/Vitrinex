import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listTasks, removeTask } from "../api/tasks";

export default function TasksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await listTasks();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar definitivamente?")) return;
    await removeTask(id);
    setItems((prev) => prev.filter((x) => x._id !== id));
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>;

  return (
    <section style={{ maxWidth: 1000, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ fontSize: 24 }}>Mis tareas</h1>
        <Link to="/tasks/new" style={btnPri}>Nueva</Link>
      </div>

      {!items.length ? (
        <div style={{ color: "#555" }}>Aún no has creado tareas.</div>
      ) : (
        <div style={grid}>
          {items.map((t) => (
            <article key={t._id} style={card}>
              {t.imageUrl && (
                <img
                  src={`http://localhost:3000${t.imageUrl}`}
                  alt=""
                  style={{ width: "100%", height: 160, objectFit: "cover", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                />
              )}
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 14, color: "#6b7280", textTransform: "uppercase" }}>{t.type}</div>
                <h3 style={{ margin: "6px 0 4px" }}>{t.title}</h3>
                {t.type === "product" && t.price != null && (
                  <div style={{ fontWeight: 700 }}>CLP {Number(t.price).toLocaleString("es-CL")}</div>
                )}
                <p style={{ color: "#555", marginTop: 6 }}>{t.description}</p>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <Link to={`/tasks/${t._id}/edit`} style={btnSec}>Editar</Link>
                  <button onClick={() => onDelete(t._id)} style={btnDanger}>Eliminar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 16 };
const card = { border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" };
const btnPri = { background: "#0d6efd", color: "#fff", textDecoration: "none", padding: "8px 12px", borderRadius: 8, fontWeight: 700 };
const btnSec = { background: "#f3f4f6", color: "#111", textDecoration: "none", padding: "6px 10px", borderRadius: 8, fontWeight: 700, border: 0 };
const btnDanger = { background: "#ef4444", color: "#fff", padding: "6px 10px", borderRadius: 8, fontWeight: 700, border: 0 };
