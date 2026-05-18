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

export function updateCategory(id: string, patch: { name: string; color: string; icon: string }) {
  db.runSync(
    'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?',
    patch.name,
    patch.color,
    patch.icon,
    id,
  );
}

/** Hides a category and moves its expenses to `fallbackId` so totals stay intact. */
export function archiveCategory(id: string, fallbackId: string) {
  db.withTransactionSync(() => {
    db.runSync('UPDATE expenses SET category_id = ? WHERE category_id = ?', fallbackId, id);
    db.runSync('UPDATE categories SET archived = 1 WHERE id = ?', id);
  });
}

// Expenses

/** Changes the currency label of entries (amounts are not converted). */
export function relabelCurrency(from: string, to: string) {
  db.runSync('UPDATE expenses SET currency = ? WHERE currency = ?', to, from);
}

export function setExpenseCategory(id: string, categoryId: string) {
  db.runSync(
    'UPDATE expenses SET category_id = ?, needs_review = 0, updated_at = ? WHERE id = ?',
    categoryId,
    new Date().toISOString(),
    id,
  );
}

export function listRecentExpenses(sinceDate: string): Expense[] {
  return db.getAllSync<Expense>(
    `SELECT ${EXPENSE_COLUMNS} FROM expenses
     WHERE deleted_at IS NULL AND date >= ?
     ORDER BY date DESC, created_at DESC`,
    sinceDate,
  );
}

export function listExpensesOn(date: string): Expense[] {
  return db.getAllSync<Expense>(
    `SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE deleted_at IS NULL AND date = ? ORDER BY created_at DESC`,
    date,
  );
}

export function sumBetween(currency: string, from: string, to: string): number {
  const row = db.getFirstSync<{ total: number | null }>(
    `SELECT SUM(amount_minor) AS total FROM expenses
     WHERE deleted_at IS NULL AND currency = ? AND date >= ? AND date <= ?`,
    currency,
    from,
    to,
  );
  return row?.total ?? 0;
}

/** Per-day totals (minor units) between two dates, keyed by YYYY-MM-DD. */
export function dailyTotals(currency: string, from: string, to: string): Record<string, number> {
  const rows = db.getAllSync<{ date: string; total: number }>(
    `SELECT date, SUM(amount_minor) AS total FROM expenses
     WHERE deleted_at IS NULL AND currency = ? AND date >= ? AND date <= ? GROUP BY date`,
    currency,
    from,
    to,
  );
  return Object.fromEntries(rows.map((r) => [r.date, r.total]));
}

export function insertExpenses(inputs: ExpenseInput[]): string[] {
  const now = new Date().toISOString();
  const ids: string[] = [];
  db.withTransactionSync(() => {
    for (const e of inputs) {
      const id = uuid();
      ids.push(id);
      db.runSync(
        `INSERT INTO expenses (${EXPENSE_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        e.amount_minor,
        e.currency,
        e.category_id,
        e.note,
        e.merchant ?? null,
        e.vat_minor ?? null,
        e.date,
        e.source,
        e.capture_id ?? null,
        e.needs_review ? 1 : 0,
        now,
        now,
      );
    }
  });
  return ids;
}

export function updateExpense(id: string, e: ExpenseInput) {
  db.runSync(
    `UPDATE expenses SET amount_minor = ?, currency = ?, category_id = ?, note = ?, date = ?,
       needs_review = 0, updated_at = ? WHERE id = ?`,
    e.amount_minor,
    e.currency,
    e.category_id,
    e.note,
    e.date,
    new Date().toISOString(),
    id,
  );
}

/** Soft delete so it can be undone. */
export function deleteExpenses(ids: string[]) {
  const now = new Date().toISOString();
  db.withTransactionSync(() => {
    for (const id of ids) db.runSync('UPDATE expenses SET deleted_at = ? WHERE id = ?', now, id);
  });
}

