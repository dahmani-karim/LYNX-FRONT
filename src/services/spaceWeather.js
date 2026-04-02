import { API_CONFIG } from '../config/api';
import { asyncTranslate } from '../utils/translate';

/**
 * Fetches space weather alerts from NOAA SWPC.
 * Free, no API key, CORS-friendly.
 */
export async function fetchSpaceWeather() {
  const events = [];

  try {
    const [alertsRes, kpRes] = await Promise.allSettled([
      fetch(API_CONFIG.NOAA_SWPC.ALERTS),
      fetch(API_CONFIG.NOAA_SWPC.KP_INDEX),
    ]);

    // Parse SWPC alerts (solar flares, geomagnetic storms, etc.)
    if (alertsRes.status === 'fulfilled' && alertsRes.value.ok) {
      const alerts = await alertsRes.value.json();
      const recent = alerts.slice(0, 15);

      recent.forEach((alert, i) => {
        const message = alert.message || '';
        const severity = classifySpaceAlert(message);

        events.push({
          id: `sw-alert-${i}-${Date.now()}`,
          type: 'space_weather',
          title: extractAlertTitle(message),
          description: message.slice(0, 400),
          severity,
          eventDate: alert.issue_datetime || new Date().toISOString(),
          latitude: 64.8, // Aurora oval center
          longitude: -18.0,
          sourceName: 'NOAA SWPC',
          sourceUrl: 'https://www.swpc.noaa.gov',
          sourceReliability: 98,
          metadata: { product_id: alert.product_id },
        });
      });
    }

    // Parse Kp index (geomagnetic activity)
    if (kpRes.status === 'fulfilled' && kpRes.value.ok) {
      const kpData = await kpRes.value.json();
      // API returns [{time_tag, Kp, a_running, station_count}, ...]
      const latest = kpData[kpData.length - 1];
      if (latest) {
        const kp = parseFloat(latest.Kp) || 0;
        const severity = kp >= 4 ? kpSeverity(kp) : 'info';
        events.push({
          id: `sw-kp-${Date.now()}`,
          type: 'space_weather',
          title: kp >= 4
            ? `Indice Kp: ${kp.toFixed(0)} — ${kpLabel(kp)}`
            : `Indice Kp: ${kp.toFixed(1)} — Activité normale`,
          description: kp >= 4
            ? `Activité géomagnétique ${kpLabel(kp)}. Kp=${kp.toFixed(1)}. Risques: perturbations GPS, communications radio, réseaux électriques.`
            : `Activité géomagnétique calme. Kp=${kp.toFixed(1)}.`,
          severity,
          eventDate: latest.time_tag || new Date().toISOString(),
          latitude: 64.8,
          longitude: -18.0,
          sourceName: 'NOAA SWPC',
          sourceUrl: 'https://www.swpc.noaa.gov/products/planetary-k-index',
          sourceReliability: 98,
          metadata: { kp_index: kp },
        });
      }
    }
  } catch (err) {
    console.warn('[spaceWeather] NOAA SWPC failed:', err.message);
  }

  // Translate titles and descriptions
  events.forEach((e) => {
    e.title = asyncTranslate(e.title);
    e.description = asyncTranslate(e.description);
  });

  return events;
}

function extractAlertTitle(message) {
  const firstLine = message.split('\n').find((l) => l.trim().length > 5);
  if (firstLine && firstLine.length < 120) return firstLine.trim();
  if (message.includes('WARNING')) return 'Alerte Météo Spatiale';
  if (message.includes('WATCH')) return 'Veille Météo Spatiale';
  return 'Bulletin Météo Spatiale';
}

function classifySpaceAlert(message) {
  const m = message.toUpperCase();
  if (m.includes('X-CLASS') || m.includes('EXTREME') || m.includes('G5') || m.includes('G4')) return 'critical';
  if (m.includes('M-CLASS') || m.includes('STRONG') || m.includes('G3') || m.includes('S3')) return 'high';
  if (m.includes('WARNING') || m.includes('G2') || m.includes('S2') || m.includes('R2')) return 'medium';
  if (m.includes('WATCH') || m.includes('G1') || m.includes('S1') || m.includes('R1')) return 'low';
  return 'info';
}

function kpSeverity(kp) {
  if (kp >= 8) return 'critical';
  if (kp >= 6) return 'high';
  if (kp >= 5) return 'medium';
  return 'low';
}

function kpLabel(kp) {
  if (kp >= 8) return 'Tempête extrême';
  if (kp >= 7) return 'Tempête forte';
  if (kp >= 6) return 'Tempête modérée';
  if (kp >= 5) return 'Tempête mineure';
  return 'Activité élevée';
}
