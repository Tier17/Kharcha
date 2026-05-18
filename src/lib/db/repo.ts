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

export type CaptureStatus = 'pending' | 'processing' | 'failed' | 'done';

export type Capture = {
  id: string;
  type: 'voice' | 'photo';
  file_name: string;
  transcript: string | null;
  status: CaptureStatus;
  attempts: number;
  next_attempt_at: number;
  error: string | null;
  duration_ms: number | null;
  created_at: string;
};

export type ExpenseInput = {
  amount_minor: number;
  currency: string;
  category_id: string | null;
  note: string;
  merchant?: string | null;
  vat_minor?: number | null;
  date: string;
  source: Expense['source'];
  capture_id?: string | null;
  needs_review?: boolean;
};

const EXPENSE_COLUMNS =
  'id, amount_minor, currency, category_id, note, merchant, vat_minor, date, source, capture_id, needs_review, created_at, updated_at';

// Categories

export function listCategories(): Category[] {
  return db.getAllSync<Category>(
    'SELECT * FROM categories WHERE archived = 0 ORDER BY sort_order',
  );
}

export function addCategory(name: string, color: string, icon: string): string {
  const id = uuid();
  const max = db.getFirstSync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM categories')?.m ?? 0;
  db.runSync(
    'INSERT INTO categories (id, name, color, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
    id,
    name,
    color,
    icon,
    max + 1,
  );
  return id;
}

