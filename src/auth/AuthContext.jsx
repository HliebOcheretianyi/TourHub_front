import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { getRefresh, setTokens, clearTokens } from "./tokens";

const AuthContext = createContext(null);

// Зберігає поточного користувача й дає login / logout / register будь-якому компоненту.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    if (!getRefresh()) {
      setUser(null);
      setLoading(false);
      return;
    }
    const res = await api("GET", "/auth/me/");
    if (res.ok) {
      setUser(res.data);
    } else {
      clearTokens();
      setUser(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMe();
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  async function login(username, password) {
    const res = await api("POST", "/auth/login/", { username, password });
    if (res.ok) {
      setTokens(res.data.access, res.data.refresh);
      await loadMe();
    }
    return res;
  }

  const register = (form) => api("POST", "/auth/register/", form);

  // Logout = видалити токени на клієнті
  function logout() {
    clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
