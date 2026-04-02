/**
 * Country Risk Choropleth — loads lightweight world GeoJSON and computes risk per country.
 * Uses Natural Earth 110m from a free CDN.
 */

const GEOJSON_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

let cachedTopology = null;

/**
 * Load world topology (TopoJSON → we convert to GeoJSON features).
 * world-atlas@2 ships as TopoJSON; we need topojson-client to convert.
 * To avoid adding a dependency, we use the GeoJSON variant instead.
 */
const GEOJSON_SIMPLE_URL =
  'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

// Lighter alternative — Natural Earth 110m as GeoJSON (~240KB gzipped)
const NE_GEOJSON_URL =
  'https://cdn.jsdelivr.net/npm/@naturalearthdatajs/naturalearthdata@1.0.0/ne_110m_admin_0_countries.json';

let cachedGeoJSON = null;

export async function loadCountryBoundaries() {
  if (cachedGeoJSON) return cachedGeoJSON;

  // Try lightweight NE 110m first, fallback to datasets/geo-countries
  for (const url of [NE_GEOJSON_URL, GEOJSON_SIMPLE_URL]) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      const data = await res.json();
      // Normalize: ensure FeatureCollection
      if (data.type === 'FeatureCollection') {
        cachedGeoJSON = data;
        return data;
      }
    } catch {
      // try next
    }
  }
  return null;
}

/**
 * Compute risk score per country based on events.
 * Returns Map<countryName, { score, count, maxSeverity }>.
 */
const SEVERITY_WEIGHT = { info: 1, low: 2, medium: 4, high: 8, critical: 16 };

// ISO 3166-1 alpha-2 → common GeoJSON property names
function getCountryKey(feature) {
  const p = feature.properties;
  return (
    p.ADMIN ||
    p.admin ||
    p.NAME ||
    p.name ||
    p.NAME_LONG ||
    p.name_long ||
    p.SOVEREIGNT ||
    p.sovereignt ||
    ''
  ).toLowerCase();
}

// Simple country name normalization for matching events
const COUNTRY_ALIASES = {
  'united states of america': ['usa', 'united states', 'us', 'états-unis', 'etats-unis'],
  'united kingdom': ['uk', 'grande-bretagne', 'angleterre'],
  france: ['france'],
  germany: ['allemagne', 'germany'],
  china: ['chine', 'china'],
  'russian federation': ['russie', 'russia'],
  japan: ['japon', 'japan'],
  'korea, republic of': ['corée du sud', 'south korea'],
  'iran, islamic republic of': ['iran'],
  ukraine: ['ukraine'],
  turkey: ['turquie', 'turkey', 'türkiye'],
  brazil: ['brésil', 'brazil'],
  india: ['inde', 'india'],
};

function buildCountryIndex() {
  const index = {};
  for (const [canonical, aliases] of Object.entries(COUNTRY_ALIASES)) {
    index[canonical] = canonical;
    for (const a of aliases) index[a] = canonical;
  }
  return index;
}

const countryIndex = buildCountryIndex();

function matchEventToCountry(event) {
  // Try to extract country from location field
  const loc = (event.location || event.title || '').toLowerCase();
  for (const [alias, canonical] of Object.entries(countryIndex)) {
    if (loc.includes(alias)) return canonical;
  }
  return null;
}

export function computeCountryRisks(events) {
  const risks = new Map();

  for (const event of events) {
    const country = matchEventToCountry(event);
    if (!country) continue;

    const existing = risks.get(country) || { score: 0, count: 0, maxSeverity: 'info' };
    existing.score += SEVERITY_WEIGHT[event.severity] || 1;
    existing.count += 1;
    if ((SEVERITY_WEIGHT[event.severity] || 0) > (SEVERITY_WEIGHT[existing.maxSeverity] || 0)) {
      existing.maxSeverity = event.severity;
    }
    risks.set(country, existing);
  }

  return risks;
}

/**
 * Get fill color based on risk score.
 */
export function getRiskColor(score) {
  if (score >= 40) return '#DC2626'; // critical red
  if (score >= 20) return '#F97316'; // high orange
  if (score >= 10) return '#EAB308'; // medium yellow
  if (score >= 4) return '#3B82F6';  // low blue
  if (score > 0) return '#6366F1';   // info purple
  return 'transparent';
}

export function getRiskOpacity(score) {
  if (score >= 40) return 0.4;
  if (score >= 20) return 0.3;
  if (score >= 10) return 0.25;
  if (score > 0) return 0.15;
  return 0;
}
