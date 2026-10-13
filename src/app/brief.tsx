import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, HeroCard } from '@/components/Card';
import { CategoryGlyph } from '@/components/CategoryGlyph';
import { Icon } from '@/components/Icon';
import { Mascot } from '@/components/Mascot';
import { Text } from '@/components/Text';
import * as repo from '@/lib/db/repo';
import { formatMinor, isoDate } from '@/lib/format';
import { categoryById, useStore } from '@/store';
import { moneyType, radius, space, useColors } from '@/theme';

function monthBounds(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { start, end, from: isoDate(start), to: isoDate(end) };
}

function Bar({ ratio, color, index }: { ratio: number; color: string; index: number }) {
  const c = useColors();
  const w = useSharedValue(0);
  useEffect(() => {
    w.set(withDelay(index * 50, withTiming(ratio, { duration: 600, easing: Easing.out(Easing.cubic) })));
  }, [ratio, index, w]);
  const style = useAnimatedStyle(() => ({ width: `${Math.max(2, w.value * 100)}%` }));
  return (
    <View style={[styles.track, { backgroundColor: c.surface }]}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, style]} />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="bodyMedium" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function Brief() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.currency);
  // Recompute when expenses change elsewhere.
  const version = useStore((s) => s.expenses);
  const [offset, setOffset] = useState(0);

  const data = useMemo(() => {
    void version;
    const m = monthBounds(offset);
    const prev = monthBounds(offset - 1);
    const total = repo.sumBetween(currency, m.from, m.to);
    const prevTotal = repo.sumBetween(currency, prev.from, prev.to);
    const today = new Date();
    const daysCounted = offset === 0 ? today.getDate() : m.end.getDate();
    return {
      label: m.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      total,
      prevTotal,
      perDay: Math.round(total / daysCounted / 100) * 100,
      byCategory: repo.categoryTotals(currency, m.from, m.to),
      merchants: repo.topMerchants(currency, m.from, m.to),
      biggest: repo.biggestExpenses(currency, m.from, m.to),
      count: repo.categoryTotals(currency, m.from, m.to).reduce((n, r) => n + r.count, 0),
    };
  }, [offset, version, currency]);

  const change = data.prevTotal ? (data.total - data.prevTotal) / data.prevTotal : null;
  const max = Math.max(1, ...data.byCategory.map((r) => r.total));

  return (
    <View style={[styles.screen, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable hitSlop={14} onPress={() => router.back()} style={{ marginLeft: -6 }}>
          <Icon name="back" color={c.text} size={24} />
        </Pressable>
        <View style={styles.monthSwitch}>
          <Pressable hitSlop={12} onPress={() => setOffset((o) => o - 1)}>
            <Icon name="back" color={c.textSecondary} size={18} />
          </Pressable>
          <Text variant="bodyMedium" style={{ minWidth: 140, textAlign: 'center' }}>
            {data.label}
          </Text>
          <Pressable hitSlop={12} disabled={offset >= 0} onPress={() => setOffset((o) => o + 1)} style={{ opacity: offset >= 0 ? 0.25 : 1 }}>
            <Icon name="forward" color={c.textSecondary} size={18} />
          </Pressable>
        </View>
        <View style={{ width: 24 }} />
      </View>

