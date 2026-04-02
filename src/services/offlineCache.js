/**
 * Offline Cache — IndexedDB storage for alerts & risk scores.
 * Allows offline consultation of the last fetched data.
 */

const DB_NAME = 'lynx-offline';
const DB_VERSION = 1;
const STORE_EVENTS = 'events';
const STORE_META = 'meta';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        db.createObjectStore(STORE_EVENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save current alerts + risk scores to IndexedDB.
 */
export async function cacheAlertData(events, riskScores, weatherData) {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_EVENTS, STORE_META], 'readwrite');

    // Clear old events and store new ones
    const eventStore = tx.objectStore(STORE_EVENTS);
    eventStore.clear();
    for (const event of events) {
      eventStore.put(event);
    }

    // Store metadata
    const metaStore = tx.objectStore(STORE_META);
    metaStore.put({ key: 'riskScores', value: riskScores });
    metaStore.put({ key: 'lastCached', value: new Date().toISOString() });
    if (weatherData) {
      metaStore.put({ key: 'weatherData', value: weatherData });
    }

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB unavailable — silent fail
  }
}

/**
 * Load cached alerts + risk scores from IndexedDB.
 * Returns { events, riskScores, weatherData, lastCached } or null.
 */
export async function loadCachedData() {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_EVENTS, STORE_META], 'readonly');

    const events = await new Promise((resolve, reject) => {
      const req = tx.objectStore(STORE_EVENTS).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const getMeta = (key) =>
      new Promise((resolve) => {
        const req = tx.objectStore(STORE_META).get(key);
        req.onsuccess = () => resolve(req.result?.value ?? null);
        req.onerror = () => resolve(null);
      });

    const riskScores = await getMeta('riskScores');
    const lastCached = await getMeta('lastCached');
    const weatherData = await getMeta('weatherData');

    if (!events.length) return null;

    return { events, riskScores, weatherData, lastCached };
  } catch {
    return null;
  }
}
