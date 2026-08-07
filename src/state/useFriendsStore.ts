import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Balance } from '../utils/settlement';
import { roundCurrency } from '../utils/settlement';

export interface Friend {
  id: string;
  name: string;
}

export type SplitType = 'equal' | 'custom';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidById: string;
  splitType: SplitType;
  participantIds: string[];
  customShares?: Record<string, number>;
  createdAt: number;
}

/**
 * Stable references for "nothing yet" so selectors like
 * `friendsByTrip[id] ?? EMPTY_FRIENDS` don't hand React a brand new array on
 * every render — a fresh `[]` there breaks useSyncExternalStore's snapshot
 * equality check and causes an infinite render loop.
 */
export const EMPTY_FRIENDS: Friend[] = [];
export const EMPTY_EXPENSES: Expense[] = [];

interface FriendsState {
  friendsByTrip: Record<string, Friend[]>;
  expensesByTrip: Record<string, Expense[]>;
  addFriend: (tripId: string, name: string) => void;
  removeFriend: (tripId: string, id: string) => void;
  addExpense: (tripId: string, input: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (tripId: string, id: string, patch: Partial<Omit<Expense, 'id'>>) => void;
  removeExpense: (tripId: string, id: string) => void;
  removeTripData: (tripId: string) => void;
  reset: () => void;
}

function randomId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set) => ({
      friendsByTrip: {},
      expensesByTrip: {},
      addFriend: (tripId, name) =>
        set((state) => {
          const existing = state.friendsByTrip[tripId] ?? [];
          return {
            friendsByTrip: {
              ...state.friendsByTrip,
              [tripId]: [...existing, { id: randomId('fr'), name }],
            },
          };
        }),
      removeFriend: (tripId, id) =>
        set((state) => {
          const existingFriends = state.friendsByTrip[tripId] ?? [];
          const existingExpenses = state.expensesByTrip[tripId] ?? [];
          const remainingExpenses = existingExpenses
            .filter((e) => e.paidById !== id)
            .map((e) => ({
              ...e,
              participantIds: e.participantIds.filter((pid) => pid !== id),
            }))
            .filter((e) => e.participantIds.length > 0);
          return {
            friendsByTrip: {
              ...state.friendsByTrip,
              [tripId]: existingFriends.filter((f) => f.id !== id),
            },
            expensesByTrip: {
              ...state.expensesByTrip,
              [tripId]: remainingExpenses,
            },
          };
        }),
      addExpense: (tripId, input) =>
        set((state) => {
          const existing = state.expensesByTrip[tripId] ?? [];
          return {
            expensesByTrip: {
              ...state.expensesByTrip,
              [tripId]: [...existing, { ...input, id: randomId('exp'), createdAt: Date.now() }],
            },
          };
        }),
      updateExpense: (tripId, id, patch) =>
        set((state) => {
          const existing = state.expensesByTrip[tripId] ?? [];
          return {
            expensesByTrip: {
              ...state.expensesByTrip,
              [tripId]: existing.map((e) => (e.id === id ? { ...e, ...patch } : e)),
            },
          };
        }),
      removeExpense: (tripId, id) =>
        set((state) => {
          const existing = state.expensesByTrip[tripId] ?? [];
          return {
            expensesByTrip: {
              ...state.expensesByTrip,
              [tripId]: existing.filter((e) => e.id !== id),
            },
          };
        }),
      removeTripData: (tripId) =>
        set((state) => {
          const nextFriends = { ...state.friendsByTrip };
          const nextExpenses = { ...state.expensesByTrip };
          delete nextFriends[tripId];
          delete nextExpenses[tripId];
          return { friendsByTrip: nextFriends, expensesByTrip: nextExpenses };
        }),
      reset: () => set({ friendsByTrip: {}, expensesByTrip: {} }),
    }),
    {
      name: 'taksim-friends',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function computeFriendBalances(friends: Friend[], expenses: Expense[]): Balance[] {
  const totals = new Map<string, number>(friends.map((f) => [f.id, 0]));

  for (const expense of expenses) {
    if (totals.has(expense.paidById)) {
      totals.set(expense.paidById, (totals.get(expense.paidById) ?? 0) + expense.amount);
    }

    if (expense.splitType === 'custom' && expense.customShares) {
      for (const pid of expense.participantIds) {
        const share = expense.customShares[pid] ?? 0;
        if (totals.has(pid)) {
          totals.set(pid, (totals.get(pid) ?? 0) - share);
        }
      }
    } else {
      const share = expense.amount / expense.participantIds.length;
      for (const pid of expense.participantIds) {
        if (totals.has(pid)) {
          totals.set(pid, (totals.get(pid) ?? 0) - share);
        }
      }
    }
  }

  return friends.map((f) => ({
    id: f.id,
    name: f.name,
    balance: roundCurrency(totals.get(f.id) ?? 0),
  }));
}
