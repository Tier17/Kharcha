import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useStore } from '@/store';
import { radius, space, useScheme } from '@/theme';

/** Floating dark pill above the dock; auto-hides after a few seconds. */
export function Toast({ bottom }: { bottom: number }) {
  const toast = useStore((s) => s.toast);
  const dismiss = useStore((s) => s.dismissToast);
  const scheme = useScheme();

