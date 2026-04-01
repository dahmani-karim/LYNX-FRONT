/**
 * Quick keyword-based English → French translation for alert titles.
 * Not a full NLP translator — just maps common OSINT/crisis terms.
 */

const TERM_MAP = [
  // Conflicts / Geopolitics
  ['\\bwar\\b', 'guerre'],
  ['\\battack\\b', 'attaque'],
  ['\\battacks\\b', 'attaques'],
  ['\\bbombing\\b', 'bombardement'],
  ['\\bbomb\\b', 'bombe'],
  ['\\binvasion\\b', 'invasion'],
  ['\\bmilitary\\b', 'militaire'],
  ['\\bstrike\\b', 'frappe'],
  ['\\bstrikes\\b', 'frappes'],
  ['\\bairstrikes?\\b', 'frappes aériennes'],
  ['\\bcombat\\b', 'combat'],
  ['\\bconflict\\b', 'conflit'],
  ['\\bcrisis\\b', 'crise'],
  ['\\bclash(?:es)?\\b', 'affrontements'],
  ['\\bviolence\\b', 'violence'],
  ['\\bkilled\\b', 'tués'],
  ['\\bdead\\b', 'morts'],
  ['\\bdeaths?\\b', 'décès'],
  ['\\bcasualt(?:y|ies)\\b', 'victimes'],
  ['\\bwounded\\b', 'blessés'],
  ['\\binjured\\b', 'blessés'],
  ['\\bceasefire\\b', 'cessez-le-feu'],
  ['\\bsanctions?\\b', 'sanctions'],
  ['\\bthreat\\b', 'menace'],
  ['\\bthreats\\b', 'menaces'],
  ['\\btension\\b', 'tension'],
  ['\\btensions\\b', 'tensions'],
  ['\\bnuclear\\b', 'nucléaire'],
  ['\\bmissile\\b', 'missile'],
  ['\\bmissiles\\b', 'missiles'],
  ['\\bterror(?:ism|ist)?\\b', 'terrorisme'],
  ['\\bsurrender\\b', 'reddition'],
  ['\\bcoup\\b', 'coup d\'état'],
  ['\\brebels?\\b', 'rebelles'],
  ['\\binsurgents?\\b', 'insurgés'],
  ['\\bhostages?\\b', 'otages'],

  // Social
  ['\\bprotest\\b', 'manifestation'],
  ['\\bprotests\\b', 'manifestations'],
  ['\\bprotesters\\b', 'manifestants'],
  ['\\bdemonstration\\b', 'manifestation'],
  ['\\briot\\b', 'émeute'],
  ['\\briots\\b', 'émeutes'],
  ['\\bunrest\\b', 'troubles'],
  ['\\brefugees?\\b', 'réfugiés'],
  ['\\bmigration\\b', 'migration'],
  ['\\bdisplacement\\b', 'déplacement'],
  ['\\bdisplaced\\b', 'déplacés'],
  ['\\belection\\b', 'élection'],
  ['\\belections\\b', 'élections'],

  // Disasters / Weather
  ['\\bearthquake\\b', 'séisme'],
  ['\\bflood(?:s|ing)?\\b', 'inondation'],
  ['\\btsunami\\b', 'tsunami'],
  ['\\bhurricane\\b', 'ouragan'],
  ['\\bcyclone\\b', 'cyclone'],
  ['\\btyphoon\\b', 'typhon'],
  ['\\btornado\\b', 'tornade'],
  ['\\bvolcan(?:o|ic)\\b', 'volcanique'],
  ['\\beruption\\b', 'éruption'],
  ['\\blandslide\\b', 'glissement de terrain'],
  ['\\bdrought\\b', 'sécheresse'],
  ['\\bwildfire\\b', 'feu de forêt'],
  ['\\bwildfires\\b', 'feux de forêt'],
  ['\\bforest fire\\b', 'feu de forêt'],
  ['\\bfire\\b', 'incendie'],
  ['\\bfires\\b', 'incendies'],
  ['\\bstorm\\b', 'tempête'],
  ['\\bstorms\\b', 'tempêtes'],
  ['\\bheatwave\\b', 'canicule'],
  ['\\bheat wave\\b', 'canicule'],
  ['\\bcold wave\\b', 'vague de froid'],
  ['\\bblizzard\\b', 'blizzard'],
  ['\\bhail\\b', 'grêle'],
  ['\\bfamine\\b', 'famine'],

  // Health
  ['\\bepidemic\\b', 'épidémie'],
  ['\\bpandemic\\b', 'pandémie'],
  ['\\boutbreak\\b', 'épidémie'],
  ['\\binfection\\b', 'infection'],
  ['\\binfected\\b', 'infectés'],
  ['\\bvaccine\\b', 'vaccin'],
  ['\\bvaccination\\b', 'vaccination'],
  ['\\bquarantine\\b', 'quarantaine'],
  ['\\blockdown\\b', 'confinement'],
  ['\\bsurge\\b', 'flambée'],

  // Energy / Fuel
  ['\\bpower outage\\b', 'panne de courant'],
  ['\\bblackout\\b', 'coupure de courant'],
  ['\\bshortage\\b', 'pénurie'],
  ['\\bfuel\\b', 'carburant'],
  ['\\boil\\b', 'pétrole'],
  ['\\bgas\\b', 'gaz'],
  ['\\bpipeline\\b', 'gazoduc'],
  ['\\benergy\\b', 'énergie'],
  ['\\bprice\\b', 'prix'],
  ['\\bprices\\b', 'prix'],
  ['\\bsupply\\b', 'approvisionnement'],

  // Cyber
  ['\\bcyber\\b', 'cyber'],
  ['\\bhack(?:ed|ing)?\\b', 'piratage'],
  ['\\bbreach\\b', 'fuite de données'],
  ['\\bransomware\\b', 'rançongiciel'],
  ['\\bmalware\\b', 'logiciel malveillant'],
  ['\\bphishing\\b', 'hameçonnage'],
  ['\\bvulnerability\\b', 'vulnérabilité'],

  // General
  ['\\bemergency\\b', 'urgence'],
  ['\\balert\\b', 'alerte'],
  ['\\bwarning\\b', 'avertissement'],
  ['\\bevacua(?:tion|ted)\\b', 'évacuation'],
  ['\\brescue\\b', 'secours'],
  ['\\brelief\\b', 'aide humanitaire'],
  ['\\bhumanitarian\\b', 'humanitaire'],
  ['\\baid\\b', 'aide'],
  ['\\bsuspect(?:ed)?\\b', 'suspecté'],
  ['\\breport(?:ed)?\\b', 'signalé'],
  ['\\bconfirmed\\b', 'confirmé'],
  ['\\bgovernment\\b', 'gouvernement'],
  ['\\bpresident\\b', 'président'],
  ['\\barmy\\b', 'armée'],
  ['\\bnavy\\b', 'marine'],
  ['\\btroops\\b', 'troupes'],
  ['\\bsoldiers\\b', 'soldats'],
  ['\\bpolice\\b', 'police'],
  ['\\bcivilian\\b', 'civil'],
  ['\\bcivilians\\b', 'civils'],
];

