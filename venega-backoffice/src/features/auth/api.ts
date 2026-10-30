/**
 * Authentification admin.
 *
 * L'API n'expose pas encore d'authentification admin. En attendant, un « mode démo »
 * permet d'ouvrir le backoffice sans aucun identifiant codé en dur :
 *  - actif automatiquement en développement (`next dev`) ;
 *  - en production uniquement si NEXT_PUBLIC_ADMIN_DEMO=1 (voir .env.example).
 *
 * En mode démo, le rôle est choisi à la connexion pour tester le moindre privilège.
 * Ce garde côté navigateur n'est PAS une protection : toute la sécurité devra être
 * portée par l'API (JWT admin, rôles vérifiés sur chaque route, journalisation côté serveur).
 */
import { ForbiddenError, roleCan, type AdminRole, type Permission } from './permissions';

const SESSION_KEY = 'venega_admin_session';

export interface AdminSession {
  email: string;
  name: string;
  role: AdminRole;
  mode: 'demo';
}

export function isDemoLoginEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ADMIN_DEMO === '1';
}

export class LoginError extends Error {}

function save(session: AdminSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* stockage indisponible : la session ne survivra pas au rechargement */
  }
}

// TODO API: POST /api/v1/admin/auth/login  { email, password } -> { accessToken, admin: { id, name, role } }
export async function signIn(email: string, _password: string, role: AdminRole = 'SUPER_ADMIN'): Promise<AdminSession> {
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
  const session: AdminSession = { email, name: name || 'Administrateur', role, mode: 'demo' };
  save(session);
  return session;
}

export function getSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AdminSession;
    // Anciennes sessions (rôle MODERATOR) : ramenées au rôle Support.
    if (!['SUPER_ADMIN', 'SUPPORT', 'KYC_AGENT', 'FINANCE'].includes(s.role)) s.role = 'SUPPORT';
    return s;
  } catch {
    return null;
  }
}

/** Mode démo uniquement : changer de rôle sans se reconnecter, pour tester les droits. */
export function switchDemoRole(role: AdminRole): AdminSession | null {
  const s = getSession();
  if (!s) return null;
  const next = { ...s, role };
  save(next);
  return next;
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

export function currentRole(): AdminRole | undefined {
  return getSession()?.role;
}

/**
 * Contrôle de permission dans la couche mock (simule le 403 de l'API).
 * L'API devra faire ce contrôle côté serveur : voir permissions.ts.
 */
export function assertCan(permission: Permission): void {
  if (!roleCan(currentRole(), permission)) throw new ForbiddenError();
}
