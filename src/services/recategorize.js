/**
 * Client-side recategorization + deduplication layer.
 *
 * recategorizeEvent — two-pass:
 *  1. VALIDATION — types Strapi over-assigns (nuclear, conflict, cyber, weather):
 *     confirm content matches, else reclassify or downgrade to 'other'.
 *  2. OVERRIDE — generic types (other, disaster…): promote when keywords match.
 *
 * deduplicateEvents — removes near-duplicates (same event, multiple GDELT articles):
 *  keeps the entry with the highest sourceReliability, using a
 *  type + normalised-title (5 words) + day signature.
 */

/**
 * Sources that generate events with precise, purpose-built classifiers.
 * Their type assignment is trusted — skip all validation for them.
 */
const TRUSTED_SOURCES = ['Open-Meteo', 'USGS', 'FIRMS', 'NASA EONET', 'IODA', 'Météo-France'];

/**
 * Types where Strapi's classifier is unreliable.
 * Content MUST match CONFIRM_KEYWORDS to keep the assigned type.
 */
const HIGH_RISK_TYPES = ['nuclear', 'conflict', 'cyber', 'weather', 'air_quality'];

const CONFIRM_KEYWORDS = {
  nuclear: /nucléair|radioactif|réacteur|centrale.*atom|uranium|plutonium|IAEA|AIEA|irradiat|Fukushima|Tchernobyl|Chernobyl|matière.*radioact/i,
  conflict: /guerre|frappe\s+(?:aérien|de\s+drones?)|bombardement|missile\s+(?:balistiq|de\s+croisièr)|armée.*attaqu|combats?\s+(?:ach|intens)|attentat\s+terr|tirs?\s+d['']artill|forces\s+armées/i,
  cyber: /cyberattaque|ransomware|rançongiciel|piratage\s+(?:de|inform)|fuite\s+(?:de\s+)?données|attaque\s+informatique|DDoS|violation\s+de\s+données/i,
  weather: /tempête|ouragan|cyclone|typhon|tornade|tornado|inondation|canicule|vague\s+de\s+(?:froid|chaleur)|sécheresse|précipitation|grêle|blizzard|alerte\s+(?:météo|orange|rouge)|vent\s+(?:fort|violent|extrêm)|neige\s+(?:abond|record)|pluie\s+(?:torrentiel|abond|extrem)|météo\s+(?:extrem|dange)|gel\s+(?:prévu|annoncé|dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)|avis\s+de\s+gel|verglas|alerte\s+gel/i,
  // Air quality: must mention pollution indicators, AQI, or specific pollutants
  air_quality: /qualité\s+(?:de\s+l[''])?air|indice\s+ATMO|AQI|PM2[.,]5|PM10|particules\s+fines|pollution\s+(?:atmos|de\s+l['']air|urbaine|de\s+l['']|aux\s+part)|épisode\s+de\s+pollution|smog|ozone\s+(?:en\s+surface|au\s+sol|élevé|dépasse)|NO2|dioxyde\s+d['']azote|pic\s+de\s+pollution|indice\s+de\s+qualité/i,
};

/** Reclassification rules — used when validation fails or type is generic */
const RULES = [
  {
    type: 'health',
    keywords: /hantavirus|hondius|épidémie|epidemic|outbreak|dengue|mpox|choléra|cholera|contagion|cas\s+confirm|pandémi|quarantaine|fièvre\s+hémorr|ebola|paludisme|variole|covid|rappel.*alimentaire|contamination\s+(?:alimentaire|bactéri)|salmonell|listéria|listeria|intoxication\s+alimentaire/i,
  },
  {
    type: 'conflict',
    keywords: /frappe\s+aérien|bombardement\s+(?:de|sur)|offensive\s+milit|armée.*attaqu|combats\s+ach|mort.*conflit|conflit\s+armé/i,
  },
  {
    type: 'weather',
    keywords: /tempête\s+(?:tropicale|extra-trop)|cyclone\s+(?:cat|de\s+cat)|ouragan|typhon|tornado|tornade|inondation\s+(?:grave|catastro|majeu)|canicule\s+(?:extrêm|record)|sécheresse\s+(?:extrêm|sévèr)/i,
  },
  {
    type: 'fire',
    keywords: /feux?\s+de\s+forêt|incendie\s+(?:foresti|de\s+forêt)|wildfire/i,
  },
  {
    type: 'cyber',
    keywords: /cyberattaque|ransomware|rançongiciel|piratage\s+(?:de|inform)|fuite\s+(?:de\s+)?données|attaque\s+informatique|ddos/i,
  },
  {
    type: 'nuclear',
    keywords: /(?:incident|accident|fuite)\s+(?:nucléair|radioactif)|centrale\s+nucléair|réacteur.*incident|contamination\s+radioactif/i,
  },
  {
    type: 'disaster',
    keywords: /tremblement\s+de\s+terre|séisme|glissement\s+de\s+terrain|tsunami|volcan|éruption/i,
  },
];

/** Generic Strapi types that can be safely overridden */
const GENERIC_TYPES = ['other', 'disaster', 'social', 'energy', 'space_weather', 'nuclear', 'conflict', 'cyber', 'weather', 'air_quality'];

/**
 * Returns the event with a corrected `type` when needed, otherwise unchanged.
 * @param {object} event
 * @returns {object}
 */
export function recategorizeEvent(event) {
  // Trusted precision sources — never touch their classification
  if (TRUSTED_SOURCES.some((s) => (event.sourceName || '').includes(s))) return event;

  const text = `${event.title || ''} ${event.description || ''}`;

  // Pass 1 — validate high-risk Strapi types
  if (HIGH_RISK_TYPES.includes(event.type)) {
    const confirmKw = CONFIRM_KEYWORDS[event.type];
    if (confirmKw && !confirmKw.test(text)) {
      // Content doesn't match — try to find the real category
      for (const rule of RULES) {
        if (rule.type !== event.type && rule.keywords.test(text)) {
          return { ...event, type: rule.type };
        }
      }
      // No better match — downgrade to generic
      return { ...event, type: 'other' };
    }
  }

  // Pass 2 — promote generic types when a specific rule matches
  if (GENERIC_TYPES.includes(event.type)) {
    for (const rule of RULES) {
      if (rule.type !== event.type && rule.keywords.test(text)) {
        return { ...event, type: rule.type };
      }
    }
  }

  return event;
}

/**
 * Builds a deduplication signature from an event.
 * Combines type + first-5-normalised-title-words + event day.
 * Strips accents and punctuation so minor translation variants collapse.
 */
function buildDupSig(event) {
  const day = event.eventDate ? event.eventDate.slice(0, 10) : '';
  const titleWords = (event.title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^\w\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(' ');
  return `${event.type}::${titleWords}::${day}`;
}

/**
 * Removes near-duplicate events (same story, multiple GDELT articles with different IDs).
 * Within each duplicate group, keeps the event with the highest sourceReliability.
 * @param {object[]} events — already ID-deduplicated
 * @returns {object[]}
 */
export function deduplicateEvents(events) {
  // Sort reliability desc so the first occurrence in the Set is the best one
  const sorted = [...events].sort(
    (a, b) => (b.sourceReliability || 50) - (a.sourceReliability || 50)
  );
  const seen = new Set();
  return sorted.filter((event) => {
    const sig = buildDupSig(event);
    if (seen.has(sig)) return false;
    seen.add(sig);
    return true;
  });
}
