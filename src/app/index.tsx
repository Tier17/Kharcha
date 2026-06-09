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

