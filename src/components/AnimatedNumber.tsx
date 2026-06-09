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

