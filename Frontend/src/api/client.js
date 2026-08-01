import axios from "axios";

// عدّل هذا الرابط ليطابق منفذ الـ API عندك (شوف launchSettings.json)
export const API_BASE_URL = "https://localhost:7080/api";

const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
    }
    return Promise.reject(err);
  }
);

export default client;
