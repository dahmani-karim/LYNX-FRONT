import { API_CONFIG } from '../config/api';

function classifySeverity(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('critique') || t.includes('critical')) return 'critical';
  if (t.includes('important') || t.includes('élevé')) return 'high';
  if (t.includes('modéré') || t.includes('moderate')) return 'medium';
  return 'medium';
}

function mapRss2JsonItems(items) {
  return items.map((item, i) => ({
    id: `cert-${i}-${Date.now()}`,
    type: 'cyber',
    title: (item.title || '').trim(),
    description: (item.description || '').replace(/<[^>]*>/g, '').trim().substring(0, 400),
    severity: classifySeverity(item.title),
    sourceUrl: item.link || '',
    sourceName: 'CERT-FR',
    sourceReliability: 97,
    eventDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    latitude: 46.603354,
    longitude: 1.888334,
  }));
}

function parseCERTRSS(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = doc.querySelectorAll('item');
  const events = [];
  items.forEach((item, i) => {
    events.push({
      id: `cert-${i}-${Date.now()}`,
      type: 'cyber',
      title: (item.querySelector('title')?.textContent || '').trim(),
      description: (item.querySelector('description')?.textContent || '').replace(/<[^>]*>/g, '').trim().substring(0, 400),
      severity: classifySeverity(item.querySelector('title')?.textContent),
      sourceUrl: item.querySelector('link')?.textContent || '',
      sourceName: 'CERT-FR',
      sourceReliability: 97,
      eventDate: item.querySelector('pubDate')?.textContent
        ? new Date(item.querySelector('pubDate').textContent).toISOString()
        : new Date().toISOString(),
      latitude: 46.603354,
      longitude: 1.888334,
    });
  });
  return events;
}

async function fetchViaRss2Json(rssUrl) {
  const res = await fetch(`${API_CONFIG.RSS2JSON}${encodeURIComponent(rssUrl)}`);
  if (!res.ok) throw new Error(`rss2json: ${res.status}`);
  const data = await res.json();
  if (data.status !== 'ok' || !data.items?.length) throw new Error('rss2json: no items');
  return mapRss2JsonItems(data.items);
}

async function fetchViaProxies(targetUrl) {
  for (const proxy of API_CONFIG.CORS_PROXIES) {
    try {
      const res = await fetch(`${proxy}${encodeURIComponent(targetUrl)}`);
      if (!res.ok) continue;
      const text = await res.text();
      if (text && text.includes('<item>')) return parseCERTRSS(text);
    } catch {
      continue;
    }
  }
  throw new Error('All CORS proxies failed');
}

export async function fetchCyberAlerts() {
  // Strategy 1: rss2json (CORS-friendly, returns JSON)
  try {
    return await fetchViaRss2Json(API_CONFIG.CERT_FR.ALERTES_RSS);
  } catch { /* fall through */ }

  try {
    return await fetchViaRss2Json(API_CONFIG.CERT_FR.AVIS_RSS);
  } catch { /* fall through */ }

  // Strategy 2: CORS proxies
  try {
    return await fetchViaProxies(API_CONFIG.CERT_FR.ALERTES_RSS);
  } catch { /* fall through */ }

  try {
    return await fetchViaProxies(API_CONFIG.CERT_FR.AVIS_RSS);
  } catch {
    console.warn('CERT-FR: all fetch strategies failed');
    return [];
  }
}
