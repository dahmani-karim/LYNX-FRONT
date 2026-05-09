import { API_CONFIG } from '../config/api';

const STRAPI = API_CONFIG.STRAPI_URL;

/**
 * SPECTER — fetch historical memory events from Strapi
 * Public endpoint, no auth required
 */
export async function fetchSpecterEvents({ category, type, page = 1, pageSize = 200 } = {}) {
  const params = new URLSearchParams();
  params.set('pagination[page]', page);
  params.set('pagination[pageSize]', pageSize);
  params.set('sort', 'startDate:desc');
  params.set('publicationState', 'live');
  // Populate linkedEventsInverse (title + type + slug) for badges in cards
  params.set('populate[linkedEventsInverse][fields][0]', 'title');
  params.set('populate[linkedEventsInverse][fields][1]', 'type');
  params.set('populate[linkedEventsInverse][fields][2]', 'slug');

  if (category && category !== 'ALL') {
    params.set('filters[category][$eq]', category);
  }
  if (type && type !== 'ALL') {
    params.set('filters[type][$eq]', type);
  }

  const res = await fetch(`${STRAPI}/api/lynx-memory-events?${params.toString()}`);
  if (!res.ok) throw new Error('SPECTER fetch error');
  const json = await res.json();
  return json.data || [];
}

export async function fetchSpecterEventBySlug(slug) {
  const params = new URLSearchParams();
  params.set('filters[slug][$eq]', slug);
  params.set('publicationState', 'live');
  params.set('populate[linkedEventsInverse][fields][0]', 'title');
  params.set('populate[linkedEventsInverse][fields][1]', 'slug');
  params.set('populate[linkedEventsInverse][fields][2]', 'type');
  params.set('populate[linkedEventsInverse][fields][3]', 'category');
  params.set('populate[linkedEventsInverse][fields][4]', 'startDate');

  const res = await fetch(`${STRAPI}/api/lynx-memory-events?${params.toString()}`);
  if (!res.ok) throw new Error('SPECTER event fetch error');
  const json = await res.json();
  return json.data?.[0] || null;
}
