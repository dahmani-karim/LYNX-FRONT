import { create } from 'zustand';
import { fetchGlobalAlerts } from '../services/globalAlerts';
import { fetchWeather } from '../services/weather';
import { fetchAirQuality } from '../services/airQuality';
import { fetchFires } from '../services/fires';
import { fetchServiceStatuses } from '../services/status';
import { fetchNuclearProduction } from '../services/energy';
import { fetchInternetOutages } from '../services/internetOutages';
import { fetchSpaceWeather } from '../services/spaceWeather';
import { calculateRiskScores } from '../services/riskEngine';
import { useSettingsStore } from './settingsStore';
import { notifyNewAlerts } from '../services/notifications';
import { computeDelta, getAlertTier } from '../services/deltaEngine';
import { cacheAlertData, loadCachedData } from '../services/offlineCache';
import { recordDeltaSnapshot } from '../services/deltaHistory';

let knownEventSigs = new Set();
let isFirstFetch = true;

export const useAlertStore = create((set, get) => ({
  events: [],
  weatherData: null,
  serviceStatuses: [],
  spaceWeatherData: [],
  riskScores: {
    global: 0,
    earthquake: 0,
    weather: 0,
    disaster: 0,
    conflict: 0,
    cyber: 0,
    energy: 0,
    social: 0,
    fuel: 0,
    health: 0,
    blackout: 0,
    air_quality: 0,
    fire: 0,
    space_weather: 0,
    nuclear: 0,
    radiation: 0,
  },
  previousGlobalScore: null,
  isLoading: false,
  errors: {},
  lastFetch: null,
  selectedEvent: null,
  delta: { newEvents: [], resolved: [], escalated: [], deescalated: [] },
  filters: {
    categories: [],
    severity: 'all',
    timeRange: '24h',
    searchQuery: '',
  },

  setSelectedEvent: (event) => set({ selectedEvent: event }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () =>
    set({
      filters: { categories: [], severity: 'all', timeRange: '24h', searchQuery: '' },
    }),

  getFilteredEvents: () => {
    const { events, filters } = get();
    // Exclure les alertes de type 'blackout' du flux principal (page Blackout Watcher dédiée)
    let filtered = events.filter((e) => e.type !== 'blackout');

    if (filters.categories.length > 0) {
      filtered = filtered.filter((e) => filters.categories.includes(e.type));
    }

    if (filters.severity !== 'all') {
      const severityOrder = ['info', 'low', 'medium', 'high', 'critical'];
      const minIdx = severityOrder.indexOf(filters.severity);
      filtered = filtered.filter((e) => severityOrder.indexOf(e.severity) >= minIdx);
    }

    if (filters.timeRange !== 'all') {
      const now = Date.now();
      const ranges = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      const maxAge = ranges[filters.timeRange];
      if (maxAge) {
        filtered = filtered.filter((e) => now - new Date(e.eventDate).getTime() < maxAge);
      }
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.sourceName?.toLowerCase().includes(q)
      );
    }

    // Exclure les événements datés dans le futur
    const now = Date.now();
    filtered = filtered.filter((e) => new Date(e.eventDate).getTime() <= now);

    filtered.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    return filtered;
  },

  fetchAllData: async (userLocation, weatherLocation) => {
    const { riskScores: prevScores } = get();
    set({ isLoading: true, errors: {} });

    const lat = userLocation?.lat || 48.8566;
    const lng = userLocation?.lng || 2.3522;
    const wLat = weatherLocation?.lat || lat;
    const wLng = weatherLocation?.lng || lng;
    const errors = {};
    let allEvents = [];

    // 1 appel Strapi (alertes globales pré-traduites) + quelques appels locaux (location-dependent)
    const results = await Promise.allSettled([
      fetchGlobalAlerts({ pageSize: 200, lang: 'fr' }),
      fetchWeather(wLat, wLng),
      fetchAirQuality(wLat, wLng),
      fetchFires(lat, lng),
      fetchServiceStatuses(),
      fetchNuclearProduction(),
      fetchInternetOutages(),
      fetchSpaceWeather(),
    ]);

    // [0] Alertes globales depuis Strapi (séismes, conflits, géopolitique, GDACS, cyber, énergie, santé, radiation, météo spatiale, feux globaux, statut)
    if (results[0].status === 'fulfilled') {
      allEvents.push(...results[0].value);
    } else {
      errors.global = results[0].reason?.message;
    }

    // [1] Météo locale
    let weatherData = null;
    if (results[1].status === 'fulfilled') {
      weatherData = results[1].value;
      allEvents.push(...(results[1].value.alerts || []));
    } else {
      errors.weather = results[1].reason?.message;
    }

    // [2] Qualité de l'air locale
    if (results[2].status === 'fulfilled') {
      allEvents.push(...results[2].value);
    } else {
      errors.air_quality = results[2].reason?.message;
    }

    // [3] Feux locaux (FIRMS — autour position utilisateur)
    if (results[3].status === 'fulfilled') {
      allEvents.push(...results[3].value);
    } else {
      errors.fire = results[3].reason?.message;
    }

    // [4] Statut services (GitHub, Cloudflare — pour l'UI serviceStatuses)
    let serviceStatuses = [];
    if (results[4].status === 'fulfilled') {
      serviceStatuses = results[4].value.services;
      allEvents.push(...results[4].value.alerts);
    } else {
      errors.blackout = results[4].reason?.message;
    }

    // [5] Production nucléaire
    if (results[5].status === 'fulfilled') {
      allEvents.push(...results[5].value);
    } else {
      errors.nuclear = results[5].reason?.message;
    }

    // [6] Internet Outages (IODA)
    if (results[6].status === 'fulfilled') {
      allEvents.push(...results[6].value);
    } else {
      errors.internet_outage = results[6].reason?.message;
    }

    // [7] Space Weather (NOAA SWPC — Kp index, solar flares, CME)
    let spaceWeatherData = [];
    if (results[7].status === 'fulfilled') {
      spaceWeatherData = results[7].value;
      allEvents.push(...results[7].value);
    } else {
      errors.space_weather = results[7].reason?.message;
    }

    const uniqueEvents = Array.from(
      new Map(allEvents.map((e) => [e.id, e])).values()
    );

    // Filter earthquakes by minimum magnitude setting
    const minMag = useSettingsStore.getState().earthquakeMinMagnitude || 4;
    const filteredEvents = uniqueEvents.filter((e) => {
      if (e.type === 'earthquake' && e.magnitude && e.magnitude < minMag) return false;
      return true;
    });

    // NOTE: La traduction est gérée côté backend Strapi (lang=fr).
    // L'ancien double-translate frontend cassait les titres déjà français.

    const riskScores = calculateRiskScores(filteredEvents);

    // Compute delta between previous and current events
    const previousEvents = get().events;
    const delta = isFirstFetch ? { newEvents: [], resolved: [], escalated: [], deescalated: [] } : computeDelta(previousEvents, filteredEvents);

    // Detect new events by comparing against previous known IDs (exclude blackout — separate page)
    const wasFirstFetch = isFirstFetch;
    const prevEventIds = new Set(get().events.map((e) => e.id));
    const newAlerts = filteredEvents.filter((e) => !prevEventIds.has(e.id) && e.type !== 'blackout');

    // Send push notifications for new high/critical alerts (skip first fetch)
    try {
      if (isFirstFetch) {
        // Hydrate known signatures without sending notifications
        knownEventSigs = new Set(filteredEvents.map((e) => `${e.type}::${e.title}`));
        isFirstFetch = false;
      } else {
        const settings = JSON.parse(localStorage.getItem('lynx-settings') || '{}');
        const minSev = settings?.state?.notifications?.minSeverity || 'high';
        knownEventSigs = notifyNewAlerts(filteredEvents, knownEventSigs, minSev);
      }
    } catch {}

    set({
      events: filteredEvents,
      weatherData,
      serviceStatuses,
      spaceWeatherData,
      riskScores,
      previousGlobalScore: prevScores.global,
      delta,
      isLoading: false,
      errors,
      lastFetch: new Date().toISOString(),
    });

    // Persist to IndexedDB for offline access
    cacheAlertData(uniqueEvents, riskScores, weatherData).catch(() => {});

    // Record delta snapshot for history graph
    if (!wasFirstFetch) {
      recordDeltaSnapshot(uniqueEvents.length, riskScores.global, delta);
    }

    // Return fetch result for sound feedback (include highest tier of new alerts)
    const allFailed = results.every((r) => r.status === 'rejected');
    let highestTier = 'routine';
    if (!wasFirstFetch && newAlerts.length > 0) {
      for (const a of newAlerts) {
        const t = getAlertTier(a);
        if (t === 'flash') { highestTier = 'flash'; break; }
        if (t === 'priority') highestTier = 'priority';
      }
    }
    return { ok: !allFailed, newCount: wasFirstFetch ? 0 : newAlerts.length, highestTier };
  },

  /**
   * Load cached data from IndexedDB (offline fallback).
   * Called on initial mount if network is unavailable.
   */
  loadOfflineData: async () => {
    const cached = await loadCachedData();
    if (!cached) return false;
    set({
      events: cached.events,
      riskScores: cached.riskScores || get().riskScores,
      weatherData: cached.weatherData || null,
      lastFetch: cached.lastCached,
    });
    return true;
  },
}));
