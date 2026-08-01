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

