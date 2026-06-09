import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold, useFonts } from '@expo-google-fonts/geist';
import NetInfo from '@react-native-community/netinfo';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { migrate } from '@/lib/db';
import { resetProcessingCaptures } from '@/lib/db/repo';
import { processQueue } from '@/lib/queue';
import { getApiKey } from '@/lib/settings';
import { useStore } from '@/store';
import { useColors, useScheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Runs once at startup, before the first render.
migrate();
resetProcessingCaptures();
useStore.getState().load();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Geist_400Regular, Geist_500Medium, Geist_600SemiBold });
  const scheme = useScheme();
  const c = useColors();

  useEffect(() => {
    getApiKey().then((key) => {
      useStore.getState().setHasApiKey(!!key);
      processQueue();
    });

