import React, { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@venega/design-tokens';
import { loadLocalData, saveOnBackground } from '../src/lib/persistence';
import { LOCK_AFTER_MS, isLockEnabled, isLockShown } from '../src/lib/appLock';
import { hasSession } from '../src/features/auth/api';
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

  // Verrou : au retour dans l'app après LOCK_AFTER_MS en arrière-plan, on redemande l'empreinte / le code.
  useEffect(() => {
    let leftAt: number | null = null;
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'background') {
        leftAt = Date.now();
        return;
      }
      if (state !== 'active' || leftAt === null) return;
      const away = Date.now() - leftAt;
      leftAt = null;
      if (away < LOCK_AFTER_MS || isLockShown()) return;
      if ((await isLockEnabled()) && (await hasSession())) router.push('/lock');
    });
    return () => sub.remove();
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
        <Stack.Screen name="lock" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </>
  );
}
