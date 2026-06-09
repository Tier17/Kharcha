import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';

import { Mascot } from '@/components/Mascot';
import { Text } from '@/components/Text';
import { font, radius, space, useColors } from '@/theme';

const EXAMPLES = ['“Petrol 120”', '“Chai 15 aur samosa 10”', '“Kal groceries 230”'];

function Bubble({ text, index }: { text: string; index: number }) {
  const c = useColors();
  return (
    <Animated.View
      entering={FadeIn.delay(200 + index * 90).duration(420).easing(Easing.out(Easing.cubic))}
      style={[styles.bubble, { backgroundColor: c.surface, alignSelf: index % 2 ? 'flex-end' : 'flex-start' }]}
    >
      <Text variant="body" tone="secondary">
        {text}
      </Text>
    </Animated.View>
  );
}

export function EmptyState() {
  return (
    <View style={styles.wrap}>
      <Animated.View entering={FadeIn.duration(420).easing(Easing.out(Easing.cubic))}>
        <Mascot size={92} />
        <Text style={[styles.title, { marginTop: space.md }]}>Just say it.</Text>
        <Text variant="body" tone="secondary" style={styles.sub}>
          Hold the mic and say what you spent — Urdu, English, or both.
        </Text>
      </Animated.View>
      <View style={styles.bubbles}>
        {EXAMPLES.map((t, i) => (
          <Bubble key={t} text={t} index={i} />
        ))}
      </View>
    </View>
  );
}

