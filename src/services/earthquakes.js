// @deprecated — Remplacé par globalAlerts.js + Strapi backend (lang=fr).
// Ce service n'est plus appelé par alertStore. À supprimer en P2.
import { API_CONFIG } from '../config/api';
import { asyncTranslate } from '../utils/translate';

function magnitudeToSeverity(mag) {
  if (mag >= 7) return 'critical';
  if (mag >= 6) return 'high';
  if (mag >= 5) return 'medium';
  if (mag >= 4) return 'low';
  return 'info';
}

export async function fetchEarthquakes(timeRange = 'day') {
  const feedKey = timeRange === 'week' ? 'm25_week' : 'm25_day';
  const url = API_CONFIG.USGS.FEED_BASE + API_CONFIG.USGS.feeds[feedKey];

  const res = await fetch(url);
  if (!res.ok) throw new Error(`USGS API error: ${res.status}`);
  const data = await res.json();

  const events = data.features.map((f) => ({
    id: `usgs-${f.id}`,
    type: 'earthquake',
    title: f.properties.title,
    description: `Magnitude ${f.properties.mag} – Profondeur ${f.geometry.coordinates[2]?.toFixed(1)} km`,
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
    depth: f.geometry.coordinates[2],
    magnitude: f.properties.mag,
    severity: magnitudeToSeverity(f.properties.mag),
    sourceUrl: f.properties.url,
    sourceName: 'USGS',
    sourceReliability: 98,
    eventDate: new Date(f.properties.time).toISOString(),
    tsunami: f.properties.tsunami > 0,
    pagerAlert: f.properties.alert,
    felt: f.properties.felt,
    sig: f.properties.sig,
    rawData: f.properties,
  }));

  events.forEach((e) => { e.title = asyncTranslate(e.title); });
  return events;
}

export async function fetchSignificantEarthquakes() {
  const url = API_CONFIG.USGS.FEED_BASE + API_CONFIG.USGS.feeds.significant_week;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USGS API error: ${res.status}`);
  const data = await res.json();

  const events = data.features.map((f) => ({
    id: `usgs-sig-${f.id}`,
    type: 'earthquake',
    title: f.properties.title,
    description: `Séisme significatif – Magnitude ${f.properties.mag}`,
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
    magnitude: f.properties.mag,
    severity: magnitudeToSeverity(f.properties.mag),
    sourceUrl: f.properties.url,
    sourceName: 'USGS',
    sourceReliability: 99,
    eventDate: new Date(f.properties.time).toISOString(),
    tsunami: f.properties.tsunami > 0,
    pagerAlert: f.properties.alert,
  }));

  events.forEach((e) => { e.title = asyncTranslate(e.title); });
  return events;
}
