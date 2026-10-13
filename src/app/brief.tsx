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

