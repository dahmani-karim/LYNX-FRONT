import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      userLocation: {
        lat: 48.8566,
        lng: 2.3522,
        label: 'Paris, France',
      },
      zones: [],
      theme: 'dark',
      notifications: {
        enabled: false,
        minSeverity: 'medium',
        categories: [],
      },
      soundEnabled: true,
      isPremium: false,
      hasSeenOnboarding: false,
      mapStyle: 'dark',

      setUserLocation: (location) => set({ userLocation: location }),

      addZone: (zone) =>
        set((state) => ({
          zones: [
            ...state.zones,
            {
              id: Date.now().toString(),
              ...zone,
              radiusKm: zone.radiusKm || 50,
              alertCategories: zone.alertCategories || [],
              minSeverity: zone.minSeverity || 'medium',
            },
          ],
        })),

      removeZone: (id) =>
        set((state) => ({
          zones: state.zones.filter((z) => z.id !== id),
        })),

      updateZone: (id, updates) =>
        set((state) => ({
          zones: state.zones.map((z) => (z.id === id ? { ...z, ...updates } : z)),
        })),

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },

      setNotifications: (notifs) =>
        set((state) => ({
          notifications: { ...state.notifications, ...notifs },
        })),

      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setHasSeenOnboarding: (v) => set({ hasSeenOnboarding: v }),
      setMapStyle: (style) => set({ mapStyle: style }),
    }),
    {
      name: 'lynx-settings',
      version: 1,
    }
  )
);
