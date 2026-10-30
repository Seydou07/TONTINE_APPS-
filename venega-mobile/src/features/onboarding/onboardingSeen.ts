import AsyncStorage from '@react-native-async-storage/async-storage';

/** L'onboarding n'est montré qu'au tout premier lancement sur ce téléphone. */
const KEY = 'venega.onboardingSeen';

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(KEY, '1').catch(() => {});
}
