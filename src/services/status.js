import { API_CONFIG } from '../config/api';

// ─── Service categories for grouped display ────────────────
export const SERVICE_CATEGORIES = {
  finance:       { label: 'Finances & Paiement',     icon: 'CreditCard',   order: 1 },
  cloud:         { label: 'Cloud & Hébergement',     icon: 'Cloud',        order: 2 },
  communication: { label: 'Communication & Réseaux', icon: 'MessageCircle', order: 3 },
  tools:         { label: 'Outils & Productivité',   icon: 'Wrench',       order: 4 },
  logistics:     { label: 'Logistique & Transport',   icon: 'Truck',        order: 5 },
  health:        { label: 'Santé & Services publics', icon: 'Heart',        order: 6 },
  platforms:     { label: 'Grandes plateformes',      icon: 'Globe',        order: 7 },
};

// ─── Statuspage.io-compatible services ─────────────────────
const STATUSPAGE_SERVICES = [
  // Finance
  { name: 'Stripe',       category: 'finance',       url: API_CONFIG.STATUS_PAGES.STRIPE },
  { name: 'PayPal',       category: 'finance',       url: API_CONFIG.STATUS_PAGES.PAYPAL },
  { name: 'Wise',         category: 'finance',       url: API_CONFIG.STATUS_PAGES.WISE },
  { name: 'Coinbase',     category: 'finance',       url: API_CONFIG.STATUS_PAGES.COINBASE },
  // Cloud
  { name: 'GitHub',       category: 'cloud',         url: API_CONFIG.STATUS_PAGES.GITHUB },
  { name: 'Cloudflare',   category: 'cloud',         url: API_CONFIG.STATUS_PAGES.CLOUDFLARE },
  { name: 'Vercel',       category: 'cloud',         url: API_CONFIG.STATUS_PAGES.VERCEL },
  { name: 'Netlify',      category: 'cloud',         url: API_CONFIG.STATUS_PAGES.NETLIFY },
  { name: 'Render',       category: 'cloud',         url: API_CONFIG.STATUS_PAGES.RENDER },
  { name: 'DigitalOcean', category: 'cloud',         url: API_CONFIG.STATUS_PAGES.DIGITALOCEAN },
  // Communication
  { name: 'Discord',      category: 'communication', url: API_CONFIG.STATUS_PAGES.DISCORD },
  { name: 'Zoom',         category: 'communication', url: API_CONFIG.STATUS_PAGES.ZOOM },
  { name: 'Twitch',       category: 'communication', url: API_CONFIG.STATUS_PAGES.TWITCH },
  { name: 'Reddit',       category: 'communication', url: API_CONFIG.STATUS_PAGES.REDDIT },
  // Tools
  { name: 'OpenAI',       category: 'tools',         url: API_CONFIG.STATUS_PAGES.OPENAI },
  { name: 'Notion',       category: 'tools',         url: API_CONFIG.STATUS_PAGES.NOTION },
  { name: 'Figma',        category: 'tools',         url: API_CONFIG.STATUS_PAGES.FIGMA },
  { name: 'Bitbucket',    category: 'tools',         url: API_CONFIG.STATUS_PAGES.BITBUCKET },
  { name: 'Datadog',      category: 'tools',         url: API_CONFIG.STATUS_PAGES.DATADOG },
  { name: 'Dropbox',      category: 'tools',         url: API_CONFIG.STATUS_PAGES.DROPBOX },
  { name: 'Atlassian',    category: 'tools',         url: API_CONFIG.STATUS_PAGES.ATLASSIAN },
];

// ─── HTTP-ping services (no public status API) ─────────────
const PING_SERVICES = [
  // Santé & Services publics
  { name: 'Doctolib',       category: 'health',    url: API_CONFIG.PING_SERVICES.DOCTOLIB,        pageUrl: 'https://www.doctolib.fr' },
  { name: 'Ameli',          category: 'health',    url: API_CONFIG.PING_SERVICES.AMELI,            pageUrl: 'https://www.ameli.fr' },
  { name: 'Service-Public', category: 'health',    url: API_CONFIG.PING_SERVICES.SERVICE_PUBLIC,   pageUrl: 'https://www.service-public.fr' },
  { name: 'Impots.gouv',    category: 'health',    url: API_CONFIG.PING_SERVICES.IMPOTS,           pageUrl: 'https://www.impots.gouv.fr' },
  { name: 'Assurance Maladie', category: 'health', url: API_CONFIG.PING_SERVICES.CNAM,             pageUrl: 'https://www.complementaire-sante-solidaire.gouv.fr' },
  // Logistique
  { name: 'SNCF Connect',   category: 'logistics', url: API_CONFIG.PING_SERVICES.SNCF,             pageUrl: 'https://www.sncf-connect.com' },
  { name: 'RATP',           category: 'logistics', url: API_CONFIG.PING_SERVICES.RATP,             pageUrl: 'https://www.ratp.fr' },
  { name: 'Uber',           category: 'logistics', url: API_CONFIG.PING_SERVICES.UBER,             pageUrl: 'https://www.uber.com' },
  // Grandes plateformes
  { name: 'Google',         category: 'platforms', url: API_CONFIG.PING_SERVICES.GOOGLE,            pageUrl: 'https://www.google.fr' },
  { name: 'YouTube',        category: 'platforms', url: API_CONFIG.PING_SERVICES.YOUTUBE,           pageUrl: 'https://www.youtube.com' },
  { name: 'WhatsApp',       category: 'platforms', url: API_CONFIG.PING_SERVICES.WHATSAPP,          pageUrl: 'https://web.whatsapp.com' },
  { name: 'Instagram',      category: 'platforms', url: API_CONFIG.PING_SERVICES.INSTAGRAM,         pageUrl: 'https://www.instagram.com' },
  { name: 'Amazon',         category: 'platforms', url: API_CONFIG.PING_SERVICES.AMAZON,            pageUrl: 'https://www.amazon.fr' },
];

