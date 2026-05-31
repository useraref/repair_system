import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: { name: string } | null;
  isAuthenticated: boolean;
  login: (user: { name: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false })
    }),
    { name: 'auth-storage' }
  )
); 
