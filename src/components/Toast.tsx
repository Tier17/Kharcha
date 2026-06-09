import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useStore } from '@/store';
import { radius, space, useScheme } from '@/theme';

/** Floating dark pill above the dock; auto-hides after a few seconds. */
export function Toast({ bottom }: { bottom: number }) {
  const toast = useStore((s) => s.toast);
  const dismiss = useStore((s) => s.dismissToast);
  const scheme = useScheme();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismiss, toast.action ? 5000 : 2800);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  if (!toast) return null;
  const bg = scheme === 'dark' ? '#2C2C2E' : '#111113';

  return (
    <Animated.View
      key={toast.id}
      entering={FadeIn.duration(220).easing(Easing.out(Easing.cubic))}
      exiting={FadeOut.duration(180)}
      style={[styles.toast, { bottom, backgroundColor: bg }]}
    >
      <Text variant="label" numberOfLines={2} style={styles.message}>
        {toast.message}
      </Text>
      {toast.action && (
        <Pressable
          hitSlop={10}
          onPress={() => {
            toast.action?.run();
            dismiss();
          }}
        >
          <Text variant="label" style={{ color: '#6FD3A8' }}>
            {toast.action.label}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: space.xl,
    right: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingHorizontal: space.lg + 2,
    paddingVertical: 14,
    borderRadius: radius.md,
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
  },
  message: { flex: 1, color: '#F5F5F7' },
});
