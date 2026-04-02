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

  // USGS / Geographic directions
  ['\\bof\\b', 'de'],
  ['\\bnear\\b', 'près de'],
  ['\\bregion\\b', 'région'],
  ['\\bislands?\\b', 'île(s)'],
  ['\\bcoast\\b', 'côte'],
  ['\\bsouth\\b', 'sud'],
  ['\\bnorth\\b', 'nord'],
  ['\\beast\\b', 'est'],
  ['\\bwest\\b', 'ouest'],
  ['\\bcentral\\b', 'central'],
  ['\\bnorthern\\b', 'du nord'],
  ['\\bsouthern\\b', 'du sud'],
  ['\\beastern\\b', 'de l\'est'],
  ['\\bwestern\\b', 'de l\'ouest'],
  ['\\bborder\\b', 'frontière'],
  ['\\bcity\\b', 'ville'],
  ['\\bcapital\\b', 'capitale'],
  ['\\bprovince\\b', 'province'],
  ['\\bdistrict\\b', 'district'],
  ['\\bcounty\\b', 'comté'],
  ['\\bstate\\b', 'état'],
  ['\\bocean\\b', 'océan'],
  ['\\bsea\\b', 'mer'],
  ['\\briver\\b', 'rivière'],
  ['\\bmountain\\b', 'montagne'],

  // Severity / Status
  ['\\bsevere\\b', 'sévère'],
  ['\\bextreme\\b', 'extrême'],
  ['\\bmoderate\\b', 'modéré'],
  ['\\bminor\\b', 'mineur'],
  ['\\bmajor\\b', 'majeur'],
  ['\\bcritical\\b', 'critique'],
  ['\\bsignificant\\b', 'significatif'],
  ['\\bdeadly\\b', 'meurtrier'],
  ['\\bfatal\\b', 'mortel'],
  ['\\bdangerous\\b', 'dangereux'],
  ['\\bactive\\b', 'actif'],
  ['\\bongoing\\b', 'en cours'],
  ['\\bupdate\\b', 'mise à jour'],
  ['\\bupdated\\b', 'mis à jour'],
  ['\\bissued\\b', 'émis'],
  ['\\blifted\\b', 'levé'],
  ['\\bcancelled\\b', 'annulé'],
  ['\\bexpired\\b', 'expiré'],

  // Natural phenomena
  ['\\baftershock\\b', 'réplique'],
  ['\\baftershocks\\b', 'répliques'],
  ['\\bmagnitude\\b', 'magnitude'],
  ['\\bdepth\\b', 'profondeur'],
  ['\\bepicenter\\b', 'épicentre'],
  ['\\bseismic\\b', 'sismique'],
  ['\\btremor\\b', 'secousse'],
  ['\\bshaking\\b', 'secousse'],
  ['\\btsunami warning\\b', 'alerte tsunami'],
  ['\\btsunami watch\\b', 'veille tsunami'],
  ['\\bavalanche\\b', 'avalanche'],
  ['\\bmudslide\\b', 'coulée de boue'],
  ['\\bsinkhole\\b', 'effondrement de terrain'],
  ['\\bwind\\b', 'vent'],
  ['\\bwinds\\b', 'vents'],
  ['\\bgust\\b', 'rafale'],
  ['\\bgusts\\b', 'rafales'],
  ['\\brain\\b', 'pluie'],
  ['\\bheavy rain\\b', 'fortes pluies'],
  ['\\bsnow\\b', 'neige'],
  ['\\bfog\\b', 'brouillard'],
  ['\\bthunderstorm\\b', 'orage'],
  ['\\blightning\\b', 'foudre'],
  ['\\bfreeze\\b', 'gel'],
  ['\\bfreezing\\b', 'verglas'],
  ['\\bice\\b', 'glace'],
  ['\\bsmoke\\b', 'fumée'],
  ['\\bash\\b', 'cendres'],
  ['\\blava\\b', 'lave'],

  // Infrastructure / Technology
  ['\\boutage\\b', 'panne'],
  ['\\boutages\\b', 'pannes'],
  ['\\bdowntime\\b', 'temps d\'arrêt'],
  ['\\bdisruption\\b', 'perturbation'],
  ['\\bdisruptions\\b', 'perturbations'],
  ['\\binfrastructure\\b', 'infrastructure'],
  ['\\btransportation\\b', 'transport'],
  ['\\btransport\\b', 'transport'],
  ['\\brailway\\b', 'chemin de fer'],
  ['\\bairport\\b', 'aéroport'],
  ['\\bflight\\b', 'vol'],
  ['\\bflights\\b', 'vols'],
  ['\\bdam\\b', 'barrage'],
  ['\\bbridge\\b', 'pont'],
  ['\\bbuilding\\b', 'bâtiment'],
  ['\\bcollapse\\b', 'effondrement'],
  ['\\bcollapsed\\b', 'effondré'],
  ['\\bdestroyed\\b', 'détruit'],
  ['\\bdamage\\b', 'dégât'],
  ['\\bdamaged\\b', 'endommagé'],
  ['\\bdamages\\b', 'dégâts'],

  // People / Numbers
  ['\\bpeople\\b', 'personnes'],
  ['\\bpersons?\\b', 'personne(s)'],
  ['\\bfamil(?:y|ies)\\b', 'famille(s)'],
  ['\\bchildren\\b', 'enfants'],
  ['\\bwomen\\b', 'femmes'],
  ['\\bthousan(?:d|ds)\\b', 'millier(s)'],
  ['\\bhundred\\b', 'centaine'],
  ['\\bmillion\\b', 'million'],
  ['\\bsurvivor\\b', 'survivant'],
  ['\\bsurvivors\\b', 'survivants'],
  ['\\bvictims?\\b', 'victime(s)'],
  ['\\bmissing\\b', 'disparus'],
  ['\\btrapped\\b', 'piégés'],
  ['\\brescued\\b', 'secourus'],

  // Actions / Response
  ['\\bdeployed\\b', 'déployé'],
  ['\\bsent\\b', 'envoyé'],
  ['\\blaunched\\b', 'lancé'],
  ['\\bdeclared\\b', 'déclaré'],
  ['\\bordered\\b', 'ordonné'],
  ['\\bsuspended\\b', 'suspendu'],
  ['\\bbanned\\b', 'interdit'],
  ['\\bblocked\\b', 'bloqué'],
  ['\\bclosed\\b', 'fermé'],
  ['\\bshut down\\b', 'arrêté'],
  ['\\bshutdown\\b', 'arrêt'],
  ['\\bopened\\b', 'ouvert'],
  ['\\bresumed\\b', 'repris'],
  ['\\brestored\\b', 'rétabli'],
  ['\\binvestigation\\b', 'enquête'],
  ['\\binvestigating\\b', 'en cours d\'enquête'],

  // Space weather
  ['\\bsolar flare\\b', 'éruption solaire'],
  ['\\bsolar storm\\b', 'tempête solaire'],
  ['\\bgeomagnetic\\b', 'géomagnétique'],
  ['\\bcoronal mass ejection\\b', 'éjection de masse coronale'],
  ['\\bsunspot\\b', 'tache solaire'],
  ['\\baurora\\b', 'aurore'],
  ['\\bradiation storm\\b', 'tempête radiative'],
  ['\\bsatellite\\b', 'satellite'],
  ['\\bspace\\b', 'spatial'],
  ['\\borbital\\b', 'orbital'],

  // Economy / Trade
  ['\\btrade\\b', 'commerce'],
  ['\\bexport\\b', 'exportation'],
  ['\\bimport\\b', 'importation'],
  ['\\bembargo\\b', 'embargo'],
  ['\\btariff\\b', 'tarif douanier'],
  ['\\binflation\\b', 'inflation'],
  ['\\brecession\\b', 'récession'],
  ['\\bmarket\\b', 'marché'],
  ['\\beconomy\\b', 'économie'],
  ['\\beconomic\\b', 'économique'],

  // Time
  ['\\btoday\\b', 'aujourd\'hui'],
  ['\\byesterday\\b', 'hier'],
  ['\\bhours? ago\\b', 'il y a quelques heures'],
  ['\\bthis morning\\b', 'ce matin'],
  ['\\bovernight\\b', 'durant la nuit'],
  ['\\bearly\\b', 'tôt'],
  ['\\blate\\b', 'tard'],
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
 * Synchronous keyword-based fallback.
 */
