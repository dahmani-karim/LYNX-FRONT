import { API_CONFIG } from '../config/api';

/**
 * Fetches live aircraft positions from OpenSky Network via CORS proxy.
 * Free, rate-limited to 10 req/10s.
 * Returns tracker points for the map, not alert events.
 */
export async function fetchAircraftTracker(lat, lng, radiusKm = 200) {
  try {
    const delta = radiusKm / 111;
    const lamin = lat - delta;
    const lamax = lat + delta;
    const lomin = lng - delta;
    const lomax = lng + delta;

    const openSkyUrl = `https://opensky-network.org/api/states/all?lamin=${lamin}&lamax=${lamax}&lomin=${lomin}&lomax=${lomax}`;

    let data = null;
    for (const proxy of API_CONFIG.CORS_PROXIES) {
      try {
        const res = await fetch(`${proxy}${encodeURIComponent(openSkyUrl)}`);
        if (res.ok) {
          data = await res.json();
          break;
        }
      } catch { continue; }
    }

    if (!data) throw new Error('All proxies failed');

    return (data.states || []).map((s) => ({
      id: `aircraft-${s[0]}`,
      type: 'aircraft',
      callsign: (s[1] || '').trim(),
      icao24: s[0],
      origin: s[2] || '',
      latitude: s[6],
      longitude: s[5],
      altitude: s[7] || s[13] || 0, // baro or geo altitude
      velocity: s[9] || 0, // m/s
      heading: s[10] || 0,
      verticalRate: s[11] || 0,
      onGround: s[8],
      lastContact: s[4],
    }));
  } catch (err) {
    console.warn('[aircraft] OpenSky failed:', err.message);
    return [];
  }
}
