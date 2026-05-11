/**
 * Client-side recategorization layer.
 * Corrects event types that Strapi may have misclassified,
 * using keyword matching on title + description.
 * Only overrides "generic" source types to avoid breaking precision sources.
 */

const RULES = [
  {
    type: 'health',
    keywords: /hantavirus|épidémie|epidemic|outbreak|dengue|mpox|choléra|cholera|contagion|cas\s+confirm|pandémi|quarantaine|fièvre\s+hémorr|ebola|paludisme|variole|covid/i,
    overrides: ['other', 'disaster', 'social'],
  },
  {
    type: 'conflict',
    keywords: /frappe\s+aérien|bombardement|missile|attentat\s+terr|offensive\s+milit|armée.*attaqu|combats\s+ach|mort.*conflit|conflit\s+armé|forces\s+armées/i,
    overrides: ['other', 'social', 'disaster'],
  },
  {
    type: 'weather',
    keywords: /tempête\s+(?:tropicale|extra-trop)|cyclone\s+(?:cat|de\s+cat)|ouragan|typhon|tornado|tornade|inondation\s+(?:grave|catastro|majeu)|canicule\s+(?:extrêm|record)|sécheresse\s+(?:extrêm|sévèr)/i,
    overrides: ['other', 'disaster'],
  },
  {
    type: 'fire',
    keywords: /feux?\s+de\s+forêt|incendie\s+(?:foresti|de\s+forêt)|wildfire/i,
    overrides: ['other', 'disaster'],
  },
  {
    type: 'cyber',
    keywords: /cyberattaque|ransomware|rançongiciel|piratage\s+(?:de|inform)|fuite\s+(?:de\s+)?données|attaque\s+informatique|ddos/i,
    overrides: ['other', 'disaster', 'social'],
  },
  {
    type: 'nuclear',
    keywords: /(?:incident|accident|fuite)\s+(?:nucléair|radioactif)|centrale\s+nucléair|réacteur.*incident|contamination\s+radioactif/i,
    overrides: ['other', 'disaster', 'energy'],
  },
];

/**
 * Returns the event with a corrected `type` if a rule matches,
 * otherwise returns the event unchanged.
 * @param {object} event
 * @returns {object}
 */
export function recategorizeEvent(event) {
  const text = `${event.title || ''} ${event.description || ''}`;
  for (const rule of RULES) {
    if (rule.overrides.includes(event.type) && rule.keywords.test(text)) {
      return { ...event, type: rule.type };
    }
  }
  return event;
}
