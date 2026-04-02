import { API_CONFIG } from '../config/api';

/**
 * Fetches live aircraft positions via Strapi backend proxy.
 * Backend fetches from ADSB.lol / OpenSky server-side (no CORS issues).
 */

export async function fetchAircraftTracker(lat, lng, radiusKm = 450) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const url = `${API_CONFIG.STRAPI_URL}/api/lynx-trackers/aircraft?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Strapi tracker proxy: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[aircraft] Backend proxy failed:', err.message);
    return [];
  }
}
