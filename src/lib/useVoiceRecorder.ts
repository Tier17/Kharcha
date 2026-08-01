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

