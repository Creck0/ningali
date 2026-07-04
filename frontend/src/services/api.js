import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fleetops_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 means the token is missing/expired — drop the stale session so the
// app falls back to the login screen instead of showing broken data.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fleetops_token");
      localStorage.removeItem("fleetops_user");
    }
    return Promise.reject(error);
  }
);

export default api;
