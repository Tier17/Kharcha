import { getMeta, setMeta } from '@/lib/db/repo';

// Rough list prices (USD) used only for the estimate shown in Settings.
const USD_PER_TRANSCRIBED_MINUTE = 0.003;
const USD_PER_PARSE = 0.0004;

export type Usage = { seconds: number; parses: number; instant: number };

const key = (d = new Date()) => `usage:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export function getUsage(d?: Date): Usage {
  try {
    return { seconds: 0, parses: 0, instant: 0, ...JSON.parse(getMeta(key(d)) ?? '{}') };
  } catch {
    return { seconds: 0, parses: 0, instant: 0 };
  }
}

export function recordUsage(delta: Partial<Usage>) {
  const u = getUsage();
  setMeta(
    key(),
    JSON.stringify({
      seconds: u.seconds + (delta.seconds ?? 0),
      parses: u.parses + (delta.parses ?? 0),
      instant: u.instant + (delta.instant ?? 0),
    }),
  );
}

