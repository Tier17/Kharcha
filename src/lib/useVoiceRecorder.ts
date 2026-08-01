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

  // Poll metering while recording to drive the live waveform.
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => {
      const s = recorder.getStatus();
      if (s.metering != null) metered.current = true;
      const level = toLevel(s.metering);
      if (level > peak.current) peak.current = level;
      setDurationMs(s.durationMillis);
      if (s.durationMillis >= MAX_DURATION_MS) onLimitRef.current();
      setLevels((prev) => [...prev.slice(1), level]);
    }, 50);
    return () => clearInterval(id);
  }, [isRecording, recorder]);

  const start = useCallback(async (): Promise<boolean> => {
    const run = async () => {
      warmUp();
      let perm = await getRecordingPermissionsAsync();
      if (!perm.granted) {
        perm = await requestRecordingPermissionsAsync();
        // The permission dialog interrupted the hold, so don't start recording now.
        if (!perm.granted) {
          useStore.getState().showToast('Microphone access is off. Enable it in system settings.');
        }
        return false;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAt.current = Date.now();
      peak.current = 0;
      metered.current = false;
      setDurationMs(0);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return true;
    };
    starting.current = run().catch(() => false);
    return starting.current;
  }, [recorder]);

  const stop = useCallback(
    async (cancel: boolean): Promise<StopResult> => {
      // The 30s cap and the finger lifting can both ask to stop; only the first one counts.
      const pending = starting.current;
      starting.current = null;
      const began = await (pending ?? Promise.resolve(false));
      if (!began) return 'idle';

      const duration = Date.now() - startedAt.current;
      setIsRecording(false);
      setLevels(SILENT);
      await recorder.stop();
      setAudioModeAsync({ allowsRecording: false }).catch(() => {});
      const uri = recorder.uri;
      if (!uri) return 'idle';

      const silent = metered.current && peak.current < SILENCE_PEAK;
      if (cancel || duration < MIN_DURATION_MS || silent) {
        deleteTemp(uri);
        Haptics.selectionAsync();
        return cancel ? 'cancelled' : duration < MIN_DURATION_MS ? 'too-short' : 'silent';
      }

      const id = uuid();
      const fileName = keepRecording(uri, id);
      repo.insertCapture({ id, type: 'voice', file_name: fileName, duration_ms: duration });
      useStore.getState().refresh();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      processQueue();
      return 'saved';
    },
    [recorder],
  );

  return { start, stop, isRecording, durationMs, levels };
}
