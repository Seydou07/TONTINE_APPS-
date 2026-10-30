/**
 * Utilisateurs (vue admin) : liste, fiche 360° et actions de support.
 * Données mock locales tant que l'API admin n'existe pas.
 *
 * Règles que l'API devra reproduire côté serveur :
 *  - l'admin ne saisit JAMAIS de mot de passe : il déclenche l'envoi d'un code à l'utilisateur ;
 *  - le changement de numéro exige un KYC vérifié + la vérification du numéro de pièce ;
 *  - chaque action est journalisée avec motif, avant / après.
 */
import { db, clone, latency, refreshCircle } from '@/mocks/db';
import { matchesQuery, paginate, type ListParams, type Paginated } from '@/lib/list';
import { phoneMatches, toE164BF } from '@/lib/phone';
import { formatPhone } from '@/lib/format';
import { assertCan } from '@/features/auth/api';
import { recordLocalAction } from '@/features/audit/api';
import type { FraudAlert } from '@/features/alerts/types';
import type { KycSubmission } from '@/features/kyc/types';
import type { MemberRole, CircleKind, MemberStatus, MemberPaymentStatus } from '@/features/circles/types';
import type { AdminUser, KycStatus, UserSession } from './types';

export type UserFilter = KycStatus | 'SUSPENDED' | 'LOCKED' | 'UNVERIFIED_PHONE';

const isLocked = (u: AdminUser) => !!u.security.lockedUntil && new Date(u.security.lockedUntil).getTime() > Date.now();

// TODO API: GET /api/v1/admin/users?kycStatus=&accountStatus=&locked=&q=&page=&pageSize=
export async function listUsers(params: ListParams<UserFilter>): Promise<Paginated<AdminUser>> {
  await latency();
  const items = db.users
    .filter((u) => {
      if (!params.status || params.status === 'ALL') return true;
      if (params.status === 'SUSPENDED') return u.accountStatus === 'SUSPENDED';
      if (params.status === 'LOCKED') return isLocked(u);
      if (params.status === 'UNVERIFIED_PHONE') return !u.security.phoneVerified;
      return u.kycStatus === params.status;
    })
    .filter((u) => (params.q && phoneMatches(params.q, u.phoneNumber)) || matchesQuery(params.q, u.displayName, u.phoneNumber, u.city, u.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return clone(paginate(items, params.page, params.pageSize));
}

export interface UserCircleRow {
  id: string;
  name: string;
  kind: CircleKind;
  role: MemberRole;
  memberStatus: MemberStatus;
  turnOrder?: number;
  currentTurn: number;
  paymentStatus: MemberPaymentStatus;
  lateCount: number;
  contribution: number;
}

export interface UserPayoutRow {
  circleId: string;
  circleName: string;
  turn: number;
  amount: number;
  status: string;
  paidAt?: string;
  dueDate: string;
  failureReason?: string;
}

export interface UserDetail {
  user: AdminUser;
  circles: UserCircleRow[];
  payouts: UserPayoutRow[];
  openAlerts: FraudAlert[];
  sessions: UserSession[];
  kyc: KycSubmission | null;
  counts: { payments: number; failedPayments: number; requests: number; tickets: number; notifications: number };
}

// TODO API: GET /api/v1/admin/users/:id  (profil, sécurité, cercles avec rôle et statut de paiement, versements, alertes, sessions, dernier KYC)
export async function getUserDetail(id: string): Promise<UserDetail | null> {
  await latency(120);
  const user = db.users.find((u) => u.id === id);
  if (!user) return null;
  const circles = db.circles.flatMap((c) =>
    c.members
      .filter((m) => m.userId === id)
      .map(
        (m): UserCircleRow => ({
          id: c.id, name: c.name, kind: c.kind, role: m.role, memberStatus: m.status, turnOrder: m.turnOrder,
          currentTurn: c.currentTurn, paymentStatus: m.paymentStatus, lateCount: m.lateCount, contribution: c.contribution,
        }),
      ),
  );
  const payouts = db.payouts
    .filter((p) => p.beneficiaryId === id)
    .map((p) => ({
      circleId: p.circleId, circleName: db.circles.find((c) => c.id === p.circleId)?.name ?? p.circleId, turn: p.turn,
      amount: p.amount, status: p.status, paidAt: p.paidAt, dueDate: p.dueDate, failureReason: p.failureReason,
    }));
  const openAlerts = db.alerts.filter((a) => a.status === 'OPEN' && a.subjects.some((s) => s.kind === 'user' && s.id === id));
  const kyc = [...db.kycSubmissions].filter((k) => k.userId === id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0] ?? null;
  const pays = db.payments.filter((p) => p.userId === id);
  return clone({
    user,
    circles,
    payouts,
    openAlerts,
    sessions: db.sessions.filter((s) => s.userId === id).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt)),
    kyc,
    counts: {
      payments: pays.length,
      failedPayments: pays.filter((p) => p.status === 'FAILED').length,
      requests: db.requests.filter((r) => r.userId === id).length,
      tickets: db.tickets.filter((t) => t.userId === id && t.status !== 'RESOLVED').length,
      notifications: db.notifications.filter((n) => n.userId === id).length,
    },
  });
}

