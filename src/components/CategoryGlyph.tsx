import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export const GLYPHS = [
  'fuel',
  'food',
  'transport',
  'groceries',
  'bills',
  'work',
  'repairs',
  'health',
  'shopping',
  'home',
  'phone',
  'gift',
  'other',
] as const;
export type Glyph = (typeof GLYPHS)[number];

