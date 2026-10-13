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

