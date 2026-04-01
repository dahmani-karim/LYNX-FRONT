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
      if (!res.ok) return null;
      const json = await res.json();
      const result = json.responseData?.translatedText || null;
      if (result && result.includes('MYMEMORY WARNING')) return null;
      return result;
    });

    if (translated) {
      MYMEMORY_CACHE.set(text, translated);
      saveCache(MYMEMORY_CACHE);
      return translated;
    }
    // API failed (429, etc.) — use keyword fallback and cache it
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

// Background translation queue — processes one text at a time
const bgQueue = [];
let bgProcessing = false;

function queueBackgroundTranslation(text) {
  if (MYMEMORY_CACHE.has(text)) return;
  if (bgQueue.includes(text)) return;
  bgQueue.push(text);
  if (!bgProcessing) processBackgroundQueue();
}

async function processBackgroundQueue() {
  bgProcessing = true;
  while (bgQueue.length > 0) {
    const text = bgQueue.shift();
    if (MYMEMORY_CACHE.has(text)) continue;
    const chunks = splitIntoChunks(text);
    for (const chunk of chunks) {
      if (!MYMEMORY_CACHE.has(chunk)) {
        await translateChunkMyMemory(chunk);
      }
    }
  }
  bgProcessing = false;
}

/**
 * Batch-translate an array of strings.
 * Returns same-length array with translated strings (instant).
 */
export function asyncTranslateBatch(texts) {
  return texts.map((t) => asyncTranslate(t));
}
