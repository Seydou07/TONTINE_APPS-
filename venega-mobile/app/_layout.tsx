import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@venega/design-tokens';
import { loadLocalData, saveOnBackground } from '../src/lib/persistence';
import '../global.css';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  // Police système : rien à charger. On relit seulement les données sauvegardées, puis on libère
  // l'écran de démarrage natif.
  useEffect(() => {
    loadLocalData().finally(() => {
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    });
    return saveOnBackground();
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}
