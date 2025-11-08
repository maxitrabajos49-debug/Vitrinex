// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true, // para enviar/recibir la cookie del token
});

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authErrors, setAuthErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ---------- SIGNUP ----------
  const signup = async (values) => {
    try {
      setAuthErrors([]);
      const res = await client.post("/auth/register", values);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error en signup:", error);
      if (error.response?.data?.message) {
        setAuthErrors([error.response.data.message]);
      } else {
        setAuthErrors(["Error al registrar la cuenta"]);
      }
      setIsAuthenticated(false);
    }
  };

  // ---------- LOGIN ----------
  const signin = async (values) => {
    try {
      setAuthErrors([]);
      const res = await client.post("/auth/login", values);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error en signin:", error);
      if (error.response?.status === 401) {
        setAuthErrors(["Credenciales inválidas"]);
      } else if (error.response?.data?.message) {
        setAuthErrors([error.response.data.message]);
      } else {
        setAuthErrors(["Error al iniciar sesión"]);
      }
      setIsAuthenticated(false);
    }
  };

  // ---------- LOGOUT ----------
  const logout = async () => {
    try {
      await client.post("/auth/logout");
    } catch (err) {
      console.error("Error en logout:", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // ---------- CARGAR PERFIL (mantener sesión) ----------
  const checkAuth = async () => {
    try {
      const res = await client.get("/auth/profile");
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      // 401 / sin cookie → no autenticado, pero no es error grave
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // limpiar mensajes de error después de unos segundos
  useEffect(() => {
    if (authErrors.length > 0) {
      const timer = setTimeout(() => setAuthErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [authErrors]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        authErrors,
        signup,   // 👈 ahora existe
        signin,   // login
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
