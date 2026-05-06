/**
 * Internet Outage fetcher — IODA (Internet Outage Detection & Analysis)
 * Georgia Tech / INetIntel — Free, no API key required.
 * Uses /v2/outages/alerts?entityType=country — IODA's own anomaly detection
 * (BGP prefix withdrawals + active probing). Much more reliable than raw signals.
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

function severityFromLevel(level, pctDrop) {
  if (level === 'critical' && pctDrop >= 50) return 'critical';
  if (level === 'critical') return 'high';
  return 'medium';
}

export async function fetchInternetOutages() {
  const alerts = [];

  try {
    const now = Math.floor(Date.now() / 1000);
    const sixHoursAgo = now - 6 * 3600;

    const resp = await fetch(
      `${IODA_API}/outages/alerts?entityType=country&from=${sixHoursAgo}&until=${now}&limit=200`,
      { signal: AbortSignal.timeout(15000), headers: { Accept: 'application/json' } }
    );
    if (!resp.ok) return alerts;

    const json = await resp.json();
    const data = json?.data || [];

    // Keep only the most recent alert per country code
    // and only if we monitor that country
    const latestByCountry = {};
    for (const entry of data) {
      const code = entry.entity?.code;
      if (!code || !MONITORED_COUNTRIES[code]) continue;

      const existing = latestByCountry[code];
      if (!existing || entry.time > existing.time) {
        latestByCountry[code] = entry;
      }
    }

    // Only report countries whose latest state is NOT "normal"
    for (const [code, entry] of Object.entries(latestByCountry)) {
      if (entry.level === 'normal') continue;

      const country = MONITORED_COUNTRIES[code];
      const pctDrop = entry.historyValue > 0
        ? Math.round((1 - entry.value / entry.historyValue) * 100)
        : 0;
      const severity = severityFromLevel(entry.level, pctDrop);

      alerts.push({
        id: `ioda-${code}-${entry.datasource}`,
        type: 'blackout',
        severity,
        title: `Coupure internet — ${country.name}`,
        description: `Anomalie ${entry.datasource.toUpperCase()} détectée en ${country.name} : ${entry.value}/${entry.historyValue} (baisse de ${pctDrop}%). Source: IODA.`,
        latitude: country.lat,
        longitude: country.lng,
        country: country.name,
        eventDate: new Date(entry.time * 1000).toISOString(),
        sourceName: 'IODA',
        sourceUrl: `https://ioda.inetintel.cc.gatech.edu/country/${code}`,
      });
    }
  } catch {
    // IODA is optional enrichment — silent fail
  }

  return alerts;
}
