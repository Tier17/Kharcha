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

const SPARKLE = 'M12 2c.6 4.8 2.2 7.4 10 10-7.8 2.6-9.4 5.2-10 10-.6-4.8-2.2-7.4-10-10 7.8-2.6 9.4-5.2 10-10Z';

/** Soft flat circles and two sparkles for the corner of a purple hero card. */
export function HeroDecor() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.blob, { width: 220, height: 220, top: -90, right: -70, opacity: 0.1 }]} />
      <View style={[styles.blob, { width: 120, height: 120, top: 40, right: -40, opacity: 0.07 }]} />
      <Svg width={18} height={18} viewBox="0 0 24 24" style={{ position: 'absolute', top: 64, right: 92, opacity: 0.85 }}>
        <Path d={SPARKLE} fill="#FFFFFF" />
      </Svg>
      <Svg width={10} height={10} viewBox="0 0 24 24" style={{ position: 'absolute', top: 96, right: 70, opacity: 0.6 }}>
        <Path d={SPARKLE} fill="#FFFFFF" />
      </Svg>
    </View>
  );
}

/** The signature royal-purple card used for the main number on a screen. */
export function HeroCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return (
    <View style={[styles.hero, { backgroundColor: c.hero }, style]}>
      <HeroDecor />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: CARD_RADIUS, overflow: 'hidden' },
  hero: {
    borderRadius: 28,
    paddingHorizontal: space.xl - 2,
    paddingTop: space.lg + 2,
    paddingBottom: space.lg + 4,
    overflow: 'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: '#FFFFFF' },
});
