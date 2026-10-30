'use client';

import { useSyncExternalStore } from 'react';

/**
 * Abonnement commun aux stores de démonstration (cercles, profil).
 *
 * Les stores sont de simples modules à état mutable, comme sur le mobile
 * (`circleStore.ts`, `profileStore.ts`). Chaque écriture appelle `emitChange()`
 * et les composants qui utilisent `useDemoStore()` se ré-affichent.
 * TODO API : quand l'API sera branchée, ces stores seront remplacés par des
 * requêtes (voir les commentaires `TODO API` dans chaque `api.ts`).
 */

let version = 0;
const listeners = new Set<() => void>();

export function emitChange(): void {
  version += 1;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getVersion = () => version;

/** Renvoie un numéro de version : le composant se ré-affiche à chaque changement des données. */
export function useDemoStore(): number {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}
