// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, submitting, error, setError, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  // Si ya está logueado, no mostramos el form
  if (user) return <p style={{ padding: 16 }}>Ya has iniciado sesión.</p>;

  const onChange = (e) => {
    setError(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form);
    if (res.ok) navigate("/dashboard");
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Iniciar sesión</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          type="email"
          required
          style={{ display: "block", marginBottom: 8 }}
        />
        <input
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={onChange}
          type="password"
          required
          style={{ display: "block", marginBottom: 8 }}
        />
        <button disabled={submitting} type="submit">
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}
