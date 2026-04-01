/**
 * RSS Feed Generator for LYNX alerts.
 * Generates a valid RSS 2.0 XML string from events.
 */

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate RSS feed XML from events.
 * @param {Array} events - Alert events
 * @param {Object} options - Feed metadata
 * @returns {string} RSS 2.0 XML string
 */
export function generateRssFeed(events, options = {}) {
  const {
    title = 'LYNX – Alertes Multi-Risques',
    description = 'Flux d\'alertes OSINT en temps réel',
    link = 'https://lynx.lacavernedurefractaire.fr',
  } = options;

  const now = new Date().toUTCString();

  const items = events
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
    .slice(0, 50)
    .map((event) => {
      const pubDate = new Date(event.eventDate).toUTCString();
      const guid = `lynx-${event.id}`;
      const coords = event.latitude && event.longitude
        ? `\n      <georss:point>${event.latitude} ${event.longitude}</georss:point>`
        : '';

      return `    <item>
      <title>${escapeXml(event.title)}</title>
      <description>${escapeXml(event.description || '')}</description>
      <category>${escapeXml(event.type || 'other')}</category>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${guid}</guid>
      <source url="${escapeXml(event.sourceUrl || link)}">${escapeXml(event.sourceName || 'LYNX')}</source>${coords}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:georss="http://www.georss.org/georss">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    <language>fr</language>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>LYNX OSINT Monitor</generator>
${items}
  </channel>
</rss>`;
}

/**
 * Download the RSS feed as an XML file.
 */
export function downloadRssFeed(events) {
  const xml = generateRssFeed(events);
  const blob = new Blob([xml], { type: 'application/rss+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lynx_alerts_${new Date().toISOString().slice(0, 10)}.xml`;
  a.click();
  URL.revokeObjectURL(url);
}
