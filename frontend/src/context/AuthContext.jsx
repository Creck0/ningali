import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("fleetops_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // On first load, if we have a saved token, confirm it's still valid with the
  // API (and refresh the cached user) instead of trusting localStorage blindly.
  useEffect(() => {
    const token = localStorage.getItem("fleetops_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .get("/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("fleetops_user", JSON.stringify(data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("fleetops_user");
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email, password) {
    try {
      const { data } = await api.post("/login", { email, password });
      localStorage.setItem("fleetops_token", data.token);
      localStorage.setItem("fleetops_user", JSON.stringify(data.user));
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.message || "Tidak dapat terhubung ke server.";
      return { ok: false, message };
    }
  }

  async function logout() {
    try {
      await api.post("/logout");
    } catch {
      // Even if the request fails (e.g. token already expired), clear locally.
    }
    localStorage.removeItem("fleetops_token");
    localStorage.removeItem("fleetops_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
