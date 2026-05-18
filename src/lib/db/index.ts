import * as Crypto from 'expo-crypto';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { categoryColors, legacyCategoryColors } from '@/theme/tokens';

export const db: SQLiteDatabase = openDatabaseSync('kharcha.db');

const DEFAULT_CATEGORIES = [
  'Fuel',
  'Food',
  'Transport',
  'Groceries',
  'Bills',
  'Site/Work',
  'Repairs',
  'Health',
  'Shopping',
  'Other',
];

/** Each entry upgrades the schema by one version (tracked in PRAGMA user_version). */
const MIGRATIONS: ((db: SQLiteDatabase) => void)[] = [
  (db) => {
    db.execSync(`
      CREATE TABLE categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        archived INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE captures (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        transcript TEXT,
        status TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        next_attempt_at INTEGER NOT NULL DEFAULT 0,
        error TEXT,
        duration_ms INTEGER,
        created_at TEXT NOT NULL
      );
      CREATE TABLE expenses (
        id TEXT PRIMARY KEY NOT NULL,
        amount_minor INTEGER NOT NULL,
        currency TEXT NOT NULL,
        category_id TEXT,
        note TEXT NOT NULL DEFAULT '',
        merchant TEXT,
        vat_minor INTEGER,
        date TEXT NOT NULL,
        source TEXT NOT NULL,
        capture_id TEXT,
        needs_review INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );
      CREATE INDEX expenses_date ON expenses (date);
      CREATE TABLE meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    `);
    const now = new Date().toISOString();
    DEFAULT_CATEGORIES.forEach((name, i) => {
      db.runSync(
        'INSERT INTO categories (id, name, color, sort_order) VALUES (?, ?, ?, ?)',
        Crypto.randomUUID(),
        name,
        categoryColors[i % categoryColors.length],
        i,
      );
    });
    db.runSync('INSERT INTO meta (key, value) VALUES (?, ?)', 'created_at', now);
  },
  (db) => {
    // Per-category icon (so renamed/custom categories keep a meaningful glyph) + new palette.
    db.execSync('ALTER TABLE categories ADD COLUMN icon TEXT');
    legacyCategoryColors.forEach((old, i) => {
      db.runSync('UPDATE categories SET color = ? WHERE color = ?', categoryColors[i], old);
    });
  },
  (db) => {
    // Titles are English-only now: replace Urdu-script titles/merchants from earlier voice notes.
    const urdu = /[؀-ۿ]/;
    const rows = db.getAllSync<{ id: string; note: string; merchant: string | null; name: string | null }>(
      'SELECT e.id, e.note, e.merchant, c.name FROM expenses e LEFT JOIN categories c ON c.id = e.category_id',
    );
    for (const r of rows) {
      if (urdu.test(r.note)) db.runSync('UPDATE expenses SET note = ? WHERE id = ?', r.name ?? '', r.id);
      if (r.merchant && urdu.test(r.merchant)) db.runSync('UPDATE expenses SET merchant = NULL WHERE id = ?', r.id);
    }
  },
];

export function migrate() {
  db.execSync('PRAGMA journal_mode = WAL;');
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  while (version < MIGRATIONS.length) {
    db.withTransactionSync(() => {
      MIGRATIONS[version](db);
      db.execSync(`PRAGMA user_version = ${version + 1}`);
    });
    version++;
  }
}

export const uuid = () => Crypto.randomUUID();
