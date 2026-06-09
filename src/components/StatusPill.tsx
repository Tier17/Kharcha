import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { Capture } from '@/lib/db/repo';
import { radius, useColors } from '@/theme';

function describe(captures: Capture[], online: boolean, hasKey: boolean) {
  const processing = captures.find((c) => c.status === 'processing');
  if (processing) return { label: 'Understanding', busy: true, target: null };
  const failed = captures.filter((c) => c.status === 'failed');
  if (failed.length) {
    return {
      label: failed.length === 1 ? '1 voice note needs a look' : `${failed.length} voice notes need a look`,
      busy: false,
      target: failed[0],
    };
  }
  const pending = captures.length;
  if (!hasKey) return { label: 'Add your OpenAI key in Settings', busy: false, target: null };
  if (!online) return { label: pending === 1 ? 'Saved · waiting for internet' : `${pending} waiting for internet`, busy: false, target: null };
  return { label: 'Understanding', busy: true, target: null };
}

