import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { restoreStore, snapshotStore } from '../features/circles/circleStore';
import type { StoreSnapshot } from '../features/circles/circleStore';
import { restoreProfile, snapshotProfile } from '../features/profile/profileStore';
import type { UserProfile } from '../features/profile/profileStore';

/**
 * Sauvegarde des données locales (cercles, membres, cotisations, profil) sur le téléphone,
 * pour qu'elles survivent à la fermeture de l'app tant que l'API n'est pas branchée.
 * Données de démonstration uniquement : les jetons de session sont dans le stockage chiffré
 * (`lib/api/session.ts`), et les vraies données viendront de l'API.
 */
const KEY = 'venega.data';
/** À incrémenter si la forme des données change : l'ancienne sauvegarde est alors ignorée. */
const VERSION = 1;

type Saved = { version: number; store: StoreSnapshot; profile: UserProfile };

export async function loadLocalData(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Saved;
    if (saved.version !== VERSION) return;
    restoreStore(saved.store);
    restoreProfile(saved.profile);
  } catch {
    // Sauvegarde illisible : on repart des données par défaut.
  }
}

export async function saveLocalData(): Promise<void> {
  const saved: Saved = { version: VERSION, store: snapshotStore(), profile: snapshotProfile() };
  await AsyncStorage.setItem(KEY, JSON.stringify(saved)).catch(() => {});
}

/** Efface la sauvegarde (déconnexion). */
export async function clearLocalData(): Promise<void> {
  await AsyncStorage.removeItem(KEY).catch(() => {});
}

/** Enregistre dès que l'app passe en arrière-plan (avant qu'Android ou iOS ne la ferme). */
export function saveOnBackground(): () => void {
  const sub = AppState.addEventListener('change', (state) => {
    if (state !== 'active') saveLocalData();
  });
  return () => sub.remove();
}
