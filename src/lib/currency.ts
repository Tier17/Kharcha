export type Currency = {
  code: string;
  name: string;
  /** How people say it out loud (lowercase); used by the voice parsers. */
  words: string[];
};

export const CURRENCIES: Currency[] = [
  { code: 'PKR', name: 'Pakistani Rupee', words: ['rs', 'rupee', 'rupees', 'rupay', 'rupaye', 'pkr'] },
  { code: 'AED', name: 'UAE Dirham', words: ['aed', 'dhs', 'dh', 'dirham', 'dirhams'] },
  { code: 'INR', name: 'Indian Rupee', words: ['rs', 'rupee', 'rupees', 'rupay', 'rupaye', 'inr'] },
  { code: 'SAR', name: 'Saudi Riyal', words: ['sar', 'riyal', 'riyals'] },
  { code: 'QAR', name: 'Qatari Riyal', words: ['qar', 'riyal', 'riyals'] },
  { code: 'OMR', name: 'Omani Rial', words: ['omr', 'rial', 'rials'] },
  { code: 'KWD', name: 'Kuwaiti Dinar', words: ['kwd', 'dinar', 'dinars'] },
  { code: 'BHD', name: 'Bahraini Dinar', words: ['bhd', 'dinar', 'dinars'] },
  { code: 'USD', name: 'US Dollar', words: ['usd', 'dollar', 'dollars'] },
  { code: 'GBP', name: 'British Pound', words: ['gbp', 'pound', 'pounds'] },
  { code: 'EUR', name: 'Euro', words: ['eur', 'euro', 'euros'] },
];

export const currencyByCode = (code: string) => CURRENCIES.find((c) => c.code === code);

/** Spoken words for every currency except `code` (minus any it shares, like "rs"). */
export function foreignCurrencyWords(code: string): string[] {
  const own = new Set(currencyByCode(code)?.words ?? []);
  return [...new Set(CURRENCIES.flatMap((c) => (c.code === code ? [] : c.words)))].filter((w) => !own.has(w));
}
