import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { font, useColors } from '@/theme';

type Variant = 'hero' | 'title' | 'body' | 'bodyMedium' | 'label' | 'caption';
type Tone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'onAccent';

const variants: Record<Variant, TextStyle> = {
  hero: { fontFamily: font.semibold, fontSize: 56, lineHeight: 64, letterSpacing: -2 },
  title: { fontFamily: font.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.4 },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  bodyMedium: { fontFamily: font.medium, fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  label: { fontFamily: font.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  caption: { fontFamily: font.regular, fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
};

