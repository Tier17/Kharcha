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

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      {/* shadow */}
      <Ellipse cx={60} cy={106} rx={34} ry={4} fill={face} opacity={0.08} />
      {/* coin peeking out the top */}
      <Circle cx={78} cy={30} r={13} fill="#F2C14E" />
      <Circle cx={78} cy={30} r={8.5} fill="none" stroke="#D9A43A" strokeWidth={2} />
      {/* body */}
      <Rect x={18} y={34} width={84} height={66} rx={20} fill={body} />
      {/* flap with clasp */}
      <Path d="M18 54c0-11 9-20 20-20h44c11 0 20 9 20 20v4H18v-4Z" fill={flap} />
      <Rect x={80} y={50} width={22} height={16} rx={8} fill={flap} />
      <Circle cx={90} cy={58} r={3.2} fill={body} />
      {/* face */}
      {resting ? (
        <>
          <Path d="M40 76c2.5 2.5 6.5 2.5 9 0" stroke={face} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M63 76c2.5 2.5 6.5 2.5 9 0" stroke={face} strokeWidth={3} strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <Circle cx={44.5} cy={76} r={4} fill={face} />
          <Circle cx={67.5} cy={76} r={4} fill={face} />
          <Circle cx={46} cy={74.5} r={1.3} fill={body} />
          <Circle cx={69} cy={74.5} r={1.3} fill={body} />
        </>
      )}
      <Path d="M51 85c3 3 7 3 10 0" stroke={face} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Ellipse cx={36} cy={84} rx={5} ry={3} fill={cheek} opacity={0.7} />
      <Ellipse cx={76} cy={84} rx={5} ry={3} fill={cheek} opacity={0.7} />
    </Svg>
  );
}
