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

function DeleteAction({ drag }: { drag: SharedValue<number> }) {
  const c = useColors();
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(-drag.value, [0, 60], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(-drag.value, [0, 80], [0.6, 1], 'clamp') }],
  }));
  return (
    <View style={styles.action}>
      <Animated.View style={[styles.actionInner, style]}>
        <Icon name="delete" color={c.danger} size={22} />
      </Animated.View>
    </View>
  );
}

