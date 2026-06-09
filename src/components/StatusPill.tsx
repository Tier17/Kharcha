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

/** One small line about voice notes in flight; replaces a list of pending rows. */
export function StatusPill({
  captures,
  online,
  hasKey,
  onOpen,
}: {
  captures: Capture[];
  online: boolean;
  hasKey: boolean;
  onOpen: (c: Capture) => void;
}) {
  const c = useColors();
  const [width, setWidth] = useState(0);
  const sweep = useSharedValue(0);
  const info = captures.length ? describe(captures, online, hasKey) : null;
  const busy = !!info?.busy;

  useEffect(() => {
    if (busy) {
      sweep.set(0);
      sweep.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, false));
    } else {
      cancelAnimation(sweep);
    }
  }, [busy, sweep]);

  const shimmer = useAnimatedStyle(() => ({
    transform: [{ translateX: -80 + sweep.value * (width + 160) }],
  }));

  if (!info) return null;
  const target = info.target;

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.wrap}>
      <Pressable
        disabled={!target}
        onPress={() => target && onOpen(target)}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={[styles.pill, { backgroundColor: c.surfaceRaised, borderColor: c.separator }]}
      >
        <View style={[styles.icon, { backgroundColor: busy ? c.accentSoft : c.surface }]}>
          <Icon name={busy ? 'mic' : 'clock'} color={busy ? c.accent : c.textSecondary} size={13} strokeWidth={2} />
        </View>
        <Text variant="label" tone={busy ? 'primary' : 'secondary'}>
          {info.label}
          {busy && '…'}
        </Text>
        {target && (
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <Icon name="back" color={c.textTertiary} size={14} strokeWidth={2} />
          </View>
        )}
        {busy && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shine,
              {
                experimental_backgroundImage:
                  'linear-gradient(90deg, rgba(185,166,255,0) 0%, rgba(185,166,255,0.22) 50%, rgba(185,166,255,0) 100%)',
              },
              shimmer,
            ]}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

