import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  checkAuth: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

// Mock users for demonstration
const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'admin@redciudadana.org',
    password: 'admin123',
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

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      },

      register: async (userData) => {
        set({ isLoading: true });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user already exists
        const existingUser = mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          set({ isLoading: false });
          return false;
        }
        
        // Create new user
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
        isLoginModalOpen: false // Don't persist modal state
      })
    }
  )
);