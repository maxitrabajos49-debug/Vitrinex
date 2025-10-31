import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <section style={{ fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>
        Bienvenido, {user?.username || "usuario"}
      </h1>
      <p style={{ color: "#555", marginBottom: 20 }}>
        Desde aquí puedes gestionar tus productos/tareas.
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/tasks" style={btnSec}>Ver mis tareas</Link>
        <Link to="/tasks/new" style={btnPri}>Crear nueva tarea</Link>
      </div>
    </section>
  );
}

const btnPri = {
  background: "#0d6efd", color: "#fff", textDecoration: "none",
  padding: "8px 12px", borderRadius: 8, fontWeight: 600
};
const btnSec = {
  background: "#f1f5f9", color: "#111", textDecoration: "none",
  padding: "8px 12px", borderRadius: 8, fontWeight: 600
};
