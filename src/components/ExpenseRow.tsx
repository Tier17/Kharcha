import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeIn, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { CARD_RADIUS } from '@/components/Card';
import { CategoryGlyph } from '@/components/CategoryGlyph';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { Category, Expense } from '@/lib/db/repo';
import { formatMinor } from '@/lib/format';
import { font, space, useColors } from '@/theme';

