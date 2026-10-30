/**
 * Authentification du site — même structure que venega-mobile/src/features/auth/api.ts.
 *
 * En mode démo (aucune `NEXT_PUBLIC_API_URL`), les fonctions simulent les réponses pour
 * que le parcours reste utilisable. Aucun identifiant n'est journalisé ni stocké.
 *
 * TODO API (docs/api-mobile.md, section 2) :
 *   - POST /auth/register { phoneNumber, password, firstName, lastName } → { accessToken, refreshToken }
 *   - POST /auth/login { phoneNumber, password }
 *   - POST /auth/verify-otp { phoneNumber, code }
 *   - POST /auth/resend-otp { phoneNumber } (pas encore dans l'API)
 *   - PATCH /users/me { displayName }
 *   - POST /auth/logout { refreshToken }
 * Sur le web, les jetons ne doivent pas être lisibles par le JavaScript de la page :
 * passer par une route Next (route handler) qui les pose en cookies `httpOnly; Secure; SameSite=Lax`.
 */
import { DEMO_OTP_CODE, isDemoMode } from '@/lib/demo';
import { setProfileName, setProfilePhone } from '@/features/profile/store';
import { clearLocalData } from '@/lib/persistence';
import { formatPhone } from './validation';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const INVALID_CREDENTIALS = 'Numéro ou mot de passe incorrect.';
export const PHONE_TAKEN = 'Ce numéro a déjà un compte Venega. Connectez-vous.';
const NOT_CONNECTED = 'Le service n’est pas encore disponible. Réessayez plus tard.';

/** « 70 12 34 56 » → « +22670123456 » (format attendu par l'API). */
export function toE164(localPhone: string): string {
  return `+226${localPhone.replace(/\D/g, '')}`;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function register(params: {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<void> {
  if (isDemoMode) {
    await wait(800);
    // Nouveau compte : on repart des données de démonstration par défaut.
    clearLocalData();
    setProfileName(`${params.firstName.trim()} ${params.lastName.trim()}`);
    setProfilePhone(formatPhone(params.phone));
    return;
  }
  // TODO API: POST /auth/register ; 409 → throw new ApiError(PHONE_TAKEN, 409).
  throw new ApiError(NOT_CONNECTED, 501);
}

export async function login(phone: string, _password: string): Promise<void> {
  if (isDemoMode) {
    await wait(800);
    setProfilePhone(formatPhone(phone));
    return;
  }
  // TODO API: POST /auth/login puis GET /users/me. 400 / 401 / 404 → INVALID_CREDENTIALS
  // (même message que le numéro soit inconnu ou le mot de passe faux).
  throw new ApiError(NOT_CONNECTED, 501);
}

export async function verifyOtp(_phone: string, code: string): Promise<void> {
  if (isDemoMode) {
    await wait(800);
    if (code !== DEMO_OTP_CODE) throw new ApiError('Code incorrect.', 401);
    return;
  }
  // TODO API: POST /auth/verify-otp puis GET /users/me (nom + statut KYC).
  throw new ApiError(NOT_CONNECTED, 501);
}

/** Nom affiché auprès des membres. E-mail et numéro Mobile Money : pas encore dans l'API. */
export async function saveDisplayName(fullName: string): Promise<void> {
  setProfileName(fullName);
  if (isDemoMode) return;
  // TODO API: PATCH /users/me { displayName }.
  throw new ApiError('Le profil n’a pas pu être enregistré.', 501);
}

/** Renvoi du code par SMS (endpoint attendu : POST /auth/resend-otp). */
export async function resendOtp(_phone: string): Promise<void> {
  if (isDemoMode) return;
  throw new ApiError('Le renvoi du code n’est pas encore disponible. Réessayez plus tard.', 501);
}

export async function logout(): Promise<void> {
  if (isDemoMode) return;
  // TODO API: POST /auth/logout puis suppression des cookies de session.
}
