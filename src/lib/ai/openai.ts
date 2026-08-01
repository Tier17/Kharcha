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

/** Error code stored on a capture when the OpenAI project blocks a model. */
export const MODEL_ACCESS = 'model_access';

const API = 'https://api.openai.com/v1';

export class AiError extends Error {
  constructor(
    message: string,
    /** false when retrying will not help (bad key, bad input). */
    readonly retryable: boolean,
    readonly code?: string,
  ) {
    super(message);
  }
}

let lastWarm = 0;

/**
 * Opens the TLS connection to OpenAI while the user is still talking, so the upload
 * after release skips the handshake. Unauthenticated, so it costs nothing.
 */
export function warmUp() {
  const now = Date.now();
  if (now - lastWarm < 30_000) return;
  lastWarm = now;
  fetch(`${API}/models`, { method: 'HEAD' }).catch(() => {});
}

async function check(res: Response): Promise<any> {
  if (res.ok) return res.json();
  let detail = '';
  try {
    detail = (await res.json())?.error?.message ?? '';
  } catch {}
  if (res.status === 401) throw new AiError('Invalid API key', false);
  if (res.status === 403 || /does not have access to model/i.test(detail)) {
    throw new AiError(detail || 'Model not allowed', false, MODEL_ACCESS);
  }
  if (res.status === 400) throw new AiError(detail || 'Request rejected', false);
  throw new AiError(detail || `OpenAI error ${res.status}`, true);
}

export async function transcribe(apiKey: string, audio: File): Promise<string> {
  try {
    return await transcribeWith(MODELS.transcribe, apiKey, audio);
  } catch (err) {
    if (err instanceof AiError && err.code === MODEL_ACCESS) {
      return transcribeWith(MODELS.transcribeFallback, apiKey, audio);
    }
    throw err;
  }
}

async function transcribeWith(model: string, apiKey: string, audio: File): Promise<string> {
  const form = new FormData();
  // expo-file-system's File implements Blob, which Expo's fetch can stream as a multipart part.
  form.append('file', audio, audio.name);
  form.append('model', model);
  form.append('response_format', 'json');
  // No forced language: forcing English on Urdu speech makes the model guess English-sounding
  // words. The parser translates titles to English instead.
  // Style hint only. It must not contain sample words or amounts: on quiet audio the
  // model can echo the prompt back, which would then be parsed as fake expenses.
  form.append('prompt', 'Short note about money spent, in English or Urdu.');
  const res = await fetch(`${API}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const json = await check(res);
  return String(json.text ?? '').trim();
}

export type ParsedExpense = {
  amount: number;
  currency: string;
  category: string;
  note: string;
  date: string;
  merchant: string | null;
};

export type ParseResult = { expenses: ParsedExpense[]; confidence: 'high' | 'low' };

export async function parseExpenses(
  apiKey: string,
  transcript: string,
  categories: Category[],
  today: string,
  currency: string,
): Promise<ParseResult> {
  const names = categories.map((c) => c.name);
  const own = currencyByCode(currency);
  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['expenses', 'confidence'],
    properties: {
      expenses: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['amount', 'currency', 'category', 'note', 'date', 'merchant'],
          properties: {
            amount: { type: 'number' },
            currency: { type: 'string' },
            category: { type: 'string', enum: names },
            note: { type: 'string' },
            date: { type: 'string' },
            merchant: { type: ['string', 'null'] },
          },
        },
      },
      confidence: { type: 'string', enum: ['high', 'low'] },
    },
  };

  const system = [
    'You extract personal expenses from a short spoken note.',
    'The note may be in English, Roman Urdu, Urdu, or a mix. All output text must be in English.',
    `The user's currency is ${currency}${own ? ` (${own.name}; also said as ${own.words.map((w) => `"${w}"`).join(', ')})` : ''}. Use it unless another currency is clearly stated; then use that currency's ISO code.`,
    `Today is ${today}. Resolve relative dates: aaj/today = today, kal/yesterday = yesterday (in past-tense spending context), parson = 2 days ago. Dates are YYYY-MM-DD.`,
    'One note can contain several expenses ("petrol 120 aur chai 15" is two expenses).',
    `Pick the closest category from: ${names.join(', ')}. Use "Other" if nothing fits.`,
    'note: a short ENGLISH title of 1-3 words in Title Case naming WHAT was bought, translated if needed (e.g. "Petrol", "Tea", "Tyre Repair"). Never Urdu, never a sentence, never a number or amount word (not "Three Hundred").',
    'Only extract an amount the speaker actually said. Never guess, estimate or invent an amount. If an item has no spoken amount, leave it out.',
    'If the text is not about spending money (e.g. random words, a question, silence, "thank you"), return an empty list.',
    'merchant: the shop or company name in English letters if mentioned (e.g. "PSO", "Carrefour"), otherwise null.',
    'Convert spoken numbers to digits ("sau" = 100, "dedh sau" = 150, "dhai sau" = 250, "hazaar" = 1000).',
    'confidence is "low" if any amount or item was unclear, otherwise "high". If no expense is mentioned, return an empty list with "low".',
  ].join('\n');

  const res = await fetch(`${API}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELS.parse,
      temperature: 0,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: transcript },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'expenses', strict: true, schema },
      },
    }),
  });
  const json = await check(res);
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new AiError('Empty response', true);
  const parsed = JSON.parse(content) as ParseResult;
  parsed.expenses = parsed.expenses.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
  return parsed;
}
