// @deprecated — Remplacé par globalAlerts.js + Strapi backend (lang=fr).
// Ce service n'est plus appelé par alertStore. À supprimer en P2.
import { API_CONFIG } from '../config/api';
import { asyncTranslate } from '../utils/translate';

/**
 * Fetches geopolitical events from GDELT (social unrest, sanctions, diplomacy).
 * Single combined query for social + fuel to reduce CORS proxy calls.
 */
export async function fetchGeopolitics() {
  const events = [];

  // Single combined query to reduce CORS proxy load
  const params = new URLSearchParams({
    query: '(protest OR strike OR demonstration OR riot OR fuel shortage OR gas price OR petrol crisis OR oil supply) sourcelang:eng',
    mode: 'ArtList',
    maxrecords: '25',
    format: 'json',
    sort: 'DateDesc',
  });
  const gdeltUrl = `${API_CONFIG.GDELT.DOC_API}?${params}`;

  let data = null;
  for (const proxy of API_CONFIG.CORS_PROXIES) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${proxy}${encodeURIComponent(gdeltUrl)}`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) { data = await res.json(); break; }
    } catch { continue; }
  }

  if (data) {
    (data.articles || []).forEach((a, i) => {
      const title = (a.title || '').toLowerCase();
      const category = (title.includes('fuel') || title.includes('gas') || title.includes('oil') || title.includes('petrol'))
        ? 'fuel' : 'social';
      const severity = assessGeoSeverity(a.title || '');
      events.push({
        id: `geo-${category}-${i}-${Date.now()}`,
        type: category,
        title: asyncTranslate(a.title || 'Événement géopolitique'),
        description: `Source: ${a.domain || 'GDELT'}${a.seendate ? ` | ${a.seendate.slice(0, 10)}` : ''}`,
        severity,
        eventDate: a.seendate ? formatDate(a.seendate) : new Date().toISOString(),
        latitude: a.sourcelat ? parseFloat(a.sourcelat) : null,
        longitude: a.sourcelon ? parseFloat(a.sourcelon) : null,
        country: a.sourcecountry || 'Inconnu',
        sourceName: a.domain || 'GDELT',
        sourceUrl: a.url || 'https://www.gdeltproject.org',
        sourceReliability: 70,
        metadata: { gdeltUrl: a.url },
      });
    });
  }

  return events;
}

function formatDate(seendate) {
  try {
    const s = seendate.replace(/[^0-9]/g, '');
    const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}Z`;
    return new Date(iso).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function assessGeoSeverity(title) {
  const t = title.toLowerCase();
  if (t.includes('riot') || t.includes('deadly') || t.includes('kill') || t.includes('explosion')) return 'critical';
  if (t.includes('crisis') || t.includes('violence') || t.includes('clash') || t.includes('shortage')) return 'high';
  if (t.includes('protest') || t.includes('strike') || t.includes('tension') || t.includes('price')) return 'medium';
  return 'low';
}