export function autoTranslate(text) {
  if (!text) return '';
  const frenchIndicators = /[àâäéèêëïîôùûüçœæ]|(?:^|\s)(le|la|les|de|du|des|un|une|en|et|ou|dans|pour|sur|par|avec|aux)\s/i;
  if (frenchIndicators.test(text)) return text;
  return translateToFrench(text);
}

// ============================================
// MyMemory API — real EN→FR translation
// Persisted cache in localStorage + rate limiting
// ============================================

const STORAGE_KEY = 'lynx-translate-cache';
const MYMEMORY_MAX_CHARS = 450;
const MAX_CACHE_SIZE = 500;

// Load cache from localStorage
function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Map(JSON.parse(raw));
  } catch { /* corrupted, start fresh */ }
  return new Map();
}

function saveCache(cache) {
  try {
    // Trim oldest entries if too large
    const entries = [...cache.entries()];
    const trimmed = entries.length > MAX_CACHE_SIZE
      ? entries.slice(entries.length - MAX_CACHE_SIZE)
      : entries;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* quota exceeded, ignore */ }
}

const MYMEMORY_CACHE = loadCache();

// Simple rate limiter: max 5 requests per second
let requestQueue = Promise.resolve();
let lastRequestTime = 0;
const MIN_INTERVAL = 200; // 200ms between requests = 5/s

function rateLimited(fn) {
  requestQueue = requestQueue.catch(() => {}).then(async () => {
    const elapsed = Date.now() - lastRequestTime;
    if (elapsed < MIN_INTERVAL) {
      await new Promise((r) => setTimeout(r, MIN_INTERVAL - elapsed));
    }
    lastRequestTime = Date.now();
    return fn();
  });
  return requestQueue;
}

