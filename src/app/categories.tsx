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

      <View style={styles.editorActions}>
        {draft.id && !isOther && (
          <Pressable onPress={remove} hitSlop={8} style={styles.deleteBtn}>
            <Text variant="bodyMedium" style={{ color: c.danger }}>
              Delete
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={save}
          disabled={!canSave}
          style={[styles.saveBtn, { backgroundColor: canSave ? c.accent : c.surface }]}
        >
          <Text variant="bodyMedium" style={{ color: canSave ? c.onAccent : c.textTertiary }}>
            {draft.id ? 'Save' : 'Add category'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function Categories() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const categories = useStore((s) => s.categories);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [shown, setShown] = useState<{ draft: Draft; n: number } | null>(null);
  if (draft && draft !== shown?.draft) setShown({ draft, n: (shown?.n ?? 0) + 1 });

  const full = categories.length >= MAX_CATEGORIES;
  const edit = (cat: Category) =>
    setDraft({ id: cat.id, name: cat.name, color: cat.color, icon: glyphFor(cat.name, cat.icon) });
  const add = () => {
    const used = new Set(categories.map((x) => x.color));
    const color = categoryColors.find((x) => !used.has(x)) ?? categoryColors[0];
    setDraft({ id: null, name: '', color, icon: 'other' });
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable hitSlop={14} onPress={() => router.back()} style={{ marginLeft: -6 }}>
          <Icon name="back" color={c.text} size={24} />
        </Pressable>
        <Text variant="title">Categories</Text>
        <Pressable hitSlop={14} onPress={add} disabled={full} style={{ opacity: full ? 0.3 : 1 }}>
          <Icon name="plus" color={c.text} size={24} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }}>
        <View style={[styles.card, { backgroundColor: c.surfaceRaised }]}>
          {categories.map((cat, i) => (
            <Pressable
              key={cat.id}
              onPress={() => edit(cat)}
              style={({ pressed }) => [
                styles.row,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.separator },
                pressed && { opacity: 0.6 },
              ]}
            >
              <CategoryGlyph name={cat.name} icon={cat.icon} color={cat.color} size={36} />
              <Text variant="bodyMedium" style={{ flex: 1 }}>
                {cat.name}
              </Text>
              <Icon name="forward" color={c.textTertiary} size={16} />
            </Pressable>
          ))}
        </View>
        <Text variant="caption" tone="tertiary" style={styles.footer}>
          {categories.length} of {MAX_CATEGORIES}. Voice notes are always filed into one of these, never a new one.
          Deleting a category moves its expenses to Other.
        </Text>
      </ScrollView>

