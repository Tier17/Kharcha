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

export const glyphFor = (name: string | undefined, icon?: string | null): Glyph =>
  (GLYPHS as readonly string[]).includes(icon ?? '')
    ? (icon as Glyph)
    : (BY_NAME[(name ?? '').toLowerCase()] ?? 'other');

export function GlyphIcon({ glyph, color, size = 18 }: { glyph: Glyph; color: string; size?: number }) {
  const p = {
    stroke: color,
    strokeWidth: 1.7,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {glyph === 'fuel' && (
        <Path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5V20M3.5 20h12M7.5 8.5h4M14 11h1.5a1.5 1.5 0 0 1 1.5 1.5v3.75a1.25 1.25 0 0 0 2.5 0V8.5L17 6" {...p} />
      )}
      {glyph === 'food' && (
        <Path d="M7 3.5V10a2 2 0 0 0 2 2m0 0a2 2 0 0 0 2-2V3.5M9 12v8.5M9 3.5V9M16.5 20.5v-17c-2 1.4-3 4-3 7 0 1.6.9 2.6 3 2.6" {...p} />
      )}
      {glyph === 'transport' && (
        <>
          <Path d="M5 17h14v-4.5l-1.8-4.6a1.5 1.5 0 0 0-1.4-.9H8.2a1.5 1.5 0 0 0-1.4.9L5 12.5V17ZM5 12.5h14M7 17v2.2M17 17v2.2" {...p} />
          <Circle cx={8.5} cy={14.7} r={0.4} {...p} />
          <Circle cx={15.5} cy={14.7} r={0.4} {...p} />
        </>
      )}
      {glyph === 'groceries' && (
        <>
          <Path d="M3.5 4.5h2l2.2 10.2h9.8l2-7.2H6.4" {...p} />
          <Circle cx={9.5} cy={19} r={1.1} {...p} />
          <Circle cx={16.5} cy={19} r={1.1} {...p} />
        </>
      )}
      {glyph === 'bills' && (
        <Path d="M6.5 3.5h11v17l-1.8-1.2-1.9 1.2-1.8-1.2-1.8 1.2-1.9-1.2-1.8 1.2v-17ZM9.5 8h5M9.5 11.5h5M9.5 15h2.5" {...p} />
      )}
      {glyph === 'work' && (
        <Path d="M3.5 17.5h17M5.5 17.5v-.8A6.5 6.5 0 0 1 12 10.2a6.5 6.5 0 0 1 6.5 6.5v.8M10 10.5V6.8h4v3.7" {...p} />
      )}
      {glyph === 'repairs' && (
        <Path d="M14.8 4.2a4.6 4.6 0 0 0-4.4 6L4.6 16a2.1 2.1 0 1 0 3 3l5.8-5.8a4.6 4.6 0 0 0 6-4.4l-2.9 2.9-2.6-.6-.6-2.6 2.9-2.9a4.7 4.7 0 0 0-1.4-.4Z" {...p} />
      )}
      {glyph === 'health' && (
        <Path d="M12 19.5s-7.5-4.4-7.5-9.8A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 9.8-7.5 9.8ZM8 12h2l1-2 2 4 1-2h2" {...p} />
      )}
      {glyph === 'shopping' && (
        <Path d="M5.5 8h13l-1 12.5h-11L5.5 8ZM9 10.5V6.8a3 3 0 0 1 6 0v3.7" {...p} />
      )}
      {glyph === 'home' && <Path d="M4 11.2 12 4.5l8 6.7M6 9.6V19.5h12V9.6M10 19.5v-5h4v5" {...p} />}
      {glyph === 'phone' && (
        <Path d="M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5ZM11 17.5h2" {...p} />
      )}
      {glyph === 'gift' && (
        <Path d="M4.5 9h15v3h-15V9ZM6 12v8h12v-8M12 9v11M12 9c-1.5 0-4.5-.5-4.5-2.5S10.5 5 12 9Zm0 0c1.5 0 4.5-.5 4.5-2.5S13.5 5 12 9Z" {...p} />
      )}
      {glyph === 'other' && (
        <>
          <Circle cx={6.5} cy={12} r={0.9} {...p} fill={color} />
          <Circle cx={12} cy={12} r={0.9} {...p} fill={color} />
          <Circle cx={17.5} cy={12} r={0.9} {...p} fill={color} />
        </>
      )}
    </Svg>
  );
}

/** Soft tinted squircle with the category's line icon. */
export function CategoryGlyph({
  name,
  icon,
  color,
  size = 40,
}: {
  name: string | undefined;
  icon?: string | null;
  color: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        backgroundColor: color + '1F',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GlyphIcon glyph={glyphFor(name, icon)} color={color} size={size * 0.5} />
    </View>
  );
}
