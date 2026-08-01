import type { File } from 'expo-file-system';

import { currencyByCode } from '@/lib/currency';
import type { Category } from '@/lib/db/repo';

// Kept in one place so they are easy to swap when OpenAI ships newer/cheaper models.
export const MODELS = {
  transcribe: 'gpt-4o-mini-transcribe',
  /** Used if the OpenAI project isn't allowed to use the primary transcription model. */
  transcribeFallback: 'whisper-1',
  // Reliable on mixed Urdu/English while still costing a fraction of a cent per note.
  parse: 'gpt-4.1-mini',
} as const;

