// API client — health + auth foundation only. No feature APIs.
// Uses PUBLIC VITE_API_URL only. Never put backend secrets here.
// Auth transport: server-managed session + httpOnly cookie (credentials: include).
// The cookie is HttpOnly and cannot be read by JS; the browser sends it automatically.
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function parse(res) {
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, headers: res.headers };
}

export function getApiBase() {
  return BASE;
}

export async function fetchHealth() {
  const res = await fetch(`${BASE}/health`);
  return parse(res);
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  return parse(res);
}

export async function fetchMe() {
  const res = await fetch(`${BASE}/auth/me`, {
    credentials: 'include',
  });
  return parse(res);
}

export async function logout() {
  const res = await fetch(`${BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return parse(res);
}

export async function createCashier({ username, password, displayName }) {
  const res = await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, displayName }),
  });
  return parse(res);
}

export async function fetchCashiers() {
  const res = await fetch(`${BASE}/users`, {
    credentials: 'include',
  });
  return parse(res);
}

export async function updateCashier(id, patch) {
  const res = await fetch(`${BASE}/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(patch),
  });
  return parse(res);
}
