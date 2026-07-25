import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { isoDate } from '@/lib/format';
import { useColors } from '@/theme';

const HEIGHT = 44;

function Bar({
  ratio,
  index,
  color,
  dot,
  disabled,
  onPress,
}: {
  ratio: number;
  index: number;
  color: string;
  dot: string | null;
  disabled: boolean;
  onPress: () => void;
}) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.set(withDelay(index * 14, withTiming(ratio, { duration: 600, easing: Easing.out(Easing.cubic) })));
  }, [ratio, index, h]);
  const style = useAnimatedStyle(() => ({ height: 3 + h.value * (HEIGHT - 3) }));
  return (
    <Pressable disabled={disabled} onPress={onPress} hitSlop={{ top: 16, bottom: 8 }} style={styles.slot}>
      <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />
      {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
    </Pressable>
  );
}

