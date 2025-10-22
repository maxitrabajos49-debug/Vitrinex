// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, submitting, error, setError, user } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  if (user) return <p style={{ padding: 16 }}>Ya has iniciado sesión.</p>;

  const onChange = (e) => {
    setError(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await register(form);
    if (res.ok) navigate("/dashboard");
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Crear cuenta</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <input
          name="username"
          placeholder="Usuario"
          value={form.username}
          onChange={onChange}
          required
          style={{ display: "block", marginBottom: 8 }}
        />
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
          {submitting ? "Creando..." : "Registrarme"}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
