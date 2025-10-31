import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header style={styles.header}>
      <Link to="/dashboard" style={styles.brand}>Vitrinex</Link>

      <nav style={styles.nav}>
        <NavLink to="/dashboard" style={styles.link}>Dashboard</NavLink>
        <NavLink to="/tasks" style={styles.link}>Tareas</NavLink>
        <NavLink to="/tasks/new" style={styles.cta}>Nueva tarea</NavLink>
      </nav>

      <div style={styles.right}>
        <span style={styles.user}>
          {user?.username ? `Hola, ${user.username}` : "Usuario"}
        </span>
        <button onClick={logout} style={styles.logout}>Cerrar sesión</button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "12px 20px",
    borderBottom: "1px solid #eee",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 10
  },
  brand: { fontWeight: 700, fontSize: 18, color: "#111", textDecoration: "none" },
  nav: { display: "flex", gap: 12, alignItems: "center" },
  link: ({ isActive }) => ({
    textDecoration: "none",
    color: isActive ? "#0d6efd" : "#333",
    fontWeight: isActive ? 700 : 500
  }),
  cta: ({ isActive }) => ({
    textDecoration: "none",
    background: "#0d6efd",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 8,
    fontWeight: 600,
    border: isActive ? "2px solid #0847b6" : "2px solid transparent"
  }),
  right: { display: "flex", alignItems: "center", gap: 10 },
  user: { fontSize: 14, color: "#555" },
  logout: {
    background: "#ef4444",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 600
  }
};
