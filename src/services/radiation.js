/**
 * Fetches radiation monitoring data from German BfS IMIS WFS (CORS-friendly).
 */

const BFS_WFS = 'https://www.imis.bfs.de/ogc/opendata/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=opendata:odlinfo_odl_1h_latest&outputFormat=application/json&maxFeatures=100';

export async function fetchRadiationData() {
  const events = [];

  try {
    const res = await fetch(BFS_WFS);
    if (!res.ok) throw new Error(`BfS WFS: ${res.status}`);
    const geojson = await res.json();

    const features = (geojson.features || []).slice(0, 50);

    for (const feat of features) {
      const p = feat.properties || {};
      const value = p.value || 0; // µSv/h
      if (value <= 0.3) continue; // Skip normal background

      const coords = feat.geometry?.coordinates || [10, 51];
      const severity = radiationSeverity(value);

      events.push({
        id: `rad-${p.id || p.kenn}-${Date.now()}`,
        type: 'radiation',
        title: `Radiation: ${value.toFixed(3)} µSv/h — ${p.name || p.id}`,
        description: `Station ${p.name || p.id}. Débit dose: ${value.toFixed(3)} µSv/h. Statut: ${p.site_status === 1 ? 'Actif' : 'Inactif'}`,
        severity,
        eventDate: p.end_measure || new Date().toISOString(),
        latitude: coords[1],
        longitude: coords[0],
        sourceName: 'BfS ODL',
        sourceUrl: 'https://odlinfo.bfs.de',
        sourceReliability: 95,
        metadata: {
          doseRate: value,
          unit: 'µSv/h',
          stationId: p.id,
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
