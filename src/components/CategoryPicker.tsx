import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryGlyph } from '@/components/CategoryGlyph';
import { Sheet } from '@/components/Sheet';
import { Text } from '@/components/Text';
import * as repo from '@/lib/db/repo';
import type { Expense } from '@/lib/db/repo';
import { formatMinor } from '@/lib/format';
import { useStore } from '@/store';
import { radius, space, useColors } from '@/theme';

