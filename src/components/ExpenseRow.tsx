import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeIn, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { CARD_RADIUS } from '@/components/Card';
import { CategoryGlyph } from '@/components/CategoryGlyph';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { Category, Expense } from '@/lib/db/repo';
import { formatMinor } from '@/lib/format';
import { font, space, useColors } from '@/theme';

function DeleteAction({ drag }: { drag: SharedValue<number> }) {
  const c = useColors();
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(-drag.value, [0, 60], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(-drag.value, [0, 80], [0.6, 1], 'clamp') }],
  }));
  return (
    <View style={styles.action}>
      <Animated.View style={[styles.actionInner, style]}>
        <Icon name="delete" color={c.danger} size={22} />
      </Animated.View>
    </View>
  );
}

/**
 * One expense inside a day's white card. `first`/`last` round the card's corners so a
 * day's rows read as one grouped card.
 */
export const ExpenseRow = memo(function ExpenseRow({
  expense,
  category,
  currency,
  first,
  last,
  onPress,
  onPressCategory,
  onDelete,
}: {
  expense: Expense;
  category: Category | undefined;
  currency: string;
  first: boolean;
  last: boolean;
  onPress: (e: Expense) => void;
  onPressCategory: (e: Expense) => void;
  onDelete: (id: string) => void;
}) {
  const c = useColors();
  const title = expense.note || category?.name || 'Expense';
  const subtitle = [title !== category?.name ? category?.name : null, expense.merchant].filter(Boolean).join(' · ');
  const foreign = expense.currency !== currency;
  const sourceIcon = expense.source === 'voice' ? 'mic' : expense.source === 'photo' ? 'camera' : 'pencil';

