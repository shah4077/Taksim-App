import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Family {
  id: string;
  name: string;
  contribution: number;
  members: number;
}

export const MAX_FAMILIES = 10;

/**
 * Stable reference for "no families yet" so that selectors like
 * `familiesByGathering[id] ?? EMPTY_FAMILIES` don't hand React a brand new
 * array on every render (which breaks useSyncExternalStore's snapshot
 * equality check and causes an infinite render loop).
 */
export const EMPTY_FAMILIES: Family[] = [];

interface FamilyState {
  /** Families, grouped by the gathering (event) they belong to. */
  familiesByGathering: Record<string, Family[]>;
  addFamily: (gatheringId: string, name: string, contribution: number, members: number) => void;
  updateFamily: (gatheringId: string, id: string, patch: Partial<Omit<Family, 'id'>>) => void;
  removeFamily: (gatheringId: string, id: string) => void;
  removeGatheringFamilies: (gatheringId: string) => void;
  reset: () => void;
}

function randomId(): string {
  return `fam-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set) => ({
      familiesByGathering: {},
      addFamily: (gatheringId, name, contribution, members) =>
        set((state) => {
          const existing = state.familiesByGathering[gatheringId] ?? [];
          return {
            familiesByGathering: {
              ...state.familiesByGathering,
              [gatheringId]: [...existing, { id: randomId(), name, contribution, members }],
            },
          };
        }),
      updateFamily: (gatheringId, id, patch) =>
        set((state) => {
          const existing = state.familiesByGathering[gatheringId] ?? [];
          return {
            familiesByGathering: {
              ...state.familiesByGathering,
              [gatheringId]: existing.map((f) => (f.id === id ? { ...f, ...patch } : f)),
            },
          };
        }),
      removeFamily: (gatheringId, id) =>
        set((state) => {
          const existing = state.familiesByGathering[gatheringId] ?? [];
          return {
            familiesByGathering: {
              ...state.familiesByGathering,
              [gatheringId]: existing.filter((f) => f.id !== id),
            },
          };
        }),
      removeGatheringFamilies: (gatheringId) =>
        set((state) => {
          const next = { ...state.familiesByGathering };
          delete next[gatheringId];
          return { familiesByGathering: next };
        }),
      reset: () => set({ familiesByGathering: {} }),
    }),
    {
      name: 'taksim-families',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
