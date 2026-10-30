/**
 * Règles de saisie partagées par les écrans d'authentification (copie exacte de
 * venega-mobile/src/features/auth/validation.ts).
 * Chaque fonction renvoie le message à afficher sous le champ, ou `undefined` si la saisie est valide.
 */

export const PHONE_DIGITS = 8;
export const MIN_PASSWORD = 8;

/** Ne garde que les chiffres (8 au maximum). */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, PHONE_DIGITS);
}

/** « 70123456 » → « 70 12 34 56 », au fil de la frappe. */
export function formatPhone(value: string): string {
  return phoneDigits(value).replace(/(\d{2})(?=\d)/g, '$1 ');
}

export function validatePhone(value: string): string | undefined {
  const count = phoneDigits(value).length;
  if (count === 0) return 'Entrez votre numéro de téléphone.';
  if (count < PHONE_DIGITS) {
    return `Le numéro doit contenir ${PHONE_DIGITS} chiffres (${count} saisi${count > 1 ? 's' : ''}).`;
  }
  return undefined;
}

/** À la connexion, on ne rappelle pas les règles du mot de passe : il doit seulement être rempli. */
export function validateLoginPassword(value: string): string | undefined {
  return value ? undefined : 'Entrez votre mot de passe.';
}

export function validateNewPassword(value: string): string | undefined {
  if (!value) return 'Choisissez un mot de passe.';
  if (value.length < MIN_PASSWORD) return `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`;
  return undefined;
}

export function validateConfirm(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Confirmez votre mot de passe.';
  return confirm === password ? undefined : 'Les mots de passe ne correspondent pas.';
}

export function validateName(value: string, label: 'prénom' | 'nom'): string | undefined {
  return value.trim().length >= 2 ? undefined : `Indiquez votre ${label}.`;
}
