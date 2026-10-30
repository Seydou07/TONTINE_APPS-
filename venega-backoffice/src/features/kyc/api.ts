/**
 * Couche d'accès KYC. Données mock locales tant que l'API admin n'existe pas.
 * Les écrans n'importent QUE ce fichier : brancher l'API = remplacer le corps des fonctions.
 */
import { db, clone, latency, newId } from '@/mocks/db';
import { matchesQuery, paginate, type ListParams, type Paginated } from '@/lib/list';
import { assertCan, currentActorName } from '@/features/auth/api';
import { recordLocalAction } from '@/features/audit/api';
import type { KycDecision, KycReviewStatus, KycStats, KycSubmission } from './types';

const WEEK_MS = 7 * 24 * 3600_000;

// TODO API: GET /api/v1/admin/kyc/submissions?status=PENDING&q=&page=&pageSize=
export async function listKycSubmissions(params: ListParams<KycReviewStatus>): Promise<Paginated<KycSubmission>> {
  await latency();
  const status = params.status ?? 'PENDING';
  const items = db.kycSubmissions
    .filter((s) => status === 'ALL' || s.status === status)
    .filter((s) => matchesQuery(params.q, s.userName, s.phoneNumber, s.documentNumber, s.city))
    // File d'attente : les dossiers signalés d'abord, puis les plus anciens.
    .sort((a, b) => b.flags.length - a.flags.length || a.submittedAt.localeCompare(b.submittedAt));
  return clone(paginate(items, params.page, params.pageSize));
}

// TODO API: GET /api/v1/admin/kyc/submissions/:id
export async function getKycSubmission(id: string): Promise<KycSubmission | null> {
  await latency(120);
  const s = db.kycSubmissions.find((x) => x.id === id);
  return s ? clone(s) : null;
}

// TODO API: GET /api/v1/admin/kyc/stats
export async function getKycStats(): Promise<KycStats> {
  await latency(120);
  const since = Date.now() - WEEK_MS;
  const recent = db.kycDecisions.filter((d) => new Date(d.decidedAt).getTime() >= since);
  return {
    pending: db.kycSubmissions.filter((s) => s.status === 'PENDING').length,
    verifiedLast7d: recent.filter((d) => d.decision === 'VERIFIED').length,
    rejectedLast7d: recent.filter((d) => d.decision === 'REJECTED').length,
    flagged: db.kycSubmissions.filter((s) => s.status === 'PENDING' && s.flags.length > 0).length,
  };
}

// TODO API: GET /api/v1/admin/kyc/decisions?q=&page=&pageSize=
export async function listKycDecisions(params: ListParams<'VERIFIED' | 'REJECTED'>): Promise<Paginated<KycDecision>> {
  await latency();
  const items = db.kycDecisions
    .filter((d) => !params.status || params.status === 'ALL' || d.decision === params.status)
    .filter((d) => matchesQuery(params.q, d.userName, d.documentNumber, d.decidedBy, d.reason))
    .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));
  return clone(paginate(items, params.page, params.pageSize));
}

function decide(id: string, decision: 'VERIFIED' | 'REJECTED', reason?: string): KycSubmission {
  assertCan('kyc.decide');
  const s = db.kycSubmissions.find((x) => x.id === id);
  if (!s) throw new Error('Dossier KYC introuvable.');
  if (s.status !== 'PENDING') throw new Error('Ce dossier a déjà été traité.');
  const now = new Date().toISOString();
  const actor = currentActorName();
  s.status = decision;
  s.reviewedAt = now;
  s.reviewedBy = actor;
  s.rejectionReason = reason;
  const user = db.users.find((u) => u.id === s.userId);
  if (user) user.kycStatus = decision;
  db.kycDecisions.unshift({
    id: newId('dec'),
    submissionId: s.id,
    userId: s.userId,
    userName: s.userName,
    documentNumber: s.documentNumber,
    decision,
    reason,
    decidedBy: actor,
    decidedAt: now,
    localOnly: true,
  });
  recordLocalAction({
    action: decision === 'VERIFIED' ? 'KYC validé' : 'KYC refusé',
    targetType: 'kyc',
    targetId: s.userId,
    targetLabel: s.userName,
    reason,
    before: 'En attente',
    after: decision === 'VERIFIED' ? 'Vérifié' : 'Refusé',
  });
  db.notifications.unshift({
    id: newId('nt'), userId: s.userId, type: 'KYC_DECISION', channel: 'PUSH', status: 'SENT', sentAt: now, byAdmin: actor,
    title: decision === 'VERIFIED' ? 'Identité vérifiée' : 'Vérification d’identité refusée',
  });
  return clone(s);
}

// TODO API: POST /api/v1/admin/kyc/submissions/:id/approve
export async function approveKyc(id: string): Promise<KycSubmission> {
  await latency();
  return decide(id, 'VERIFIED');
}

// TODO API: POST /api/v1/admin/kyc/submissions/:id/reject  { reason }
export async function rejectKyc(id: string, reason: string): Promise<KycSubmission> {
  await latency();
  const clean = reason.trim();
  if (clean.length < 5) throw new Error('Le motif de refus est obligatoire (5 caractères minimum).');
  return decide(id, 'REJECTED', clean);
}
