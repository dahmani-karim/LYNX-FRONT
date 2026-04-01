import { API_CONFIG } from '../config/api';

const STRAPI = API_CONFIG.STRAPI_URL;

// ─── Helpers ───────────────────────────────────────────────

function getToken() {
  const auth = JSON.parse(localStorage.getItem('lynx-auth') || '{}');
  return auth?.state?.jwt || null;
}

function authHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const message =
      data?.error?.message || data?.message?.[0]?.messages?.[0]?.message || 'Erreur serveur';
    throw new Error(message);
  }
  return data;
}

// ─── Auth ──────────────────────────────────────────────────

export async function strapiRegister(username, email, password) {
  const res = await fetch(`${STRAPI}/api/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
}

export async function strapiLogin(identifier, password) {
  const res = await fetch(`${STRAPI}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  return handleResponse(res);
}

// ─── User Profile ──────────────────────────────────────────

export async function fetchProfile() {
  const res = await fetch(`${STRAPI}/api/user-profiles/me`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function updateProfile(data) {
  const res = await fetch(`${STRAPI}/api/user-profiles/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ─── LYNX Alerts (saved/bookmarked) ───────────────────────

export async function fetchSavedAlerts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${STRAPI}/api/lynx-alerts/mine?${query}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function saveAlert(alertData) {
  const res = await fetch(`${STRAPI}/api/lynx-alerts/save`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(alertData),
  });
  return handleResponse(res);
}

export async function markAlertsRead(ids) {
  const res = await fetch(`${STRAPI}/api/lynx-alerts/mark-read`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
  return handleResponse(res);
}

export async function deleteSavedAlert(id) {
  const res = await fetch(`${STRAPI}/api/lynx-alerts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function fetchAlertCounts() {
  const res = await fetch(`${STRAPI}/api/lynx-alerts/counts`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── LYNX Zones ────────────────────────────────────────────

export async function fetchZones() {
  const res = await fetch(`${STRAPI}/api/lynx-zones/mine`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function createZone(zoneData) {
  const res = await fetch(`${STRAPI}/api/lynx-zones`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(zoneData),
  });
  return handleResponse(res);
}

export async function updateZone(id, zoneData) {
  const res = await fetch(`${STRAPI}/api/lynx-zones/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(zoneData),
  });
  return handleResponse(res);
}

export async function deleteZone(id) {
  const res = await fetch(`${STRAPI}/api/lynx-zones/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Fourthwall Membership ─────────────────────────────────

export async function checkMembership() {
  const res = await fetch(`${STRAPI}/api/fourthwall/check-membership`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse(res);
}
