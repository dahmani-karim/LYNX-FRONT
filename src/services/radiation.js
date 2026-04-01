import { API_CONFIG } from '../config/api';

const BFS_URL = 'https://odlinfo.bfs.de/json/stat.json';

/**
 * Fetches radiation monitoring data from German BfS via CORS proxy.
 */
export async function fetchRadiationData() {
  const events = [];

  try {
    let data = null;

    // Try CORS proxies
    for (const proxy of API_CONFIG.CORS_PROXIES) {
      try {
        const res = await fetch(`${proxy}${encodeURIComponent(BFS_URL)}`);
        if (res.ok) {
          data = await res.json();
          break;
        }
      } catch { continue; }
    }

    if (!data) throw new Error('All proxies failed');

    const stations = Object.entries(data).slice(0, 30);

    for (const [id, station] of stations) {
      const value = station.mw || 0; // µSv/h
      if (value <= 0.3) continue; // Skip normal background

      const severity = radiationSeverity(value);
      events.push({
        id: `rad-${id}-${Date.now()}`,
        type: 'radiation',
        title: `Radiation: ${value.toFixed(3)} µSv/h — ${station.ort || id}`,
        description: `Station ${station.ort || id} (${station.kenn || ''}). Débit dose: ${value.toFixed(3)} µSv/h. Statut: ${station.status === 1 ? 'Actif' : 'Inactif'}`,
        severity,
        eventDate: station.t ? new Date(station.t * 1000).toISOString() : new Date().toISOString(),
        latitude: station.lat || 51.0,
        longitude: station.lon || 10.0,
        sourceName: 'BfS ODL',
        sourceUrl: 'https://odlinfo.bfs.de',
        sourceReliability: 95,
        metadata: {
          doseRate: value,
          unit: 'µSv/h',
          stationId: id,
        },
      });
    }
  } catch (err) {
    console.warn('[radiation] BfS ODL failed:', err.message);
  }

  return events;
}

function radiationSeverity(microSvH) {
  if (microSvH >= 5) return 'critical';
  if (microSvH >= 1) return 'high';
  if (microSvH >= 0.5) return 'medium';
  return 'low';
}
