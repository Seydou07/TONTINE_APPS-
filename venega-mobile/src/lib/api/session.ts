import * as SecureStore from 'expo-secure-store';

/**
 * Jetons de session (JWT d'accès + jeton de rafraîchissement), conservés dans le
 * stockage chiffré du téléphone (Keychain / Keystore), jamais dans AsyncStorage.
 */
export type Tokens = { accessToken: string; refreshToken: string };

const KEY = 'venega.session';

let cached: Tokens | null | undefined;

export async function getTokens(): Promise<Tokens | null> {
  if (cached !== undefined) return cached;
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    cached = raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    cached = null;
  }
  return cached;
}

export async function setTokens(tokens: Tokens): Promise<void> {
  cached = tokens;
  await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
}

export async function clearTokens(): Promise<void> {
  cached = null;
  await SecureStore.deleteItemAsync(KEY).catch(() => {});
}