// ─── Helpers ───────────────────────────────────────────────

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

function translateDesc(raw) {
  switch (raw) {
    case 'All Systems Operational': return 'Opérationnel';
    case 'Partially Degraded Service': return 'Service partiellement dégradé';
    case 'Major Service Outage': return 'Panne majeure';
    case 'Minor Service Outage': return 'Panne mineure';
    case 'Degraded Performance': return 'Performances dégradées';
    case 'Service Under Maintenance': return 'Maintenance en cours';
    default: return raw;
  }
}

function indicatorToFrench(indicator) {
  switch (indicator) {
    case 'minor': return 'mineur';
    case 'major': return 'majeur';
    case 'critical': return 'critique';
    case 'maintenance': return 'maintenance';
    default: return indicator;
  }
}

// ─── Statuspage.io fetcher ─────────────────────────────────

async function fetchStatuspageService(service) {
  const makeResult = (data) => {
    const indicator = data.status?.indicator || 'none';
    const rawDesc = data.status?.description || 'Operational';
    return {
      name: service.name,
      category: service.category,
      method: 'statuspage',
      pageUrl: service.url.replace('/api/v2/status.json', '').replace('/api/v2.0.0/current', ''),
      status: indicator === 'none' ? 'operational' : indicator,
      description: translateDesc(rawDesc),
      indicator,
      lastChecked: new Date().toISOString(),
    };
  };

  // Try direct fetch first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(service.url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) return makeResult(await res.json());
  } catch {
    // CORS or network error — try proxy
  }

  // Fallback via CORS proxy
  for (const proxy of API_CONFIG.CORS_PROXIES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${proxy}${encodeURIComponent(service.url)}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) return makeResult(await res.json());
    } catch {
      // try next proxy
    }
  }

  return {
    name: service.name,
    category: service.category,
    method: 'statuspage',
    pageUrl: service.url.replace('/api/v2/status.json', '').replace('/api/v2.0.0/current', ''),
    status: 'unknown',
    description: 'Impossible de vérifier',
    indicator: 'unknown',
    lastChecked: new Date().toISOString(),
  };
}

// ─── HTTP ping fetcher (no-cors mode — opaque response = reachable) ────

async function fetchPingService(service) {
  let reachable = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    // mode: 'no-cors' returns an opaque response if server is reachable
    // A TypeError/AbortError means the server is unreachable
    await fetch(service.url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    reachable = true;
  } catch {
    // network error → server unreachable
  }

  return {
    name: service.name,
    category: service.category,
    method: 'ping',
    pageUrl: service.pageUrl,
    status: reachable ? 'operational' : 'unreachable',
    description: reachable ? 'Accessible' : 'Inaccessible ou bloqué',
    indicator: reachable ? 'none' : 'major',
    lastChecked: new Date().toISOString(),
  };
}

// ─── Main export ───────────────────────────────────────────

export async function fetchServiceStatuses() {
  const alerts = [];

  // Fetch both types in parallel
  const statuspagePromises = STATUSPAGE_SERVICES.map(fetchStatuspageService);
  const pingPromises = PING_SERVICES.map(fetchPingService);

  const allResults = await Promise.allSettled([...statuspagePromises, ...pingPromises]);

  const serviceList = allResults
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);

  // Generate alert events for degraded services
  for (const svc of serviceList) {
    if (svc.status !== 'operational' && svc.status !== 'unknown') {
      alerts.push({
        id: `status-${svc.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'blackout',
        title: `${svc.name} : ${svc.description}`,
        description: `Service ${svc.name} en état dégradé (${indicatorToFrench(svc.indicator)})`,
        severity: svc.status === 'unreachable' ? 'high' : statusToSeverity(svc.indicator),
        sourceName: `${svc.name} Status`,
        sourceReliability: svc.method === 'statuspage' ? 99 : 70,
        sourceUrl: svc.pageUrl,
        eventDate: new Date().toISOString(),
        latitude: 48.8566,
        longitude: 2.3522,
        serviceInfo: {
          name: svc.name,
          category: svc.category,
          indicator: svc.indicator,
          description: svc.description,
        },
      });
    }
  }

  return { alerts, services: serviceList };
}
