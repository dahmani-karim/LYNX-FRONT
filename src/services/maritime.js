import { API_CONFIG } from '../config/api';

/**
 * Maritime tracking — multi-source aggregation:
 * 1. Strapi backend (AISHub global + BarentsWatch + Digitraffic fallbacks, server-side)
 * 2. Digitraffic.fi direct (CORS-friendly, Finnish/Baltic AIS, no key) — up to 2000 ships
 */

const MARITIME_CACHE = { data: null, ts: 0 };
const CACHE_TTL = 60_000; // 60 seconds

async function fetchFromStrapi(lat, lng) {
  try {
    const url = `${API_CONFIG.STRAPI_URL}/api/lynx-trackers/maritime?lat=${lat}&lng=${lng}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`${res.status}`);
    const json = await res.json();
    return { ships: json.data || [], coverage: json.coverage || 'none', source: json.source || 'none' };
  } catch (err) {
    console.warn('[maritime] Strapi failed:', err.message);
    return { ships: [], coverage: 'none', source: 'none' };
  }
}

async function fetchFromDigitraffic() {
  try {
    const res = await fetch('https://meri.digitraffic.fi/api/ais/v1/locations', {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return (data.features || []).slice(0, 2000).map((f) => {
      const p = f.properties || {};
      const coords = f.geometry?.coordinates || [];
      return {
        id: `ship-dt-${p.mmsi}`,
        type: 'ship',
        mmsi: p.mmsi,
        name: `MMSI ${p.mmsi}`,
        latitude: coords[1],
        longitude: coords[0],
        heading: p.heading || 0,
        speed: p.sog || 0,
        course: p.cog || 0,
        navStatus: p.navStat,
      };
    }).filter((s) => s.latitude && s.longitude);
  } catch (err) {
    console.warn('[maritime] Digitraffic failed:', err.message);
    return [];
  }
}

export async function fetchMaritimeTracker(lat, lng) {
  if (MARITIME_CACHE.data && Date.now() - MARITIME_CACHE.ts < CACHE_TTL) {
    return MARITIME_CACHE.data;
  }

  const [strapiRes, dtRes] = await Promise.allSettled([
    fetchFromStrapi(lat, lng),
    fetchFromDigitraffic(),
  ]);

  const strapi = strapiRes.status === 'fulfilled' ? strapiRes.value : { ships: [], coverage: 'none', source: 'none' };
  const digitraffic = dtRes.status === 'fulfilled' ? dtRes.value : [];

  // Merge + deduplicate by MMSI
  const seenMmsi = new Set();
  const allShips = [];

  for (const ship of strapi.ships) {
    const key = String(ship.mmsi);
    if (!seenMmsi.has(key)) { seenMmsi.add(key); allShips.push(ship); }
  }
  for (const ship of digitraffic) {
    const key = String(ship.mmsi);
    if (!seenMmsi.has(key)) { seenMmsi.add(key); allShips.push(ship); }
  }

  const sources = [];
  if (strapi.source !== 'none') sources.push(strapi.source);
  if (digitraffic.length > 0) sources.push('digitraffic');

  const result = {
    data: allShips,
    coverage: strapi.coverage === 'global' ? 'global' : (allShips.length > 200 ? 'regional' : allShips.length > 0 ? 'local' : 'none'),
    source: sources.join('+') || 'none',
  };

  MARITIME_CACHE.data = result;
  MARITIME_CACHE.ts = Date.now();
  return result;
}
