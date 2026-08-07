import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Trip {
  id: string;
  name: string;
  /** ISO date strings (yyyy-mm-dd). Both optional — a trip's dates may not be fixed yet. */
  startDate?: string;
  endDate?: string;
  createdAt: number;
}

export const MAX_TRIPS = 5;

interface TripState {
  trips: Trip[];
  addTrip: (name: string, startDate?: string, endDate?: string) => Trip;
  removeTrip: (id: string) => void;
  reset: () => void;
}

function randomId(): string {
  return `trip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trips: [],
      addTrip: (name, startDate, endDate) => {
        const trip: Trip = { id: randomId(), name, startDate, endDate, createdAt: Date.now() };
        set((state) => ({ trips: [...state.trips, trip] }));
        return trip;
      },
      removeTrip: (id) => set((state) => ({ trips: state.trips.filter((t) => t.id !== id) })),
      reset: () => set({ trips: [] }),
    }),
    {
      name: 'taksim-trips',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
