/**
 * Authentification — `POST /auth/register`, `/auth/login`, `/auth/verify-otp`, `/auth/logout`,
 * puis `GET /users/me` pour charger le profil.
 *
 * En mode démo (aucune API configurée), les mêmes fonctions simulent les réponses
 * pour que le parcours reste utilisable.
 */
import { KycStatus } from '@venega/types';
import { ApiError, DEMO_OTP_CODE, apiRequest, clearTokens, getTokens, isDemoMode, setTokens } from '../../lib/api';
import type { Tokens } from '../../lib/api';
import { setCurrentUserKycStatus } from '../circles/circleStore';
import { setProfileName } from '../profile/profileStore';

/** Profil renvoyé par l'API (champs sensibles déjà retirés côté serveur). */
export type ApiUser = {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string | null;
  kycStatus: KycStatus;
  isPhoneVerified: boolean;
};

/** « 70 12 34 56 » → « +22670123456 » (format attendu par l'API). */
export function toE164(localPhone: string): string {
  return `+226${localPhone.replace(/\D/g, '')}`;
}

export const INVALID_CREDENTIALS = 'Numéro ou mot de passe incorrect.';
export const PHONE_TAKEN = 'Ce numéro a déjà un compte Venega. Connectez-vous.';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function loadProfile(): Promise<void> {
  const me = await apiRequest<ApiUser>('/users/me');
  setProfileName(me.displayName || `${me.firstName} ${me.lastName}`);
  setCurrentUserKycStatus(me.kycStatus);
}

export async function register(params: {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<void> {
  if (isDemoMode) {
    await wait(800);
    setProfileName(`${params.firstName} ${params.lastName}`);
    return;
  }
  const tokens = await apiRequest<Tokens>('/auth/register', {
    method: 'POST',
    auth: false,
    body: {
      phoneNumber: toE164(params.phone),
      password: params.password,
      firstName: params.firstName.trim(),
      lastName: params.lastName.trim(),
    },
  }).catch((e: unknown) => {
    if (e instanceof ApiError && e.status === 409) throw new ApiError(PHONE_TAKEN, 409);
    throw e;
  });
  await setTokens(tokens);
}

export async function login(phone: string, password: string): Promise<void> {
  if (isDemoMode) {
    await wait(800);
    return;
  }
  const tokens = await apiRequest<Tokens>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { phoneNumber: toE164(phone), password },
  }).catch((e: unknown) => {
    // Même message que le numéro soit inconnu ou le mot de passe faux : on ne révèle pas quels numéros ont un compte.
    if (e instanceof ApiError && (e.status === 400 || e.status === 401 || e.status === 404)) {
      throw new ApiError(INVALID_CREDENTIALS, e.status);
    }
    throw e;
  });
  await setTokens(tokens);
  await loadProfile();
}

export async function verifyOtp(phone: string, code: string): Promise<void> {
  if (isDemoMode) {
    await wait(800);
    if (code !== DEMO_OTP_CODE) throw new ApiError('Code incorrect.', 401);
    return;
  }
  await apiRequest('/auth/verify-otp', {
    method: 'POST',
    auth: false,
    body: { phoneNumber: toE164(phone), code },
  });
  await loadProfile();
}

/** Nom affiché auprès des membres (`PATCH /users/me`). E-mail et numéro Mobile Money : pas encore dans l'API. */
export async function saveDisplayName(fullName: string): Promise<void> {
  setProfileName(fullName);
  if (isDemoMode) return;
  await apiRequest('/users/me', { method: 'PATCH', body: { displayName: fullName.trim() } });
}

/**
 * Renvoi du code par SMS. L'API n'a pas encore d'endpoint pour ça
 * (attendu : `POST /auth/resend-otp` — voir docs/api-mobile.md).
 */
export async function resendOtp(_phone: string): Promise<void> {
  if (isDemoMode) return;
  throw new ApiError('Le renvoi du code n’est pas encore disponible. Réessayez plus tard.', 501);
}

export async function logout(): Promise<void> {
  if (!isDemoMode) {
    const tokens = await getTokens();
    if (tokens) {
      await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken: tokens.refreshToken } }).catch(() => {});
    }
  }
  await clearTokens();
}

/** Vrai si une session est enregistrée sur le téléphone (toujours faux en mode démo). */
export async function hasSession(): Promise<boolean> {
  if (isDemoMode) return false;
  return (await getTokens()) !== null;
}
