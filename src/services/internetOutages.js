/**
 * Internet Outage fetcher — IODA (Internet Outage Detection & Analysis)
 * Georgia Tech / CAIDA — Free, no API key required.
 * Detects regional internet connectivity drops via BGP + active probing.
 */

const IODA_API = 'https://api.ioda.inetintel.cc.gatech.edu/v2';

// Countries to monitor (ISO 2-letter codes → names + coords for map)
const MONITORED_COUNTRIES = {
  FR: { name: 'France', lat: 46.6, lng: 2.2 },
  DE: { name: 'Allemagne', lat: 51.1, lng: 10.4 },
  GB: { name: 'Royaume-Uni', lat: 55.3, lng: -3.4 },
  US: { name: 'États-Unis', lat: 37.1, lng: -95.7 },
  CN: { name: 'Chine', lat: 35.9, lng: 104.2 },
  RU: { name: 'Russie', lat: 61.5, lng: 105.3 },
  UA: { name: 'Ukraine', lat: 48.4, lng: 31.2 },
  IR: { name: 'Iran', lat: 32.4, lng: 53.7 },
  TR: { name: 'Turquie', lat: 39.9, lng: 32.9 },
  SY: { name: 'Syrie', lat: 34.8, lng: 38.9 },
  IL: { name: 'Israël', lat: 31.0, lng: 34.8 },
  IN: { name: 'Inde', lat: 20.6, lng: 79.0 },
  BR: { name: 'Brésil', lat: -14.2, lng: -51.9 },
  EG: { name: 'Égypte', lat: 26.8, lng: 30.8 },
  SD: { name: 'Soudan', lat: 12.9, lng: 30.2 },
  MM: { name: 'Myanmar', lat: 21.9, lng: 95.9 },
  VE: { name: 'Venezuela', lat: 6.4, lng: -66.6 },
  PK: { name: 'Pakistan', lat: 30.4, lng: 69.3 },
  BD: { name: 'Bangladesh', lat: 23.7, lng: 90.4 },
  ET: { name: 'Éthiopie', lat: 9.1, lng: 40.5 },
};

function severityFromScore(normalizedScore) {
  // normalizedScore: 0 = full outage, 1 = normal. Alert when < 0.7
  if (normalizedScore <= 0.2) return 'critical';
  if (normalizedScore <= 0.4) return 'high';
  if (normalizedScore <= 0.6) return 'medium';
  return 'low';
}

export async function fetchInternetOutages() {
  const alerts = [];

  try {
    // Query IODA alerts endpoint for recent events
    const now = Math.floor(Date.now() / 1000);
    const sixHoursAgo = now - 6 * 3600;

    const url = `${IODA_API}/alerts/country?from=${sixHoursAgo}&until=${now}`;

    const resp = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'Accept': 'application/json' },
    });

    if (!resp.ok) throw new Error(`IODA HTTP ${resp.status}`);
    const data = await resp.json();

    const entries = data?.data || data?.results || data || [];
    if (!Array.isArray(entries)) return alerts;

    for (const entry of entries) {
      const code = entry.entityCode || entry.entity?.code || '';
      const country = MONITORED_COUNTRIES[code];
      if (!country) continue;

      // Each alert has datasource, level, condition
      const level = entry.level || entry.condition || 'normal';
      if (level === 'normal') continue;

      const score = entry.value ?? entry.score ?? 0.5;
      const severity = level === 'critical' ? 'critical' : level === 'warning' ? 'high' : severityFromScore(score);
      const pctDrop = entry.value != null ? Math.round((1 - entry.value) * 100) : null;

      alerts.push({
        id: `ioda-${code}-${entry.datasource || 'bgp'}`,
        type: 'blackout',
        severity,
        title: `Coupure internet ${country.name}${pctDrop != null ? ` (−${pctDrop}%)` : ''}`,
        description: `Perturbation de connectivité détectée en ${country.name} via ${entry.datasource || 'BGP/Active Probing'}. Source: IODA Georgia Tech.`,
        latitude: country.lat,
        longitude: country.lng,
        country: country.name,
        eventDate: entry.time ? new Date(entry.time * 1000).toISOString() : new Date().toISOString(),
        sourceName: 'IODA',
        sourceUrl: `https://ioda.inetintel.cc.gatech.edu/country/${code}`,
      });
    }
  } catch (err) {
    // IODA API may be unavailable — fallback to signals endpoint
    try {
      const alerts2 = await fetchIODASignals();
      return alerts2;
    } catch {
      // Silent fail — IODA is optional enrichment
    }
  }

  return alerts;
}

/**
 * Fallback: query IODA signals/outages endpoint
 */
async function fetchIODASignals() {
  const alerts = [];
  const now = Math.floor(Date.now() / 1000);
  const sixHoursAgo = now - 6 * 3600;

  const url = `${IODA_API}/outages/overall/country?from=${sixHoursAgo}&until=${now}&limit=50`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });

  if (!resp.ok) return alerts;
  const data = await resp.json();
  const entries = data?.data || [];

  for (const entry of entries) {
    const code = entry.entity?.code || '';
    const country = MONITORED_COUNTRIES[code];
    if (!country) continue;

    const scores = entry.scores || {};
    // Average across all datasources
    const values = Object.values(scores).filter((v) => typeof v === 'number');
    if (values.length === 0) continue;
    const avgScore = values.reduce((a, b) => a + b, 0) / values.length;

    if (avgScore >= 0.7) continue; // Normal — no alert

    const severity = severityFromScore(avgScore);
    const pctDrop = Math.round((1 - avgScore) * 100);

    alerts.push({
      id: `ioda-${code}-overall`,
      type: 'blackout',
      severity,
      title: `Coupure internet ${country.name} (−${pctDrop}%)`,
      description: `Baisse de connectivité de ${pctDrop}% détectée en ${country.name}. Analyse multi-sources (BGP, Active Probing). Source: IODA.`,
      latitude: country.lat,
      longitude: country.lng,
      country: country.name,
      eventDate: new Date().toISOString(),
      sourceName: 'IODA',
      sourceUrl: `https://ioda.inetintel.cc.gatech.edu/country/${code}`,
    });
  }

  return alerts;
}
