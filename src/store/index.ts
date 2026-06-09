import { create } from 'zustand';

import * as repo from '@/lib/db/repo';
import type { Capture, Category, Expense, ExpenseInput } from '@/lib/db/repo';
import { addDays, isoDate, monthRange } from '@/lib/format';

export type ThemePref = 'system' | 'light' | 'dark';

export type Toast = {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
};

type State = {
  ready: boolean;
  themePref: ThemePref;
  currency: string;
  categories: Category[];
  expenses: Expense[];
  captures: Capture[];
  monthTotal: number;
  todayTotal: number;
  daily: Record<string, number>;
  online: boolean;
  hasApiKey: boolean;
  toast: Toast | null;

  load: () => void;
  refresh: () => void;
  setThemePref: (pref: ThemePref) => void;
  setCurrency: (code: string) => void;
  setOnline: (online: boolean) => void;
  setHasApiKey: (has: boolean) => void;
  showToast: (message: string, action?: Toast['action']) => void;
  dismissToast: () => void;
  addExpense: (input: ExpenseInput) => void;
  editExpense: (id: string, input: ExpenseInput) => void;
  deleteExpense: (id: string) => void;
};

let toastSeq = 0;

export const useStore = create<State>((set, get) => ({
  ready: false,
  themePref: 'dark',
  currency: 'AED',
  categories: [],
  expenses: [],
  captures: [],
  monthTotal: 0,
  todayTotal: 0,
  daily: {},
  online: true,
  hasApiKey: false,
  toast: null,

  load: () => {
    set({
      themePref: (repo.getMeta('theme') as ThemePref | null) ?? 'dark',
      currency: repo.getMeta('currency') ?? 'AED',
      ready: true,
    });
    get().refresh();
  },

  refresh: () => {
    const { currency } = get();
    const today = isoDate();
    const { from, to } = monthRange();
    // Show this month plus a little history so early-month lists aren't empty.
    const since = addDays(from, -31);
    set({
      categories: repo.listCategories(),
      expenses: repo.listRecentExpenses(since),
      captures: repo.listOpenCaptures(),
      monthTotal: repo.sumBetween(currency, from, to),
      todayTotal: repo.sumBetween(currency, today, today),
      daily: repo.dailyTotals(currency, from, to),
    });
  },

  setThemePref: (pref) => {
    repo.setMeta('theme', pref);
    set({ themePref: pref });
  },

  setCurrency: (code) => {
    const old = get().currency;
    if (code === old) return;
    // One personal ledger in one currency: existing entries follow the switch (no conversion).
    repo.relabelCurrency(old, code);
    repo.setMeta('currency', code);
    set({ currency: code });
    get().refresh();
  },

  setOnline: (online) => set({ online }),
  setHasApiKey: (hasApiKey) => set({ hasApiKey }),

  showToast: (message, action) => set({ toast: { id: ++toastSeq, message, action } }),
  dismissToast: () => set({ toast: null }),

  addExpense: (input) => {
    repo.insertExpenses([input]);
    get().refresh();
  },

  editExpense: (id, input) => {
    repo.updateExpense(id, input);
    get().refresh();
  },

  deleteExpense: (id) => {
    repo.deleteExpenses([id]);
    get().refresh();
    get().showToast('Deleted', {
      label: 'Undo',
      run: () => {
        repo.restoreExpenses([id]);
        get().refresh();
      },
    });
  },
}));

export const categoryById = (categories: Category[], id: string | null) =>
  categories.find((c) => c.id === id);
