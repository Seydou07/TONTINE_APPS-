/**
 * Verrou de l'application : empreinte, visage, ou à défaut le code / schéma / mot de passe
 * de verrouillage du téléphone. Aucun code n'est géré par Venega : c'est le téléphone qui vérifie.
 */
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const KEY = 'venega.appLock';

/**
 * Délai en arrière-plan avant de redemander le verrou. Laisse le temps de faire un paiement USSD
 * (l'app passe en arrière-plan pendant que le téléphone compose le code) sans être reverrouillé.
 */
export const LOCK_AFTER_MS = 3 * 60 * 1000;

let enabled: boolean | undefined;

export async function isLockEnabled(): Promise<boolean> {
  if (enabled !== undefined) return enabled;
  try {
    enabled = (await SecureStore.getItemAsync(KEY)) === '1';
  } catch {
    enabled = false;
  }
  return enabled;
}

export async function setLockEnabled(value: boolean): Promise<void> {
  enabled = value;
  if (value) await SecureStore.setItemAsync(KEY, '1');
  else await SecureStore.deleteItemAsync(KEY).catch(() => {});
}

/** Vrai si le téléphone a au moins un code, un schéma, un mot de passe ou une empreinte configurés. */
export async function canUseDeviceLock(): Promise<boolean> {
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return level !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

/** Affiche la demande du téléphone (empreinte, sinon code / schéma). Vrai si l'utilisateur est reconnu. */
export async function authenticate(promptMessage = 'Déverrouiller Venega'): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Annuler',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}

// Écran de verrou déjà affiché : évite de l'empiler deux fois.
let lockShown = false;
export const setLockShown = (value: boolean) => {
  lockShown = value;
};
export const isLockShown = () => lockShown;
