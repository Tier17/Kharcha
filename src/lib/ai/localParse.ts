import { currencyByCode, foreignCurrencyWords } from '@/lib/currency';

import type { ParseResult } from './openai';

/**
 * Instant, offline parser for the common simple case: "<item> <amount>" pairs such as
 * "petrol 120 aur chai 15". When it is sure, the app skips the AI parsing call entirely
 * (faster and cheaper). Anything unusual returns null and goes to the AI.
 */

type Entry = { category: string; note: string; merchant?: string };

// keyword → what it means. Keys are lowercase and may contain spaces.
const KEYWORDS: Record<string, Entry> = {
  petrol: { category: 'Fuel', note: 'Petrol' },
  diesel: { category: 'Fuel', note: 'Diesel' },
  fuel: { category: 'Fuel', note: 'Fuel' },
  adnoc: { category: 'Fuel', note: 'Petrol', merchant: 'ADNOC' },
  enoc: { category: 'Fuel', note: 'Petrol', merchant: 'ENOC' },
  eppco: { category: 'Fuel', note: 'Petrol', merchant: 'EPPCO' },
  pso: { category: 'Fuel', note: 'Petrol', merchant: 'PSO' },
  shell: { category: 'Fuel', note: 'Petrol', merchant: 'Shell' },
  attock: { category: 'Fuel', note: 'Petrol', merchant: 'Attock' },
  foodpanda: { category: 'Food', note: 'Food Delivery', merchant: 'foodpanda' },
  talabat: { category: 'Food', note: 'Food Delivery', merchant: 'talabat' },
  bykea: { category: 'Transport', note: 'Bykea', merchant: 'Bykea' },
  indrive: { category: 'Transport', note: 'inDrive', merchant: 'inDrive' },
  rickshaw: { category: 'Transport', note: 'Rickshaw' },
  imtiaz: { category: 'Groceries', note: 'Groceries', merchant: 'Imtiaz' },
  wapda: { category: 'Bills', note: 'Electricity', merchant: 'WAPDA' },
  lesco: { category: 'Bills', note: 'Electricity', merchant: 'LESCO' },
  'k electric': { category: 'Bills', note: 'Electricity', merchant: 'K-Electric' },
  'sui gas': { category: 'Bills', note: 'Gas Bill' },
  bijli: { category: 'Bills', note: 'Electricity' },
  electricity: { category: 'Bills', note: 'Electricity' },
  jazz: { category: 'Bills', note: 'Mobile', merchant: 'Jazz' },
  zong: { category: 'Bills', note: 'Mobile', merchant: 'Zong' },
  ufone: { category: 'Bills', note: 'Mobile', merchant: 'Ufone' },
  telenor: { category: 'Bills', note: 'Mobile', merchant: 'Telenor' },
  daraz: { category: 'Shopping', note: 'Shopping', merchant: 'Daraz' },

