import { setAuthToken } from "../api/http";

const KEY = "chatapp_auth";

export function loadAuth() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (data?.accessToken) setAuthToken(data.accessToken);
    return data;
  } catch {
    return null;
  }
}

export function saveAuth(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  if (data?.accessToken) setAuthToken(data.accessToken);
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  setAuthToken(null);
}
