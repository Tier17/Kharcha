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

