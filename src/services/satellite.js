/**
 * Fetches satellite positions via Strapi backend proxy.
 * N2YO API key is stored server-side — no client-side key needed.
 */
import { API_CONFIG } from '../config/api';

export async function fetchSatelliteTracker(lat, lng) {
  try {
    const url = `${API_CONFIG.STRAPI_URL}/api/lynx-trackers/satellites?lat=${lat}&lng=${lng}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Strapi satellite proxy: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[satellite] Strapi proxy failed:', err.message);
    return [];
  }
}
