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

const BY_NAME: Record<string, Glyph> = {
  fuel: 'fuel',
  food: 'food',
  transport: 'transport',
  groceries: 'groceries',
  bills: 'bills',
  'site/work': 'work',
  work: 'work',
  repairs: 'repairs',
  health: 'health',
  shopping: 'shopping',
};

