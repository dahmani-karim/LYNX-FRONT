export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function isInRadius(eventLat, eventLng, centerLat, centerLng, radiusKm) {
  return distanceKm(eventLat, eventLng, centerLat, centerLng) <= radiusKm;
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function getBoundsFromEvents(events) {
  if (!events.length) return null;
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  events.forEach((e) => {
    if (e.latitude && e.longitude) {
      minLat = Math.min(minLat, e.latitude);
      maxLat = Math.max(maxLat, e.latitude);
      minLng = Math.min(minLng, e.longitude);
      maxLng = Math.max(maxLng, e.longitude);
    }
  });
  return [[minLat, minLng], [maxLat, maxLng]];
}
