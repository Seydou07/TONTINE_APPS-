/**
 * Mode démo du site : tant qu'aucune API n'est configurée (`NEXT_PUBLIC_API_URL`),
 * les écrans utilisent les données de démonstration de `@venega/types`, comme
 * l'app mobile sans `EXPO_PUBLIC_API_URL`.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export const isDemoMode = API_URL === '';

/** Code OTP accepté en mode démo uniquement (l'API réelle envoie un SMS). */
export const DEMO_OTP_CODE = '123456';
