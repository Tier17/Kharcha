import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryGlyph, GLYPHS, GlyphIcon, glyphFor } from '@/components/CategoryGlyph';
import { Icon } from '@/components/Icon';
import { Sheet } from '@/components/Sheet';
import { Text } from '@/components/Text';
import * as repo from '@/lib/db/repo';
import type { Category } from '@/lib/db/repo';
import { useStore } from '@/store';
import { MAX_CATEGORIES, categoryColors, font, radius, space, useColors } from '@/theme';

type Draft = { id: string | null; name: string; color: string; icon: string };

function Editor({ draft, onClose }: { draft: Draft; onClose: () => void }) {
  const c = useColors();
  const categories = useStore((s) => s.categories);
  const refresh = useStore((s) => s.refresh);
  const showToast = useStore((s) => s.showToast);
  const [name, setName] = useState(draft.name);
  const [color, setColor] = useState(draft.color);
  const [icon, setIcon] = useState(draft.icon);

  const trimmed = name.trim();
  const duplicate = categories.some((x) => x.id !== draft.id && x.name.toLowerCase() === trimmed.toLowerCase());
  const isOther = categories.find((x) => x.id === draft.id)?.name === 'Other';
  const canSave = trimmed.length > 0 && trimmed.length <= 20 && !duplicate;

  const save = () => {
    if (!canSave) return;
    if (draft.id) repo.updateCategory(draft.id, { name: trimmed, color, icon });
    else repo.addCategory(trimmed, color, icon);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    refresh();
    onClose();
  };

  const remove = () => {
    if (!draft.id) return;
    const other = categories.find((x) => x.name === 'Other');
    if (!other || other.id === draft.id) return;
    repo.archiveCategory(draft.id, other.id);
    refresh();
    showToast(`Deleted. Its expenses moved to Other.`);
    onClose();
  };

  return (
    <View>
      <View style={styles.editorHead}>
        <CategoryGlyph name={trimmed} icon={icon} color={color} size={56} />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Category name"
          placeholderTextColor={c.textTertiary}
          maxLength={20}
          autoFocus={!draft.id}
          style={[styles.nameInput, { color: c.text, borderColor: c.separator }]}
        />
        {duplicate && (
          <Text variant="caption" tone="secondary">
            You already have a category with this name.
          </Text>
        )}
      </View>

      <Text variant="caption" tone="tertiary" style={styles.editorLabel}>
        COLOR
      </Text>
      <View style={styles.swatches}>
        {categoryColors.map((col) => (
          <Pressable
            key={col}
            onPress={() => setColor(col)}
            style={[styles.swatch, { backgroundColor: col, borderColor: color === col ? c.text : 'transparent' }]}
          />
        ))}
      </View>

      <Text variant="caption" tone="tertiary" style={styles.editorLabel}>
        ICON
      </Text>
      <View style={styles.icons}>
        {GLYPHS.map((g) => (
          <Pressable
            key={g}
            onPress={() => setIcon(g)}
            style={[styles.iconCell, { backgroundColor: icon === g ? color + '26' : c.surface }]}
          >
            <GlyphIcon glyph={g} color={icon === g ? color : c.textSecondary} size={20} />
          </Pressable>
        ))}
      </View>

