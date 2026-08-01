import { localParse } from '@/lib/ai/localParse';
import { AiError, parseExpenses, transcribe } from '@/lib/ai/openai';
import * as repo from '@/lib/db/repo';
import { audioFile } from '@/lib/files';
import { formatMinor, isoDate, toMinor } from '@/lib/format';
import { getApiKey } from '@/lib/settings';
import { recordUsage } from '@/lib/usage';
import { useStore } from '@/store';

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [0, 15_000, 60_000];

let running = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

/** Processes pending captures one at a time. Safe to call as often as you like. */
export async function processQueue(): Promise<void> {
  if (running) return;
  running = true;
  try {
    while (true) {
      const { online } = useStore.getState();
      const apiKey = await getApiKey();
      if (!online || !apiKey) return;

      const capture = repo.nextDueCapture(Date.now());
      if (!capture) {
        scheduleRetry();
        return;
      }
      await processOne(capture, apiKey);
    }
  } catch (err) {
    console.log('[queue] stopped', err);
  } finally {
    running = false;
  }
}

