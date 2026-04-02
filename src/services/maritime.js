import { API_CONFIG } from '../config/api';

/**
 * Fetches live ship positions via Strapi backend proxy.
 * Backend aggregates from Digitraffic, BarentsWatch, and other sources server-side.
 */

export async function fetchMaritimeTracker(lat, lng) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const url = `${API_CONFIG.STRAPI_URL}/api/lynx-trackers/maritime?lat=${lat}&lng=${lng}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Strapi maritime proxy: ${res.status}`);
    const json = await res.json();
    return { data: json.data || [], coverage: json.coverage || 'none', source: json.source || 'none' };
  } catch (err) {
    console.warn('[maritime] Backend proxy failed:', err.message);
    return { data: [], coverage: 'none', source: 'none' };
  }
}
