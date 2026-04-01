import { API_CONFIG } from '../config/api';

const STRAPI = API_CONFIG.STRAPI_URL;

/**
 * Récupère les alertes globales pré-traduites depuis le backend Strapi.
 * Remplace tous les appels directs à GDELT, USGS, GDACS, CERT-FR, etc.
 * Plus de problèmes de CORS ou de rate-limiting côté client.
 */
export async function fetchGlobalAlerts(options = {}) {
  const {
    types,
    severity,
    pageSize = 200,
    page = 1,
    lang = 'fr',
  } = options;

  const params = new URLSearchParams({ page, pageSize, lang });
  if (types) params.set('type', Array.isArray(types) ? types.join(',') : types);
  if (severity) params.set('severity', severity);

  const res = await fetch(`${STRAPI}/api/lynx-global-alerts?${params}`);
  if (!res.ok) throw new Error(`Strapi lynx-global-alerts: ${res.status}`);

  const json = await res.json();
  return json.data || [];
}
