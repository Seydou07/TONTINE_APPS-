/**
 * Paiements Mobile Money, rapprochement manuel et remboursements.
 * Données mock locales tant que l'API admin n'existe pas.
 *
 * Règles que l'API devra reproduire côté serveur :
 *  - un rattachement manuel exige la référence opérateur exacte ET un motif ; il ne modifie
 *    jamais le montant ; il est refusé si la cotisation est déjà payée ;
 *  - le serveur revérifie le statut du paiement auprès de CinetPay avant tout rattachement ;
 *  - remboursement : principe des quatre yeux (celui qui approuve ≠ celui qui demande) — TODO API,
 *    non simulé ici car la démo n'a qu'un seul utilisateur.
 */
import { db, clone, latency, newId, refreshCircle } from '@/mocks/db';
import { matchesQuery, paginate, type ListParams, type Paginated } from '@/lib/list';
import { phoneMatches } from '@/lib/phone';
import { formatXOF } from '@/lib/format';
import { assertCan, currentActorName } from '@/features/auth/api';
import { recordLocalAction } from '@/features/audit/api';
import { REFUND_STATUS_LABEL, type Payment, type PaymentStatus, type Refund, type RefundStatus } from './types';

export type PaymentFilter = PaymentStatus | 'UNMATCHED' | 'OUT';

export interface PaymentListParams extends ListParams<PaymentFilter> {
  userId?: string;
  circleId?: string;
}

export const isUnmatched = (p: Payment) => p.direction === 'IN' && p.status === 'COMPLETED' && !p.matched;

