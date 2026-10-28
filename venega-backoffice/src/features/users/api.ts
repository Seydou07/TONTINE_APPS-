/**
 * Utilisateurs (vue admin). Données mock locales tant que l'API admin n'existe pas.
 */
import { db, clone, latency } from '@/mocks/db';
import { matchesQuery, paginate, type ListParams, type Paginated } from '@/lib/list';
import { recordLocalAction } from '@/features/audit/api';
import type { FraudAlert } from '@/features/alerts/types';
import type { AdminUser, KycStatus } from './types';

export type UserFilter = KycStatus | 'SUSPENDED';

// TODO API: GET /api/v1/admin/users?kycStatus=&accountStatus=&q=&page=&pageSize=
export async function listUsers(params: ListParams<UserFilter>): Promise<Paginated<AdminUser>> {
  await latency();
  const items = db.users
    .filter((u) => {
      if (!params.status || params.status === 'ALL') return true;
      if (params.status === 'SUSPENDED') return u.accountStatus === 'SUSPENDED';
      return u.kycStatus === params.status;
    })
    .filter((u) => matchesQuery(params.q, u.displayName, u.phoneNumber, u.city, u.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return clone(paginate(items, params.page, params.pageSize));
}

export interface UserDetail {
  user: AdminUser;
  circles: { id: string; name: string; role: string }[];
  openAlerts: FraudAlert[];
}

// TODO API: GET /api/v1/admin/users/:id  (avec cercles et alertes ouvertes)
export async function getUserDetail(id: string): Promise<UserDetail | null> {
  await latency(120);
  const user = db.users.find((u) => u.id === id);
  if (!user) return null;
  const circles = db.circles.flatMap((c) =>
    c.members.filter((m) => m.userId === id).map((m) => ({ id: c.id, name: c.name, role: m.role })),
  );
  const openAlerts = db.alerts.filter((a) => a.status === 'OPEN' && a.subjects.some((s) => s.kind === 'user' && s.id === id));
  return clone({ user, circles, openAlerts });
}

// TODO API: POST /api/v1/admin/users/:id/suspend  { reason }
export async function suspendUser(id: string, reason: string): Promise<AdminUser> {
  await latency();
  const u = db.users.find((x) => x.id === id);
  if (!u) throw new Error('Utilisateur introuvable.');
  const clean = reason.trim();
  if (clean.length < 5) throw new Error('Le motif de suspension est obligatoire (5 caractères minimum).');
  u.accountStatus = 'SUSPENDED';
  u.suspensionReason = clean;
  recordLocalAction({ action: 'Compte suspendu', targetType: 'user', targetLabel: u.displayName, detail: clean });
  return clone(u);
}

// TODO API: POST /api/v1/admin/users/:id/reactivate
export async function reactivateUser(id: string): Promise<AdminUser> {
  await latency();
  const u = db.users.find((x) => x.id === id);
  if (!u) throw new Error('Utilisateur introuvable.');
  u.accountStatus = 'ACTIVE';
  u.suspensionReason = undefined;
  recordLocalAction({ action: 'Compte réactivé', targetType: 'user', targetLabel: u.displayName });
  return clone(u);
}
