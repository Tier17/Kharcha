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

function scheduleRetry() {
  const waiting = repo.listOpenCaptures().filter((c) => c.status === 'pending');
  if (!waiting.length) return;
  const next = Math.min(...waiting.map((c) => c.next_attempt_at));
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = setTimeout(processQueue, Math.max(1000, next - Date.now()));
}

async function processOne(capture: repo.Capture, apiKey: string) {
  const store = useStore.getState();
  repo.updateCapture(capture.id, { status: 'processing', error: null });
  store.refresh();

  try {
    const categories = repo.listCategories();
    const today = isoDate();
    let transcript = capture.transcript;
    if (!transcript) {
      transcript = await transcribe(apiKey, audioFile(capture.file_name));
      recordUsage({ seconds: Math.max(1, (capture.duration_ms ?? 0) / 1000) });
      repo.updateCapture(capture.id, { transcript });
    }
    if (!transcript) {
      repo.updateCapture(capture.id, { status: 'failed', error: 'no_speech' });
      return;
    }

    // Simple notes are understood on the phone instantly; only tricky ones go to the AI.
    let result = localParse(transcript, categories.map((c) => c.name), today, store.currency);
    if (result) {
      recordUsage({ instant: 1 });
    } else {
      result = await parseExpenses(apiKey, transcript, categories, today, store.currency);
      recordUsage({ parses: 1 });
    }
    if (!result.expenses.length) {
      repo.updateCapture(capture.id, { status: 'failed', error: 'no_amount' });
      return;
    }

    const other = categories.find((c) => c.name === 'Other');
    const inputs: repo.ExpenseInput[] = result.expenses.map((e) => {
      const category = categories.find((c) => c.name === e.category) ?? other;
      const foreign = e.currency.toUpperCase() !== store.currency;
      const spoken = amountInText(e.amount, transcript);
      return {
        amount_minor: toMinor(e.amount),
        currency: e.currency.toUpperCase() || store.currency,
        category_id: category?.id ?? null,
        note: cleanNote(e.note, category?.name),
        merchant: e.merchant && !/[؀-ۿ]/.test(e.merchant) ? e.merchant : null,
        date: /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.date <= today ? e.date : today,
        source: 'voice',
        capture_id: capture.id,
        needs_review: result.confidence === 'low' || foreign || !spoken,
      };
    });
    const ids = repo.insertExpenses(inputs);
    repo.updateCapture(capture.id, { status: 'done' });

