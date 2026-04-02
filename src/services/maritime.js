import { API_CONFIG } from '../config/api';

/**
 * Maritime tracking — multi-source aggregation:
 * 1. Strapi backend (AISHub global + Nordic fallbacks)
 * 2. Digitraffic.fi direct (CORS-friendly, Finnish/Baltic, no key)
 */

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
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return (data.features || []).slice(0, 300).map((f) => {
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
    console.warn('[maritime] Digitraffic direct failed:', err.message);
    return [];
  }
}

export async function fetchMaritimeTracker(lat, lng) {
  const [strapiRes, dtShips] = await Promise.allSettled([
    fetchFromStrapi(lat, lng),
    fetchFromDigitraffic(),
  ]);

  const strapi = strapiRes.status === 'fulfilled' ? strapiRes.value : { ships: [], coverage: 'none', source: 'none' };
  const digitraffic = dtShips.status === 'fulfilled' ? dtShips.value : [];

  // Merge + deduplicate by MMSI
  const seenMmsi = new Set();
  const allShips = [];

  for (const ship of strapi.ships) {
    if (ship.mmsi) seenMmsi.add(String(ship.mmsi));
    allShips.push(ship);
  }
  for (const ship of digitraffic) {
    if (!seenMmsi.has(String(ship.mmsi))) {
      seenMmsi.add(String(ship.mmsi));
      allShips.push(ship);
    }
  }

  const coverage = allShips.length > 100 ? 'regional' : allShips.length > 0 ? 'local' : 'none';
  return {
    data: allShips,
    coverage: strapi.coverage === 'global' ? 'global' : coverage,
    source: strapi.source !== 'none' ? strapi.source : (digitraffic.length > 0 ? 'digitraffic' : 'none'),
  };
}
