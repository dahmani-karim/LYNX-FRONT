import { API_CONFIG } from '../config/api';

/**
 * Global aircraft tracking via Strapi proxy → ADSB.lol/OpenSky.
 * Scans 10 strategic regions + user viewport for worldwide coverage.
 * All calls go through the backend proxy to avoid CORS.
 * Global results cached 90s, viewport always fresh.
 */

const GLOBAL_HOTSPOTS = [
  { lat: 51.5, lng: -0.1 },    // London / W-Europe
  { lat: 40.6, lng: -73.8 },   // New York / E-USA
  { lat: 34.0, lng: -118.2 },  // Los Angeles / W-USA
  { lat: 25.3, lng: 55.3 },    // Dubai / Middle East
  { lat: 35.7, lng: 139.7 },   // Tokyo / E-Asia
  { lat: 1.4, lng: 103.8 },    // Singapore / SE-Asia
  { lat: 19.1, lng: 72.9 },    // Mumbai / S-Asia
  { lat: -23.5, lng: -46.6 },  // São Paulo / S-America
  { lat: -33.9, lng: 151.2 },  // Sydney / Oceania
  { lat: 55.9, lng: 37.4 },    // Moscow / E-Europe
];

const GLOBAL_CACHE = { data: [], ts: 0 };
const GLOBAL_TTL = 90_000; // 90 seconds

async function fetchRegion(lat, lng, radiusKm = 900) {
  try {
    const url = `${API_CONFIG.STRAPI_URL}/api/lynx-trackers/aircraft?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function fetchGlobalHotspots() {
  if (Date.now() - GLOBAL_CACHE.ts < GLOBAL_TTL) return GLOBAL_CACHE.data;

  // Fetch in batches of 3 to avoid overloading the backend
  const batches = [];
  for (let i = 0; i < GLOBAL_HOTSPOTS.length; i += 3) {
    batches.push(GLOBAL_HOTSPOTS.slice(i, i + 3));
  }

  const seen = new Set();
  const aircraft = [];

  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map((r) => fetchRegion(r.lat, r.lng, 900))
    );
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      for (const a of r.value) {
        if (!seen.has(a.icao24)) { seen.add(a.icao24); aircraft.push(a); }
      }
    }
  }

  GLOBAL_CACHE.data = aircraft;
  GLOBAL_CACHE.ts = Date.now();
  return aircraft;
}

export async function fetchAircraftTracker(lat, lng) {
  const [globalResult, localResult] = await Promise.allSettled([
    fetchGlobalHotspots(),
    fetchRegion(lat, lng, 450),
  ]);

  const seen = new Set();
  const all = [];

  // Local viewport data first (freshest)
  for (const a of (localResult.status === 'fulfilled' ? localResult.value : [])) {
    seen.add(a.icao24); all.push(a);
  }
  // Then global hotspot data
  for (const a of (globalResult.status === 'fulfilled' ? globalResult.value : [])) {
    if (!seen.has(a.icao24)) { seen.add(a.icao24); all.push(a); }
  }

  return all;
}
