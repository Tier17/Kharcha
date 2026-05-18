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

