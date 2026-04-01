import { API_CONFIG } from '../config/api';

/**
 * Fetches ongoing international crises and conflicts from ReliefWeb (UN OCHA).
 * Free, no API key required.
 */
export async function fetchConflicts() {
  try {
    const url = new URL('https://api.reliefweb.int/v1/reports');
    url.searchParams.set('appname', 'lynx-monitoring');
    url.searchParams.set('preset', 'latest');
    url.searchParams.set('limit', '30');
    url.searchParams.set('fields[include][]', 'title');

    const params = [
      ['fields[include][]', 'body-html'],
      ['fields[include][]', 'date.created'],
      ['fields[include][]', 'primary_country'],
      ['fields[include][]', 'source'],
      ['fields[include][]', 'disaster'],
      ['fields[include][]', 'url'],
      ['fields[include][]', 'theme'],
      ['filter[operator]', 'OR'],
      ['filter[conditions][0][field]', 'theme.name'],
      ['filter[conditions][0][value][]', 'Contributions'],
      ['filter[conditions][1][field]', 'theme.name'],
      ['filter[conditions][1][value][]', 'Peacekeeping and Peacebuilding'],
      ['filter[conditions][2][field]', 'disaster_type.name'],
      ['filter[conditions][2][value][]', 'Complex Emergency'],
    ];

    params.forEach(([key, val]) => url.searchParams.append(key, val));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`ReliefWeb: ${res.status}`);

    const data = await res.json();

    return (data.data || []).map((item) => {
      const fields = item.fields || {};
      const country = fields.primary_country?.name || 'Inconnu';
      const countryIso = fields.primary_country?.iso3 || '';
      const countryLat = fields.primary_country?.location?.lat;
      const countryLng = fields.primary_country?.location?.lon;

      const severity = assessConflictSeverity(fields);

      return {
        id: `conflict-${item.id}`,
        type: 'conflict',
        title: fields.title || 'Conflit international',
        description: extractCleanText(fields['body-html'] || '', 200),
        severity,
        eventDate: fields.date?.created || new Date().toISOString(),
        latitude: countryLat || null,
        longitude: countryLng || null,
        country,
        countryIso,
        sourceName: fields.source?.[0]?.name || 'ReliefWeb',
        sourceUrl: fields.url || `https://reliefweb.int/node/${item.id}`,
        sourceReliability: 95,
        metadata: {
          themes: (fields.theme || []).map((t) => t.name),
          disasters: (fields.disaster || []).map((d) => d.name),
        },
      };
    });
  } catch (err) {
    console.warn('[conflicts] ReliefWeb fetch failed:', err.message);
    return tryGDACSConflictFallback();
  }
}

function assessConflictSeverity(fields) {
  const title = (fields.title || '').toLowerCase();
  const themes = (fields.theme || []).map((t) => t.name.toLowerCase());

  if (title.includes('war') || title.includes('guerre') || title.includes('offensive') ||
      title.includes('invasion') || title.includes('armed conflict')) {
    return 'critical';
  }
  if (title.includes('crisis') || title.includes('crise') || title.includes('emergency') ||
      title.includes('combat') || title.includes('escalation')) {
    return 'high';
  }
  if (title.includes('tension') || title.includes('displacement') || title.includes('refugee') ||
      title.includes('sanction') || title.includes('protest')) {
    return 'medium';
  }
  return 'low';
}

function extractCleanText(html, maxLen) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

async function tryGDACSConflictFallback() {
  return [];
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
