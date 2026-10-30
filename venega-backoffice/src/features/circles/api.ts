/**
 * Cercles (tontines et caisses de solidarité) : liste, fiche 360° et actions de support.
 * Données mock locales tant que l'API admin n'existe pas.
 *
 * Règles que l'API devra reproduire côté serveur :
 *  - un cercle gelé (FROZEN) refuse toute cotisation, tout versement et tout décaissement ;
 *  - chaque action admin est journalisée (motif, avant / après) et ajoutée à la chronologie du cercle ;
 *  - les membres concernés sont notifiés.
 */
import { db, clone, latency, newId, refreshCircle } from '@/mocks/db';
import { matchesQuery, paginate, type ListParams, type Paginated } from '@/lib/list';
import { formatXOF } from '@/lib/format';
import { assertCan, currentActorName } from '@/features/auth/api';
import { recordLocalAction } from '@/features/audit/api';
import {
  CIRCLE_STATUS_LABEL,
  REQUEST_TYPE_LABEL,
  roleLabel,
  type AdminCircle,
  type CircleDetail,
  type CircleEvent,
  type CircleKind,
  type CircleRequest,
  type CircleRequestStatus,
  type CircleRequestType,
} from './types';

export type CircleListItem = Omit<AdminCircle, 'members'>;
export type CircleFilter = CircleKind | 'LATE' | 'OVERDUE_PAYOUT' | 'FROZEN' | 'OPEN_REQUESTS' | 'SOLIDARITY_ACTION';

/** Caisse avec une aide approuvée non décaissée ou un vote bloqué (échéance passée). */
function solidarityNeedsAction(circleId: string) {
  const now = Date.now();
  return db.solidarityRequests.some((r) => r.circleId === circleId && (r.status === 'APPROVED' || (r.status === 'VOTING' && new Date(r.voteDeadline).getTime() < now)));
}

const DAY = 86_400_000;

function openRequests(circleId: string) {
  return db.requests.filter((r) => r.circleId === circleId && (r.status === 'PENDING' || (r.type === 'EXCLUSION' && r.contested && r.status === 'APPROVED')));
}

// TODO API: GET /api/v1/admin/circles?type=&status=&late=true&overduePayout=true&q=&page=&pageSize=
export async function listCircles(params: ListParams<CircleFilter>): Promise<Paginated<CircleListItem & { openRequests: number }>> {
  await latency();
  const items = db.circles
    .filter((c) => {
      const s = params.status;
      if (!s || s === 'ALL') return true;
      if (s === 'LATE') return c.latePayments > 0;
      if (s === 'OVERDUE_PAYOUT') return c.overduePayouts > 0;
      if (s === 'FROZEN') return c.status === 'FROZEN';
      if (s === 'OPEN_REQUESTS') return openRequests(c.id).length > 0;
      if (s === 'SOLIDARITY_ACTION') return solidarityNeedsAction(c.id);
      return c.kind === s;
    })
    .filter((c) => matchesQuery(params.q, c.name, c.founderName, c.inviteCode, ...c.members.map((m) => m.name)))
    .sort((a, b) => b.overduePayouts - a.overduePayouts || b.latePayments - a.latePayments || b.createdAt.localeCompare(a.createdAt))
    .map(({ members: _members, ...rest }) => ({ ...rest, openRequests: openRequests(rest.id).length }));
  return clone(paginate(items, params.page, params.pageSize));
}

// TODO API: GET /api/v1/admin/circles/counts
export async function getCircleCounts(): Promise<Record<'LATE' | 'OVERDUE_PAYOUT' | 'FROZEN' | 'OPEN_REQUESTS' | 'SOLIDARITY_ACTION', number>> {
  await latency(80);
  return {
    LATE: db.circles.filter((c) => c.latePayments > 0).length,
    OVERDUE_PAYOUT: db.circles.filter((c) => c.overduePayouts > 0).length,
    FROZEN: db.circles.filter((c) => c.status === 'FROZEN').length,
    OPEN_REQUESTS: db.circles.filter((c) => openRequests(c.id).length > 0).length,
    SOLIDARITY_ACTION: db.circles.filter((c) => solidarityNeedsAction(c.id)).length,
  };
}

