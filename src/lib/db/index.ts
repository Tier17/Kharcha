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

