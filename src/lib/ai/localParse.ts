import { currencyByCode, foreignCurrencyWords } from '@/lib/currency';

import type { ParseResult } from './openai';

/**
 * Instant, offline parser for the common simple case: "<item> <amount>" pairs such as
 * "petrol 120 aur chai 15". When it is sure, the app skips the AI parsing call entirely
 * (faster and cheaper). Anything unusual returns null and goes to the AI.
 */

