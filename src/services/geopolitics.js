import { API_CONFIG } from '../config/api';
import { asyncTranslate } from '../utils/translate';

/**
 * Fetches geopolitical events from GDELT (social unrest, sanctions, diplomacy).
 * Covers the "social" category that had no data source.
 * Free, no API key, CORS-friendly.
 */
export async function fetchGeopolitics() {
  const events = [];

  const queries = [
    { q: '(protest OR strike OR demonstration OR riot) sourcelang:eng', category: 'social' },
    { q: '(fuel shortage OR gas price OR petrol crisis OR oil supply) sourcelang:eng', category: 'fuel' },
  ];

  for (const { q, category } of queries) {
    try {
      const params = new URLSearchParams({
        query: q,
        mode: 'ArtList',
        maxrecords: '15',
        format: 'json',
        sort: 'DateDesc',
      });
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_CONFIG.GDELT.DOC_API}?${params}`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const data = await res.json();

      (data.articles || []).forEach((a, i) => {
        const severity = assessGeoSeverity(a.title || '');
        events.push({
          id: `geo-${category}-${i}-${Date.now()}`,
          type: category,
          title: a.title || 'Événement géopolitique',
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
    } catch (err) {
      console.warn(`[geopolitics] GDELT ${category} failed:`, err.message);
    }
  }

  // Batch translate titles
  const translations = await Promise.all(events.map((e) => asyncTranslate(e.title)));
  translations.forEach((t, i) => { events[i].title = t; });

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
