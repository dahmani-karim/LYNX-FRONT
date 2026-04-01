import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isPremium: false,
      premiumPlan: null,

      login: (email, password) => {
        // Mock auth – ready to connect to Strapi API later
        const stored = localStorage.getItem('lynx_users');
        const users = stored ? JSON.parse(stored) : [];
        const user = users.find((u) => u.email === email && u.password === password);

        if (!user) {
          throw new Error('Email ou mot de passe incorrect');
        }

        set({
          user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
          isAuthenticated: true,
          isPremium: user.isPremium || false,
          premiumPlan: user.premiumPlan || null,
        });
      },

      register: (name, email, password) => {
        const stored = localStorage.getItem('lynx_users');
        const users = stored ? JSON.parse(stored) : [];

        if (users.some((u) => u.email === email)) {
          throw new Error('Cet email est déjà utilisé');
        }

        const newUser = {
          id: crypto.randomUUID(),
          name,
          email,
          password,
          avatar: null,
          isPremium: false,
          premiumPlan: null,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem('lynx_users', JSON.stringify(users));

        set({
          user: { id: newUser.id, email: newUser.email, name: newUser.name, avatar: null },
          isAuthenticated: true,
          isPremium: false,
          premiumPlan: null,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isPremium: false,
          premiumPlan: null,
        });
      },

      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        set({ user: updatedUser });

        // Update localStorage too
        const stored = localStorage.getItem('lynx_users');
        const users = stored ? JSON.parse(stored) : [];
        const idx = users.findIndex((u) => u.id === user.id);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...updates };
          localStorage.setItem('lynx_users', JSON.stringify(users));
        }
      },

      setPremium: (plan) => {
        set({ isPremium: true, premiumPlan: plan });
        const { user } = get();
        if (user) {
          const stored = localStorage.getItem('lynx_users');
          const users = stored ? JSON.parse(stored) : [];
          const idx = users.findIndex((u) => u.id === user.id);
          if (idx >= 0) {
            users[idx].isPremium = true;
            users[idx].premiumPlan = plan;
            localStorage.setItem('lynx_users', JSON.stringify(users));
          }
        }
      },
    }),
    {
      name: 'lynx-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isPremium: state.isPremium,
        premiumPlan: state.premiumPlan,
      }),
    }
  )
);
