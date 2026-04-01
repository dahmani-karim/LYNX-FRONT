import { API_CONFIG } from '../config/api';

function parseCERTRSS(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = doc.querySelectorAll('item');
  const events = [];

  items.forEach((item, i) => {
    const title = item.querySelector('title')?.textContent || '';
    const desc = item.querySelector('description')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';

    let severity = 'medium';
    const titleLower = title.toLowerCase();
    if (titleLower.includes('critique') || titleLower.includes('critical')) severity = 'critical';
    else if (titleLower.includes('important') || titleLower.includes('élevé')) severity = 'high';
    else if (titleLower.includes('modéré') || titleLower.includes('moderate')) severity = 'medium';

    events.push({
      id: `cert-${i}-${Date.now()}`,
      type: 'cyber',
      title: title.trim(),
      description: desc.replace(/<[^>]*>/g, '').trim().substring(0, 400),
      severity,
      sourceUrl: link,
      sourceName: 'CERT-FR',
      sourceReliability: 97,
      eventDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      latitude: 46.603354,
      longitude: 1.888334,
    });
  });

  return events;
}

async function fetchViaProxies(targetUrl) {
  for (const proxy of API_CONFIG.CORS_PROXIES) {
    try {
      const res = await fetch(`${proxy}${encodeURIComponent(targetUrl)}`);
      if (!res.ok) continue;
      const text = await res.text();
      if (text && text.includes('<item>')) return text;
    } catch {
      continue;
    }
  }
  throw new Error('All CORS proxies failed');
}

export async function fetchCyberAlerts() {
  try {
    const xml = await fetchViaProxies(API_CONFIG.CERT_FR.ALERTES_RSS);
    return parseCERTRSS(xml);
  } catch {
    try {
      const xml = await fetchViaProxies(API_CONFIG.CERT_FR.AVIS_RSS);
      return parseCERTRSS(xml);
    } catch {
      console.warn('CERT-FR: tous les proxies CORS ont échoué');
      return [];
    }
  }
}
