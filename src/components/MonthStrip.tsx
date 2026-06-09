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

/**
 * One slim bar per day of the month. Tap a bar to jump to that day; the selected day is
 * highlighted and today keeps a small dot.
 */
export function MonthStrip({
  daily,
  selected,
  onSelect,
}: {
  daily: Record<string, number>;
  selected: string;
  onSelect: (date: string) => void;
}) {
  const c = useColors();
  const now = new Date();
  const today = isoDate(now);
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const keys = Array.from({ length: days }, (_, i) => isoDate(new Date(now.getFullYear(), now.getMonth(), i + 1)));
  const max = Math.max(1, ...keys.map((k) => daily[k] ?? 0));

  return (
    <View style={styles.row}>
      {keys.map((k, i) => {
        const future = k > today;
        const v = daily[k] ?? 0;
        const isSelected = k === selected;
        return (
          <Bar
            key={k}
            index={i}
            ratio={future ? 0 : Math.sqrt(v / max)}
            disabled={future}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(k);
            }}
            dot={k === today ? (isSelected ? c.accent : c.textTertiary) : null}
            color={isSelected ? c.accent : future || !v ? c.separator : c.textTertiary}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', height: HEIGHT + 10, gap: 3 },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: HEIGHT + 10, paddingBottom: 10 },
  bar: { width: '100%', maxWidth: 6, borderRadius: 3 },
  dot: { position: 'absolute', bottom: 0, width: 4, height: 4, borderRadius: 2 },
});
