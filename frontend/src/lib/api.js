// MVP 0 API client — health + auth foundation only. No feature APIs.
// Uses PUBLIC VITE_API_URL only. Never put backend secrets here.
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

async function parse(res) {
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
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
    body: JSON.stringify({ username, password }),
  });
  return parse(res);
}

export async function fetchMe(token) {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parse(res);
}
