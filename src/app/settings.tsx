import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryGlyph } from '@/components/CategoryGlyph';
import { Icon, type IconName } from '@/components/Icon';
import { Sheet } from '@/components/Sheet';
import { Text } from '@/components/Text';
import { MODELS } from '@/lib/ai/openai';
import { CURRENCIES, currencyByCode } from '@/lib/currency';
import { processQueue } from '@/lib/queue';
import { getApiKey, setApiKey } from '@/lib/settings';
import { estimateUsd, getUsage } from '@/lib/usage';
import { useStore, type ThemePref } from '@/store';
import { font, radius, space, useColors } from '@/theme';

function Group({
  title,
  icon,
  children,
  footer,
}: {
  title: string;
  icon: IconName;
  children: React.ReactNode;
  footer?: string;
}) {
  const c = useColors();
  return (
    <View style={styles.group}>
      <View style={styles.groupHead}>
        <View style={[styles.groupIcon, { backgroundColor: c.accentSoft }]}>
          <Icon name={icon} color={c.accent} size={14} strokeWidth={2} />
        </View>
        <Text variant="bodyMedium" style={styles.groupTitle}>
          {title}
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: c.surfaceRaised }]}>{children}</View>
      {footer && (
        <Text variant="caption" tone="tertiary" style={styles.footer}>
          {footer}
        </Text>
      )}
    </View>
  );
}

