import { create } from 'zustand';
import { fetchAircraftTracker } from '../services/aircraft';
import { fetchSatelliteTracker } from '../services/satellite';
import { fetchMaritimeTracker } from '../services/maritime';

export const useTrackerStore = create((set, get) => ({
  aircraft: [],
  satellites: [],
  ships: [],
  maritimeCoverage: 'none',
  activeTrackers: ['aircraft', 'satellite', 'ship'],
  isLoading: false,
  lastFetch: null,

  toggleTracker: (type) =>
    set((state) => {
      const active = state.activeTrackers.includes(type)
        ? state.activeTrackers.filter((t) => t !== type)
        : [...state.activeTrackers, type];
      return { activeTrackers: active };
    }),

  fetchTrackers: async (lat, lng) => {
    set({ isLoading: true });
    const { activeTrackers } = get();

    const results = await Promise.allSettled([
      activeTrackers.includes('aircraft') ? fetchAircraftTracker(lat, lng) : Promise.resolve([]),
      activeTrackers.includes('satellite') ? fetchSatelliteTracker(lat, lng) : Promise.resolve([]),
      activeTrackers.includes('ship') ? fetchMaritimeTracker(lat, lng) : Promise.resolve([]),
    ]);

    const maritimeResult = results[2].status === 'fulfilled' ? results[2].value : { data: [], coverage: 'none' };

    set({
      aircraft: results[0].status === 'fulfilled' ? results[0].value : [],
      satellites: results[1].status === 'fulfilled' ? results[1].value : [],
      ships: maritimeResult.data || [],
      maritimeCoverage: maritimeResult.coverage || 'none',
      isLoading: false,
      lastFetch: new Date().toISOString(),
    });
  },

  getAllTrackerPoints: () => {
    const { aircraft, satellites, ships, activeTrackers } = get();
    const points = [];
    if (activeTrackers.includes('aircraft')) points.push(...aircraft);
    if (activeTrackers.includes('satellite')) points.push(...satellites);
    if (activeTrackers.includes('ship')) points.push(...ships);
    return points;
  },
}));
