/**
 * Configuration de l'accès à l'API Venega (`venega-api`, préfixe `/api/v1`).
 *
 * L'adresse vient de `EXPO_PUBLIC_API_URL` (voir `.env.example`), par exemple
 * `http://192.168.1.10:3000/api/v1` en local ou l'URL HTTPS de production.
 * Sans adresse, l'app tourne en mode démo : données locales, aucun appel réseau.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

/** Vrai tant qu'aucune API n'est configurée : les écrans utilisent les données de démonstration. */
export const isDemoMode = API_URL === '';

/** Délai maximal d'une requête. Large, car les réseaux mobiles sont souvent lents. */
export const REQUEST_TIMEOUT_MS = 20000;

/** Code OTP accepté en mode démo uniquement (l'API réelle envoie un SMS). */
export const DEMO_OTP_CODE = '123456';
