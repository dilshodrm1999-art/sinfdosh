"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, apiFetch, clearTokens, getAccess, setTokens } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function loadMe() {
    if (!getAccess()) {
      setLoading(false);
      return;
    }
    try {
      const me = await apiFetch("/api/auth/me/");
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(phone, password) {
    const res = await fetch(`${API_URL}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Telefon yoki parol noto'g'ri");
    }
    const data = await res.json();
    setTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearTokens();
    setUser(null);
    router.push("/login");
  }

  async function refreshUser() {
    const me = await apiFetch("/api/auth/me/");
    setUser(me);
    return me;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, setUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return ctx;
}
