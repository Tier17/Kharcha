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

  chai: { category: 'Food', note: 'Tea' },
  tea: { category: 'Food', note: 'Tea' },
  coffee: { category: 'Food', note: 'Coffee' },
  karak: { category: 'Food', note: 'Karak' },
  khana: { category: 'Food', note: 'Food' },
  lunch: { category: 'Food', note: 'Lunch' },
  dinner: { category: 'Food', note: 'Dinner' },
  breakfast: { category: 'Food', note: 'Breakfast' },
  nashta: { category: 'Food', note: 'Breakfast' },
  shawarma: { category: 'Food', note: 'Shawarma' },
  biryani: { category: 'Food', note: 'Biryani' },
  samosa: { category: 'Food', note: 'Samosa' },
  paratha: { category: 'Food', note: 'Paratha' },
  roti: { category: 'Food', note: 'Roti' },
  juice: { category: 'Food', note: 'Juice' },
  pani: { category: 'Food', note: 'Water' },
  water: { category: 'Food', note: 'Water' },
  restaurant: { category: 'Food', note: 'Restaurant' },

  taxi: { category: 'Transport', note: 'Taxi' },
  cab: { category: 'Transport', note: 'Taxi' },
  uber: { category: 'Transport', note: 'Uber', merchant: 'Uber' },
  careem: { category: 'Transport', note: 'Careem', merchant: 'Careem' },
  metro: { category: 'Transport', note: 'Metro' },
  bus: { category: 'Transport', note: 'Bus' },
  salik: { category: 'Transport', note: 'Salik' },
  parking: { category: 'Transport', note: 'Parking' },
  toll: { category: 'Transport', note: 'Toll' },

  grocery: { category: 'Groceries', note: 'Groceries' },
  groceries: { category: 'Groceries', note: 'Groceries' },
  sabzi: { category: 'Groceries', note: 'Vegetables' },
  vegetables: { category: 'Groceries', note: 'Vegetables' },
  doodh: { category: 'Groceries', note: 'Milk' },
  milk: { category: 'Groceries', note: 'Milk' },
  anday: { category: 'Groceries', note: 'Eggs' },
  eggs: { category: 'Groceries', note: 'Eggs' },
  bread: { category: 'Groceries', note: 'Bread' },
  carrefour: { category: 'Groceries', note: 'Groceries', merchant: 'Carrefour' },
  lulu: { category: 'Groceries', note: 'Groceries', merchant: 'Lulu' },
  spinneys: { category: 'Groceries', note: 'Groceries', merchant: 'Spinneys' },

  dewa: { category: 'Bills', note: 'DEWA', merchant: 'DEWA' },
  sewa: { category: 'Bills', note: 'SEWA', merchant: 'SEWA' },
  etisalat: { category: 'Bills', note: 'Etisalat', merchant: 'Etisalat' },
  internet: { category: 'Bills', note: 'Internet' },
  recharge: { category: 'Bills', note: 'Recharge' },
  rent: { category: 'Bills', note: 'Rent' },
  kiraya: { category: 'Bills', note: 'Rent' },
  bill: { category: 'Bills', note: 'Bill' },

  site: { category: 'Site/Work', note: 'Site' },
  cement: { category: 'Site/Work', note: 'Cement' },
  sand: { category: 'Site/Work', note: 'Sand' },
  labour: { category: 'Site/Work', note: 'Labour' },
  labor: { category: 'Site/Work', note: 'Labour' },
  material: { category: 'Site/Work', note: 'Material' },
  steel: { category: 'Site/Work', note: 'Steel' },

  repair: { category: 'Repairs', note: 'Repair' },
  mechanic: { category: 'Repairs', note: 'Mechanic' },
  mistri: { category: 'Repairs', note: 'Mechanic' },
  tyre: { category: 'Repairs', note: 'Tyre' },
  tire: { category: 'Repairs', note: 'Tyre' },
  puncture: { category: 'Repairs', note: 'Puncture' },
  service: { category: 'Repairs', note: 'Service' },
  'oil change': { category: 'Repairs', note: 'Oil Change' },

  doctor: { category: 'Health', note: 'Doctor' },
  medicine: { category: 'Health', note: 'Medicine' },
  dawai: { category: 'Health', note: 'Medicine' },
  pharmacy: { category: 'Health', note: 'Pharmacy' },
  clinic: { category: 'Health', note: 'Clinic' },
  hospital: { category: 'Health', note: 'Hospital' },

  shopping: { category: 'Shopping', note: 'Shopping' },
  clothes: { category: 'Shopping', note: 'Clothes' },
  kapray: { category: 'Shopping', note: 'Clothes' },
  kapde: { category: 'Shopping', note: 'Clothes' },
  shoes: { category: 'Shopping', note: 'Shoes' },
  joote: { category: 'Shopping', note: 'Shoes' },
  amazon: { category: 'Shopping', note: 'Shopping', merchant: 'Amazon' },
  noon: { category: 'Shopping', note: 'Shopping', merchant: 'noon' },
};

// Filler words that may sit next to an item/amount without changing meaning.
const FILLER = new Set([
  'ka', 'ki', 'ke', 'ko', 'pe', 'par', 'mein', 'me', 'for',
  'the', 'a', 'of', 'on', 'liya', 'li', 'liye', 'diya', 'diye', 'di', 'kharcha', 'kharch', 'kiya', 'kiye',
  'hua', 'hue', 'gaya', 'gaye', 'paid', 'spent', 'bought', 'ka', 'wala', 'wali', 'aaj', 'today', 'kal',
  'yesterday', 'parson', 'maine', 'mene', 'i', 'got', 'dala', 'dalwaya', 'bhara', 'bharwaya', 'se',
]);

