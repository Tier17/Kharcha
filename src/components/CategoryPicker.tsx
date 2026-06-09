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

