import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedNumber } from '@/components/AnimatedNumber';
import { HeroCard } from '@/components/Card';
import { CategoryPicker } from '@/components/CategoryPicker';
import { EmptyState } from '@/components/EmptyState';
import { EntrySheet, type EntryTarget } from '@/components/EntrySheet';
import { ExpenseRow } from '@/components/ExpenseRow';
import { Icon, type IconName } from '@/components/Icon';
import { MonthStrip } from '@/components/MonthStrip';
import { StatusPill } from '@/components/StatusPill';
import { Text } from '@/components/Text';
import { Mascot } from '@/components/Mascot';
import { Toast } from '@/components/Toast';
import { VoiceDock } from '@/components/VoiceDock';
import * as repo from '@/lib/db/repo';
import type { Capture, Expense } from '@/lib/db/repo';
import { addDays, dayLabel, formatMinor, isoDate, monthName } from '@/lib/format';
import { dayInsight } from '@/lib/insight';
import { categoryById, useStore } from '@/store';
import { moneyType, radius, space, useColors } from '@/theme';

