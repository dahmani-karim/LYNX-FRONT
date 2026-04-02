/**
 * Satellite tracking via CelesTrak TLE + satellite.js SGP4 propagation.
 * No API key needed — computes real-time positions for ~200 satellites.
 */
import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  degreesLong,
  degreesLat,
} from 'satellite.js';

const TLE_CACHE = { data: null, ts: 0 };
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const TLE_URLS = [
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle',
];

function parseTLE(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const sats = [];
  for (let i = 0; i < lines.length - 2; i++) {
    if (!lines[i].startsWith('1 ') && !lines[i].startsWith('2 ') &&
        lines[i + 1]?.startsWith('1 ') && lines[i + 2]?.startsWith('2 ')) {
      sats.push({ name: lines[i].replace(/^0\s+/, ''), line1: lines[i + 1], line2: lines[i + 2] });
      i += 2;
    }
  }
  return sats;
}

async function fetchTLEData() {
  if (TLE_CACHE.data && Date.now() - TLE_CACHE.ts < CACHE_TTL) return TLE_CACHE.data;

  const allSats = [];
  const seen = new Set();

  for (const url of TLE_URLS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!res.ok) continue;
      const text = await res.text();
      for (const s of parseTLE(text)) {
        const id = s.line1.substring(2, 7).trim();
        if (!seen.has(id)) { seen.add(id); allSats.push(s); }
      }
    } catch (e) {
      console.warn('[satellite] CelesTrak fetch failed:', e.message);
    }
  }

  if (allSats.length > 0) { TLE_CACHE.data = allSats; TLE_CACHE.ts = Date.now(); }
  return allSats;
}

export async function fetchSatelliteTracker() {
  const tleData = await fetchTLEData();
  if (!tleData || tleData.length === 0) return [];

  const now = new Date();
  const gmst = gstime(now);
  const satellites = [];

  for (const { name, line1, line2 } of tleData) {
    try {
      const satrec = twoline2satrec(line1, line2);
      const pv = propagate(satrec, now);
      const pos = pv.position;
      if (!pos || typeof pos.x !== 'number') continue;

      const gd = eciToGeodetic(pos, gmst);
      const satid = parseInt(line1.substring(2, 7).trim(), 10);

      satellites.push({
        id: `sat-${satid}`,
        type: 'satellite',
        name,
        satid,
        latitude: degreesLat(gd.latitude),
        longitude: degreesLong(gd.longitude),
        altitude: Math.round(gd.height),
        heading: 0,
      });
    } catch { /* skip failed propagation */ }
  }

  return satellites;
}
