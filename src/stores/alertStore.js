import { create } from 'zustand';
import { fetchGlobalAlerts } from '../services/globalAlerts';
import { fetchWeather } from '../services/weather';
import { fetchAirQuality } from '../services/airQuality';
import { fetchFires } from '../services/fires';
import { fetchServiceStatuses } from '../services/status';
import { fetchNuclearProduction } from '../services/energy';
import { calculateRiskScores } from '../services/riskEngine';
import { notifyNewAlerts } from '../services/notifications';

let knownEventSigs = new Set();
let isFirstFetch = true;

export const useAlertStore = create((set, get) => ({
  events: [],
  weatherData: null,
  serviceStatuses: [],
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
  },
  previousGlobalScore: null,
  isLoading: false,
  errors: {},
  lastFetch: null,
  selectedEvent: null,
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
    let filtered = [...events];

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

    const uniqueEvents = Array.from(
      new Map(allEvents.map((e) => [e.id, e])).values()
    );

    const riskScores = calculateRiskScores(uniqueEvents);

    // Send push notifications for new high/critical alerts (skip first fetch)
    try {
      if (isFirstFetch) {
        // Hydrate known signatures without sending notifications
        knownEventSigs = new Set(uniqueEvents.map((e) => `${e.type}::${e.title}`));
        isFirstFetch = false;
      } else {
        const settings = JSON.parse(localStorage.getItem('lynx-settings') || '{}');
        const minSev = settings?.state?.notifications?.minSeverity || 'high';
        knownEventSigs = notifyNewAlerts(uniqueEvents, knownEventSigs, minSev);
      }
    } catch {}

    set({
      events: uniqueEvents,
      weatherData,
      serviceStatuses,
      riskScores,
      previousGlobalScore: prevScores.global,
      isLoading: false,
      errors,
      lastFetch: new Date().toISOString(),
    });
  },
}));
