/**
 * Fetches satellite TLE data and visible passes from N2YO.
 * Requires a free API key from n2yo.com.
 * For now, uses a placeholder — will be activated when user provides a key.
 */

const N2YO_KEY = import.meta.env.VITE_N2YO_KEY || '';

export async function fetchSatelliteTracker(lat, lng) {
  if (!N2YO_KEY) {
    // Return ISS position from open API as fallback
    return fetchISSPosition();
  }

  try {
    // Fetch visible satellites above user
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
  try {
    const res = await fetch('https://api.open-notify.org/iss-now.json');
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
