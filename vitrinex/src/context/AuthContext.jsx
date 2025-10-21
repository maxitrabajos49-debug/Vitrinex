// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/axios";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);      // carga inicial (chequear cookie)
  const [submitting, setSubmitting] = useState(false); // para deshabilitar botones
  const [error, setError] = useState(null);

  // Restaura sesión si hay cookie válida
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/profile"); // 200 si cookie ok, 401 si no
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login({ email, password }) {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data);
      return { ok: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al iniciar sesión";
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      setSubmitting(false);
    }
  }

  async function register({ username, email, password }) {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/register", { username, email, password });
      setUser(data);
      return { ok: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al registrar";
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
  }

  const value = { user, loading, submitting, error, login, register, logout, setError };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
