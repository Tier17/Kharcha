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

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }} showsVerticalScrollIndicator={false}>
        <HeroCard style={styles.hero}>
          <Text variant="label" style={{ color: c.onHero, opacity: 0.8 }}>
            Spent in {data.label.split(' ')[0]}
          </Text>
          <View style={styles.totalRow}>
            <Text style={{ ...moneyType.code, color: c.onHero, opacity: 0.7, marginTop: 18, marginRight: 8 }}>
              {currency}
            </Text>
            <Text tabular style={[styles.total, { color: c.onHero }]}>
              {formatMinor(data.total)}
            </Text>
          </View>
          <View style={styles.chips}>
            {change !== null && (
              <View style={styles.chip}>
                <Text variant="label" style={{ color: c.onHero }}>
                  {change > 0 ? '▲' : '▼'} {Math.abs(Math.round(change * 100))}% vs last month
                </Text>
              </View>
            )}
            <View style={styles.chip}>
              <Text variant="label" tabular style={{ color: c.onHero }}>
                {formatMinor(data.perDay)} / day
              </Text>
            </View>
            <View style={styles.chip}>
              <Text variant="label" style={{ color: c.onHero }}>
                {data.count} {data.count === 1 ? 'entry' : 'entries'}
              </Text>
            </View>
          </View>
        </HeroCard>

        {data.byCategory.length === 0 ? (
          <View style={styles.empty}>
            <Mascot size={96} resting />
            <Text variant="bodyMedium" style={{ marginTop: space.md }}>
              Nothing recorded this month.
            </Text>
          </View>
        ) : (
          <Section title="Where it went">
            <Card style={styles.cardPad}>
            {data.byCategory.map((row, i) => {
              const cat = categoryById(categories, row.category_id);
              const pct = data.total ? Math.round((row.total / data.total) * 100) : 0;
              return (
                <View key={row.category_id ?? 'none'} style={styles.catRow}>
                  <CategoryGlyph name={cat?.name} icon={cat?.icon} color={cat?.color ?? c.textTertiary} size={38} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <View style={styles.catTop}>
                      <Text variant="bodyMedium">{cat?.name ?? 'Uncategorised'}</Text>
                      <Text variant="bodyMedium" tabular>
                        {formatMinor(row.total)}
                        <Text variant="caption" tone="tertiary">
                          {'  '}
                          {pct}%
                        </Text>
                      </Text>
                    </View>
                    <Bar ratio={row.total / max} color={cat?.color ?? c.textTertiary} index={i} />
                  </View>
                </View>
              );
            })}
            </Card>
          </Section>
        )}

        {data.merchants.length > 0 && (
          <Section title="Top places">
            <Card style={styles.cardList}>
              {data.merchants.map((m, i) => (
                <View
                  key={m.merchant}
                  style={[styles.listRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.separator }]}
                >
                  <Text variant="bodyMedium" style={{ flex: 1 }}>
                    {m.merchant}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {m.count}×{'   '}
                  </Text>
                  <Text variant="bodyMedium" tabular>
                    {formatMinor(m.total)}
                  </Text>
                </View>
              ))}
            </Card>
          </Section>
        )}

        {data.biggest.length > 0 && (
          <Section title="Biggest">
            <Card style={styles.cardList}>
              {data.biggest.map((e, i) => {
                const cat = categoryById(categories, e.category_id);
                return (
                  <View
                    key={e.id}
                    style={[styles.listRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.separator }]}
                  >
                    <CategoryGlyph name={cat?.name} icon={cat?.icon} color={cat?.color ?? c.textTertiary} size={30} />
                    <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>
                      {e.note || cat?.name || 'Expense'}
                    </Text>
                    <Text variant="bodyMedium" tabular>
                      {formatMinor(e.amount_minor)}
                    </Text>
                  </View>
                );
              })}
            </Card>
          </Section>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingVertical: space.lg,
  },
  monthSwitch: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  hero: { marginHorizontal: space.lg, marginTop: space.xs },
  totalRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: space.xs },
  empty: { alignItems: 'center', marginTop: space.xxl },
  cardPad: { paddingHorizontal: space.lg, paddingVertical: space.sm },
  cardList: { paddingHorizontal: space.lg },
  total: { ...moneyType.hero, fontSize: 64, lineHeight: 74 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  chip: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: radius.pill,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  section: { marginTop: space.xl, paddingHorizontal: space.lg, gap: space.md },
  sectionTitle: { fontSize: 17, letterSpacing: -0.3, marginLeft: space.sm },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 14 },
});
