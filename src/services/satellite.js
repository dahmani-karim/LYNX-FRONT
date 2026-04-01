/**
 * Fetches satellite positions.
 * Primary: N2YO if key available
 * Fallback: ISS position from wheretheiss.at then open-notify
 */

const N2YO_KEY = import.meta.env.VITE_N2YO_KEY || '';

export async function fetchSatelliteTracker(lat, lng) {
  if (!N2YO_KEY) {
    return fetchISSPosition();
  }

  try {
    const res = await fetch(
      `https://api.n2yo.com/rest/v1/satellite/above/${lat}/${lng}/0/70/18&apiKey=${N2YO_KEY}`
    );
    if (!res.ok) throw new Error(`N2YO: ${res.status}`);
    const data = await res.json();

    return (data.above || []).map((sat) => ({
      id: `sat-${sat.satid}`,
      type: 'satellite',
      name: sat.satname,
      satid: sat.satid,
      latitude: sat.satlat,
      longitude: sat.satlng,
      altitude: sat.satalt,
      intDesignator: sat.intDesignator || '',
      launchDate: sat.launchDate || '',
    }));
  } catch (err) {
    console.warn('[satellite] N2YO failed:', err.message);
    return fetchISSPosition();
  }
}

async function fetchISSPosition() {
  // Strategy 1: wheretheiss.at (reliable, CORS-friendly)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return [{
        id: 'sat-iss',
        type: 'satellite',
        name: 'ISS (Station Spatiale Internationale)',
        satid: 25544,
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: Math.round(data.altitude),
        velocity: data.velocity ? Math.round(data.velocity) : 27600,
        intDesignator: '1998-067A',
        launchDate: '1998-11-20',
      }];
    }
  } catch (err) {
    console.warn('[satellite] wheretheiss.at failed:', err.message);
  }

  // Strategy 2: open-notify.org (legacy fallback)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://api.open-notify.org/iss-now.json', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    return [{
      id: 'sat-iss',
      type: 'satellite',
      name: 'ISS (Station Spatiale Internationale)',
      satid: 25544,
      latitude: parseFloat(data.iss_position.latitude),
      longitude: parseFloat(data.iss_position.longitude),
      altitude: 420,
      intDesignator: '1998-067A',
      launchDate: '1998-11-20',
    }];
  } catch {
    return [];
  }
}
