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

