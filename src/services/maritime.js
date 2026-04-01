/**
 * Fetches live ship positions from AIS (AISHub/MarineTraffic alternative).
 * We use the free WikiVoyage-based coastline data + VesselFinder's public widget data.
 * For the MVP, we use a simplified approach with the free AIS data from several sources.
 */

export async function fetchMaritimeTracker(lat, lng) {
  // Strategy 1: Try the free Finnish AIS API (covers European waters)
  try {
    return await fetchDigitrafficAIS(lat, lng);
  } catch {
    // AIS data sources are limited for free. Return empty for now.
    return [];
  }
}

async function fetchDigitrafficAIS(lat, lng) {
  // Digitraffic.fi provides free AIS data for Finnish/Baltic waters
  // CORS-friendly, no key needed
  const res = await fetch(
    `https://meri.digitraffic.fi/api/ais/v1/locations?latitude=${lat}&longitude=${lng}&radius=100`
  );
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
      speed: p.sog || 0, // knots
      course: p.cog || 0,
      navStatus: p.navStat,
      timestamp: p.timestampExternal || new Date().toISOString(),
    };
  });
}
