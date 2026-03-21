import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { space, useColors } from '@/theme';

export const CARD_RADIUS = 22;

/** Plain white (or raised dark) rounded card on the tinted background. */
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return <View style={[styles.card, { backgroundColor: c.surfaceRaised }, style]}>{children}</View>;
}

