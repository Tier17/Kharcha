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