/**
 * Fiche 360° : membres, grille des cotisations (membres × tours), versements, demandes,
 * historique de l'ordre de passage, solidarité (demandes, votes, grand livre), chronologie.
 */
// TODO API: GET /api/v1/admin/circles/:id  (+ /contributions, /payouts, /requests, /turn-order-history, /events, /solidarity)
export async function getCircle(id: string): Promise<CircleDetail | null> {
  await latency(120);
  const c = db.circles.find((x) => x.id === id);
  if (!c) return null;
  const detail: CircleDetail = {
    ...c,
    contributions: db.contributions.filter((x) => x.circleId === id),
    payouts: db.payouts.filter((x) => x.circleId === id).sort((a, b) => a.turn - b.turn),
    requests: db.requests.filter((x) => x.circleId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    orderChanges: db.orderChanges.filter((x) => x.circleId === id).sort((a, b) => b.at.localeCompare(a.at)),
    events: db.circleEvents.filter((x) => x.circleId === id).sort((a, b) => b.at.localeCompare(a.at)),
    solidarityRequests: db.solidarityRequests.filter((x) => x.circleId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ledger: db.ledger.filter((x) => x.circleId === id).sort((a, b) => b.at.localeCompare(a.at)),
  };
  return clone(detail);
}

// TODO API: GET /api/v1/admin/requests?type=&status=&userId=
export async function listUserRequests(userId: string): Promise<CircleRequest[]> {
  await latency(100);
  return clone(db.requests.filter((r) => r.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

/* ── Actions ──────────────────────────────────────────────────────────── */

function findCircle(id: string) {
  const c = db.circles.find((x) => x.id === id);
  if (!c) throw new Error('Cercle introuvable.');
  return c;
}

function requireReason(reason: string, min = 5): string {
  const clean = reason.trim();
  if (clean.length < min) throw new Error(`Le motif est obligatoire (${min} caractères minimum).`);
  return clean;
}

function event(circleId: string, e: Omit<CircleEvent, 'id' | 'circleId' | 'at' | 'actor'>) {
  db.circleEvents.push({ id: newId('ev'), circleId, at: new Date().toISOString(), actor: `${currentActorName()} (Venega)`, ...e });
}

function notifyMembers(circleId: string, title: string, onlyUserIds?: string[]) {
  const c = findCircle(circleId);
  const now = new Date().toISOString();
  for (const m of c.members.filter((x) => x.status === 'ACTIVE' && (!onlyUserIds || onlyUserIds.includes(x.userId)))) {
    db.notifications.unshift({ id: newId('nt'), userId: m.userId, type: 'MEMBERSHIP', title, channel: 'PUSH', status: 'SENT', circleId, sentAt: now, byAdmin: currentActorName() });
  }
}

// TODO API: POST /api/v1/admin/circles/:id/freeze    { reason }
// TODO API: POST /api/v1/admin/circles/:id/unfreeze  { reason }
export async function setCircleFrozen(id: string, frozen: boolean, reason: string): Promise<AdminCircle> {
  await latency();
  assertCan('circle.freeze');
  const c = findCircle(id);
  const clean = requireReason(reason);
  if (frozen && c.status === 'FROZEN') throw new Error('Ce cercle est déjà gelé.');
  if (!frozen && c.status !== 'FROZEN') throw new Error('Ce cercle n’est pas gelé.');
  if (frozen && c.status === 'COMPLETED') throw new Error('Un cercle terminé ne peut pas être gelé.');
  const before = CIRCLE_STATUS_LABEL[c.status];
  c.status = frozen ? 'FROZEN' : 'ACTIVE';
  c.frozenReason = frozen ? clean : undefined;
  c.frozenAt = frozen ? new Date().toISOString() : undefined;
  event(id, { label: frozen ? 'Cercle gelé par Venega' : 'Cercle dégelé par Venega', detail: clean, tone: frozen ? 'red' : 'green' });
  notifyMembers(id, frozen ? `Le cercle « ${c.name} » est gelé par Venega le temps d’une vérification` : `Le cercle « ${c.name} » est de nouveau actif`);
  recordLocalAction({ action: frozen ? 'Cercle gelé' : 'Cercle dégelé', targetType: 'circle', targetId: id, targetLabel: c.name, reason: clean, before, after: CIRCLE_STATUS_LABEL[c.status] });
  return clone(c);
}

// TODO API: POST /api/v1/admin/circles/:id/transfer-founder  { newFounderUserId, reason }
export async function transferFounder(id: string, newFounderId: string, reason: string): Promise<AdminCircle> {
  await latency();
  assertCan('circle.transferFounder');
  const c = findCircle(id);
  const clean = requireReason(reason, 10);
  const next = c.members.find((m) => m.userId === newFounderId && m.status === 'ACTIVE');
  if (!next) throw new Error('Le nouveau responsable doit être un membre actif du cercle.');
  if (next.userId === c.founderId) throw new Error('Ce membre est déjà responsable du cercle.');
  const user = db.users.find((u) => u.id === newFounderId);
  if (user?.accountStatus === 'SUSPENDED') throw new Error('Ce compte est suspendu.');
  const old = c.members.find((m) => m.userId === c.founderId);
  const label = roleLabel('PRESIDENT', c.kind);
  if (old) old.role = 'MEMBER';
  next.role = 'PRESIDENT';
  const beforeName = c.founderName;
  c.founderId = next.userId;
  c.founderName = next.name;
  event(id, { label: `Rôle de ${label.toLowerCase()} transféré`, detail: `${beforeName} → ${next.name}. Motif : ${clean}`, tone: 'amber' });
  notifyMembers(id, `${next.name} est désormais ${label.toLowerCase()} du cercle « ${c.name} »`);
  recordLocalAction({
    action: `Transfert du rôle de ${label.toLowerCase()}`, targetType: 'circle', targetId: id, targetLabel: c.name, reason: clean,
    before: beforeName, after: next.name, relatedIds: [next.userId, old?.userId ?? ''],
  });
  return clone(c);
}

// TODO API: PATCH /api/v1/admin/circles/:id/members/:userId/turn-order  { turnOrder, reason }  (échange avec le titulaire du tour)
export async function changeTurnOrder(id: string, userId: string, toOrder: number, reason: string): Promise<AdminCircle> {
  await latency();
  assertCan('circle.turnOrder');
  const c = findCircle(id);
  const clean = requireReason(reason, 10);
  if (c.kind === 'SOLIDARITY') throw new Error('Une caisse de solidarité n’a pas d’ordre de passage.');
  const m = c.members.find((x) => x.userId === userId);
  if (!m || m.turnOrder === undefined) throw new Error('Membre introuvable.');
  if (toOrder <= c.currentTurn) throw new Error(`Seuls les tours à venir peuvent changer (après le tour ${c.currentTurn}).`);
  if (m.turnOrder <= c.currentTurn) throw new Error('Ce membre a déjà reçu ou reçoit en ce moment sa cagnotte.');
  const other = c.members.find((x) => x.turnOrder === toOrder);
  const from = m.turnOrder;
  m.turnOrder = toOrder;
  if (other) other.turnOrder = from;
  db.orderChanges.push({
    id: newId('oc'), circleId: id, at: new Date().toISOString(), by: `${currentActorName()} (Venega)`, byAdmin: true,
    userId, userName: m.name, fromOrder: from, toOrder, swappedWithName: other?.name, reason: clean,
  });
  event(id, { label: 'Ordre de passage modifié par Venega', detail: `${m.name} : tour ${from} → ${toOrder}${other ? ` (échangé avec ${other.name})` : ''}. Motif : ${clean}`, tone: 'amber' });
  notifyMembers(id, `Ordre de passage modifié dans « ${c.name} »`, [userId, other?.userId ?? '']);
  recordLocalAction({
    action: 'Ordre de passage modifié', targetType: 'circle', targetId: id, targetLabel: c.name, reason: clean,
    before: `${m.name} : tour ${from}`, after: `${m.name} : tour ${toOrder}`, relatedIds: [userId, other?.userId ?? ''],
  });
  return clone(c);
}

// TODO API: POST /api/v1/admin/circles/:id/reminders  { userIds?: string[] }  (SMS + push, limité à 1 par membre et par 24 h)
export async function sendReminders(id: string, userIds?: string[]): Promise<number> {
  await latency();
  assertCan('circle.remind');
  const c = findCircle(id);
  if (c.status === 'FROZEN') throw new Error('Cercle gelé : aucun rappel de cotisation.');
  const now = Date.now();
  const targets = c.members.filter(
    (m) =>
      m.status === 'ACTIVE' &&
      m.paymentStatus !== 'PAID' &&
      (!userIds || userIds.includes(m.userId)) &&
      (!m.lastReminderAt || now - new Date(m.lastReminderAt).getTime() > DAY),
  );
  if (targets.length === 0) throw new Error('Aucun membre à relancer (déjà payé, ou rappel envoyé il y a moins de 24 h).');
  const at = new Date().toISOString();
  for (const m of targets) {
    m.remindersSent += 1;
    m.lastReminderAt = at;
    db.notifications.unshift({
      id: newId('nt'), userId: m.userId, type: 'PAYMENT_REMINDER', title: `Rappel : cotisation de ${formatXOF(c.contribution)} — ${c.name}`,
      channel: 'SMS', status: 'SENT', circleId: id, sentAt: at, byAdmin: currentActorName(),
    });
  }
  event(id, { label: 'Rappel de cotisation envoyé', detail: targets.map((t) => t.name).join(', '), tone: 'neutral' });
  recordLocalAction({ action: 'Rappel de cotisation envoyé', targetType: 'circle', targetId: id, targetLabel: c.name, detail: `${targets.length} membre(s) : ${targets.map((t) => t.name).join(', ')}`, relatedIds: targets.map((t) => t.userId) });
  return targets.length;
}

export type RequestDecision = 'APPROVE' | 'REJECT' | 'CANCEL_EXCLUSION' | 'CONFIRM_EXCLUSION';

/**
 * Décision de Venega sur une demande (fondateur absent, litige).
 * CANCEL_EXCLUSION : réintègre le membre exclu à tort.
 */
// TODO API: POST /api/v1/admin/circles/requests/:requestId/decide  { decision, reason }
export async function decideRequest(requestId: string, decision: RequestDecision, reason: string): Promise<CircleRequest> {
  await latency();
  assertCan('circle.requests');
  const r = db.requests.find((x) => x.id === requestId);
  if (!r) throw new Error('Demande introuvable.');
  const clean = requireReason(reason);
  const c = findCircle(r.circleId);
  if (c.status === 'FROZEN' && decision === 'APPROVE') throw new Error('Cercle gelé : dégelez-le avant d’accepter une demande.');
  const before = r.status;
  const now = new Date().toISOString();
  const member = c.members.find((m) => m.userId === r.userId);

  if (decision === 'CANCEL_EXCLUSION' || decision === 'CONFIRM_EXCLUSION') {
    if (r.type !== 'EXCLUSION') throw new Error('Action réservée aux exclusions.');
    if (decision === 'CANCEL_EXCLUSION') {
      r.status = 'CANCELLED';
      if (member) member.status = 'ACTIVE';
    }
    r.contested = false;
  } else {
    if (r.status !== 'PENDING') throw new Error('Cette demande a déjà été traitée.');
    r.status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    if (decision === 'APPROVE') applyApproval(r, c);
  }
  r.decidedAt = now;
  r.decidedBy = `${currentActorName()} (Venega)`;
  r.decisionNote = clean;
  refreshCircle(c.id);

  const verb: Record<RequestDecision, string> = {
    APPROVE: 'acceptée', REJECT: 'refusée', CANCEL_EXCLUSION: 'annulée (membre réintégré)', CONFIRM_EXCLUSION: 'confirmée',
  };
  const label = `${REQUEST_TYPE_LABEL[r.type]} de ${r.userName} ${verb[decision]} par Venega`;
  event(c.id, { label, detail: clean, tone: decision === 'REJECT' ? 'neutral' : decision === 'CONFIRM_EXCLUSION' ? 'red' : 'green' });
  db.notifications.unshift({ id: newId('nt'), userId: r.userId, type: 'MEMBERSHIP', title: `${REQUEST_TYPE_LABEL[r.type]} ${verb[decision]} — ${c.name}`, channel: 'SMS', status: 'SENT', circleId: c.id, sentAt: now, byAdmin: currentActorName() });
  recordLocalAction({
    action: `${REQUEST_TYPE_LABEL[r.type]} ${verb[decision]}`, targetType: 'circle', targetId: c.id, targetLabel: c.name, reason: clean,
    before: STATUS_TEXT[before], after: STATUS_TEXT[r.status], relatedIds: [r.userId],
    detail: r.userName,
  });
  return clone(r);
}

const STATUS_TEXT: Record<CircleRequestStatus, string> = { PENDING: 'En attente', APPROVED: 'Acceptée', REJECTED: 'Refusée', CANCELLED: 'Annulée' };

function applyApproval(r: CircleRequest, c: (typeof db.circles)[number]) {
  const member = c.members.find((m) => m.userId === r.userId);
  if (r.type === 'LEAVE' && member) member.status = 'LEFT';
  if (r.type === 'EXCLUSION' && member) member.status = 'EXCLUDED';
  if (r.type === 'JOIN' && !member) {
    const u = db.users.find((x) => x.id === r.userId);
    if (!u) return;
    const maxOrder = Math.max(0, ...c.members.map((m) => m.turnOrder ?? 0));
    c.members.push({
      userId: u.id, name: u.displayName, phoneNumber: u.phoneNumber, role: 'MEMBER', status: 'ACTIVE',
      turnOrder: c.kind === 'SOLIDARITY' ? undefined : maxOrder + 1, paymentStatus: 'PENDING', joinedAt: new Date().toISOString(),
      lateCount: 0, paidLateCount: 0, remindersSent: 0,
    });
    if (c.kind !== 'SOLIDARITY') c.totalTurns = c.members.filter((m) => m.status === 'ACTIVE').length;
  }
  if (r.type === 'REPLACEMENT' && member) {
    // Le remplaçant n'a pas encore de compte Venega dans les données de démo : on marque le départ.
    member.status = 'LEFT';
  }
}

export type SolidarityAction = 'CLOSE_VOTE_APPROVE' | 'CLOSE_VOTE_REJECT' | 'DISBURSE';

/**
 * Débloquer la caisse de solidarité :
 *  - clôturer un vote bloqué (échéance passée) en approuvant ou refusant ;
 *  - lancer le décaissement d'une aide approuvée (vers le numéro Mobile Money du bénéficiaire).
 */
// TODO API: POST /api/v1/admin/solidarity/requests/:id/close-vote  { outcome: 'APPROVED'|'REJECTED', reason }
// TODO API: POST /api/v1/admin/solidarity/requests/:id/disburse    { reason }  (refusé si solde insuffisant ou cercle gelé)
export async function solidarityAction(requestId: string, action: SolidarityAction, reason: string) {
  await latency();
  assertCan('solidarity.manage');
  const r = db.solidarityRequests.find((x) => x.id === requestId);
  if (!r) throw new Error('Demande d’aide introuvable.');
  const clean = requireReason(reason, 10);
  const c = findCircle(r.circleId);
  const now = new Date().toISOString();
  const before = r.status;
  if (action === 'DISBURSE') {
    if (r.status !== 'APPROVED') throw new Error('Seule une aide approuvée peut être décaissée.');
    if (c.status === 'FROZEN') throw new Error('Cercle gelé : décaissement impossible.');
    const balance = db.ledger.filter((e) => e.circleId === c.id).sort((a, b) => a.at.localeCompare(b.at)).at(-1)?.balanceAfter ?? 0;
    if (balance < r.amount) throw new Error(`Solde insuffisant (${formatXOF(balance)}).`);
    r.status = 'DISBURSED';
    r.disbursedAt = now;
    r.decisionNote = clean;
    db.ledger.push({ id: newId('le'), circleId: c.id, type: 'DEBIT', amount: r.amount, balanceAfter: balance - r.amount, label: `Aide versée — ${r.userName} (${r.eventLabel})`, at: now });
    const u = db.users.find((x) => x.id === r.userId);
    db.payments.unshift({
      id: newId('pay'), reference: db.nextPaymentReference(), provider: 'ORANGE_MONEY', direction: 'OUT', purpose: 'SOLIDARITY_AID',
      payerPhone: u?.mobileMoneyNumber ?? u?.phoneNumber ?? '', userId: r.userId, userName: r.userName, circleId: c.id, circleName: c.name,
      amount: r.amount, status: 'PENDING', createdAt: now, matched: true,
    });
  } else {
    if (r.status !== 'VOTING') throw new Error('Le vote est déjà clos.');
    r.status = action === 'CLOSE_VOTE_APPROVE' ? 'APPROVED' : 'REJECTED';
    r.decisionNote = clean;
    if (r.status === 'APPROVED') r.approvedAt = now;
  }
  refreshCircle(c.id);
  const label = action === 'DISBURSE' ? 'Aide décaissée par Venega' : action === 'CLOSE_VOTE_APPROVE' ? 'Vote clôturé par Venega : aide approuvée' : 'Vote clôturé par Venega : aide refusée';
  event(c.id, { label, detail: `${r.userName} · ${formatXOF(r.amount)}. Motif : ${clean}`, tone: action === 'CLOSE_VOTE_REJECT' ? 'neutral' : 'green' });
  recordLocalAction({ action: label, targetType: 'circle', targetId: c.id, targetLabel: c.name, reason: clean, before, after: r.status, relatedIds: [r.userId], detail: `${r.userName} · ${formatXOF(r.amount)}` });
  return clone(r);
}

export type PayoutAction = 'RETRY' | 'FORCE';

/**
 * RETRY : relancer un versement refusé par l'opérateur (après correction du numéro).
 * FORCE : verser au bénéficiaire quand le fondateur ne le fait pas (cotisations toutes payées).
 */
// TODO API: POST /api/v1/admin/payouts/:id/retry  { destination?, reason }
// TODO API: POST /api/v1/admin/payouts/:id/execute { reason }  (exige toutes les cotisations du tour payées, cercle non gelé)
export async function payoutAction(payoutId: string, action: PayoutAction, reason: string, destination?: string) {
  await latency();
  assertCan('payout.manage');
  const p = db.payouts.find((x) => x.id === payoutId);
  if (!p) throw new Error('Versement introuvable.');
  const clean = requireReason(reason, 10);
  const c = findCircle(p.circleId);
  if (c.status === 'FROZEN') throw new Error('Cercle gelé : aucun versement possible.');
  if (action === 'RETRY' && p.status !== 'FAILED') throw new Error('Seul un versement en échec peut être relancé.');
  if (action === 'FORCE' && p.status !== 'READY') throw new Error('Le versement n’est pas prêt (cotisations incomplètes ou déjà versé).');
  const before = p.status;
  const beforeDest = p.destination;
  if (destination) p.destination = destination;
  p.status = 'PROCESSING';
  p.failureReason = undefined;
  const pay = {
    id: newId('pay'), reference: db.nextPaymentReference(), provider: 'ORANGE_MONEY' as const, direction: 'OUT' as const, purpose: 'PAYOUT' as const,
    payerPhone: p.destination, userId: p.beneficiaryId, userName: p.beneficiaryName, circleId: c.id, circleName: c.name, turn: p.turn,
    amount: p.amount, status: 'PENDING' as const, createdAt: new Date().toISOString(), matched: true,
  };
  db.payments.unshift(pay);
  p.paymentId = pay.id;
  refreshCircle(c.id);
  const label = action === 'RETRY' ? `Versement du tour ${p.turn} relancé par Venega` : `Versement du tour ${p.turn} lancé par Venega à la place du fondateur`;
  event(c.id, { label, detail: `${p.beneficiaryName} · ${formatXOF(p.amount)}. Motif : ${clean}`, tone: 'amber' });
  recordLocalAction({
    action: label, targetType: 'circle', targetId: c.id, targetLabel: c.name, reason: clean,
    before: `${before}${destination && destination !== beforeDest ? ` · ${beforeDest}` : ''}`, after: `En cours · ${p.destination}`,
    relatedIds: [p.beneficiaryId, pay.id],
  });
  return clone(p);
}

export const REQUEST_TYPES: CircleRequestType[] = ['JOIN', 'LEAVE', 'EXCLUSION', 'REPLACEMENT'];
