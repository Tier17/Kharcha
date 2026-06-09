import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryGlyph } from '@/components/CategoryGlyph';
import { Sheet } from '@/components/Sheet';
import { Text } from '@/components/Text';
import * as repo from '@/lib/db/repo';
import type { Expense } from '@/lib/db/repo';
import { formatMinor } from '@/lib/format';
import { useStore } from '@/store';
import { radius, space, useColors } from '@/theme';

/** One-tap category switch for an expense: a grid of every category. */
export function CategoryPicker({ expense, onClose }: { expense: Expense | null; onClose: () => void }) {
  const c = useColors();
  const categories = useStore((s) => s.categories);
  const refresh = useStore((s) => s.refresh);
  // Keep showing the last expense while the sheet slides away.
  const [shown, setShown] = useState<Expense | null>(expense);
  if (expense && expense !== shown) setShown(expense);

  const pick = (categoryId: string) => {
    if (!shown) return;
    Haptics.selectionAsync();
    repo.setExpenseCategory(shown.id, categoryId);
    refresh();
    onClose();
  };

  return (
    <Sheet visible={!!expense} onClose={onClose}>
      <View style={styles.head}>
        <Text variant="title">Move to</Text>
        {shown && (
          <Text variant="label" tone="secondary" numberOfLines={1}>
            {shown.note || 'Expense'} · {formatMinor(shown.amount_minor)}
          </Text>
        )}
      </View>
      <View style={styles.grid}>
        {categories.map((cat) => {
          const active = cat.id === shown?.category_id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => pick(cat.id)}
              style={({ pressed }) => [
                styles.cell,
                {
                  backgroundColor: active ? c.surface : 'transparent',
                  borderColor: active ? cat.color + '66' : 'transparent',
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <CategoryGlyph name={cat.name} icon={cat.icon} color={cat.color} size={46} />
              <Text variant="caption" tone={active ? 'primary' : 'secondary'} numberOfLines={1}>
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.xl, paddingTop: space.sm, gap: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: space.md,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  cell: {
    width: '25%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
