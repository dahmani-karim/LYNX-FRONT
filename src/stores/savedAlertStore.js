import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  fetchSavedAlerts,
  saveAlert,
  deleteSavedAlert,
  markAlertsRead,
  fetchAlertCounts,
} from '../services/strapi';

export const useSavedAlertStore = create(
  persist(
    (set, get) => ({
      savedAlerts: [],
      counts: { total: 0, unread: 0 },
      isLoading: false,
      error: null,

      // Check if an alert is saved (by original event ID)
      isSaved: (eventId) => get().savedAlerts.some((a) => a.originalId === eventId),

      // Fetch all saved alerts from Strapi
      fetchSaved: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchSavedAlerts();
          const alerts = (data?.data || data || []).map((a) => ({
            id: a.id,
            originalId: a.originalId || a.attributes?.originalId,
            title: a.title || a.attributes?.title,
            description: a.description || a.attributes?.description,
            severity: a.severity || a.attributes?.severity,
            type: a.type || a.attributes?.type,
            eventDate: a.eventDate || a.attributes?.eventDate,
            latitude: a.latitude || a.attributes?.latitude,
            longitude: a.longitude || a.attributes?.longitude,
            sourceName: a.sourceName || a.attributes?.sourceName,
            isRead: a.isRead ?? a.attributes?.isRead ?? false,
            savedAt: a.savedAt || a.attributes?.createdAt,
          }));
          set({ savedAlerts: alerts, isLoading: false });
        } catch (err) {
          set({ error: err.message, isLoading: false });
        }
      },

      // Save an alert
      save: async (event) => {
        set({ error: null });
        try {
          const payload = {
            originalId: event.id,
            title: event.title,
            description: event.description,
            severity: event.severity,
            type: event.type,
            eventDate: event.eventDate,
            latitude: event.latitude,
            longitude: event.longitude,
            sourceName: event.sourceName,
            sourceUrl: event.sourceUrl,
          };
          const data = await saveAlert(payload);
          const saved = data?.data || data;
          set((s) => ({
            savedAlerts: [
              ...s.savedAlerts,
              {
                id: saved.id,
                originalId: event.id,
                title: event.title,
                description: event.description,
                severity: event.severity,
                type: event.type,
                eventDate: event.eventDate,
                latitude: event.latitude,
                longitude: event.longitude,
                sourceName: event.sourceName,
                isRead: false,
                savedAt: new Date().toISOString(),
              },
            ],
          }));
        } catch (err) {
          set({ error: err.message });
        }
      },

      // Remove a saved alert
      unsave: async (eventId) => {
        const alert = get().savedAlerts.find((a) => a.originalId === eventId);
        if (!alert) return;
        set({ error: null });
        try {
          await deleteSavedAlert(alert.id);
          set((s) => ({
            savedAlerts: s.savedAlerts.filter((a) => a.originalId !== eventId),
          }));
        } catch (err) {
          set({ error: err.message });
        }
      },

      // Toggle save/unsave
      toggleSave: async (event) => {
        if (get().isSaved(event.id)) {
          await get().unsave(event.id);
        } else {
          await get().save(event);
        }
      },

      // Mark alerts as read
      markRead: async (ids) => {
        try {
          await markAlertsRead(ids);
          set((s) => ({
            savedAlerts: s.savedAlerts.map((a) =>
              ids.includes(a.id) ? { ...a, isRead: true } : a
            ),
          }));
        } catch {}
      },

      // Fetch counts
      fetchCounts: async () => {
        try {
          const data = await fetchAlertCounts();
          set({ counts: data?.data || data || { total: 0, unread: 0 } });
        } catch {}
      },
    }),
    {
      name: 'lynx-saved-alerts',
      partialize: (state) => ({ savedAlerts: state.savedAlerts }),
    }
  )
);