function splitIntoChunks(text) {
  if (text.length <= MYMEMORY_MAX_CHARS) return [text];
  const chunks = [];
  let remaining = text;
  while (remaining.length > MYMEMORY_MAX_CHARS) {
    let cutAt = -1;
    for (let i = MYMEMORY_MAX_CHARS - 1; i >= 100; i--) {
      if ('.!?:'.includes(remaining[i]) && (i + 1 >= remaining.length || remaining[i + 1] === ' ')) {
        cutAt = i + 1;
        break;
      }
    }
    if (cutAt === -1) cutAt = remaining.lastIndexOf(' ', MYMEMORY_MAX_CHARS);
    if (cutAt <= 0) cutAt = MYMEMORY_MAX_CHARS;
    chunks.push(remaining.slice(0, cutAt).trim());
    remaining = remaining.slice(cutAt).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function translateChunkMyMemory(text) {
  if (!text) return text;
  if (MYMEMORY_CACHE.has(text)) return MYMEMORY_CACHE.get(text);

  try {
    const translated = await rateLimited(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      if (res.status === 429) return '___RATE_LIMITED___';
      if (!res.ok) return null;
      const json = await res.json();
      const result = json.responseData?.translatedText || null;
      if (result && result.includes('MYMEMORY WARNING')) return null;
      return result;
    });

    if (translated === '___RATE_LIMITED___') {
      // Signal to stop the background queue
      return null;
    }

    if (translated) {
      MYMEMORY_CACHE.set(text, translated);
      saveCache(MYMEMORY_CACHE);
      return translated;
    }
    // API failed — use keyword fallback and cache it
    const fallback = translateToFrench(text);
    MYMEMORY_CACHE.set(text, fallback);
    saveCache(MYMEMORY_CACHE);
    return fallback;
  } catch {
    // Network/timeout error — keyword fallback, cached to avoid retries
    const fallback = translateToFrench(text);
    MYMEMORY_CACHE.set(text, fallback);
    saveCache(MYMEMORY_CACHE);
    return fallback;
  }
}

/**
 * Instant EN→FR translation with background cache warming.
 * Returns keyword translation immediately, queues MyMemory for next cycle.
 */
export function asyncTranslate(text) {
  if (!text || typeof text !== 'string') return text || '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  // Already French? Skip
  const frenchIndicators = /[àâäéèêëïîôùûüçœæ]|(?:^|\s)(le|la|les|de|du|des|un|une|en|et|ou|dans|pour|sur|par|avec|aux)\s/i;
  if (frenchIndicators.test(trimmed)) return trimmed;

  // Check cache first — instant return if found
  const chunks = splitIntoChunks(trimmed);
  const allCached = chunks.every((c) => MYMEMORY_CACHE.has(c));
  if (allCached) {
    return chunks.map((c) => MYMEMORY_CACHE.get(c)).join(' ');
  }

  // Return keyword translation immediately
  const keywordResult = translateToFrench(trimmed);

  // Queue background MyMemory call to warm cache for next cycle
  queueBackgroundTranslation(trimmed);

  return keywordResult;
}

// Background translation queue — processes one text at a time, stops on 429
const bgQueue = [];
let bgProcessing = false;
let bgPausedUntil = 0;
const BG_MAX_PER_CYCLE = 5; // max 5 translations per background run
const BG_PAUSE_DURATION = 60000; // pause 60s on 429

function queueBackgroundTranslation(text) {
  if (MYMEMORY_CACHE.has(text)) return;
  if (bgQueue.includes(text)) return;
  bgQueue.push(text);
  if (!bgProcessing) processBackgroundQueue();
}

async function processBackgroundQueue() {
  if (Date.now() < bgPausedUntil) return;
  bgProcessing = true;
  let count = 0;
  while (bgQueue.length > 0 && count < BG_MAX_PER_CYCLE) {
    const text = bgQueue.shift();
    if (MYMEMORY_CACHE.has(text)) continue;
    const chunks = splitIntoChunks(text);
    let rateLimited = false;
    for (const chunk of chunks) {
      if (!MYMEMORY_CACHE.has(chunk)) {
        const result = await translateChunkMyMemory(chunk);
        if (result === null) {
          // 429 rate limited — pause and stop
          bgPausedUntil = Date.now() + BG_PAUSE_DURATION;
          bgQueue.unshift(text); // put it back
          bgProcessing = false;
          // Schedule retry after pause
          setTimeout(() => { if (!bgProcessing && bgQueue.length > 0) processBackgroundQueue(); }, BG_PAUSE_DURATION);
          return;
        }
      }
    }
    count++;
  }
  bgProcessing = false;
  // If more items remain, schedule next batch
  if (bgQueue.length > 0) {
    setTimeout(() => { if (!bgProcessing) processBackgroundQueue(); }, 2000);
  }
}

/**
 * Batch-translate an array of strings.
 * Returns same-length array with translated strings (instant).
 */
export function asyncTranslateBatch(texts) {
  return texts.map((t) => asyncTranslate(t));
}
