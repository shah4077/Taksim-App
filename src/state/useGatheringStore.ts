import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Gathering {
  id: string;
  name: string;
  /** ISO date string (yyyy-mm-dd). Optional — a gathering may not have a fixed date yet. */
  date?: string;
  createdAt: number;
}

export const MAX_GATHERINGS = 5;

interface GatheringState {
  gatherings: Gathering[];
  addGathering: (name: string, date?: string) => Gathering;
  removeGathering: (id: string) => void;
  reset: () => void;
}

function randomId(): string {
  return `gth-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useGatheringStore = create<GatheringState>()(
  persist(
    (set) => {
      function addGathering(name: string, date?: string): Gathering {
        const gathering: Gathering = { id: randomId(), name, date, createdAt: Date.now() };
        set((state) => ({ gatherings: [...state.gatherings, gathering] }));
        return gathering;
      }

      return {
        gatherings: [],
        addGathering,
        removeGathering: (id) =>
          set((state) => ({ gatherings: state.gatherings.filter((g) => g.id !== id) })),
        reset: () => set({ gatherings: [] }),
      };
    },
    {
      name: 'taksim-gatherings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
