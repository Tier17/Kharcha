import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedNumber } from '@/components/AnimatedNumber';
import { HeroCard } from '@/components/Card';
import { CategoryPicker } from '@/components/CategoryPicker';
import { EmptyState } from '@/components/EmptyState';
import { EntrySheet, type EntryTarget } from '@/components/EntrySheet';
import { ExpenseRow } from '@/components/ExpenseRow';
import { Icon, type IconName } from '@/components/Icon';
import { MonthStrip } from '@/components/MonthStrip';
import { StatusPill } from '@/components/StatusPill';
import { Text } from '@/components/Text';
import { Mascot } from '@/components/Mascot';
import { Toast } from '@/components/Toast';
import { VoiceDock } from '@/components/VoiceDock';
import * as repo from '@/lib/db/repo';
import type { Capture, Expense } from '@/lib/db/repo';
import { addDays, dayLabel, formatMinor, isoDate, monthName } from '@/lib/format';
import { dayInsight } from '@/lib/insight';
import { categoryById, useStore } from '@/store';
import { moneyType, radius, space, useColors } from '@/theme';

type Section = { key: string; title: string; total: number; data: Expense[] };

function RoundButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.round, { backgroundColor: c.surface, opacity: pressed ? 0.6 : 1 }]}
    >
      <Icon name={icon} color={c.text} size={19} />
    </Pressable>
  );
}

function EmptyDay({ isToday }: { isToday: boolean }) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.emptyDay}>
      <Mascot size={104} resting />
      <Text variant="bodyMedium" style={{ marginTop: space.md }}>
        {isToday ? 'Your wallet is resting.' : 'Nothing spent this day.'}
      </Text>
      <Text variant="label" tone="secondary" style={{ marginTop: 4 }}>
        {isToday ? 'Hold the mic when you spend something.' : 'Swipe the card to see other days.'}
      </Text>
    </Animated.View>
  );
}

export default function Home() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const expenses = useStore((s) => s.expenses);
  const captures = useStore((s) => s.captures);
  const categories = useStore((s) => s.categories);
  const monthTotal = useStore((s) => s.monthTotal);
  const todayTotal = useStore((s) => s.todayTotal);
  const daily = useStore((s) => s.daily);
  const currency = useStore((s) => s.currency);
  const online = useStore((s) => s.online);
  const hasApiKey = useStore((s) => s.hasApiKey);
  const deleteExpense = useStore((s) => s.deleteExpense);
  const showToast = useStore((s) => s.showToast);
  const [entry, setEntry] = useState<EntryTarget | null>(null);
  const [picking, setPicking] = useState<Expense | null>(null);

  // The day the hero number and list are showing. Today by default.
  const today = isoDate();
  const [day, setDay] = useState(today);
  const isToday = day === today;
  const goTo = useCallback(
    (next: string) => {
      if (next > today) return;
      Haptics.selectionAsync();
      setDay(next);
    },
    [today],
  );
  const dayExpenses = useMemo(
    () => (isToday ? null : repo.listExpensesOn(day)),
    // `expenses` changes whenever data changes, so the selected day stays fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [day, isToday, expenses],
  );
  const dayTotal = dayExpenses
    ? dayExpenses.reduce((sum, e) => sum + (e.currency === currency ? e.amount_minor : 0), 0)
    : todayTotal;

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-24, 24])
    .failOffsetY([-14, 14])
    .onEnd((e) => {
      if (e.translationX > 60) goTo(addDays(day, -1));
      else if (e.translationX < -60) goTo(addDays(day, 1));
    });

  const sections = useMemo<Section[]>(() => {
    const out: Section[] = [];
    for (const e of dayExpenses ?? expenses) {
      let s = out[out.length - 1];
      if (!s || s.key !== e.date) {
        s = { key: e.date, title: dayLabel(e.date), total: 0, data: [] };
        out.push(s);
      }
      s.data.push(e);
      if (e.currency === currency) s.total += e.amount_minor;
    }
    return out;
  }, [expenses, dayExpenses, currency]);

