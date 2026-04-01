import { API_CONFIG } from '../config/api';

const AQI_THRESHOLDS = [
  { max: 50, label: 'Bon', severity: 'info' },
  { max: 100, label: 'Modéré', severity: 'low' },
  { max: 150, label: 'Mauvais pour sensibles', severity: 'medium' },
  { max: 200, label: 'Mauvais', severity: 'high' },
  { max: 300, label: 'Très mauvais', severity: 'critical' },
  { max: Infinity, label: 'Dangereux', severity: 'critical' },
];

function aqiSeverity(value) {
  const t = AQI_THRESHOLDS.find((t) => value <= t.max);
  return t || AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1];
}

export async function fetchAirQuality(lat, lng) {
  try {
    // OpenAQ v2 — find nearby locations
    const res = await fetch(
      `${API_CONFIG.OPENAQ.BASE}/latest?coordinates=${lat},${lng}&radius=50000&limit=20&order_by=distance`
    );
    if (!res.ok) throw new Error(`OpenAQ: ${res.status}`);
    const data = await res.json();

    const events = [];
    for (const loc of data.results || []) {
      const pm25 = loc.measurements?.find((m) => m.parameter === 'pm25');
      const pm10 = loc.measurements?.find((m) => m.parameter === 'pm10');
      const no2 = loc.measurements?.find((m) => m.parameter === 'no2');

      const mainReading = pm25 || pm10 || no2;
      if (!mainReading) continue;

      const value = mainReading.value;
      const param = mainReading.parameter.toUpperCase();
      const { label, severity } = aqiSeverity(param === 'PM25' ? value : value * 0.5);

      events.push({
        id: `aq-${loc.location}-${Date.now()}`,
        type: 'air_quality',
        title: `${param}: ${value} µg/m³ — ${label}`,
        description: `Station ${loc.location} (${loc.city || loc.country}). ${param}=${value}µg/m³${pm10 ? `, PM10=${pm10.value}` : ''}${no2 ? `, NO₂=${no2.value}` : ''}`,
        severity,
        eventDate: mainReading.lastUpdated || new Date().toISOString(),
        latitude: loc.coordinates?.latitude || lat,
        longitude: loc.coordinates?.longitude || lng,
        sourceName: 'OpenAQ',
        sourceUrl: `https://openaq.org/#/location/${loc.location}`,
        sourceReliability: 85,
        metadata: {
          station: loc.location,
          city: loc.city,
          measurements: loc.measurements,
        },
      });
    }

    return events;
  } catch (err) {
    console.warn('[airQuality] OpenAQ failed:', err.message);
    return [];
  }
}