export default function Settings() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const themePref = useStore((s) => s.themePref);
  const setThemePref = useStore((s) => s.setThemePref);
  const setHasApiKey = useStore((s) => s.setHasApiKey);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.currency);
  const setCurrency = useStore((s) => s.setCurrency);
  const [pickingCurrency, setPickingCurrency] = useState(false);

  const [key, setKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getApiKey().then(setSavedKey);
  }, []);

  const saveKey = async () => {
    await setApiKey(key);
    const k = key.trim() || null;
    setSavedKey(k);
    setHasApiKey(!!k);
    setKey('');
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (k) processQueue();
  };

  const [usage] = useState(getUsage);
  const notes = Math.max(usage.parses + usage.instant, 0);

  const masked = savedKey ? `${savedKey.slice(0, 7)}••••${savedKey.slice(-4)}` : null;

  return (
    <View style={[styles.screen, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable hitSlop={14} onPress={() => router.back()} style={{ marginLeft: -6 }}>
          <Icon name="back" color={c.text} size={24} />
        </Pressable>
        <Text variant="title">Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }} keyboardShouldPersistTaps="handled">
        <Group
          title="Voice AI"
          icon="mic"
          footer={`Your key stays on this phone (encrypted). Voice notes are sent to OpenAI only to be understood. Models: ${MODELS.transcribe}, ${MODELS.parse}. Simple notes are understood on the phone for free.`}
        >
          {masked && !editing ? (
            <View style={styles.rowBetween}>
              <View>
                <Text variant="bodyMedium">OpenAI key</Text>
                <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                  {masked}
                </Text>
              </View>
              <Pressable hitSlop={10} onPress={() => setEditing(true)}>
                <Text variant="label" tone="accent">
                  Change
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.keyRow}>
              <TextInput
                value={key}
                onChangeText={setKey}
                placeholder="sk-…"
                placeholderTextColor={c.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                style={[styles.input, { color: c.text }]}
              />
              <Pressable
                onPress={saveKey}
                style={[styles.smallBtn, { backgroundColor: key.trim() || savedKey ? c.accent : c.bg }]}
              >
                <Text variant="label" style={{ color: key.trim() || savedKey ? c.onAccent : c.textTertiary }}>
                  {key.trim() ? 'Save' : savedKey ? 'Remove' : 'Save'}
                </Text>
              </Pressable>
            </View>
          )}
        </Group>

        <Group title="Appearance" icon="sparkle">
          <View style={[styles.segment, { backgroundColor: c.bg }]}>
            {(['system', 'light', 'dark'] as ThemePref[]).map((p) => {
              const active = themePref === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setThemePref(p);
                  }}
                  style={[styles.segmentItem, active && { backgroundColor: c.surfaceRaised, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }]}
                >
                  <Text variant="label" tone={active ? 'primary' : 'secondary'}>
                    {p[0].toUpperCase() + p.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Group>

        <Group
          title="AI cost this month"
          icon="chart"
          footer="Estimate from OpenAI list prices. Silent recordings are never sent, and notes stop at 30 seconds."
        >
          <View style={styles.rowBetween}>
            <View>
              <Text variant="title" tabular>
                {estimateUsd(usage) < 0.01 ? 'under $0.01' : `≈ $${estimateUsd(usage).toFixed(2)}`}
              </Text>
              <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                {notes} {notes === 1 ? 'note' : 'notes'} · {usage.instant} understood on phone · {Math.round(usage.seconds)}s audio
              </Text>
            </View>
          </View>
        </Group>

        <Group title="Categories" icon="grid">
          <Pressable onPress={() => router.push('/categories')} style={({ pressed }) => [styles.rowBetween, pressed && { opacity: 0.6 }]}>
            <View style={styles.catPreview}>
              {categories.slice(0, 5).map((cat, i) => (
                <View key={cat.id} style={{ marginLeft: i ? -8 : 0 }}>
                  <CategoryGlyph name={cat.name} icon={cat.icon} color={cat.color} size={30} />
                </View>
              ))}
              <Text variant="bodyMedium" style={{ marginLeft: space.md }}>
                Manage {categories.length}
              </Text>
            </View>
            <Icon name="forward" color={c.textTertiary} size={16} />
          </Pressable>
        </Group>

        <Group title="Currency" icon="coin" footer="Changing it relabels your existing entries; amounts are not converted.">
          <Pressable
            onPress={() => setPickingCurrency(true)}
            style={({ pressed }) => [styles.rowBetween, pressed && { opacity: 0.6 }]}
          >
            <View>
              <Text variant="bodyMedium">{currencyByCode(currency)?.name ?? currency}</Text>
              <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                {currency}
              </Text>
            </View>
            <Icon name="forward" color={c.textTertiary} size={16} />
          </Pressable>
        </Group>
      </ScrollView>

      <Sheet visible={pickingCurrency} onClose={() => setPickingCurrency(false)}>
        <Text variant="title" style={styles.sheetTitle}>
          Currency
        </Text>
        <ScrollView style={{ maxHeight: 460 }}>
          {CURRENCIES.map((cur) => {
            const active = cur.code === currency;
            return (
              <Pressable
                key={cur.code}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCurrency(cur.code);
                  setPickingCurrency(false);
                }}
                style={({ pressed }) => [styles.currencyRow, pressed && { backgroundColor: c.surface }]}
              >
                <Text
                  variant="bodyMedium"
                  tabular
                  style={[styles.currencyCode, { color: active ? c.accent : c.textSecondary }]}
                >
                  {cur.code}
                </Text>
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  {cur.name}
                </Text>
                {active && <Icon name="check" color={c.accent} size={20} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </Sheet>
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
  group: { marginTop: space.xl, paddingHorizontal: space.lg },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginLeft: space.xs, marginBottom: space.sm },
  groupIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  groupTitle: { fontSize: 15 },
  card: { borderRadius: 22, padding: space.lg },
  footer: { marginHorizontal: space.sm, marginTop: space.sm, lineHeight: 17 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  input: { flex: 1, fontFamily: font.regular, fontSize: 16, paddingVertical: 6 },
  smallBtn: { paddingHorizontal: 16, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', borderRadius: 12, padding: 3 },
  segmentItem: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.md },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingHorizontal: space.xl,
    paddingVertical: 14,
  },
  currencyCode: { width: 44 },
  catPreview: { flexDirection: 'row', alignItems: 'center' },
});
