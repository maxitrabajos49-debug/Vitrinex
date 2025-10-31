// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getMyStore } from "../api/store";


const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState([]);        // array de strings
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Normaliza errores del backend a un array de strings
  const toArray = (err) => {
    const res = err?.response?.data;
    if (Array.isArray(res?.errors)) return res.errors;
    if (typeof res?.message === "string") return [res.message];
    return ["Ocurrió un error. Intenta nuevamente."];
  };

  const loadProfile = async () => {
    try {
      const { data } = await api.get("/auth/profile");
      setUser(data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 const login = async (values) => {
  setErrors([]);
  try {
    await api.post("/auth/login", values);
    await loadProfile();
    const { data: store } = await getMyStore();
    navigate(store?.mode ? "/dashboard" : "/onboarding");
  } catch (err) {
    const msg = err?.response?.data?.message || "No se pudo iniciar sesión";
    setErrors([msg]);
  }
};

const register = async (values) => {
  setErrors([]);
  try {
    await api.post("/auth/register", values);
    await loadProfile();
    const { data: store } = await getMyStore();
    navigate(store?.mode ? "/dashboard" : "/onboarding");
  } catch (err) {
    const msg = err?.response?.data?.message || "No se pudo completar el registro";
    setErrors([msg]);
  }
};


  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const value = useMemo(
    () => ({
      user,
      errors,
      isAuthenticated,
      loadingProfile,
      login,
      register,
      logout,
      setErrors,
    }),
    [user, errors, isAuthenticated, loadingProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
