import { API_CONFIG } from '../config/api';

/**
 * Fetches radiation monitoring data from European Radiological Data Exchange Platform (EURDEP)
 * and other open sources.
 */
export async function fetchRadiationData() {
  const events = [];

  // Strategy 1: ODLINFO (German BfS) — gamma dose rate monitoring
  try {
    const res = await fetch(
      'https://odlinfo.bfs.de/json/stat.json'
    );
    if (res.ok) {
      const data = await res.json();
      const stations = Object.entries(data).slice(0, 30);

      for (const [id, station] of stations) {
        const value = station.mw || 0; // µSv/h
        if (value <= 0.3) continue; // Skip normal background

        const severity = radiationSeverity(value);
        events.push({
          id: `rad-${id}-${Date.now()}`,
          type: 'other', // Maps to "Autre" category
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
