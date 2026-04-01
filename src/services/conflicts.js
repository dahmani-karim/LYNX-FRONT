import { API_CONFIG } from '../config/api';
import { asyncTranslate } from '../utils/translate';

/**
 * Fetches ongoing international crises and conflicts from GDELT.
 * Adds a small delay before fetching to stagger with geopolitics (also uses GDELT).
 * ReliefWeb removed — requires pre-approved appname since Nov 2025.
 */
export async function fetchConflicts() {
  // Stagger: wait 3s so geopolitics can hit CORS proxies first
  await new Promise((r) => setTimeout(r, 3000));

  const params = new URLSearchParams({
    query: '(conflict OR war OR crisis OR attack OR military) sourcelang:eng',
    mode: 'ArtList',
    maxrecords: '20',
    format: 'json',
    sort: 'DateDesc',
  });
  const gdeltUrl = `${API_CONFIG.GDELT.DOC_API}?${params}`;

  for (const proxy of API_CONFIG.CORS_PROXIES) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${proxy}${encodeURIComponent(gdeltUrl)}`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const data = await res.json();
      const articles = data.articles || [];
      if (!articles.length) continue;

      const events = articles.map((a, i) => {
        const severity = assessGDELTSeverity(a);
        return {
          id: `conflict-gdelt-${i}-${Date.now()}`,
          type: 'conflict',
          title: asyncTranslate(a.title || 'Conflit international'),
          description: (a.seendate ? `[${a.seendate.slice(0, 10)}] ` : '') + (a.domain || ''),
          severity,
          eventDate: a.seendate ? formatGDELTDate(a.seendate) : new Date().toISOString(),
          latitude: a.sourcelat ? parseFloat(a.sourcelat) : null,
          longitude: a.sourcelon ? parseFloat(a.sourcelon) : null,
          country: a.sourcecountry || 'Inconnu',
          countryIso: '',
          sourceName: a.domain || 'GDELT',
          sourceUrl: a.url || 'https://www.gdeltproject.org',
          sourceReliability: 75,
          metadata: { themes: [], disasters: [] },
        };
      });
      return events;
    } catch { continue; }
  }
  // All proxies failed — return empty instead of throwing
  console.warn('[conflicts] All GDELT proxies failed');
  return [];
}

function formatGDELTDate(seendate) {
  // GDELT format: "20260401T120000Z" or "20260401120000"
  try {
    const s = seendate.replace(/[^0-9]/g, '');
    const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}Z`;
    return new Date(iso).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function assessGDELTSeverity(article) {
  const t = (article.title || '').toLowerCase();
  if (t.includes('war') || t.includes('attack') || t.includes('bomb') || t.includes('invasion') || t.includes('killed')) return 'critical';
  if (t.includes('crisis') || t.includes('military') || t.includes('strike') || t.includes('combat')) return 'high';
  if (t.includes('tension') || t.includes('protest') || t.includes('sanction') || t.includes('threat')) return 'medium';
  return 'low';
}

/**
 * Evaluates potential impacts of international conflicts on the user's location.
 */
export function assessConflictImpact(conflicts, userLocation) {
  const impacts = [];

  const IMPACT_RULES = [
    {
      keywords: ['energy', 'oil', 'gas', 'pipeline', 'pétrole', 'gaz'],
      regions: ['RUS', 'UKR', 'IRQ', 'IRN', 'SAU', 'LBY', 'VEN', 'NGA'],
      impact: 'Risque hausse prix énergie',
      category: 'energy',
      icon: '⚡',
    },
    {
      keywords: ['grain', 'wheat', 'food', 'blé', 'céréale', 'agriculture', 'famine'],
      regions: ['UKR', 'RUS', 'ETH', 'SDN', 'YEM', 'SOM', 'AFG'],
      impact: 'Risque perturbation chaîne alimentaire',
      category: 'food',
      icon: '🌾',
    },
    {
      keywords: ['refugee', 'migration', 'displacement', 'réfugié', 'déplacement'],
      regions: ['SYR', 'AFG', 'SDN', 'UKR', 'MMR', 'VEN', 'HTI'],
      impact: 'Flux migratoires potentiels',
      category: 'migration',
      icon: '🚶',
    },
    {
      keywords: ['cyber', 'hack', 'attack', 'infrastructure', 'sabotage'],
      regions: ['RUS', 'CHN', 'IRN', 'PRK'],
      impact: 'Risque cyber / infrastructure',
      category: 'cyber',
      icon: '🛡️',
    },
    {
      keywords: ['nuclear', 'nucléaire', 'radiation', 'missile', 'balistique'],
      regions: ['RUS', 'UKR', 'PRK', 'IRN'],
      impact: 'Risque nucléaire / balistique',
      category: 'nuclear',
      icon: '☢️',
    },
    {
      keywords: ['supply chain', 'trade', 'embargo', 'sanction', 'commerce', 'shipping'],
      regions: ['CHN', 'TWN', 'RUS', 'IRN', 'YEM'],
      impact: 'Risque disruption commerce',
      category: 'trade',
      icon: '🚢',
    },
  ];

  conflicts.forEach((conflict) => {
    const text = `${conflict.title} ${conflict.description}`.toLowerCase();
    const iso = conflict.countryIso;

    IMPACT_RULES.forEach((rule) => {
      const keywordMatch = rule.keywords.some((k) => text.includes(k));
      const regionMatch = rule.regions.includes(iso);

      if (keywordMatch || regionMatch) {
        const existing = impacts.find((i) => i.category === rule.category);
        if (!existing) {
          impacts.push({
            category: rule.category,
            icon: rule.icon,
            impact: rule.impact,
            severity: conflict.severity,
            relatedConflicts: [conflict.id],
          });
        } else {
          existing.relatedConflicts.push(conflict.id);
          const sevOrder = ['info', 'low', 'medium', 'high', 'critical'];
          if (sevOrder.indexOf(conflict.severity) > sevOrder.indexOf(existing.severity)) {
            existing.severity = conflict.severity;
          }
        }
      }
    });
  });

  return impacts.sort((a, b) => {
    const sevOrder = ['info', 'low', 'medium', 'high', 'critical'];
    return sevOrder.indexOf(b.severity) - sevOrder.indexOf(a.severity);
  });
}
