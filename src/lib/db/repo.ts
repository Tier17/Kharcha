import { db, uuid } from './index';

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  sort_order: number;
  archived: number;
};

export type Expense = {
  id: string;
  amount_minor: number;
  currency: string;
  category_id: string | null;
  note: string;
  merchant: string | null;
  vat_minor: number | null;
  date: string;
  source: 'voice' | 'photo' | 'manual';
  capture_id: string | null;
  needs_review: number;
  created_at: string;
  updated_at: string;
};

