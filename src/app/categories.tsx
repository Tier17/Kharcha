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

