import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { strapiLogin, strapiRegister, fetchProfile, updateProfile as updateProfileApi, checkMembership } from '../services/strapi';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      jwt: null,
      isAuthenticated: false,
      isPremium: false,
      premiumPlan: null,
      profile: null,

      login: async (identifier, password) => {
        const data = await strapiLogin(identifier, password);

        set({
          user: data.user,
          jwt: data.jwt,
          isAuthenticated: true,
        });

        // Check Partner status first (distinct badge)
        if (data.user?.isPartner) {
          set({ isPremium: true, premiumPlan: 'Partner' });
        }

        // Fetch extended profile
        try {
          const profile = await fetchProfile();
          set({ profile });
          // Check VIP status from profile
          if (profile?.vipLynx) {
            set({ isPremium: true, premiumPlan: 'VIP' });
          } else if (profile?.isPartner && !get().premiumPlan) {
            set({ isPremium: true, premiumPlan: 'Partner' });
          }
        } catch {
          // Profile fetch can fail if not created yet
        }

        // Check VIP from user object
        if (data.user?.vipLynx) {
          set({ isPremium: true, premiumPlan: 'VIP' });
        }

        // Auto-check Fourthwall membership (non-blocking)
        checkMembership().then((res) => {
          if (res?.isPremium || res?.premiumApps?.premiumLynx) {
            set({ isPremium: true, premiumPlan: res.tierName || 'Fourthwall' });
          }
        }).catch(() => {});
      },

      register: async (username, email, password) => {
        const data = await strapiRegister(username, email, password);

        set({
          user: data.user,
          jwt: data.jwt,
          isAuthenticated: true,
        });

        // Check VIP for newly registered users
        if (data.user?.vipLynx) {
          set({ isPremium: true, premiumPlan: 'VIP' });
        } else if (data.user?.isPartner) {
          set({ isPremium: true, premiumPlan: 'Partner' });
        }
      },

      logout: () => {
        set({
          user: null,
          jwt: null,
          isAuthenticated: false,
          isPremium: false,
          premiumPlan: null,
          profile: null,
        });
      },

      updateProfile: async (updates) => {
        const profile = await updateProfileApi(updates);
        set({ profile });
        return profile;
      },

      refreshProfile: async () => {
        try {
          const profile = await fetchProfile();
          set({ profile });
          // Re-check VIP status on refresh
          if (profile?.vipLynx) {
            set({ isPremium: true, premiumPlan: 'VIP' });
            return;
          }
          // Check Partner status
          if (profile?.isPartner) {
            set({ isPremium: true, premiumPlan: 'Partner' });
            return;
          }
          // Re-check Fourthwall membership
          try {
            const res = await checkMembership();
            if (res?.isPremium || res?.premiumApps?.premiumLynx) {
              set({ isPremium: true, premiumPlan: res.tierName || 'Fourthwall' });
            }
          } catch {}
        } catch {
          // silent fail
        }
      },

      setPremium: (plan) => {
        set({ isPremium: true, premiumPlan: plan });
      },
    }),
    {
      name: 'lynx-auth',
      partialize: (state) => ({
        user: state.user,
        jwt: state.jwt,
        isAuthenticated: state.isAuthenticated,
        isPremium: state.isPremium,
        premiumPlan: state.premiumPlan,
      }),
    }
  )
);
