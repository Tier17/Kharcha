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

