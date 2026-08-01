import {
  AudioQuality,
  IOSOutputFormat,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  type RecordingOptions,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

import { warmUp } from '@/lib/ai/openai';
import { uuid } from '@/lib/db';
import * as repo from '@/lib/db/repo';
import { deleteTemp, keepRecording } from '@/lib/files';
import { processQueue } from '@/lib/queue';
import { useStore } from '@/store';

/** Speech-tuned: mono 16 kHz AAC keeps clips tiny (~4 KB/s) and uploads fast. */
const VOICE_PRESET: RecordingOptions = {
  extension: '.m4a',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 32000,
  isMeteringEnabled: true,
  android: { outputFormat: 'mpeg4', audioEncoder: 'aac' },
  ios: { outputFormat: IOSOutputFormat.MPEG4AAC, audioQuality: AudioQuality.MEDIUM },
  web: { mimeType: 'audio/webm' },
};

const MIN_DURATION_MS = 600;
/** Hard cap keeps every note cheap; real expense notes take a few seconds. */
export const MAX_DURATION_MS = 30_000;
/** Below this peak level (≈ -45 dBFS) nobody spoke; transcription would only hallucinate. */
const SILENCE_PEAK = 0.12;
export const WAVE_BARS = 32;
const SILENT = Array<number>(WAVE_BARS).fill(0);

/** Maps recorder metering (dBFS, about -60…0) to 0…1. */
const toLevel = (db: number | undefined) =>
  db == null ? 0 : Math.max(0, Math.min(1, (db + 52) / 46)) ** 1.4;

export type StopResult = 'saved' | 'cancelled' | 'too-short' | 'silent' | 'idle';

export function useVoiceRecorder({ onLimit }: { onLimit: () => void }) {
  const recorder = useAudioRecorder(VOICE_PRESET);
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [levels, setLevels] = useState<number[]>(SILENT);
  const starting = useRef<Promise<boolean> | null>(null);
  const startedAt = useRef(0);
  const peak = useRef(0);
  const metered = useRef(false);
  const onLimitRef = useRef(onLimit);
  useEffect(() => {
    onLimitRef.current = onLimit;
  });

