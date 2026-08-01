import { createContext, useContext, useState } from "react";
import { login as loginApi } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("admin_username"));

  async function login(user, pass) {
    const res = await loginApi(user, pass);
    localStorage.setItem("admin_token", res.token);
    localStorage.setItem("admin_username", res.username);
    setToken(res.token);
    setUsername(res.username);
  }

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    setToken(null);
    setUsername(null);
  }

  return (
    <AuthContext.Provider value={{ token, username, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
