import { API_CONFIG } from '../config/api';

// Mots-clés pour filtrer les items RSS
const HANTAVIRUS_KEYWORDS = [
  'hantavirus', 'hanta virus', 'hantaviral',
  'hemorrhagic fever with renal syndrome', 'hfrs',
  'hantaan', 'puumala', 'seoul virus', 'sin nombre',
  'andes virus', 'dobrava', 'hantapulmonary',
];

// Table de correspondance pays/région → [lat, lng]
const GEO_LOOKUP = {
  // Amériques (zone la plus touchée : SNV/HPS)
  patagonie: [-45.0, -70.0],
  patagonia: [-45.0, -70.0],
  'buenos aires': [-34.6, -58.4],
  argentina: [-38.4, -63.6],
  argentine: [-38.4, -63.6],
  chile: [-33.5, -70.7],
  chili: [-33.5, -70.7],
  brasil: [-14.2, -51.9],
  brazil: [-14.2, -51.9],
  brésil: [-14.2, -51.9],
  panama: [8.5, -80.8],
  bolivia: [-16.3, -63.6],
  bolivie: [-16.3, -63.6],
  uruguay: [-32.5, -55.8],
  paraguay: [-23.4, -58.4],
  peru: [-9.2, -75.0],
  pérou: [-9.2, -75.0],
  colombia: [4.6, -74.1],
  colombie: [4.6, -74.1],
  mexico: [23.6, -102.6],
  mexique: [23.6, -102.6],
  venezuela: [6.4, -66.6],
  ecuador: [-1.8, -78.2],
  équateur: [-1.8, -78.2],
  canada: [56.1, -106.3],
  // USA régions
  'new mexico': [34.5, -105.8],
  'nouveau mexique': [34.5, -105.8],
  colorado: [39.1, -105.4],
  california: [36.8, -119.4],
  californie: [36.8, -119.4],
  arizona: [34.0, -111.1],
  'united states': [38.9, -95.7],
  'états-unis': [38.9, -95.7],
  'etats-unis': [38.9, -95.7],
  usa: [38.9, -95.7],
  // Europe (Puumala)
  germany: [51.2, 10.4],
  allemagne: [51.2, 10.4],
  deutschland: [51.2, 10.4],
  france: [46.2, 2.2],
  sweden: [60.1, 18.6],
  suède: [60.1, 18.6],
  finland: [61.9, 25.7],
  finlande: [61.9, 25.7],
  belgium: [50.5, 4.5],
  belgique: [50.5, 4.5],
  netherlands: [52.1, 5.3],
  'pays-bas': [52.1, 5.3],
  'czech republic': [49.8, 15.5],
  czechia: [49.8, 15.5],
  tchéquie: [49.8, 15.5],
  austria: [47.5, 14.5],
  autriche: [47.5, 14.5],
  // Asie (Hantaan, Seoul)
  china: [35.0, 105.0],
  chine: [35.0, 105.0],
  'south korea': [36.5, 127.9],
  'corée du sud': [36.5, 127.9],
  korea: [36.5, 127.9],
  russia: [61.5, 105.3],
  russie: [61.5, 105.3],
  balkans: [44.0, 20.5],
};

/**
 * Tente d'extraire des coordonnées depuis un texte en cherchant les noms de pays/régions.
 */
function extractCoords(text) {
  const lower = text.toLowerCase();
  // Chercher d'abord les correspondances les plus spécifiques (régions)
  for (const [name, coords] of Object.entries(GEO_LOOKUP)) {
    if (lower.includes(name)) return coords;
  }
  return null;
}

/**
 * Vérifie si un item RSS concerne le hantavirus.
 */
function isHantavirusItem(title, description) {
  const text = (title + ' ' + (description || '')).toLowerCase();
  return HANTAVIRUS_KEYWORDS.some((kw) => text.includes(kw));
}

/**
 * Détermine la sévérité à partir du texte.
 */
function assessSeverity(text) {
  const lower = text.toLowerCase();
  if (
    lower.includes('death') || lower.includes('fatal') ||
    lower.includes('décès') || lower.includes('mort') ||
    lower.includes('died') || lower.includes('killed') ||
    lower.includes('lethal')
  ) return 'critical';
  if (
    lower.includes('confirmed') || lower.includes('confirmé') ||
    lower.includes('hospitali') || lower.includes('outbreak') ||
    lower.includes('épidémie') || lower.includes('flambée')
  ) return 'high';
  return 'medium';
}

/**
 * Parse les items rss2json et retourne les événements hantavirus géolocalisés.
 */
function parseItems(items, sourceName) {
  const events = [];
  for (const item of items) {
    const title = (item.title || '').trim();
    const description = (item.description || item.content || '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);

    if (!isHantavirusItem(title, description)) continue;

    const coords = extractCoords(title + ' ' + description);
    if (!coords) continue; // Pas de localisation identifiable → on ignore

    const severity = assessSeverity(title + ' ' + description);
    const id = `hanta-${sourceName}-${(item.guid || item.link || Math.random()).toString().slice(-12)}-${Date.now()}`;

    events.push({
      id,
      type: 'health',
      title: title.substring(0, 120),
      description: description || 'Signalement hantavirus — voir la source pour les détails.',
      severity,
      latitude: coords[0],
      longitude: coords[1],
      eventDate: item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString(),
      sourceName,
      sourceUrl: item.link || '',
      sourceReliability: sourceName === 'WHO DON' ? 99 : 92,
      isHantavirus: true,
    });
  }
  return events;
}

/**
 * Fetch un flux RSS via l'API rss2json (déjà utilisée dans l'app).
 */
async function fetchRssFeed(rssUrl, sourceName) {
  try {
    const res = await fetch(`${API_CONFIG.RSS2JSON}${encodeURIComponent(rssUrl)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok' || !data.items?.length) throw new Error('Aucun item');
    return parseItems(data.items, sourceName);
  } catch (err) {
    console.warn(`[hantavirus] ${sourceName} RSS failed:`, err.message);
    return [];
  }
}

/**
 * Point d'entrée principal.
 * Agrège WHO DON + ProMED, filtre sur hantavirus, déduplique.
 */
export async function fetchHantavirusCases() {
  const [whoResult, promedResult] = await Promise.allSettled([
    fetchRssFeed('https://www.who.int/feeds/entity/csr/don/en/rss.xml', 'WHO DON'),
    fetchRssFeed('https://www.promedmail.org/feed/0', 'ProMED'),
  ]);

  const events = [
    ...(whoResult.status === 'fulfilled' ? whoResult.value : []),
    ...(promedResult.status === 'fulfilled' ? promedResult.value : []),
  ];

  // Déduplication : même région + même semaine
  const seen = new Set();
  return events.filter((e) => {
    const week = new Date(e.eventDate);
    week.setDate(week.getDate() - week.getDay()); // début de semaine
    const key = `${e.latitude.toFixed(1)},${e.longitude.toFixed(1)},${week.toISOString().substring(0, 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
