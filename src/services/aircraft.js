/**
 * Fetches live aircraft positions.
 * Primary: ADSB.lol (CORS-enabled, no proxy needed)
 * Fallback: OpenSky Network (CORS-enabled)
 */

function parseAdsbLol(data) {
  return (data.ac || [])
    .filter((a) => a.lat && a.lon)
    .map((a) => ({
      id: `aircraft-${a.hex}`,
      type: 'aircraft',
      callsign: (a.flight || '').trim(),
      icao24: a.hex,
      origin: a.r || '',
      latitude: a.lat,
      longitude: a.lon,
      altitude: a.alt_baro === 'ground' ? 0 : (a.alt_baro || a.alt_geom || 0),
      velocity: (a.gs || 0) * 0.514444,
      heading: a.track || a.true_heading || 0,
      verticalRate: (a.baro_rate || a.geom_rate || 0) * 0.00508,
      onGround: a.alt_baro === 'ground',
      lastContact: a.seen ? Math.floor(Date.now() / 1000) - a.seen : null,
    }));
}

function parseOpenSky(data) {
  return (data.states || []).map((s) => ({
    id: `aircraft-${s[0]}`,
    type: 'aircraft',
    callsign: (s[1] || '').trim(),
    icao24: s[0],
    origin: s[2] || '',
    latitude: s[6],
    longitude: s[5],
    altitude: s[7] || s[13] || 0,
    velocity: s[9] || 0,
    heading: s[10] || 0,
    verticalRate: s[11] || 0,
    onGround: s[8],
    lastContact: s[4],
  }));
}

export async function fetchAircraftTracker(lat, lng, radiusKm = 200) {
  const distNm = Math.round(radiusKm * 0.539957);
  const adsbUrl = `https://api.adsb.lol/v2/lat/${lat}/lon/${lng}/dist/${distNm}`;

  const delta = radiusKm / 111;
  const openSkyUrl = `https://opensky-network.org/api/states/all?lamin=${lat - delta}&lamax=${lat + delta}&lomin=${lng - delta}&lomax=${lng + delta}`;

  // ADSB.lol and OpenSky both support CORS natively — no proxy needed
  const sources = [
    { url: adsbUrl, parser: parseAdsbLol, name: 'ADSB.lol' },
    { url: openSkyUrl, parser: parseOpenSky, name: 'OpenSky' },
  ];

  for (const source of sources) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(source.url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const aircraft = source.parser(data);
        if (aircraft.length > 0) return aircraft;
      }
    } catch (err) {
      console.warn(`[aircraft] ${source.name} failed:`, err.message);
    }
  }

  return [];
}
