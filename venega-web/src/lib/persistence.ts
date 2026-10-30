'use client';

import { restoreStore, snapshotStore, type StoreSnapshot } from '@/features/circles/store';
import { restoreProfile, snapshotProfile, type UserProfile } from '@/features/profile/store';
import { subscribe } from './demoStore';

/**
 * Sauvegarde des données de démonstration dans le navigateur (comme AsyncStorage
 * sur le mobile), pour qu'elles survivent à un rechargement tant que l'API n'est
 * pas branchée. Aucune donnée sensible : pas de jeton, pas de mot de passe.
 */
const KEY = 'venega.web.data';
/** À incrémenter si la forme des données change : l'ancienne sauvegarde est ignorée. */
const VERSION = 1;

type Saved = { version: number; store: StoreSnapshot; profile: UserProfile };

export function loadLocalData(): void {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Saved;
    if (saved.version !== VERSION) return;
    restoreStore(saved.store);
    restoreProfile(saved.profile);
  } catch {
    // Sauvegarde illisible ou stockage bloqué : on repart des données par défaut.
  }
}

function saveLocalData(): void {
  try {
    const saved: Saved = { version: VERSION, store: snapshotStore(), profile: snapshotProfile() };
    window.localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Stockage plein ou bloqué (navigation privée) : la démo continue sans sauvegarde.
  }
}

/** Efface la sauvegarde (déconnexion). */
export function clearLocalData(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignoré
  }
}

/** Enregistre après chaque modification (regroupée sur 300 ms). Renvoie la fonction de désabonnement. */
export function saveOnChange(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const unsubscribe = subscribe(() => {
    clearTimeout(timer);
    timer = setTimeout(saveLocalData, 300);
  });
  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}
