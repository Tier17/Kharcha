export const palette = {
  light: {
    bg: '#F7F5FC',
    surface: '#EEEAF8',
    surfaceRaised: '#FFFFFF',
    text: '#17132A',
    textSecondary: '#6B6585',
    textTertiary: '#A7A1BD',
    separator: 'rgba(23,19,42,0.08)',
    accent: '#6C4CF1',
    accentSoft: 'rgba(108,76,241,0.10)',
    onAccent: '#FFFFFF',
    hero: '#6C4CF1',
    onHero: '#FFFFFF',
    backdrop: 'rgba(23,19,42,0.32)',
    shadow: '#000000',
    danger: '#C2564A',
  },
  dark: {
    bg: '#0E0B1A',
    surface: '#1A1530',
    surfaceRaised: '#221C3B',
    text: '#F3F0FF',
    textSecondary: '#A49DC2',
    textTertiary: '#6A6386',
    separator: 'rgba(255,255,255,0.08)',
    accent: '#8D72FF',
    accentSoft: 'rgba(141,114,255,0.16)',
    onAccent: '#FFFFFF',
    hero: '#5B3FD9',
    onHero: '#FFFFFF',
    backdrop: 'rgba(0,0,0,0.62)',
    shadow: '#000000',
    danger: '#E58A7E',
  },
} as const;

export type Colors = { [K in keyof typeof palette.light]: string };

/** One family, three weights. Geist's steady-width digits make amounts line up cleanly. */
export const font = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
} as const;

