import { API_CONFIG } from '../config/api';

const MONITORED_SERVICES = [
  {
    name: 'GitHub',
    category: 'cloud',
    url: API_CONFIG.STATUS_PAGES.GITHUB,
  },
  {
    name: 'Cloudflare',
    category: 'internet',
    url: API_CONFIG.STATUS_PAGES.CLOUDFLARE,
  },
];

function statusToSeverity(indicator) {
  if (!indicator) return 'info';
  switch (indicator) {
    case 'none': return 'info';
    case 'minor': return 'low';
    case 'major': return 'high';
    case 'critical': return 'critical';
    default: return 'medium';
  }
}

export async function fetchServiceStatuses() {
  const results = [];

  const promises = MONITORED_SERVICES.map(async (service) => {
    try {
      const res = await fetch(service.url);
      if (!res.ok) throw new Error(`${service.name}: ${res.status}`);
      const data = await res.json();

      const indicator = data.status?.indicator || 'none';
      const description = data.status?.description || 'Opérationnel';

      if (indicator !== 'none') {
        results.push({
          id: `status-${service.name.toLowerCase()}-${Date.now()}`,
          type: 'blackout',
          title: `${service.name} : ${description}`,
          description: `Service ${service.name} en état dégradé (${indicator})`,
          severity: statusToSeverity(indicator),
          sourceName: `${service.name} Status`,
          sourceReliability: 99,
          sourceUrl: service.url.replace('/api/v2/status.json', ''),
          eventDate: new Date().toISOString(),
          latitude: 37.7749,
          longitude: -122.4194,
          serviceInfo: {
            name: service.name,
            category: service.category,
            indicator,
            description,
          },
        });
      }

      return {
        name: service.name,
        category: service.category,
        status: indicator === 'none' ? 'operational' : indicator,
        description,
        lastChecked: new Date().toISOString(),
      };
    } catch {
      return {
        name: service.name,
        category: service.category,
        status: 'unknown',
        description: 'Impossible de vérifier',
        lastChecked: new Date().toISOString(),
      };
    }
  });

  const statuses = await Promise.allSettled(promises);
  const serviceList = statuses
    .filter((s) => s.status === 'fulfilled')
    .map((s) => s.value);

  return { alerts: results, services: serviceList };
}
