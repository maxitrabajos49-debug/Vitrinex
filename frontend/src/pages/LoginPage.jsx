import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

export default function LoginPage() {
  const { login, errors: apiErrors } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [localErrors, setLocalErrors] = useState([]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = [];
    if (!isEmail(form.email)) errs.push("Ingresa un correo electrónico válido.");
    if ((form.password || "").length < 6)
      errs.push("La contraseña debe tener al menos 6 caracteres.");
    if (errs.length) {
      setLocalErrors(errs);
      return;
    }
    setLocalErrors([]);
    login(form);
  };

  // Combinar errores locales + de API (si hay)
  const allErrors = useMemo(
    () => [...(localErrors || []), ...((apiErrors && Array.isArray(apiErrors)) ? apiErrors : [])],
    [localErrors, apiErrors]
  );

  return (
    <div style={{ maxWidth: 520, margin: "4rem auto" }}>
      <h1>Iniciar sesión</h1>

      {allErrors.length > 0 && (
        <div style={{ color: "crimson", marginBottom: 12 }}>
          {allErrors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={onChange}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={onChange}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
          required
          minLength={6}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>Entrar</button>
      </form>

      <p style={{ marginTop: 16 }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}
