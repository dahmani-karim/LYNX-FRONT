/**
 * Internet Outage fetcher — IODA (Internet Outage Detection & Analysis)
 * Georgia Tech / INetIntel — Free, no API key required.
 * Uses /v2/signals/raw/country/{CC} to detect drops via BGP + active probing.
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

// Priority countries to check (limit API calls)
const PRIORITY_CODES = ['IR', 'UA', 'RU', 'SY', 'SD', 'MM', 'CN', 'VE', 'PK', 'FR'];

function severityFromNorm(normValue) {
  if (normValue <= 0.2) return 'critical';
  if (normValue <= 0.4) return 'high';
  if (normValue <= 0.6) return 'medium';
  return 'low';
}

/**
 * Fetch recent signals for a country and detect drops
 */
async function fetchCountrySignals(code) {
  const now = Math.floor(Date.now() / 1000);
  const twoHoursAgo = now - 2 * 3600;

  const url = `${IODA_API}/signals/raw/country/${code}?from=${twoHoursAgo}&until=${now}`;
  const resp = await fetch(url, {
    signal: AbortSignal.timeout(12000),
    headers: { Accept: 'application/json' },
  });

  if (!resp.ok) return null;
  const data = await resp.json();

  const signals = data?.data?.[0] || [];
  if (!Array.isArray(signals)) return null;

  // Look for normalized signal (gtr-norm) which is 0–1
  const normSignal = signals.find((s) => s.datasource === 'gtr-norm');
  if (!normSignal?.values?.length) return null;

  // Get the most recent normalized value
  const values = normSignal.values.filter((v) => v != null && typeof v === 'number');
  if (values.length === 0) return null;

  const latestValue = values[values.length - 1];
  return { code, latestValue };
}

export async function fetchInternetOutages() {
  const alerts = [];

  try {
    // Fetch priority countries in parallel (batches of 5 to avoid flooding)
    const results = [];
    for (let i = 0; i < PRIORITY_CODES.length; i += 5) {
      const batch = PRIORITY_CODES.slice(i, i + 5);
      const batchResults = await Promise.allSettled(
        batch.map((code) => fetchCountrySignals(code))
      );
      results.push(...batchResults);
    }

    for (const result of results) {
      if (result.status !== 'fulfilled' || !result.value) continue;
      const { code, latestValue } = result.value;

      // Only alert if normalized value drops below 0.7 (30%+ drop)
      if (latestValue >= 0.7) continue;

      const country = MONITORED_COUNTRIES[code];
      if (!country) continue;

      const severity = severityFromNorm(latestValue);
      const pctDrop = Math.round((1 - latestValue) * 100);

      alerts.push({
        id: `ioda-${code}-signals`,
        type: 'blackout',
        severity,
        title: `Coupure internet ${country.name} (−${pctDrop}%)`,
        description: `Baisse de connectivité de ${pctDrop}% détectée en ${country.name} via Google Transparency Report normalisé. Source: IODA.`,
        latitude: country.lat,
        longitude: country.lng,
        country: country.name,
        eventDate: new Date().toISOString(),
        sourceName: 'IODA',
        sourceUrl: `https://ioda.inetintel.cc.gatech.edu/country/${code}`,
      });
    }
  } catch {
    // IODA is optional enrichment — silent fail
  }

  return alerts;
}
