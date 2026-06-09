import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { useScheme } from '@/theme';

/**
 * "Batwa", the little wallet. Flat, two-tone purple with a gold coin peeking out.
 * `resting` closes its eyes (nothing spent); otherwise it's awake and smiling.
 */
export function Mascot({ size = 120, resting = false }: { size?: number; resting?: boolean }) {
  const dark = useScheme() === 'dark';
  const body = dark ? '#3B2F72' : '#DCD2FF';
  const flap = dark ? '#5B3FD9' : '#6C4CF1';
  const face = dark ? '#F3F0FF' : '#17132A';
  const cheek = dark ? '#8D72FF' : '#B9A6FF';

