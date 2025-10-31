import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h1>Bienvenido, {user?.username ?? "usuario"}</h1>
      <button onClick={logout}>Cerrar sesión</button>
      <div style={{ marginTop: 16 }}>
        <a href="/tasks">Ir a Tareas/Productos</a>
      </div>
    </div>
  );
}
