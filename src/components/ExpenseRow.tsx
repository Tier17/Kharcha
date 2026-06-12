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

  return (
    <Animated.View
      entering={FadeIn.duration(260)}
      style={[
        styles.wrap,
        { backgroundColor: c.surfaceRaised },
        first && { borderTopLeftRadius: CARD_RADIUS, borderTopRightRadius: CARD_RADIUS },
        last && { borderBottomLeftRadius: CARD_RADIUS, borderBottomRightRadius: CARD_RADIUS },
      ]}
    >
      <ReanimatedSwipeable
        friction={1.6}
        rightThreshold={64}
        overshootRight={false}
        renderRightActions={(_p, drag) => <DeleteAction drag={drag} />}
        onSwipeableWillOpen={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onDelete(expense.id);
        }}
      >
        <Pressable
          onPress={() => onPress(expense)}
          style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.surface : c.surfaceRaised }]}
        >
          <Pressable
            hitSlop={6}
            onPress={() => onPressCategory(expense)}
            accessibilityLabel={`Category ${category?.name ?? 'none'}. Tap to change`}
          >
            <CategoryGlyph name={category?.name} icon={category?.icon} color={category?.color ?? c.textTertiary} size={42} />
          </Pressable>
          <View style={[styles.middle, !first && { borderTopColor: c.separator, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={styles.titleRow}>
                <Text variant="bodyMedium" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {title}
                </Text>
                {!!expense.needs_review && (
                  <View
                    accessibilityLabel="Needs a quick check"
                    style={[styles.reviewDot, { backgroundColor: c.accent }]}
                  />
                )}
              </View>
              <View style={styles.subRow}>
                <Icon name={sourceIcon} color={c.textTertiary} size={12} strokeWidth={2} />
                <Text variant="caption" tone="secondary" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {subtitle || (expense.source === 'voice' ? 'Voice' : 'Typed')}
                </Text>
              </View>
            </View>
            <Text style={[styles.amount, { color: c.text }]}>
              {foreign && (
                <Text variant="caption" tone="secondary">
                  {expense.currency}{' '}
                </Text>
              )}
              {formatMinor(expense.amount_minor)}
            </Text>
          </View>
        </Pressable>
      </ReanimatedSwipeable>
    </Animated.View>
  );
});

