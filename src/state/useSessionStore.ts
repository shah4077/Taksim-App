import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppUser } from '../services/authService';
import type { AppLanguage } from '../i18n';

export type CurrencyCode = 'SAR' | 'USD' | 'AED' | 'EUR' | 'KWD' | 'QAR';

interface SessionState {
  hasHydrated: boolean;
  language: AppLanguage | null;
  currency: CurrencyCode;
  user: AppUser | null;
  setHasHydrated: (value: boolean) => void;
  setLanguage: (language: AppLanguage) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setUser: (user: AppUser | null) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      language: null,
      currency: 'SAR',
      user: null,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'taksim-session',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
