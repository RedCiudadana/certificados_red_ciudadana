import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabaseFunctionsUrl } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  oidcConfigured: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  loginWithLlave: () => void;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  checkAuth: () => void;
  checkOidcSession: () => Promise<void>;
  checkOidcConfig: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

// Mock users for fallback (local password auth)
const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'admin@redciudadana.org',
    password: 'her08236',
    name: 'Administrador Red Ciudadana',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isLoginModalOpen: false,
      oidcConfigured: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        await new Promise(resolve => setTimeout(resolve, 500));

        const user = mockUsers.find(u => u.email === email && u.password === password);

        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          set({
            user: userWithoutPassword,
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        } else {
          set({ isLoading: false });
          return false;
        }
      },

      loginWithLlave: () => {
        const config = get().oidcConfigured;
        if (config) {
          window.location.href = `${supabaseFunctionsUrl}/llave-auth/authorize`;
        }
      },

      logout: async () => {
        // Try to clear OIDC session via edge function
        try {
          await fetch(`${supabaseFunctionsUrl}/llave-auth/logout`, {
            method: 'POST',
          });
        } catch {
          // best-effort
        }
        set({
          user: null,
          isAuthenticated: false
        });
      },

      register: async (userData) => {
        set({ isLoading: true });

        await new Promise(resolve => setTimeout(resolve, 500));

        const existingUser = mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          set({ isLoading: false });
          return false;
        }

        const newUser: User & { password: string } = {
          id: Date.now().toString(),
          email: userData.email,
          name: userData.name,
          role: userData.role,
          password: userData.password,
          createdAt: new Date().toISOString()
        };

        mockUsers.push(newUser);

        const { password: _, ...userWithoutPassword } = newUser;
        set({
          user: userWithoutPassword,
          isAuthenticated: true,
          isLoading: false
        });

        return true;
      },

      checkAuth: () => {
        const { user } = get();
        set({ isAuthenticated: !!user });
      },

      checkOidcSession: async () => {
        try {
          const resp = await fetch(`${supabaseFunctionsUrl}/llave-auth/session`, {
            credentials: 'include',
          });
          if (!resp.ok) return;
          const data = await resp.json();
          if (data.authenticated && data.user) {
            set({
              user: {
                id: `llave-${data.user.email}`,
                email: data.user.email,
                name: data.user.name,
                role: 'admin',
                createdAt: new Date().toISOString(),
              },
              isAuthenticated: true,
            });
          }
        } catch {
          // OIDC not available or not configured
        }
      },

      checkOidcConfig: async () => {
        try {
          const resp = await fetch(`${supabaseFunctionsUrl}/llave-auth/config`);
          if (resp.ok) {
            const data = await resp.json();
            set({ oidcConfigured: data.configured });
          }
        } catch {
          set({ oidcConfigured: false });
        }
      },

      openLoginModal: () => {
        set({ isLoginModalOpen: true });
      },

      closeLoginModal: () => {
        set({ isLoginModalOpen: false });
      }
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoginModalOpen: false
      })
    }
  )
);