function findUser(id: string): AdminUser {
  const u = db.users.find((x) => x.id === id);
  if (!u) throw new Error('Utilisateur introuvable.');
  return u;
}

function requireReason(reason: string, min = 5): string {
  const clean = reason.trim();
  if (clean.length < min) throw new Error(`Le motif est obligatoire (${min} caractères minimum).`);
  return clean;
}

// TODO API: POST /api/v1/admin/users/:id/suspend  { reason }  (révoque aussi les sessions)
export async function suspendUser(id: string, reason: string): Promise<AdminUser> {
  await latency();
  assertCan('user.suspend');
  const u = findUser(id);
  const clean = requireReason(reason);
  if (u.accountStatus === 'SUSPENDED') throw new Error('Ce compte est déjà suspendu.');
  u.accountStatus = 'SUSPENDED';
  u.suspensionReason = clean;
  db.sessions = db.sessions.filter((s) => s.userId !== id);
  recordLocalAction({ action: 'Compte suspendu', targetType: 'user', targetId: id, targetLabel: u.displayName, reason: clean, before: 'Actif', after: 'Suspendu' });
  return clone(u);
}

// TODO API: POST /api/v1/admin/users/:id/reactivate  { reason }
export async function reactivateUser(id: string, reason: string): Promise<AdminUser> {
  await latency();
  assertCan('user.suspend');
  const u = findUser(id);
  const clean = requireReason(reason);
  u.accountStatus = 'ACTIVE';
  const previous = u.suspensionReason;
  u.suspensionReason = undefined;
  recordLocalAction({
    action: 'Compte réactivé', targetType: 'user', targetId: id, targetLabel: u.displayName, reason: clean,
    before: `Suspendu${previous ? ` (${previous})` : ''}`, after: 'Actif',
  });
  return clone(u);
}

// TODO API: POST /api/v1/admin/users/:id/resend-otp  (limite : 5 codes par 24 h, côté serveur)
export async function resendOtp(id: string): Promise<AdminUser> {
  await latency();
  assertCan('user.security');
  const u = findUser(id);
  if (u.security.otpSentLast24h >= 5) {
    throw new Error('Limite atteinte : 5 codes envoyés en 24 h. Vérifiez que le téléphone est allumé et capte le réseau, puis réessayez plus tard.');
  }
  const now = new Date().toISOString();
  u.security.otpSentLast24h += 1;
  u.security.lastOtpSentAt = now;
  u.security.lastOtpDelivery = 'PENDING';
  u.security.lastOtpError = undefined;
  db.notifications.unshift({ id: `nt-${Date.now()}`, userId: id, type: 'OTP', title: 'Code de vérification (renvoyé par le support)', channel: 'SMS', status: 'SENT', sentAt: now, byAdmin: 'support' });
  recordLocalAction({ action: 'Code SMS renvoyé', targetType: 'user', targetId: id, targetLabel: u.displayName, detail: `Envoyé au ${formatPhone(u.phoneNumber)}` });
  return clone(u);
}

// TODO API: POST /api/v1/admin/users/:id/unlock  { reason }  (remet le compteur d'échecs à zéro)
export async function unlockUser(id: string, reason: string): Promise<AdminUser> {
  await latency();
  assertCan('user.security');
  const u = findUser(id);
  const clean = requireReason(reason);
  const before = `${u.security.failedLoginAttempts} échec(s)${u.security.lockedUntil ? ', verrouillé' : ''}`;
  u.security.failedLoginAttempts = 0;
  u.security.lockedUntil = undefined;
  recordLocalAction({ action: 'Compte déverrouillé', targetType: 'user', targetId: id, targetLabel: u.displayName, reason: clean, before, after: '0 échec, déverrouillé' });
  return clone(u);
}