// Precompile regexes
const COMPILED_TERMS = TERM_MAP.map(([pattern, fr]) => [new RegExp(pattern, 'gi'), fr]);

/**
 * Translates an English alert title/description to French using keyword mapping.
 * Preserves proper nouns (uppercase words), numbers, and unknown terms.
 */
export function translateToFrench(text) {
  if (!text) return '';

  // Already mostly French? Skip
  const frenchIndicators = /[àâäéèêëïîôùûüçœæ]|^(Séisme|Alerte|Tempête|Inondation|Éruption)/i;
  if (frenchIndicators.test(text)) return text;

  let result = text;
  for (const [regex, fr] of COMPILED_TERMS) {
    result = result.replace(regex, (match) => {
      // Preserve capitalization
      if (match[0] === match[0].toUpperCase()) {
        return fr.charAt(0).toUpperCase() + fr.slice(1);
      }
      return fr;
    });
  }

  return result;
}

/**
 * Translates only if the text appears to be English (no French accents, etc.)
 */
export function autoTranslate(text) {
  if (!text) return '';
  const frenchIndicators = /[àâäéèêëïîôùûüçœæ]|(?:^|\s)(le|la|les|de|du|des|un|une|en|et|ou|dans|pour|sur|par|avec|aux)\s/i;
  if (frenchIndicators.test(text)) return text;
  return translateToFrench(text);
}
