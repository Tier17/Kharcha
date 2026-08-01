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

