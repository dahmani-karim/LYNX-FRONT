/**
 * Fetches live ship positions from free AIS sources.
 * Primary: Digitraffic.fi — CORS-friendly, no key needed.
 * Coverage: Nordic/Baltic waters. Returns empty outside coverage area.
 * Note: global real-time AIS data requires paid APIs (MarineTraffic, VesselFinder).
 */

export async function fetchMaritimeTracker(lat, lng) {
  // Digitraffic covers roughly 50-70°N, 0-35°E (Nordic/Baltic)
  const inCoverage = lat >= 50 && lat <= 70 && lng >= 0 && lng <= 35;

  if (!inCoverage) {
    console.info('[maritime] Position hors couverture Digitraffic (Nordic/Baltic uniquement)');
    return [];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      `https://meri.digitraffic.fi/api/ais/v1/locations?latitude=${lat}&longitude=${lng}&radius=200`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Digitraffic AIS: ${res.status}`);
    const data = await res.json();

    return (data.features || []).slice(0, 50).map((f) => {
      const p = f.properties || {};
      const coords = f.geometry?.coordinates || [];
      return {
        id: `ship-${p.mmsi}`,
        type: 'ship',
        mmsi: p.mmsi,
        name: `MMSI ${p.mmsi}`,
        latitude: coords[1] || lat,
        longitude: coords[0] || lng,
        heading: p.heading || 0,
        speed: p.sog || 0,
        course: p.cog || 0,
        navStatus: p.navStat,
        timestamp: p.timestampExternal || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('[maritime] AIS fetch failed:', err.message);
    return [];
  }
}
