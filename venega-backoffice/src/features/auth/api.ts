/**
 * Authentification admin.
 *
 * L'API n'expose pas encore d'authentification admin. En attendant, un « mode démo »
 * permet d'ouvrir le backoffice sans aucun identifiant codé en dur :
 *  - actif automatiquement en développement (`next dev`) ;
 *  - en production uniquement si NEXT_PUBLIC_ADMIN_DEMO=1 (voir .env.example).
 *
 * Ce garde côté navigateur n'est PAS une protection : toute la sécurité devra être
 * portée par l'API (JWT admin, rôles, journalisation côté serveur).
 */

const SESSION_KEY = 'venega_admin_session';

export interface AdminSession {
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'MODERATOR';
  mode: 'demo';
}

export function isDemoLoginEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ADMIN_DEMO === '1';
}

export class LoginError extends Error {}

// TODO API: POST /api/v1/admin/auth/login  { email, password } -> { accessToken, admin }
export async function signIn(email: string, _password: string): Promise<AdminSession> {
  if (!isDemoLoginEnabled()) {
    throw new LoginError(
      "La connexion administrateur n'est pas encore branchée sur l'API. Contactez l'équipe technique.",
    );
  }
  await new Promise((r) => setTimeout(r, 300));
  const local = email.split('@')[0] ?? 'admin';
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join(' ');
  const session: AdminSession = { email, name: name || 'Administrateur', role: 'SUPER_ADMIN', mode: 'demo' };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* stockage indisponible : la session ne survivra pas au rechargement */
  }
  return session;
}

export function getSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

// TODO API: POST /api/v1/admin/auth/logout
export function signOut(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* rien */
  }
}

/** Nom affiché dans le journal pour les actions faites depuis ce navigateur. */
export function currentActorName(): string {
  return getSession()?.name ?? 'Administrateur';
}
