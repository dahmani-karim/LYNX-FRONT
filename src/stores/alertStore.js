import { create } from 'zustand';
import { fetchEarthquakes } from '../services/earthquakes';
import { fetchWeather } from '../services/weather';
import { fetchGDACSEvents } from '../services/gdacs';
import { fetchCyberAlerts } from '../services/cyber';
import { fetchEnergyData } from '../services/energy';
import { fetchServiceStatuses } from '../services/status';
import { fetchConflicts } from '../services/conflicts';
import { calculateRiskScores } from '../services/riskEngine';

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

    const uniqueEvents = Array.from(
      new Map(allEvents.map((e) => [e.id, e])).values()
    );

    const riskScores = calculateRiskScores(uniqueEvents);

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
