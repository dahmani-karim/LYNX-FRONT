/**
 * Solar Terminator — computes a GeoJSON polygon representing
 * the nighttime side of the Earth. Used as a map overlay.
 *
 * Based on astronomical calculations for the sub-solar point.
 */

function getSolarPosition(date) {
  const rad = Math.PI / 180;
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Solar declination (simplified)
  const declination = -23.44 * Math.cos(rad * (360 / 365) * (dayOfYear + 10));

  // Hour angle — where the sun is directly overhead
  const solarNoonLng = (12 - hours) * 15; // degrees

  return {
    lat: declination,
    lng: solarNoonLng,
  };
}

export function computeTerminator() {
  const now = new Date();
  const sun = getSolarPosition(now);
  const rad = Math.PI / 180;

  // Generate the twilight circle (where sun is at horizon)
  const points = [];
  for (let i = 0; i <= 360; i += 2) {
    const angle = i * rad;

    // Great circle at 90° from sub-solar point
    const lat = Math.asin(
      Math.sin(sun.lat * rad) * Math.cos(angle) +
      Math.cos(sun.lat * rad) * Math.sin(angle) * Math.cos(0)
    );

    const lng = sun.lng * rad + Math.atan2(
      Math.sin(angle) * Math.sin(Math.PI / 2) * Math.cos(sun.lat * rad),
      Math.cos(angle) - Math.sin(sun.lat * rad) * Math.sin(lat)
    );

    let lngDeg = (lng / rad + 540) % 360 - 180;
    let latDeg = lat / rad;

    points.push([lngDeg, latDeg]);
  }

  // Build GeoJSON polygon: terminator line → extend to cover the night side
  // Determine which pole is dark
  const nightPole = sun.lat > 0 ? -90 : 90;

  // Close the polygon around the dark side
  const coords = [
    ...points,
    [points[points.length - 1][0], nightPole],
    [points[0][0], nightPole],
    points[0], // close ring
  ];

  return {
    type: 'Feature',
    properties: { type: 'night' },
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  };
}
