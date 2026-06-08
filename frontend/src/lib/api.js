"use client";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

const ACCESS_KEY = "sinfdosh_access";
const REFRESH_KEY = "sinfdosh_refresh";

export function getAccess() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}
export function getRefresh() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}
export function setTokens(access, refresh) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccess() {
  const refresh = getRefresh();
  if (!refresh) return null;
  const res = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  setTokens(data.access, data.refresh);
  return data.access;
}

/**
 * Asosiy fetch wrapper — JWT qo'shadi, 401 bo'lsa refresh qiladi.
 */
export async function apiFetch(path, options = {}, retry = true) {
  const isForm = options.body instanceof FormData;
  const headers = {
    ...(isForm ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  const access = getAccess();
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const newAccess = await refreshAccess();
    if (newAccess) {
      return apiFetch(path, options, false);
    }
  }

  if (!res.ok) {
    let detail;
    try {
      detail = await res.json();
    } catch {
      detail = { detail: res.statusText };
    }
    throw new Error(
      typeof detail === "object"
        ? JSON.stringify(detail)
        : String(detail)
    );
  }

  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// Qulay yordamchilar
export const api = {
  get: (p) => apiFetch(p),
  post: (p, body) =>
    apiFetch(p, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (p, body) =>
    apiFetch(p, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  del: (p) => apiFetch(p, { method: "DELETE" }),
};
