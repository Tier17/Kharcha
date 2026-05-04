import { useColorScheme } from 'react-native';

import { useStore } from '@/store';
import { palette, type Colors } from './tokens';

export * from './tokens';

export function useScheme(): 'light' | 'dark' {
  const system = useColorScheme();
  const pref = useStore((s) => s.themePref);
  if (pref !== 'system') return pref;
  return system === 'dark' ? 'dark' : 'light';
}

export function useColors(): Colors {
  return palette[useScheme()];
}