/**
 * Envoie un code de réinitialisation par SMS au numéro du compte.
 * L'admin ne voit ni ne choisit jamais le mot de passe.
 */
// TODO API: POST /api/v1/admin/users/:id/password-reset  { reason }  -> envoi d'un code à usage unique (10 min)
export async function sendPasswordReset(id: string, reason: string): Promise<AdminUser> {
  await latency();
  assertCan('user.security');
  const u = findUser(id);
  const clean = requireReason(reason);
  const now = new Date().toISOString();
  u.security.passwordResetSentAt = now;
  db.notifications.unshift({ id: `nt-${Date.now()}`, userId: id, type: 'PASSWORD_RESET', title: 'Code de réinitialisation du mot de passe', channel: 'SMS', status: 'SENT', sentAt: now, byAdmin: 'support' });
  recordLocalAction({ action: 'Réinitialisation du mot de passe envoyée', targetType: 'user', targetId: id, targetLabel: u.displayName, reason: clean, detail: `Code envoyé par SMS au ${formatPhone(u.phoneNumber)}` });
  return clone(u);
}

// TODO API: POST /api/v1/admin/users/:id/logout-all  { reason }  (révoque tous les jetons de rafraîchissement)
export async function logoutAllSessions(id: string, reason: string): Promise<number> {
  await latency();
  assertCan('user.security');
  const u = findUser(id);
  const clean = requireReason(reason);
  const count = db.sessions.filter((s) => s.userId === id).length;
  db.sessions = db.sessions.filter((s) => s.userId !== id);
  recordLocalAction({ action: 'Toutes les sessions déconnectées', targetType: 'user', targetId: id, targetLabel: u.displayName, reason: clean, before: `${count} session(s)`, after: '0 session' });
  return count;
}

export interface PhoneChangeInput {
  newPhone: string;
  /** Numéro de pièce dicté par l'appelant, comparé à celui du KYC validé */
  documentNumber: string;
  reason: string;
}

/**
 * Perte de SIM / changement de numéro.
 * Conditions : KYC vérifié, numéro de pièce identique au KYC, nouveau numéro libre.
 * Effets : sessions révoquées, SMS de confirmation au nouveau numéro, trace avant / après.
 */
// TODO API: POST /api/v1/admin/users/:id/change-phone  { newPhone, documentNumber, reason }
export async function changePhone(id: string, input: PhoneChangeInput): Promise<AdminUser> {
  await latency();
  assertCan('user.changePhone');
  const u = findUser(id);
  const clean = requireReason(input.reason, 10);
  if (u.kycStatus !== 'VERIFIED') throw new Error('Identité non vérifiée : le KYC doit être validé avant tout changement de numéro.');
  const kyc = db.kycSubmissions.find((k) => k.userId === id && k.status === 'VERIFIED');
  const norm = (s: string) => s.replace(/[\s-]/g, '').toUpperCase();
  if (!kyc || norm(kyc.documentNumber) !== norm(input.documentNumber)) {
    throw new Error('Le numéro de pièce donné ne correspond pas au KYC. Changement refusé.');
  }
  const next = toE164BF(input.newPhone);
  if (!next) throw new Error('Numéro invalide : 8 chiffres attendus après +226.');
  if (next === u.phoneNumber) throw new Error('C’est déjà le numéro du compte.');
  if (db.users.some((x) => x.phoneNumber === next)) throw new Error('Ce numéro est déjà utilisé par un autre compte.');
  const before = u.phoneNumber;
  u.phoneHistory.unshift({ from: before, to: next, at: new Date().toISOString(), by: 'Support', reason: clean });
  u.phoneNumber = next;
  if (u.mobileMoneyNumber === before) u.mobileMoneyNumber = next;
  db.sessions = db.sessions.filter((s) => s.userId !== id);
  for (const c of db.circles) {
    const m = c.members.find((x) => x.userId === id);
    if (m) {
      m.phoneNumber = next;
      refreshCircle(c.id);
    }
  }
  db.notifications.unshift({ id: `nt-${Date.now()}`, userId: id, type: 'SECURITY', title: 'Votre numéro Venega a été modifié par le support', channel: 'SMS', status: 'SENT', sentAt: new Date().toISOString(), byAdmin: 'support' });
  recordLocalAction({
    action: 'Numéro de téléphone changé', targetType: 'user', targetId: id, targetLabel: u.displayName, reason: clean,
    before: formatPhone(before), after: formatPhone(next), detail: 'Identité vérifiée par le numéro de pièce. Sessions révoquées.',
  });
  return clone(u);
}