// TODO API: GET /api/v1/admin/payments?status=&unmatched=true&direction=&userId=&circleId=&q=&page=&pageSize=
export async function listPayments(params: PaymentListParams): Promise<Paginated<Payment>> {
  await latency();
  const items = db.payments
    .filter((p) => !params.userId || p.userId === params.userId)
    .filter((p) => !params.circleId || p.circleId === params.circleId)
    .filter((p) => {
      const s = params.status;
      if (!s || s === 'ALL') return true;
      if (s === 'UNMATCHED') return isUnmatched(p);
      if (s === 'OUT') return p.direction === 'OUT';
      return p.status === s;
    })
    .filter(
      (p) =>
        (params.q && phoneMatches(params.q, p.payerPhone)) ||
        matchesQuery(params.q, p.reference, p.providerReference, p.userName, p.circleName, p.payerPhone),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return clone(paginate(items, params.page, params.pageSize));
}

// TODO API: GET /api/v1/admin/payments/counts
export async function getPaymentCounts() {
  await latency(80);
  const unmatched = db.payments.filter(isUnmatched);
  const dayAgo = Date.now() - 86_400_000;
  return {
    UNMATCHED: unmatched.length,
    unmatchedAmount: unmatched.reduce((n, p) => n + p.amount, 0),
    PENDING: db.payments.filter((p) => p.status === 'PENDING').length,
    FAILED: db.payments.filter((p) => p.status === 'FAILED').length,
    failedLast24h: db.payments.filter((p) => p.status === 'FAILED' && new Date(p.createdAt).getTime() >= dayAgo).length,
    refundsOpen: db.refunds.filter((r) => r.status === 'REQUESTED' || r.status === 'APPROVED').length,
  };
}

export interface MatchCandidate {
  circleId: string;
  circleName: string;
  userId: string;
  userName: string;
  phoneNumber: string;
  turn: number;
  amount: number;
  status: 'LATE' | 'PENDING';
  dueDate: string;
  /** Pourquoi cette cotisation est proposée */
  hint: string;
  score: number;
}

/**
 * Cotisations impayées qui pourraient correspondre au paiement : même personne, même cercle,
 * même montant. L'agent peut aussi chercher un membre par nom ou numéro.
 */
// TODO API: GET /api/v1/admin/payments/:id/match-candidates?q=
export async function getMatchCandidates(paymentId: string, q?: string): Promise<MatchCandidate[]> {
  await latency(120);
  const p = db.payments.find((x) => x.id === paymentId);
  if (!p) throw new Error('Paiement introuvable.');
  const out: MatchCandidate[] = [];
  for (const cell of db.contributions) {
    if (cell.status !== 'LATE' && cell.status !== 'PENDING') continue;
    const c = db.circles.find((x) => x.id === cell.circleId)!;
    const m = c.members.find((x) => x.userId === cell.userId)!;
    const hints: string[] = [];
    let score = 0;
    if (p.userId && p.userId === cell.userId) { score += 5; hints.push('même compte'); }
    if (phoneMatches(p.payerPhone, m.phoneNumber)) { score += 4; hints.push('même numéro'); }
    if (p.circleId && p.circleId === cell.circleId) { score += 3; hints.push('même cercle'); }
    if (p.amount === cell.amount) { score += 2; hints.push('même montant'); }
    const searched = q?.trim() ? phoneMatches(q, m.phoneNumber) || matchesQuery(q, m.name, c.name, c.inviteCode) : false;
    if (q?.trim() ? !searched : score < 4) continue;
    out.push({
      circleId: c.id, circleName: c.name, userId: m.userId, userName: m.name, phoneNumber: m.phoneNumber, turn: cell.turn,
      amount: cell.amount, status: cell.status, dueDate: cell.dueDate, hint: hints.join(', ') || 'recherche', score,
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 12);
}

export interface ReconcileInput {
  paymentId: string;
  circleId: string;
  userId: string;
  turn: number;
  /** Référence opérateur dictée par l'utilisateur, doit être identique à celle reçue de l'opérateur */
  providerReference: string;
  reason: string;
}

// TODO API: POST /api/v1/admin/payments/:id/reconcile  { circleId, userId, turn, providerReference, reason }
export async function reconcilePayment(input: ReconcileInput): Promise<Payment> {
  await latency();
  assertCan('payment.reconcile');
  const p = db.payments.find((x) => x.id === input.paymentId);
  if (!p) throw new Error('Paiement introuvable.');
  if (!isUnmatched(p)) throw new Error('Ce paiement n’est pas à rapprocher (déjà rattaché, en attente ou échoué).');
  const reason = input.reason.trim();
  if (reason.length < 10) throw new Error('Le motif est obligatoire (10 caractères minimum).');
  const norm = (s: string) => s.replace(/\s/g, '').toUpperCase();
  if (!p.providerReference || norm(p.providerReference) !== norm(input.providerReference)) {
    throw new Error('La référence opérateur saisie ne correspond pas à celle du paiement reçu.');
  }
  const cell = db.contributions.find((x) => x.circleId === input.circleId && x.userId === input.userId && x.turn === input.turn);
  if (!cell) throw new Error('Cotisation introuvable.');
  if (cell.paidAt) throw new Error('Cette cotisation est déjà payée : proposez plutôt un remboursement.');
  if (cell.amount !== p.amount) {
    throw new Error(`Montant différent (${formatXOF(p.amount)} reçu, ${formatXOF(cell.amount)} attendu). Demandez un complément ou un remboursement.`);
  }
  const c = db.circles.find((x) => x.id === input.circleId)!;
  if (c.status === 'FROZEN') throw new Error('Cercle gelé : dégelez-le avant de rattacher un paiement.');
  const m = c.members.find((x) => x.userId === input.userId)!;
  const paidAt = p.confirmedAt ?? p.createdAt;
  cell.status = new Date(paidAt).getTime() <= new Date(cell.dueDate).getTime() ? 'PAID' : 'PAID_LATE';
  cell.paidAt = paidAt;
  cell.paymentId = p.id;
  const now = new Date().toISOString();
  p.matched = true;
  p.userId = m.userId;
  p.userName = m.name;
  p.circleId = c.id;
  p.circleName = c.name;
  p.turn = cell.turn;
  p.matchedBy = currentActorName();
  p.matchedAt = now;
  p.matchNote = reason;
  refreshCircle(c.id);
  db.circleEvents.push({
    id: newId('ev'), circleId: c.id, at: now, actor: `${currentActorName()} (Venega)`, tone: 'green',
    label: `Paiement rattaché manuellement — ${m.name}, tour ${cell.turn}`, detail: `${p.reference} · réf. opérateur ${p.providerReference}. Motif : ${reason}`,
  });
  db.notifications.unshift({ id: newId('nt'), userId: m.userId, type: 'PAYMENT_RECEIVED', title: `Cotisation enregistrée — ${c.name} (tour ${cell.turn})`, channel: 'SMS', status: 'SENT', circleId: c.id, sentAt: now, byAdmin: currentActorName() });
  recordLocalAction({
    action: 'Paiement rattaché manuellement', targetType: 'payment', targetId: p.id, targetLabel: `${p.reference} · ${formatXOF(p.amount)}`,
    reason, before: 'Non rattaché', after: `${m.name} · ${c.name} · tour ${cell.turn}`, relatedIds: [m.userId, c.id],
  });
  return clone(p);
}

/* ── Remboursements ───────────────────────────────────────────────────── */

// TODO API: GET /api/v1/admin/refunds?status=&userId=&q=&page=&pageSize=
export async function listRefunds(params: ListParams<RefundStatus> & { userId?: string }): Promise<Paginated<Refund>> {
  await latency();
  const items = db.refunds
    .filter((r) => !params.userId || r.userId === params.userId)
    .filter((r) => !params.status || params.status === 'ALL' || r.status === params.status)
    .filter((r) => matchesQuery(params.q, r.userName, r.paymentReference, r.providerReference, r.destination))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return clone(paginate(items, params.page, params.pageSize));
}

// TODO API: POST /api/v1/admin/refunds  { paymentId, reason }
export async function requestRefund(paymentId: string, reason: string): Promise<Refund> {
  await latency();
  assertCan('refund.request');
  const p = db.payments.find((x) => x.id === paymentId);
  if (!p) throw new Error('Paiement introuvable.');
  if (p.direction !== 'IN' || p.status !== 'COMPLETED') throw new Error('Seul un paiement reçu et confirmé peut être remboursé.');
  if (db.refunds.some((r) => r.paymentId === p.id && r.status !== 'REJECTED')) throw new Error('Un remboursement existe déjà pour ce paiement.');
  const clean = reason.trim();
  if (clean.length < 10) throw new Error('Le motif est obligatoire (10 caractères minimum).');
  const now = new Date().toISOString();
  const actor = currentActorName();
  const refund: Refund = {
    id: newId('rf'), paymentId: p.id, paymentReference: p.reference, providerReference: p.providerReference, provider: p.provider,
    userId: p.userId, userName: p.userName ?? 'Payeur sans compte', destination: p.payerPhone, amount: p.amount, reason: clean,
    status: 'REQUESTED', createdAt: now, history: [{ at: now, by: actor, status: 'REQUESTED', note: clean }],
  };
  db.refunds.unshift(refund);
  if (isUnmatched(p)) {
    p.matched = true;
    p.matchedBy = actor;
    p.matchedAt = now;
    p.matchNote = 'Remboursement demandé';
  }
  recordLocalAction({
    action: 'Remboursement demandé', targetType: 'refund', targetId: refund.id, targetLabel: `${refund.userName} · ${formatXOF(refund.amount)}`,
    reason: clean, after: 'Demandé', relatedIds: [p.userId ?? '', p.id, p.circleId ?? ''],
  });
  return clone(refund);
}

export type RefundDecision = 'APPROVE' | 'REJECT' | 'MARK_PAID';

const NEXT: Record<RefundDecision, { from: RefundStatus[]; to: RefundStatus }> = {
  APPROVE: { from: ['REQUESTED'], to: 'APPROVED' },
  REJECT: { from: ['REQUESTED', 'APPROVED'], to: 'REJECTED' },
  MARK_PAID: { from: ['APPROVED'], to: 'PAID' },
};

// TODO API: POST /api/v1/admin/refunds/:id/approve | /reject | /execute  { note }  (execute = cash-out CinetPay)
export async function decideRefund(id: string, decision: RefundDecision, note: string): Promise<Refund> {
  await latency();
  assertCan('refund.decide');
  const r = db.refunds.find((x) => x.id === id);
  if (!r) throw new Error('Remboursement introuvable.');
  const rule = NEXT[decision];
  if (!rule.from.includes(r.status)) throw new Error('Action impossible pour ce statut.');
  const clean = note.trim();
  if (clean.length < 5) throw new Error('Le motif est obligatoire (5 caractères minimum).');
  const before = r.status;
  const now = new Date().toISOString();
  r.status = rule.to;
  r.history.push({ at: now, by: currentActorName(), status: rule.to, note: clean });
  if (decision === 'MARK_PAID') {
    db.payments.unshift({
      id: newId('pay'), reference: db.nextPaymentReference(), provider: r.provider, direction: 'OUT', purpose: 'REFUND',
      payerPhone: r.destination, userId: r.userId, userName: r.userName, amount: r.amount, status: 'PENDING', createdAt: now, matched: true,
    });
  }
  recordLocalAction({
    action: `Remboursement ${REFUND_STATUS_LABEL[rule.to].toLowerCase()}`, targetType: 'refund', targetId: r.id,
    targetLabel: `${r.userName} · ${formatXOF(r.amount)}`, reason: clean, before: REFUND_STATUS_LABEL[before], after: REFUND_STATUS_LABEL[rule.to],
    relatedIds: [r.userId ?? '', r.paymentId],
  });
  return clone(r);
}
