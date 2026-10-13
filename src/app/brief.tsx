import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, HeroCard } from '@/components/Card';
import { CategoryGlyph } from '@/components/CategoryGlyph';
import { Icon } from '@/components/Icon';
import { Mascot } from '@/components/Mascot';
import { Text } from '@/components/Text';
import * as repo from '@/lib/db/repo';
import { formatMinor, isoDate } from '@/lib/format';
import { categoryById, useStore } from '@/store';
import { moneyType, radius, space, useColors } from '@/theme';

