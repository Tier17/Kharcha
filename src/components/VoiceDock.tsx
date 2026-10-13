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

  const onBegin = () => {
    setHolding(true);
    setArmedCancel(false);
    start();
  };
  const onArm = (armed: boolean) => setArmedCancel(armed);

  const gesture = Gesture.Pan()
    .minDistance(0)
    .shouldCancelWhenOutside(false)
    .onBegin(() => {
      press.set(withSpring(1, spring));
      scheduleOnRN(onBegin);
    })
    .onUpdate((e) => {
      const x = Math.min(0, e.translationX);
      const wasArmed = dragX.value < -CANCEL_DISTANCE;
      dragX.set(x);
      const armed = x < -CANCEL_DISTANCE;
      if (armed !== wasArmed) scheduleOnRN(onArm, armed);
    })
    .onFinalize(() => {
      const cancel = dragX.value < -CANCEL_DISTANCE;
      press.set(withSpring(0, spring));
      dragX.set(withSpring(0, spring));
      scheduleOnRN(onEnd, cancel);
    });

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value * 0.5 }, { scale: interpolate(press.value, [0, 1], [1, 0.94]) }],
  }));
  const sidesStyle = useAnimatedStyle(() => ({ opacity: 1 - press.value }));

  // Flat listening view: a solid disc plus hairline rings that open up as you speak.
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value * 0.25 }, { scale: 1 + amp.value * 0.06 }],
  }));
  const ring1 = useAnimatedStyle(() => ({
    opacity: 0.25 + amp.value * 0.5,
    transform: [{ scale: 1.22 + amp.value * 0.18 }],
  }));
  const ring2 = useAnimatedStyle(() => ({
    opacity: 0.12 + amp.value * 0.35,
    transform: [{ scale: 1.5 + amp.value * 0.35 }],
  }));
  const ring3 = useAnimatedStyle(() => ({
    opacity: 0.05 + amp.value * 0.2,
    transform: [{ scale: 1.8 + amp.value * 0.5 }],
  }));
  const micRing = useAnimatedStyle(() => ({
    opacity: 1 - press.value,
    transform: [{ translateX: dragX.value * 0.5 }],
  }));

  const seconds = Math.floor(durationMs / 1000);
  const timer = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const nearLimit = durationMs > MAX_DURATION_MS - 5000;
  const half = levels.slice(WAVE_BARS / 2);
  const mirrored = [...half].reverse().concat(half);

  return (
    <>
      {holding && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(240)}
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { zIndex: 5 }]}
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: c.bg, opacity: 0.97 }]} />
          <View style={[styles.listen, { paddingTop: insets.top + 72 }]}>
            <View style={styles.kickerRow}>
              <View style={[styles.liveDot, { backgroundColor: armedCancel ? c.textTertiary : c.accent }]} />
              <Text variant="caption" tone="secondary" style={styles.kicker}>
                {armedCancel ? 'RELEASE TO DISCARD' : 'LISTENING'}
              </Text>
            </View>

            <View style={styles.orbArea}>
              <Animated.View style={[styles.ring, { borderColor: c.accent }, ring3]} />
              <Animated.View style={[styles.ring, { borderColor: c.accent }, ring2]} />
              <Animated.View style={[styles.ring, { borderColor: c.accent }, ring1]} />
              <Animated.View
                style={[styles.orb, { backgroundColor: armedCancel ? c.textTertiary : c.accent }, orbStyle]}
              >
                <Icon name="micFilled" color={c.onAccent} size={46} strokeWidth={1.8} />
              </Animated.View>
            </View>

            <View style={styles.wave}>
              {mirrored.map((l, i) => (
                <View
                  key={i}
                  style={{
                    width: 3,
                    height: 3 + l * 36,
                    borderRadius: 2,
                    backgroundColor: armedCancel ? c.textTertiary : c.text,
                    opacity: 0.15 + l * 0.85,
                  }}
                />
              ))}
            </View>
            <Text tabular style={[styles.timer, { color: nearLimit ? c.danger : c.text }]}>
              {timer}
            </Text>
            <Text tone="tertiary" style={styles.example}>
              “Petrol 120 aur chai 15”
            </Text>
          </View>
          <Text variant="label" tone="tertiary" style={[styles.slideHint, { bottom: insets.bottom + MIC + 56 }]}>
            {armedCancel ? 'Let go to discard' : '‹  Slide left to cancel'}
          </Text>
        </Animated.View>
      )}

