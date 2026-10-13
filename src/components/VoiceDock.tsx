import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { MAX_DURATION_MS, WAVE_BARS, useVoiceRecorder } from '@/lib/useVoiceRecorder';
import { useStore } from '@/store';
import { font, space, spring, useColors } from '@/theme';

const MIC = 76;
const ORB = 132;
const CANCEL_DISTANCE = 110;

function SideButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.side, { opacity: pressed ? 0.55 : 1 }]}>
      <View style={[styles.sideIcon, { backgroundColor: c.surface, borderColor: c.separator }]}>
        <Icon name={icon} color={c.text} size={21} />
      </View>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * The bottom bar: receipt, the hold-to-talk orb, and manual entry. While the orb is held,
 * a full-screen listening view takes over.
 */
export function VoiceDock({ onManual, onCamera }: { onManual: () => void; onCamera: () => void }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [holding, setHolding] = useState(false);
  const [armedCancel, setArmedCancel] = useState(false);

  const onEnd = async (cancel: boolean) => {
    setHolding(false);
    const result = await stop(cancel);
    const toast = useStore.getState().showToast;
    if (result === 'too-short') toast('Hold the button while you speak, then let go');
    if (result === 'cancelled') toast('Discarded');
    if (result === 'silent') toast('Didn’t hear anything. Try again a little closer.');
  };
  const { start, stop, isRecording, durationMs, levels } = useVoiceRecorder({ onLimit: () => onEnd(false) });

  const press = useSharedValue(0);
  const dragX = useSharedValue(0);
  const amp = useSharedValue(0);

  // The orb follows your voice level; smoothed so it glides rather than jitters.
  const latest = isRecording ? levels[levels.length - 1] : 0;
  useEffect(() => {
    amp.set(withTiming(latest, { duration: 160, easing: Easing.out(Easing.quad) }));
  }, [latest, amp]);

