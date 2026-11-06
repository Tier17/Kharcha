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

