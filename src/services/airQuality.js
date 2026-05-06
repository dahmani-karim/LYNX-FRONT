import { API_CONFIG } from '../config/api';

const AQI_THRESHOLDS = [
  { max: 20, label: 'Bon', severity: 'info' },
  { max: 40, label: 'Correct', severity: 'info' },
  { max: 60, label: 'Modéré', severity: 'low' },
  { max: 80, label: 'Mauvais', severity: 'medium' },
  { max: 100, label: 'Très mauvais', severity: 'high' },
  { max: Infinity, label: 'Dangereux', severity: 'critical' },
];

function aqiSeverity(euAqi) {
  const t = AQI_THRESHOLDS.find((t) => euAqi <= t.max);
  return t || AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1];
}

/**
 * Fetches air quality data from Open-Meteo Air Quality API.
 * Free, no key, CORS-friendly. Uses European AQI.
 */
export async function fetchAirQuality(lat, lng) {
  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lng,
      current: 'european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide',
      timezone: 'auto',
    });

    const res = await fetch(`${API_CONFIG.OPEN_METEO_AQ.BASE}?${params}`);
    if (!res.ok) throw new Error(`Open-Meteo AQ: ${res.status}`);
    const data = await res.json();

    const c = data.current;
    if (!c) return { events: [], current: null };

    const euAqi = c.european_aqi || 0;
    const { label, severity } = aqiSeverity(euAqi);

    const current = {
      euAqi,
      label,
      severity,
      pm2_5: c.pm2_5 != null ? Math.round(c.pm2_5 * 10) / 10 : null,
      pm10: c.pm10 != null ? Math.round(c.pm10 * 10) / 10 : null,
      no2: c.nitrogen_dioxide != null ? Math.round(c.nitrogen_dioxide * 10) / 10 : null,
      ozone: c.ozone != null ? Math.round(c.ozone * 10) / 10 : null,
      so2: c.sulphur_dioxide != null ? Math.round(c.sulphur_dioxide * 10) / 10 : null,
    };

    // Only emit alert event if air quality is degraded
    const events = [];
    if (severity !== 'info') {
      const pm25 = current.pm2_5;
      const pm10 = current.pm10;
      const no2 = current.no2;
      const o3 = current.ozone;
      const so2 = current.so2;

      const parts = [];
      if (pm25 != null) parts.push(`PM2.5=${pm25}µg/m³`);
      if (pm10 != null) parts.push(`PM10=${pm10}µg/m³`);
      if (no2 != null) parts.push(`NO₂=${no2}µg/m³`);
      if (o3 != null) parts.push(`O₃=${o3}µg/m³`);
      if (so2 != null) parts.push(`SO₂=${so2}µg/m³`);

      events.push({
        id: `aq-${lat.toFixed(2)}-${lng.toFixed(2)}`,
        type: 'air_quality',
        title: `Qualité de l'air — ${label}`,
        description: `Indice européen de qualité de l'air: ${euAqi} (${label}). ${parts.join(', ')}`,
        severity,
        eventDate: c.time ? new Date(c.time).toISOString() : new Date().toISOString(),
        latitude: data.latitude || lat,
        longitude: data.longitude || lng,
        sourceName: 'Open-Meteo AQ',
        sourceUrl: 'https://open-meteo.com/en/docs/air-quality-api',
        sourceReliability: 88,
        metadata: { european_aqi: euAqi, pm2_5: pm25, pm10, no2, ozone: o3, so2 },
      });
    }

    return { events, current };
  } catch (err) {
    console.warn('[airQuality] Open-Meteo AQ failed:', err.message);
    return { events: [], current: null };
  }
}
