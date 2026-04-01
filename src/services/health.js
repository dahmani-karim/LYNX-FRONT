import { API_CONFIG } from '../config/api';

/**
 * Fetches global health/epidemic data from disease.sh.
 * Free, no API key, CORS-friendly.
 */
export async function fetchHealthAlerts() {
  const events = [];

  try {
    // Global COVID + top affected countries
    const [globalRes, countriesRes] = await Promise.allSettled([
      fetch(`${API_CONFIG.DISEASE_SH.BASE}/all`),
      fetch(`${API_CONFIG.DISEASE_SH.BASE}/countries?sort=todayCases&yesterday=true`),
    ]);

    if (globalRes.status === 'fulfilled' && globalRes.value.ok) {
      const global = await globalRes.value.json();
      const severity = assessGlobalSeverity(global);

      if (severity !== 'info') {
        events.push({
          id: `health-global-${Date.now()}`,
          type: 'health',
          title: `COVID-19 Global: +${formatNumber(global.todayCases)} cas`,
          description: `${formatNumber(global.todayCases)} nouveaux cas, ${formatNumber(global.todayDeaths)} décès aujourd'hui. Total: ${formatNumber(global.cases)} cas, ${formatNumber(global.deaths)} décès. Actifs: ${formatNumber(global.active)}`,
          severity,
          eventDate: new Date(global.updated).toISOString(),
          latitude: 20,
          longitude: 0,
          sourceName: 'disease.sh',
          sourceUrl: 'https://disease.sh',
          sourceReliability: 88,
          metadata: {
            cases: global.cases,
            deaths: global.deaths,
            todayCases: global.todayCases,
            todayDeaths: global.todayDeaths,
            active: global.active,
          },
        });
      }
    }

    if (countriesRes.status === 'fulfilled' && countriesRes.value.ok) {
      const countries = await countriesRes.value.json();
      const hotspots = countries.slice(0, 10);

      hotspots.forEach((c, i) => {
        if (!c.todayCases || c.todayCases < 1000) return;

        const severity = assessCountrySeverity(c);
        events.push({
          id: `health-${c.countryInfo?.iso3 || i}-${Date.now()}`,
          type: 'health',
          title: `${c.country}: +${formatNumber(c.todayCases)} cas`,
          description: `${formatNumber(c.todayCases)} nouveaux cas, ${formatNumber(c.todayDeaths)} décès. Actifs: ${formatNumber(c.active)}. Cas/million: ${formatNumber(c.casesPerOneMillion)}`,
          severity,
          eventDate: new Date(c.updated).toISOString(),
          latitude: c.countryInfo?.lat || 0,
          longitude: c.countryInfo?.long || 0,
          country: c.country,
          sourceName: 'disease.sh',
          sourceUrl: 'https://disease.sh',
          sourceReliability: 88,
          metadata: {
            todayCases: c.todayCases,
            todayDeaths: c.todayDeaths,
            active: c.active,
            casesPerMillion: c.casesPerOneMillion,
            iso3: c.countryInfo?.iso3,
          },
        });
      });
    }
  } catch (err) {
    console.warn('[health] disease.sh failed:', err.message);
  }

  return events;
}

function assessGlobalSeverity(data) {
  if (data.todayCases > 500000 || data.todayDeaths > 5000) return 'critical';
  if (data.todayCases > 200000 || data.todayDeaths > 2000) return 'high';
  if (data.todayCases > 50000 || data.todayDeaths > 500) return 'medium';
  if (data.todayCases > 10000) return 'low';
  return 'info';
}

function assessCountrySeverity(country) {
  if (country.todayCases > 100000 || country.todayDeaths > 1000) return 'critical';
  if (country.todayCases > 50000 || country.todayDeaths > 500) return 'high';
  if (country.todayCases > 10000 || country.todayDeaths > 100) return 'medium';
  return 'low';
}

function formatNumber(n) {
  if (!n) return '0';
  return n.toLocaleString('fr-FR');
}
