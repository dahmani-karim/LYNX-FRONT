import { create } from 'zustand';
import { fetchEarthquakes } from '../services/earthquakes';
import { fetchWeather } from '../services/weather';
import { fetchGDACSEvents } from '../services/gdacs';
import { fetchCyberAlerts } from '../services/cyber';
import { fetchEnergyData, fetchNuclearProduction } from '../services/energy';
import { fetchServiceStatuses } from '../services/status';
import { fetchConflicts } from '../services/conflicts';
import { fetchAirQuality } from '../services/airQuality';
import { fetchFires } from '../services/fires';
import { fetchSpaceWeather } from '../services/spaceWeather';
import { fetchHealthAlerts } from '../services/health';
import { fetchGeopolitics } from '../services/geopolitics';
import { fetchRadiationData } from '../services/radiation';
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

    filtered.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    return filtered;
  },

  fetchAllData: async (userLocation) => {
    const { riskScores: prevScores } = get();
    set({ isLoading: true, errors: {} });

    const lat = userLocation?.lat || 48.8566;
    const lng = userLocation?.lng || 2.3522;
    const errors = {};
    let allEvents = [];

    const results = await Promise.allSettled([
      fetchEarthquakes(),
      fetchWeather(lat, lng),
      fetchGDACSEvents(),
      fetchCyberAlerts(),
      fetchEnergyData(),
      fetchServiceStatuses(),
      fetchConflicts(),
      fetchAirQuality(lat, lng),
      fetchFires(lat, lng),
      fetchSpaceWeather(),
      fetchHealthAlerts(),
      fetchGeopolitics(),
      fetchRadiationData(),
      fetchNuclearProduction(),
    ]);

    if (results[0].status === 'fulfilled') {
      allEvents.push(...results[0].value);
    } else {
      errors.earthquake = results[0].reason?.message;
    }

    let weatherData = null;
    if (results[1].status === 'fulfilled') {
      weatherData = results[1].value;
      allEvents.push(...(results[1].value.alerts || []));
    } else {
      errors.weather = results[1].reason?.message;
    }

    if (results[2].status === 'fulfilled') {
      allEvents.push(...results[2].value);
    } else {
      errors.disaster = results[2].reason?.message;
    }

    if (results[3].status === 'fulfilled') {
      allEvents.push(...results[3].value);
    } else {
      errors.cyber = results[3].reason?.message;
    }

    if (results[4].status === 'fulfilled') {
      allEvents.push(...results[4].value);
    } else {
      errors.energy = results[4].reason?.message;
    }

    let serviceStatuses = [];
    if (results[5].status === 'fulfilled') {
      serviceStatuses = results[5].value.services;
      allEvents.push(...results[5].value.alerts);
    } else {
      errors.blackout = results[5].reason?.message;
    }

    if (results[6].status === 'fulfilled') {
      allEvents.push(...results[6].value);
    } else {
      errors.conflict = results[6].reason?.message;
    }

    if (results[7].status === 'fulfilled') {
      allEvents.push(...results[7].value);
    } else {
      errors.air_quality = results[7].reason?.message;
    }

    if (results[8].status === 'fulfilled') {
      allEvents.push(...results[8].value);
    } else {
      errors.fire = results[8].reason?.message;
    }

    if (results[9].status === 'fulfilled') {
      allEvents.push(...results[9].value);
    } else {
      errors.space_weather = results[9].reason?.message;
    }

    if (results[10].status === 'fulfilled') {
      allEvents.push(...results[10].value);
    } else {
      errors.health = results[10].reason?.message;
    }

    if (results[11].status === 'fulfilled') {
      allEvents.push(...results[11].value);
    } else {
      errors.geopolitics = results[11].reason?.message;
    }

    if (results[12].status === 'fulfilled') {
      allEvents.push(...results[12].value);
    } else {
      errors.radiation = results[12].reason?.message;
    }

    if (results[13].status === 'fulfilled') {
      allEvents.push(...results[13].value);
    } else {
      errors.nuclear = results[13].reason?.message;
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
