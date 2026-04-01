import { API_CONFIG } from '../config/api';

/**
 * Fetches active fire/hotspot data from NASA FIRMS (MODIS/VIIRS).
 * Uses CSV endpoint which is CORS-friendly with the DEMO_KEY.
 */
export async function fetchFires(lat, lng) {
  try {
    // Bounding box: ~500km around the user
    const delta = 5; // ~5 degrees
    const area = `${(lng - delta).toFixed(2)},${(lat - delta).toFixed(2)},${(lng + delta).toFixed(2)},${(lat + delta).toFixed(2)}`;
    const url = `${API_CONFIG.NASA_FIRMS.BASE}/${API_CONFIG.NASA_FIRMS.MAP_KEY}/VIIRS_SNPP_NRT/${area}/2`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`FIRMS: ${res.status}`);
    const csv = await res.text();

    return parseFireCSV(csv, lat, lng);
  } catch (err) {
    console.warn('[fires] NASA FIRMS failed:', err.message);
    return [];
  }
}

function parseFireCSV(csv, userLat, userLng) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].split(',');
  const latIdx = header.indexOf('latitude');
  const lngIdx = header.indexOf('longitude');
  const brIdx = header.indexOf('bright_ti4');
  const frpIdx = header.indexOf('frp');
  const confIdx = header.indexOf('confidence');
  const dateIdx = header.indexOf('acq_date');
  const timeIdx = header.indexOf('acq_time');

  const events = [];
  const seenGrid = new Set();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < header.length) continue;

    const fireLat = parseFloat(cols[latIdx]);
    const fireLng = parseFloat(cols[lngIdx]);
    const brightness = parseFloat(cols[brIdx]) || 0;
    const frp = parseFloat(cols[frpIdx]) || 0;
    const confidence = cols[confIdx] || 'nominal';
    const date = cols[dateIdx] || '';
    const time = cols[timeIdx] || '';

    // Cluster fires in ~0.1° grid to avoid duplicates
    const gridKey = `${fireLat.toFixed(1)}_${fireLng.toFixed(1)}`;
    if (seenGrid.has(gridKey)) continue;
    seenGrid.add(gridKey);

    const dist = haversine(userLat, userLng, fireLat, fireLng);
    const severity = assessFireSeverity(frp, confidence, dist);

    events.push({
      id: `fire-${i}-${Date.now()}`,
      type: 'fire',
      title: `Foyer détecté (FRP: ${frp.toFixed(1)} MW)`,
      description: `Feu à ${dist.toFixed(0)}km. Puissance: ${frp.toFixed(1)} MW, Luminosité: ${brightness.toFixed(0)}K, Confiance: ${confidence}`,
      severity,
      eventDate: date && time ? `${date}T${time.slice(0, 2)}:${time.slice(2)}:00Z` : new Date().toISOString(),
      latitude: fireLat,
      longitude: fireLng,
      sourceName: 'NASA FIRMS',
      sourceUrl: 'https://firms.modaps.eosdis.nasa.gov',
      sourceReliability: 92,
      metadata: { frp, brightness, confidence, distance: dist },
    });
  }

  return events.sort((a, b) => a.metadata.distance - b.metadata.distance).slice(0, 50);
}

function assessFireSeverity(frp, confidence, dist) {
  if (frp > 100 || (dist < 50 && frp > 30)) return 'critical';
  if (frp > 50 || (dist < 100 && frp > 10)) return 'high';
  if (frp > 10 || dist < 200) return 'medium';
  return 'low';
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
