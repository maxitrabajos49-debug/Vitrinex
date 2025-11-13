import { createContext, useContext, useState, useEffect } from "react";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  profileRequest,
} from "../api/auth";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await profileRequest();
        setUser(res.data);
        setIsAuthenticated(true);
      } catch {
        // 401 al cargar es normal si no hay sesión
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  const login = async (credentials) => {
    const res = await loginRequest(credentials);
    setUser(res.data);
    setIsAuthenticated(true);
    return res.data;
  };

  const register = async (data) => {
    const res = await registerRequest(data);
    setUser(res.data);
    setIsAuthenticated(true);
    return res.data;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (newData) =>
    setUser((prev) => ({ ...prev, ...newData }));

  // 🔹 Aliases para compatibilidad con tu LoginPage.jsx
  const signin = login;
  const signup = register;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
        // aliases:
        signin,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
