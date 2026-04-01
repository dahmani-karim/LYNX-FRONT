/**
 * Geofencing utility – checks events against user-defined zones.
 */

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find events that fall within any of the defined zones.
 * @param {Array} events – alert events with latitude/longitude
 * @param {Array} zones – user zones with lat, lng, radiusKm, label
 * @returns {Array} – matching objects { event, zone, distanceKm }
 */
export function checkGeofences(events, zones) {
  if (!zones?.length || !events?.length) return [];

  const matches = [];

  for (const event of events) {
    if (!event.latitude || !event.longitude) continue;

    for (const zone of zones) {
      const dist = haversineKm(zone.lat, zone.lng, event.latitude, event.longitude);
      if (dist <= zone.radiusKm) {
        matches.push({
          event,
          zone,
          distanceKm: Math.round(dist),
        });
      }
    }
  }

  // Sort by distance ascending (closest first)
  return matches.sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Get count of events per zone.
 */
export function getZoneAlertCounts(events, zones) {
  return zones.map((zone) => {
    const count = events.filter((e) => {
      if (!e.latitude || !e.longitude) return false;
      return haversineKm(zone.lat, zone.lng, e.latitude, e.longitude) <= zone.radiusKm;
    }).length;
    return { zone, count };
  });
}
