import { API_CONFIG } from '../config/api';

function gdacsAlertToSeverity(level) {
  if (!level) return 'info';
  const l = level.toLowerCase();
  if (l === 'red') return 'critical';
  if (l === 'orange') return 'high';
  if (l === 'green') return 'medium';
  return 'low';
}

function gdacsTypeToCategory(type) {
  if (!type) return 'disaster';
  const t = type.toUpperCase();
  if (t === 'EQ') return 'earthquake';
  if (t === 'TC') return 'weather';
  if (t === 'FL') return 'disaster';
  if (t === 'VO') return 'disaster';
  if (t === 'DR') return 'disaster';
  if (t === 'TS') return 'disaster';
  return 'disaster';
}

function gdacsTypeLabel(type) {
  const labels = {
    EQ: 'Séisme',
    TC: 'Cyclone',
    FL: 'Inondation',
    VO: 'Éruption volcanique',
    DR: 'Sécheresse',
    TS: 'Tsunami',
    WF: 'Feux de forêt',
  };
  return labels[type?.toUpperCase()] || 'Catastrophe';
}

function parseGDACSEventsFromJSON(data) {
  if (!data?.features) return [];
  return data.features.map((f, i) => {
    const p = f.properties || {};
    return {
      id: `gdacs-${p.eventid || i}`,
      type: gdacsTypeToCategory(p.eventtype),
      title: `${gdacsTypeLabel(p.eventtype)} – ${p.name || p.country || 'Inconnu'}`,
      description: p.description || p.htmldescription || `Alerte ${p.alertlevel}`,
      latitude: f.geometry?.coordinates?.[1] || 0,
      longitude: f.geometry?.coordinates?.[0] || 0,
      severity: gdacsAlertToSeverity(p.alertlevel),
      sourceUrl: p.url || `https://www.gdacs.org/report.aspx?eventid=${p.eventid}&eventtype=${p.eventtype}`,
      sourceName: 'GDACS',
      sourceReliability: 92,
      eventDate: p.fromdate ? new Date(p.fromdate).toISOString() : new Date().toISOString(),
      rawData: p,
    };
  });
}

function parseGDACSRSS(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = doc.querySelectorAll('item');
  const events = [];

  items.forEach((item, i) => {
    const title = item.querySelector('title')?.textContent || '';
    const desc = item.querySelector('description')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const lat = item.getElementsByTagNameNS('http://www.georss.org/georss', 'point')?.[0]?.textContent;

    let latitude = 0, longitude = 0;
    if (lat) {
      const parts = lat.trim().split(/\s+/);
      latitude = parseFloat(parts[0]) || 0;
      longitude = parseFloat(parts[1]) || 0;
    }

    let severity = 'medium';
    if (title.toLowerCase().includes('red')) severity = 'critical';
    else if (title.toLowerCase().includes('orange')) severity = 'high';
    else if (title.toLowerCase().includes('green')) severity = 'medium';

    events.push({
      id: `gdacs-rss-${i}-${Date.now()}`,
      type: 'disaster',
      title: title.replace(/<[^>]*>/g, '').trim(),
      description: desc.replace(/<[^>]*>/g, '').trim().substring(0, 300),
      latitude,
      longitude,
      severity,
      sourceUrl: link,
      sourceName: 'GDACS',
      sourceReliability: 90,
      eventDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    });
  });

  return events;
}

export async function fetchGDACSEvents() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fromDate = weekAgo.toISOString().split('T')[0];
  const toDate = now.toISOString().split('T')[0];

  try {
    const url = `${API_CONFIG.GDACS.EVENTS}?fromdate=${fromDate}&todate=${toDate}&alertlevel=Green;Orange;Red`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GDACS API: ${res.status}`);
    const data = await res.json();
    return parseGDACSEventsFromJSON(data);
  } catch {
    try {
      const proxyUrl = `${API_CONFIG.CORS_PROXY}${encodeURIComponent(API_CONFIG.GDACS.RSS)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`GDACS RSS proxy: ${res.status}`);
      const xml = await res.text();
      return parseGDACSRSS(xml);
    } catch {
      console.warn('GDACS: toutes les tentatives ont échoué');
      return [];
    }
  }
}
