import { API_CONFIG } from '../config/api';

/**
 * Fetches ongoing international crises and conflicts.
 * Strategy 1: GDELT API (free, CORS-friendly)
 * Strategy 2: ReliefWeb as fallback
 */
export async function fetchConflicts() {
  // Strategy 1: GDELT
  try {
    return await fetchFromGDELT();
  } catch (err) {
    console.warn('[conflicts] GDELT failed:', err.message);
  }

  // Strategy 2: ReliefWeb via CORS proxy
  try {
    return await fetchFromReliefWebProxy();
  } catch (err) {
    console.warn('[conflicts] ReliefWeb proxy failed:', err.message);
  }

  // Strategy 3: Direct ReliefWeb (may 403 in browser)
  try {
    return await fetchFromReliefWebDirect();
  } catch (err) {
    console.warn('[conflicts] ReliefWeb direct failed:', err.message);
    return [];
  }
}

async function fetchFromGDELT() {
  const params = new URLSearchParams({
    query: '(conflict OR war OR crisis OR attack OR military) sourcelang:eng',
    mode: 'ArtList',
    maxrecords: '40',
    format: 'json',
    sort: 'DateDesc',
  });
  const res = await fetch(`${API_CONFIG.GDELT.DOC_API}?${params}`);
  if (!res.ok) throw new Error(`GDELT: ${res.status}`);
  const data = await res.json();
  const articles = data.articles || [];
  if (!articles.length) throw new Error('GDELT: no articles');

  return articles.map((a, i) => {
    const severity = assessGDELTSeverity(a);
    return {
      id: `conflict-gdelt-${i}-${Date.now()}`,
      type: 'conflict',
      title: a.title || 'Événement géopolitique',
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

async function fetchFromReliefWebProxy() {
  const targetUrl = 'https://api.reliefweb.int/v1/reports?appname=lynx-monitoring&preset=latest&limit=20';
  for (const proxy of API_CONFIG.CORS_PROXIES) {
    try {
      const res = await fetch(`${proxy}${encodeURIComponent(targetUrl)}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.data?.length) return mapReliefWebData(data.data);
    } catch { continue; }
  }
  throw new Error('All proxies failed for ReliefWeb');
}

async function fetchFromReliefWebDirect() {
  const res = await fetch('https://api.reliefweb.int/v1/reports?appname=lynx-monitoring&preset=latest&limit=20');
  if (!res.ok) throw new Error(`ReliefWeb: ${res.status}`);
  const data = await res.json();
  return mapReliefWebData(data.data || []);
}

function mapReliefWebData(items) {
  return items.map((item) => {
    const fields = item.fields || {};
    const country = fields.primary_country?.name || 'Inconnu';
    const countryIso = fields.primary_country?.iso3 || '';
    return {
      id: `conflict-${item.id}`,
      type: 'conflict',
      title: fields.title || 'Conflit international',
      description: extractCleanText(fields['body-html'] || '', 200),
      severity: assessReliefWebSeverity(fields),
      eventDate: fields.date?.created || new Date().toISOString(),
      latitude: fields.primary_country?.location?.lat || null,
      longitude: fields.primary_country?.location?.lon || null,
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
}

function assessReliefWebSeverity(fields) {
  const title = (fields.title || '').toLowerCase();
  if (title.includes('war') || title.includes('guerre') || title.includes('offensive') ||
      title.includes('invasion') || title.includes('armed conflict')) return 'critical';
  if (title.includes('crisis') || title.includes('crise') || title.includes('emergency') ||
      title.includes('combat') || title.includes('escalation')) return 'high';
  if (title.includes('tension') || title.includes('displacement') || title.includes('refugee') ||
      title.includes('sanction') || title.includes('protest')) return 'medium';
  return 'low';
}

function extractCleanText(html, maxLen) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
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
