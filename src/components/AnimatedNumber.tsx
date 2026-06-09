import { useEffect } from 'react';
import { TextInput, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function format(minor: number): string {
  'worklet';
  const whole = Math.floor(Math.round(minor) / 100);
  return whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Whole-number part of an amount (in minor units) that counts up/down when it changes. */
export function AnimatedNumber({ value, style }: { value: number; style: TextStyle | TextStyle[] }) {
  const v = useSharedValue(value);

  useEffect(() => {
    v.set(withTiming(value, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [value, v]);

