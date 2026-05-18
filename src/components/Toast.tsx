import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useStore } from '@/store';
import { radius, space, useScheme } from '@/theme';

