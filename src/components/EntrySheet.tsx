import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { GlyphIcon, glyphFor } from '@/components/CategoryGlyph';
import { Icon } from '@/components/Icon';
import { Sheet } from '@/components/Sheet';
import { Text } from '@/components/Text';
import type { Capture, Expense } from '@/lib/db/repo';
import { audioFile } from '@/lib/files';
import { addDays, dayLabel, formatMinor, isoDate } from '@/lib/format';
import { dismissCapture, retryCapture } from '@/lib/queue';
import { useStore } from '@/store';
import { font, moneyType, radius, space, useColors } from '@/theme';

export type EntryTarget =
  | { kind: 'new'; date?: string }
  | { kind: 'edit'; expense: Expense }
  | { kind: 'capture'; capture: Capture };

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

function VoicePlayback({ capture }: { capture: Capture }) {
  const c = useColors();
  const player = useAudioPlayer(audioFile(capture.file_name).uri);
  const status = useAudioPlayerStatus(player);
  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (status.didJustFinish || status.currentTime >= status.duration - 0.05) player.seekTo(0);
      player.play();
    }
  };
  const secs = Math.max(1, Math.round((capture.duration_ms ?? 0) / 1000));
  return (
    <Pressable onPress={toggle} style={[styles.voice, { backgroundColor: c.surface }]}>
      <View style={[styles.play, { backgroundColor: c.accent }]}>
        <Icon name={status.playing ? 'pause' : 'play'} color={c.onAccent} size={14} />
      </View>
      <Text variant="label" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
        {capture.transcript ? `“${capture.transcript}”` : `Your voice note · ${secs}s`}
      </Text>
    </Pressable>
  );
}

export function EntrySheet({ target, onClose }: { target: EntryTarget | null; onClose: () => void }) {
  // Keep rendering the last target while the sheet animates out; a new target remounts the form.
  const [shown, setShown] = useState<{ target: EntryTarget; n: number } | null>(null);
  if (target && target !== shown?.target) setShown({ target, n: (shown?.n ?? 0) + 1 });

  return (
    <Sheet visible={!!target} onClose={onClose}>
      {shown && <EntryForm key={shown.n} shown={shown.target} onClose={onClose} />}
    </Sheet>
  );
}

function EntryForm({ shown, onClose }: { shown: EntryTarget; onClose: () => void }) {
  const c = useColors();
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.currency);
  const addExpense = useStore((s) => s.addExpense);
  const editExpense = useStore((s) => s.editExpense);
  const deleteExpense = useStore((s) => s.deleteExpense);
  const hasApiKey = useStore((s) => s.hasApiKey);

  const editing = shown.kind === 'edit' ? shown.expense : null;
  const [amount, setAmount] = useState(editing ? formatMinor(editing.amount_minor).replace(/,/g, '') : '');
  const [note, setNote] = useState(editing?.note ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(editing?.category_id ?? null);
  const [date, setDate] = useState(editing?.date ?? (shown.kind === 'new' ? shown.date : undefined) ?? isoDate());

  const press = (k: string) => {
    Haptics.selectionAsync();
    setAmount((a) => {
      if (k === '⌫') return a.slice(0, -1);
      if (k === '.') return a.includes('.') ? a : (a || '0') + '.';
      const [whole, frac] = a.split('.');
      if (frac !== undefined && frac.length >= 2) return a;
      if (frac === undefined && whole.length >= 7) return a;
      if (a === '0') return k;
      return a + k;
    });
  };

  const minor = Math.round(parseFloat(amount || '0') * 100);
  const canSave = minor > 0;

  const save = () => {
    if (!canSave) return;
    const input = {
      amount_minor: minor,
      currency: shown.kind === 'edit' ? shown.expense.currency : currency,
      category_id: categoryId ?? categories.find((x) => x.name === 'Other')?.id ?? null,
      note: note.trim(),
      date,
      source: shown.kind === 'new' ? ('manual' as const) : shown.kind === 'capture' ? ('voice' as const) : shown.expense.source,
      capture_id: shown.kind === 'capture' ? shown.capture.id : undefined,
    };
    if (shown.kind === 'edit') editExpense(shown.expense.id, input);
    else addExpense(input);
    if (shown.kind === 'capture') dismissCapture(shown.capture.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const today = isoDate();
  const [whole, frac] = amount.split('.');
  const display = whole ? Number(whole).toLocaleString('en-US') : '0';

  return (
    <>
      <View style={styles.header}>
        <View style={styles.dateStepper}>
          <Pressable hitSlop={10} onPress={() => setDate((d) => addDays(d, -1))} style={styles.stepBtn}>
            <Icon name="back" color={c.textSecondary} size={18} />
          </Pressable>
          <Text variant="label" tone="secondary" style={{ minWidth: 92, textAlign: 'center' }}>
            {dayLabel(date)}
          </Text>
          <Pressable
            hitSlop={10}
            disabled={date >= today}
            onPress={() => setDate((d) => addDays(d, 1))}
            style={[styles.stepBtn, { transform: [{ scaleX: -1 }], opacity: date >= today ? 0.25 : 1 }]}
          >
            <Icon name="back" color={c.textSecondary} size={18} />
          </Pressable>
        </View>
        {shown.kind === 'edit' && (
          <Pressable
            hitSlop={12}
            onPress={() => {
              deleteExpense(shown.expense.id);
              onClose();
            }}
          >
            <Icon name="delete" color={c.textSecondary} size={20} />
          </Pressable>
        )}
        {shown.kind === 'capture' && (
          <Pressable
            hitSlop={12}
            onPress={() => {
              dismissCapture(shown.capture.id);
              onClose();
            }}
          >
            <Text variant="label" tone="secondary">
              Discard
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.amountRow}>
        <Text variant="label" tone="tertiary" style={styles.currency}>
          {shown.kind === 'edit' ? shown.expense.currency : currency}
        </Text>
        <Text variant="hero" tabular style={{ color: amount ? c.text : c.textTertiary }}>
          {display}
          {frac !== undefined && <Text variant="hero" tabular tone="tertiary">.{frac}</Text>}
        </Text>
      </View>

      {shown.kind === 'capture' && (
        <View style={{ paddingHorizontal: space.xl, gap: space.sm }}>
          <VoicePlayback capture={shown.capture} />
          {shown.capture.status === 'failed' && hasApiKey && (
            <Pressable
              onPress={() => {
                retryCapture(shown.capture.id);
                onClose();
              }}
            >
              <Text variant="label" tone="accent" style={{ textAlign: 'center', paddingVertical: 4 }}>
                Try AI again
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="What was it for?"
        placeholderTextColor={c.textTertiary}
        returnKeyType="done"
        style={[styles.note, { color: c.text, borderColor: c.separator }]}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {categories.map((cat) => {
          const selected = cat.id === categoryId;
          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                Haptics.selectionAsync();
                setCategoryId(selected ? null : cat.id);
              }}
              style={[
                styles.chip,
                { backgroundColor: selected ? c.text : c.surface },
              ]}
            >
              <GlyphIcon glyph={glyphFor(cat.name, cat.icon)} color={selected ? c.bg : cat.color} size={15} />
              <Text variant="label" style={{ color: selected ? c.bg : c.text }}>
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

