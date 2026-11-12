/**
 * VENEGA — Store local des cercles (démo frontend)
 *
 * Module-level mutable state initialisé depuis les données mockées.
 * Permet, en attendant le backend, de :
 *   - créer un cercle (CreateCircleScreen) ;
 *   - modifier un cercle après création (EditCircleScreen) ;
 *   - retrouver un cercle par code d'invitation (JoinCircleScreen) ;
 *   - suivre les demandes d'adhésion (RequestsScreen).
 *
 * La logique métier commune (phase du cercle, rachat, dépôt, texte des
 * conditions) est centralisée ici pour être identique partout.
 */

import {
  mockCircles,
  mockCycles,
  mockMembershipRequests,
  mockCurrentUser,
  mockLedgerEntries,
  mockDepartureRequests,
  mockMemberships,
  mockSolidarityRequests,
  mockReliabilityEvents,
  mockAidAppeal,
  CircleType,
  ContributionMode,
  Frequency,
  RefundRule,
  UnlockRule,
  ReplacementRule,
  KycRequirement,
  KycStatus,
  DepartureRequestStatus,
  AidRequestStatus,
  ReliabilityEventType,
  Role,
  MembershipRequestStatus,
  PaymentStatus,
  AdhesionPaymentStatus,
  TurnOrderMethod,
  PayoutNumberStatus,
} from '@venega/types';
import type {
  Circle,
  Cycle,
  LedgerEntry,
  MembershipRequest,
  DepartureRequest,
  DepartureReimbursement,
  KycRequirement as KycReq,
  User,
  SolidarityRequest,
  EventType,
  AidAppeal,
  Membership,
} from '@venega/types';
import { isDemoMode } from '../../lib/api/config';
import { getProfile } from '../profile/profileStore';

/** Phase de vie d'un cercle : constitution (nouveau) ou rotation démarrée (en cours) */
export type CirclePhase = 'CONSTITUTION' | 'ACTIVE';

/** Frais uniques de création d'un cercle (anti-cercles fictifs), payés en mobile money. */
export const CIRCLE_CREATION_FEE = 2000;

/** Code USSD selon l'opérateur pour un montant donné (démo frontend). */
export function buildUssdCode(operator: string, amount: number): string {
  const prefix = operator === 'MOOV' ? '802' : operator === 'WAVE' ? '888' : '800';
  return `*${prefix}*${Math.round(amount)}*${Math.floor(100 + Math.random() * 900)}#`;
}

export const KycReqValue: Record<string, KycReq> = {
  REQUIRE_NONE: KycRequirement.NONE,
  REQUIRE_CNIB: KycRequirement.CNIB,
  REQUIRE_CNIB_SELFIE: KycRequirement.CNIB_SELFIE,
};

// ── Utilisateur courant (session démo) ──

/**
 * Utilisateur connecté pour la démo. Départ NON vérifié KYC pour illustrer
 * le flux de vérification à la création. En production, ce statut vient du
 * backend : la création de cercle exige kycStatus === VERIFIED.
 */
let currentUser: User = {
  ...mockCurrentUser,
  kycStatus: KycStatus.NOT_SUBMITTED,
};

export function getCurrentUser(): User {
  return { ...currentUser };
}

export function setCurrentUserKycStatus(status: KycStatus): void {
  currentUser = { ...currentUser, kycStatus: status };
}

/** Nom affiché de l'utilisateur connecté (inscription, « Modifier le profil », profil lu sur l'API). */
export function setCurrentUserName(fullName: string): void {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return;
  currentUser = {
    ...currentUser,
    firstName: parts[0]!,
    lastName: parts.slice(1).join(' '),
    displayName: parts.join(' '),
  };
}

export function setCurrentUserPhone(phoneNumber: string): void {
  if (phoneNumber) currentUser = { ...currentUser, phoneNumber };
}

/**
 * Soumet la demande de vérification d'identité (CNIB + selfie).
 * Le compte passe en PENDING puis est validé (simulation back-office)
 * après quelques secondes — l'utilisateur revient ensuite créer son cercle.
 */
export function submitKycVerification(): void {
  currentUser = { ...currentUser, kycStatus: KycStatus.PENDING };
  // Avec une vraie API, seul un agent du back-office valide le dossier (statut relu via GET /users/me).
  if (!isDemoMode) return;
  setTimeout(() => {
    if (currentUser.kycStatus === KycStatus.PENDING) {
      currentUser = { ...currentUser, kycStatus: KycStatus.VERIFIED };
    }
  }, 12000);
}

// ── État mutable (partagé entre les écrans pendant la session) ──

let circles: Circle[] = [...mockCircles];
let membershipRequests: MembershipRequest[] = [...mockMembershipRequests];
/** Demandes de départ (membres n'ayant pas encore reçu leur cagnotte). */
let departureRequests: DepartureRequest[] = [...mockDepartureRequests];
/** Grand livre comptable de la caisse de solidarité (traces CREDIT/DEBIT). */
let ledgerEntries: LedgerEntry[] = [...mockLedgerEntries];
/** Demandes d'aide de la caisse de solidarité (vote des membres puis double validation du bureau). */
let solidarityRequests: SolidarityRequest[] = [...mockSolidarityRequests];
/** Décision de chaque approbateur (Président + validateurs) par demande : true = approuvé, false = désapprouvé. */
let bureauDecisions: Record<string, Record<string, boolean>> = {};
/** Cercles dont l'utilisateur courant est fondateur (c1, c6 + cercles créés en session) */
let founderCircleIds: string[] = ['c1', 'c6', 'c7'];

export function getFounderCircleIds(): string[] {
  return [...founderCircleIds];
}

// ── Lecture ──

export function getCircles(): Circle[] {
  return circles;
}

export function getCircle(id: string): Circle | undefined {
  return circles.find((c) => c.id === id);
}

export function getCircleByInvite(code: string): Circle | undefined {
  const normalized = code.trim().toUpperCase();
  return circles.find((c) => c.inviteCode.toUpperCase() === normalized);
}

export function getCycles(circleId: string): Cycle[] {
  return mockCycles.filter((c) => c.circleId === circleId);
}

export function getActiveCycle(circle: Circle): Cycle | undefined {
  return (
    mockCycles.find((c) => c.circleId === circle.id && c.id === circle.activeCycleId) ??
    mockCycles.find((c) => c.circleId === circle.id && c.isActive)
  );
}

export function getMembershipRequests(circleId?: string): MembershipRequest[] {
  return circleId ? membershipRequests.filter((r) => r.circleId === circleId) : membershipRequests;
}

/** Pièces fournies par un membre lors de sa demande d'adhésion. */
export interface MemberDocumentsData {
  cnibFrontUrl: string;
  cnibBackUrl: string;
  selfieUrl?: string;
  depositNumber: string;
  submittedAt: string;
}

/**
 * Documents d'un membre dans un cercle, issus de sa demande d'adhésion
 * (approuvée en priorité, sinon la plus récente). `undefined` si le membre
 * n'a jamais déposé de demande (fondateur, membres d'origine).
 */
export function getMemberDocuments(circleId: string, userId: string): MemberDocumentsData | undefined {
  const own = membershipRequests.filter((r) => r.circleId === circleId && r.userId === userId);
  if (own.length === 0) return undefined;
  const latestFirst = [...own].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const req = latestFirst.find((r) => r.status === MembershipRequestStatus.APPROVED) ?? latestFirst[0]!;
  return {
    cnibFrontUrl: req.cnibFrontUrl,
    cnibBackUrl: req.cnibBackUrl,
    selfieUrl: req.selfieUrl,
    depositNumber: req.depositNumber,
    submittedAt: req.createdAt,
  };
}

/** Demandes de départ d'un cercle (triées, plus récentes en premier). */
export function getDepartureRequests(circleId?: string): DepartureRequest[] {
  const list = circleId ? departureRequests.filter((r) => r.circleId === circleId) : departureRequests;
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Entrées du grand livre de la caisse de solidarité d'un cercle (triées, plus récentes en premier). */
export function getLedgerEntries(circleId: string): LedgerEntry[] {
  return [...ledgerEntries]
    .filter((e) => e.circleId === circleId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Soldes globaux de la caisse de solidarité d'un cercle. */
export function getSolidarityTotals(circleId: string) {
  const entries = ledgerEntries.filter((e) => e.circleId === circleId);
  const totalCredits = entries.filter((e) => e.type === 'CREDIT').reduce((s, e) => s + e.amount, 0);
  const totalDebits = entries.filter((e) => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0);
  const last = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return { totalCredits, totalDebits, balance: last?.balanceAfter ?? totalCredits - totalDebits };
}

/**
 * Totaux par membre dans la caisse de solidarité (somme des CREDIT).
 * Utilisé par le fondateur pour voir ce que chacun a mis, et par chaque
 * membre pour sa propre contribution.
 */
export function getSolidarityContributions(circleId: string) {
  const map = new Map<string, { userId: string; memberName: string; total: number; count: number }>();
  for (const e of ledgerEntries) {
    if (e.circleId !== circleId || e.type !== 'CREDIT' || !e.userId) continue;
    const key = e.userId;
    const existing = map.get(key);
    if (existing) {
      existing.total += e.amount;
      existing.count += 1;
    } else {
      map.set(key, { userId: key, memberName: e.memberName ?? key, total: e.amount, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/** Ajoute une opération au grand livre (CREDIT cotisation / DEBIT déboursement). */
export function addLedgerEntry(entry: LedgerEntry): void {
  ledgerEntries = [entry, ...ledgerEntries];
}

// ── Écriture ──

export function addCircle(circle: Circle): void {
  circles = [circle, ...circles];
  founderCircleIds = [circle.id, ...founderCircleIds];
}

/**
 * Le fondateur est le premier membre du cercle qu'il crée (Président, premier dans l'ordre de passage
 * pour une tontine). Sans cela, le cercle n'avait aucun membre et ne pouvait ni cotiser ni verser.
 */
export function addFounderMembership(circle: Circle): void {
  if (mockMemberships.some((m) => m.circleId === circle.id && m.userId === currentUser.id)) return;
  mockMemberships.push({
    userId: currentUser.id,
    circleId: circle.id,
    role: Role.PRESIDENT,
    turnOrder: isRotative(circle) ? 1 : undefined,
    paymentStatus: PaymentStatus.PENDING,
    joinedAt: new Date().toISOString(),
    user: { ...currentUser },
    reliabilityScore: 100,
    hasReceivedPayout: false,
    hasDeposit: false,
  });
}

export function updateCircle(id: string, patch: Partial<Circle>): void {
  circles = circles.map((c) => (c.id === id ? { ...c, ...patch } : c));
}

// ── Tour en cours, cotisations et versement de la cagnotte (tontines) ──

/** État du tour en cours d'une tontine, calculé à partir des membres. */
export type TurnState = {
  /** Numéro du tour en cours (jamais 0). */
  turn: number;
  /** Membres triés dans l'ordre de passage. */
  members: Membership[];
  /** Bénéficiaire du tour : premier membre, dans l'ordre de passage, qui n'a pas encore reçu la cagnotte. */
  beneficiary?: Membership;
  paidCount: number;
  /** Membres qui n'ont pas encore payé la cotisation du tour (en attente ou en retard). */
  unpaid: Membership[];
  allPaid: boolean;
  /** Tous les membres ont reçu leur cagnotte : la rotation est terminée. */
  finished: boolean;
  /** Règle du cercle : le bénéficiaire doit avoir payé le tour suivant avant de recevoir. */
  nextPaymentRequired: boolean;
  /** Il reste un tour après celui-ci (sinon la règle du tour suivant ne s'applique pas). */
  hasNextTurn: boolean;
  /** Le bénéficiaire a déjà payé la cotisation du tour suivant. */
  beneficiaryPrepaid: boolean;
};

/**
 * Calcule le tour en cours. Le bénéficiaire et le numéro du tour sont déduits des cagnottes déjà
 * versées (et non du compteur du cycle), pour que toutes les fiches affichent la même personne.
 * `circle` (facultatif) apporte la règle « tour suivant payé avant de recevoir ».
 */
export function computeTurnState(
  memberList: Membership[],
  cycle?: Cycle,
  circle?: Pick<Circle, 'nextPaymentRequired'>,
): TurnState {
  const members = [...memberList].sort((a, b) => (a.turnOrder ?? Infinity) - (b.turnOrder ?? Infinity));
  const beneficiary = members.find((m) => !m.hasReceivedPayout);
  const received = members.filter((m) => m.hasReceivedPayout).length;
  const finished = members.length > 0 && !beneficiary;
  const turn =
    members.length === 0
      ? Math.max(cycle?.currentTurn ?? 1, 1)
      : finished
        ? members.length
        : received + 1;
  const unpaid = members.filter((m) => m.paymentStatus !== PaymentStatus.PAID);
  const hasNextTurn = !!beneficiary && members.some((m) => m.userId !== beneficiary.userId && !m.hasReceivedPayout);
  return {
    turn,
    members,
    beneficiary,
    paidCount: members.length - unpaid.length,
    unpaid,
    allPaid: members.length > 0 && unpaid.length === 0,
    finished,
    nextPaymentRequired: !!circle?.nextPaymentRequired,
    hasNextTurn,
    beneficiaryPrepaid: !!beneficiary?.nextTurnPrepaid,
  };
}

export function getTurnState(circleId: string): TurnState {
  const circle = getCircle(circleId);
  return computeTurnState(getCircleMembers(circleId), circle ? getActiveCycle(circle) : undefined, circle);
}

/** Nom court d'un membre pour les messages (« Moussa K. »). */
const shortName = (m: Membership) =>
  `${m.user?.firstName ?? ''}${m.user?.lastName ? ` ${m.user.lastName.charAt(0)}.` : ''}`.trim() || 'Le bénéficiaire';

/**
 * La cagnotte d'un tour ne peut être versée que si TOUS les membres ont payé la cotisation de ce tour,
 * une seule fois par tour, et — si la règle est activée — quand le bénéficiaire a déjà payé
 * la cotisation du tour suivant (sauf au dernier tour, qui n'a pas de suite).
 */
export function canPayout(state: TurnState): { ok: boolean; reason?: string } {
  if (state.members.length === 0) return { ok: false, reason: 'Ce cercle n’a pas encore de membres.' };
  if (state.finished) return { ok: false, reason: 'Tous les membres ont déjà reçu leur cagnotte.' };
  if (!state.allPaid) {
    const n = state.unpaid.length;
    return {
      ok: false,
      reason: `${n} membre${n > 1 ? 's n’ont' : ' n’a'} pas encore payé la cotisation du tour ${state.turn}. La cagnotte ne peut être versée que lorsque toutes les cotisations sont reçues.`,
    };
  }
  if (state.nextPaymentRequired && state.hasNextTurn && state.beneficiary && !state.beneficiaryPrepaid) {
    return {
      ok: false,
      reason: `${shortName(state.beneficiary)} doit d’abord payer sa cotisation du tour ${state.turn + 1}. C’est la règle de ce cercle : le bénéficiaire paie le tour suivant avant de recevoir la cagnotte.`,
    };
  }
  return { ok: true };
}

/**
 * Le membre peut-il (ou doit-il) payer d'avance la cotisation du tour suivant ?
 * Seulement le bénéficiaire du tour, quand la règle est activée, qu'il a payé le tour en cours
 * et qu'il reste un tour après celui-ci.
 */
export function canPrepayNextTurn(state: TurnState, userId: string): boolean {
  const b = state.beneficiary;
  return (
    state.nextPaymentRequired &&
    state.hasNextTurn &&
    !!b &&
    b.userId === userId &&
    b.paymentStatus === PaymentStatus.PAID &&
    !b.nextTurnPrepaid
  );
}

/** Cotisation du tour SUIVANT payée d'avance (montant complet confirmé). */
export function recordNextTurnPrepayment(circleId: string, userId: string): boolean {
  const state = getTurnState(circleId);
  if (!canPrepayNextTurn(state, userId)) return false;
  const idx = mockMemberships.findIndex((m) => m.circleId === circleId && m.userId === userId);
  if (idx === -1) return false;
  mockMemberships[idx] = { ...mockMemberships[idx]!, nextTurnPrepaid: true };
  return true;
}

/** Cotisation du tour payée (montant complet confirmé) par un membre. */
export function recordContribution(circleId: string, userId: string): void {
  const idx = mockMemberships.findIndex((m) => m.circleId === circleId && m.userId === userId);
  if (idx === -1) return;
  mockMemberships[idx] = { ...mockMemberships[idx]!, paymentStatus: PaymentStatus.PAID };
}

/** Cotisation à la caisse de solidarité : le membre est à jour et la caisse est créditée (grand livre). */
export function recordSolidarityContribution(circleId: string, userId: string, memberName: string, amount: number): void {
  if (!(amount > 0)) return;
  recordContribution(circleId, userId);
  const { balance } = getSolidarityTotals(circleId);
  addLedgerEntry({
    id: `le${Date.now()}`,
    circleId,
    type: 'CREDIT',
    amount,
    balanceAfter: balance + amount,
    description: `Cotisation — ${memberName}`,
    userId,
    memberName,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Enregistre le versement de la cagnotte du tour : le bénéficiaire est marqué servi, le tour suivant
 * commence (cotisations remises « en attente »). Refusé si les conditions de `canPayout` ne sont pas
 * remplies. Renvoie le bénéficiaire servi.
 */
export function recordPayout(circleId: string): Membership | undefined {
  const state = getTurnState(circleId);
  if (!canPayout(state).ok || !state.beneficiary) return undefined;
  const served = state.beneficiary;
  const nextTurnStarts = state.members.some((m) => m.userId !== served.userId && !m.hasReceivedPayout);
  mockMemberships.forEach((m, idx) => {
    if (m.circleId !== circleId) return;
    // Une avance sur le tour suivant devient la cotisation du nouveau tour.
    const prepaid = nextTurnStarts && !!m.nextTurnPrepaid;
    mockMemberships[idx] = {
      ...m,
      hasReceivedPayout: m.userId === served.userId ? true : m.hasReceivedPayout,
      paymentStatus: nextTurnStarts ? (prepaid ? PaymentStatus.PAID : PaymentStatus.PENDING) : m.paymentStatus,
      nextTurnPrepaid: prepaid ? false : m.nextTurnPrepaid,
    };
  });
  const circle = getCircle(circleId);
  const cycle = circle ? getActiveCycle(circle) : undefined;
  if (cycle) {
    const after = getTurnState(circleId);
    const idx = mockCycles.findIndex((c) => c.id === cycle.id);
    if (idx !== -1) mockCycles[idx] = { ...cycle, currentTurn: after.turn };
  }
  return { ...served, hasReceivedPayout: true };
}

// ── Gouvernance : bureau et validateurs de décaissement ──
//
// Se règlent depuis la gestion du cercle (ManageScreen), pas pendant
// l'assistant de création : un cercle qui vient d'être créé n'a pas encore
// de membres parmi lesquels choisir.

/** Membres actifs d'un cercle, dans l'ordre du bureau puis des membres. */
export function getCircleMembers(circleId: string) {
  return mockMemberships.filter((m) => m.circleId === circleId);
}

/** Retire un membre d'un cercle de solidarité (action réservée au fondateur). */
export function removeMember(circleId: string, userId: string): void {
  const idx = mockMemberships.findIndex((m) => m.circleId === circleId && m.userId === userId);
  if (idx !== -1) mockMemberships.splice(idx, 1);
}

// ── Ordre de passage et démarrage de la rotation ──

/** Méthode d'ordre de passage d'un cercle (absente = fixé par le fondateur, comportement historique). */
export function getTurnOrderMethod(circle: Pick<Circle, 'turnOrderMethod'>): TurnOrderMethod {
  return circle.turnOrderMethod ?? TurnOrderMethod.FIXED_BY_FOUNDER;
}

/**
 * La rotation a-t-elle démarré ? Oui dès le lancement explicite (`rotationStartedAt`),
 * dès qu'une cagnotte a été versée, ou si le cycle a déjà un tour en cours (données existantes).
 * À partir de là, montant, fréquence, calendrier et ordre de passage sont verrouillés.
 */
export function isRotationStarted(circle: Circle): boolean {
  if (!isRotative(circle)) return false;
  if (circle.rotationStartedAt) return true;
  if (mockMemberships.some((m) => m.circleId === circle.id && m.hasReceivedPayout)) return true;
  return getCirclePhase(circle, getActiveCycle(circle)) === 'ACTIVE';
}

/**
 * Change la position d'un membre dans l'ordre de rotation d'une tontine.
 * Échange sa place avec celle du membre qui occupe déjà le tour visé, pour
 * que chaque tour reste attribué à une seule personne à la fois.
 *
 * Refusé si l'ordre ne dépend pas du fondateur (tirage au sort, ordre d'arrivée) :
 * personne, pas même le fondateur, ne peut le modifier. Un membre déjà servi garde son tour.
 */
export function setMemberTurnOrder(
  circleId: string,
  userId: string,
  newTurnOrder: number,
): { ok: boolean; reason?: string } {
  const circle = getCircle(circleId);
  const method = circle ? getTurnOrderMethod(circle) : TurnOrderMethod.FIXED_BY_FOUNDER;
  if (method !== TurnOrderMethod.FIXED_BY_FOUNDER) {
    return {
      ok: false,
      reason:
        method === TurnOrderMethod.RANDOM_DRAW
          ? 'L’ordre de passage est tiré au sort : personne ne peut le modifier à la main.'
          : 'L’ordre de passage suit l’ordre d’arrivée : personne ne peut le modifier à la main.',
    };
  }
  const member = mockMemberships.find((m) => m.circleId === circleId && m.userId === userId);
  if (!member || member.turnOrder === undefined) return { ok: false, reason: 'Membre introuvable.' };
  const other = mockMemberships.find((m) => m.circleId === circleId && m.turnOrder === newTurnOrder);
  if (member.hasReceivedPayout || other?.hasReceivedPayout) {
    return { ok: false, reason: 'Un membre qui a déjà reçu sa cagnotte garde son tour.' };
  }
  const previousTurnOrder = member.turnOrder;
  mockMemberships.forEach((m, idx) => {
    if (m.circleId !== circleId) return;
    if (m.userId === userId) {
      mockMemberships[idx] = { ...m, turnOrder: newTurnOrder };
    } else if (m.turnOrder === newTurnOrder) {
      mockMemberships[idx] = { ...m, turnOrder: previousTurnOrder };
    }
  });
  return { ok: true };
}

/** Mélange de Fisher-Yates ; `random` injectable pour les tests. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/** Ordre d'arrivée : date d'adhésion, puis ordre actuel en cas d'égalité. */
const byArrival = (a: Membership, b: Membership) =>
  a.joinedAt.localeCompare(b.joinedAt) || (a.turnOrder ?? 0) - (b.turnOrder ?? 0);

/**
 * Peut-on démarrer le premier tour ? Tontine activée (frais payés), au moins deux membres,
 * rotation pas encore démarrée, et action réservée au fondateur.
 */
export function canStartRotation(circleId: string): { ok: boolean; reason?: string } {
  const circle = getCircle(circleId);
  if (!circle || !isRotative(circle)) return { ok: false, reason: 'Ce cercle n’est pas une tontine.' };
  if (!founderCircleIds.includes(circleId)) return { ok: false, reason: 'Seul le fondateur peut démarrer la tontine.' };
  if (isRotationStarted(circle)) return { ok: false, reason: 'La tontine a déjà démarré.' };
  if (!circle.activatedAt) return { ok: false, reason: 'Réglez d’abord les frais d’activation du cercle.' };
  if (getCircleMembers(circleId).length < 2) {
    return { ok: false, reason: 'Il faut au moins 2 membres pour démarrer la tontine.' };
  }
  return { ok: true };
}

/**
 * Démarre le premier tour : applique la méthode d'ordre de passage UNE SEULE FOIS
 * (tirage au sort ou ordre d'arrivée ; l'ordre du fondateur est conservé tel quel), crée le cycle
 * et verrouille les réglages de calendrier. Le tirage est horodaté et visible par tous.
 */
export function startRotation(
  circleId: string,
  random: () => number = Math.random,
): { ok: boolean; reason?: string; order?: string[] } {
  const check = canStartRotation(circleId);
  if (!check.ok) return check;
  const circle = getCircle(circleId)!;
  const method = getTurnOrderMethod(circle);
  const current = getCircleMembers(circleId).sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const ordered =
    method === TurnOrderMethod.RANDOM_DRAW
      ? shuffle(current, random)
      : method === TurnOrderMethod.ARRIVAL_ORDER
        ? [...current].sort(byArrival)
        : current;
  ordered.forEach((m, i) => {
    const idx = mockMemberships.findIndex((x) => x.circleId === circleId && x.userId === m.userId);
    if (idx !== -1) mockMemberships[idx] = { ...mockMemberships[idx]!, turnOrder: i + 1 };
  });

  const now = new Date().toISOString();
  const startDate = circle.startDate ?? now.slice(0, 10);
  const cycleId = `cy${Date.now().toString(36)}`;
  mockCycles.push({
    id: cycleId,
    circleId,
    startDate,
    isActive: true,
    currentTurn: 1,
    totalTurns: ordered.length,
    createdAt: now,
  });
  updateCircle(circleId, {
    activeCycleId: cycleId,
    rotationStartedAt: now,
    turnOrderDrawnAt: method === TurnOrderMethod.RANDOM_DRAW ? now : circle.turnOrderDrawnAt,
    memberCount: ordered.length,
    startDate,
  });
  return { ok: true, order: ordered.map((m) => m.userId) };
}

/**
 * Réglages d'une tontine verrouillés une fois le premier tour démarré : changer le montant,
 * le calendrier ou l'ordre en cours de route serait injuste envers ceux qui ont déjà reçu.
 */
export const LOCKED_AFTER_START: (keyof Circle)[] = [
  'tontineAmount',
  'frequency',
  'startDate',
  'contributionWeekday',
  'contributionMonthDay',
  'maxMembers',
  'beneficiariesPerTurn',
  'turnOrderMethod',
  'managementFee',
  'nextPaymentRequired',
  'contributionMode',
];

export function isSettingLocked(circle: Circle, key: keyof Circle): boolean {
  return isRotationStarted(circle) && LOCKED_AFTER_START.includes(key);
}

/**
 * Applique une modification de réglages en refusant celles qui sont verrouillées
 * (garde-fou du store, en plus de l'interface). Renvoie les réglages refusés.
 */
export function updateCircleSettings(id: string, patch: Partial<Circle>): { ok: boolean; refused: (keyof Circle)[] } {
  const circle = getCircle(id);
  if (!circle) return { ok: false, refused: [] };
  const refused: (keyof Circle)[] = [];
  const allowed: Partial<Circle> = {};
  (Object.keys(patch) as (keyof Circle)[]).forEach((k) => {
    const changed = JSON.stringify(patch[k]) !== JSON.stringify(circle[k]);
    if (changed && isSettingLocked(circle, k)) refused.push(k);
    else (allowed as Record<string, unknown>)[k] = patch[k];
  });
  updateCircle(id, allowed);
  return { ok: refused.length === 0, refused };
}

/** Nombre de cotisations en retard ou manquées d'un membre dans un cercle. */
export function getLateCount(circleId: string, userId: string): number {
  return mockReliabilityEvents.filter(
    (e) =>
      e.circleId === circleId &&
      e.userId === userId &&
      (e.type === ReliabilityEventType.LATE || e.type === ReliabilityEventType.MISSED)
  ).length;
}

/**
 * Nomme un nouveau Trésorier. L'ancien titulaire (s'il n'est pas Président)
 * redevient Membre — il n'y a qu'un Trésorier à la fois par cercle.
 */
export function setTreasurer(circleId: string, userId: string): void {
  mockMemberships.forEach((m, idx) => {
    if (m.circleId !== circleId) return;
    if (m.userId === userId) {
      mockMemberships[idx] = { ...m, role: Role.TREASURER };
    } else if (m.role === Role.TREASURER) {
      mockMemberships[idx] = { ...m, role: Role.MEMBER };
    }
  });
}

/** Validateurs de décaissement de la caisse de solidarité, par cercle (userIds). */
let solidarityValidators: Record<string, string[]> = {};

/** Par défaut, le Président et le Trésorier sont validateurs tant que personne n'y a touché. */
export function getSolidarityValidators(circleId: string): string[] {
  const chosen = solidarityValidators[circleId];
  if (chosen) return chosen;
  return mockMemberships
    .filter((m) => m.circleId === circleId && (m.role === Role.PRESIDENT || m.role === Role.TREASURER))
    .map((m) => m.userId);
}

/**
 * Ajoute ou retire un membre de la liste des validateurs de décaissement.
 * Le retrait est bloqué tant qu'une demande de ce cercle attend encore la validation
 * du bureau — on ne change pas la composition des approbateurs en pleine validation.
 */
export function toggleSolidarityValidator(circleId: string, userId: string): { success: boolean; reason?: string } {
  const current = getSolidarityValidators(circleId);
  const isRemoving = current.includes(userId);

  const hasPendingRequest = solidarityRequests.some(
    (r) => r.circleId === circleId && r.status === AidRequestStatus.APPROVED
  );
  if (isRemoving && hasPendingRequest) {
    return { success: false, reason: 'Une demande est en cours de validation — impossible de retirer un approbateur maintenant.' };
  }
  if (!isRemoving) {
    if (hasPendingRequest) {
      return { success: false, reason: 'Une demande est en cours de validation — impossible d’ajouter un approbateur maintenant.' };
    }
    // Le fondateur a fixé le nombre de validateurs : on n'en désigne pas plus.
    const wanted = getCircle(circleId)?.rules?.approversRequired ?? 0;
    if (wanted > 0 && current.length >= wanted) {
      return {
        success: false,
        reason: `Ce cercle prévoit ${wanted} validateur${wanted > 1 ? 's' : ''}. Retirez-en un, ou augmentez ce nombre dans les paramètres.`,
      };
    }
  }

  const next = isRemoving ? current.filter((id) => id !== userId) : [...current, userId];
  solidarityValidators = { ...solidarityValidators, [circleId]: next };
  return { success: true };
}

/**
 * Active un cercle après paiement des frais de création (2 000 F).
 * Appelé à la réception du paiement USSD : `activatedAt` est posé et le
 * cercle devient utilisable (grisé tant que non activé).
 */
export function activateCircle(id: string): void {
  circles = circles.map((c) =>
    c.id === id
      ? { ...c, activatedAt: new Date().toISOString(), isActive: true }
      : c
  );
}

export function addMembershipRequest(request: MembershipRequest): void {
  membershipRequests = [request, ...membershipRequests];
}

export function updateMembershipRequest(
  id: string,
  patch: Partial<MembershipRequest>
): void {
  const before = membershipRequests.find((r) => r.id === id);
  membershipRequests = membershipRequests.map((r) => (r.id === id ? { ...r, ...patch } : r));
  // Demande acceptée : le candidat devient membre (sinon il n'apparaissait nulle part dans le cercle).
  if (before && before.status !== MembershipRequestStatus.APPROVED && patch.status === MembershipRequestStatus.APPROVED) {
    addMemberFromRequest({ ...before, ...patch });
  }
}

/** Ajoute le candidat accepté aux membres, en dernier dans l'ordre de passage d'une tontine. */
function addMemberFromRequest(request: MembershipRequest): void {
  const circle = getCircle(request.circleId);
  if (!circle) return;
  if (mockMemberships.some((m) => m.circleId === circle.id && m.userId === request.userId)) return;
  const existing = mockMemberships.filter((m) => m.circleId === circle.id);
  const lastTurn = existing.reduce((max, m) => Math.max(max, m.turnOrder ?? 0), 0);
  mockMemberships.push({
    userId: request.userId,
    circleId: circle.id,
    role: Role.MEMBER,
    turnOrder: isRotative(circle) ? lastTurn + 1 : undefined,
    paymentStatus: PaymentStatus.PENDING,
    joinedAt: new Date().toISOString(),
    user: request.user,
    reliabilityScore: 100,
    hasReceivedPayout: false,
    hasDeposit: (request.depositAmount ?? 0) > 0 && request.paymentStatus === AdhesionPaymentStatus.PAID,
  });
  updateCircle(circle.id, { memberCount: existing.length + 1 });
}

export function updateDepartureRequest(
  id: string,
  patch: Partial<DepartureRequest>
): void {
  departureRequests = departureRequests.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

// ── Logique métier ──

/** Un cercle est « en cours » dès que la rotation a démarré (au moins une cagnotte versée). */
export function getCirclePhase(circle: Circle, cycle?: Cycle): CirclePhase {
  const currentTurn = cycle?.currentTurn ?? 0;
  return currentTurn > 0 ? 'ACTIVE' : 'CONSTITUTION';
}

/** Les types rotatifs (tontine en espèces ou en nature) sont concernés par le rachat des tours passés. */
export function isRotative(circle: Circle): boolean {
  return (
    circle.type === CircleType.TONTINE_ONLY ||
    circle.type === CircleType.NATURE
  );
}

/** Nombre de tours déjà effectués avant l'arrivée du nouveau membre. */
export function pastTurns(circle: Circle, cycle?: Cycle): number {
  if (!isRotative(circle) || !cycle) return 0;
  return Math.max(cycle.currentTurn - 1, 0);
}

/**
 * Frais de rachat des tours passés (0 en phase constitution ou si
 * la règle de remplacement n'exige pas le rachat).
 */
export function computeRachat(circle: Circle, cycle?: Cycle): number {
  const phase = getCirclePhase(circle, cycle);
  if (phase === 'CONSTITUTION') return 0;
  const paysPastTurns = circle.rules?.replacementRule === ReplacementRule.PAY_PAST_TURNS;
  if (!paysPastTurns) return 0;
  return pastTurns(circle, cycle) * circle.tontineAmount;
}

/**
 * Dépôt de garantie (1 cotisation). Aucun paiement en phase constitution :
 * le dépôt ne s'applique qu'en cercle en cours (remplacement).
 */
export function computeDeposit(circle: Circle, cycle?: Cycle): number {
  const phase = getCirclePhase(circle, cycle);
  if (phase === 'CONSTITUTION') return 0;
  return circle.depositRequired ? circle.tontineAmount : 0;
}

/** Total à payer pour adhérer (rachat + dépôt). 0 = aucune somme à verser. */
export function computeAdhesionTotal(circle: Circle, cycle?: Cycle): number {
  return computeRachat(circle, cycle) + computeDeposit(circle, cycle);
}

const frequencyLabel: Record<string, string> = {
  DAILY: 'journalier',
  WEEKLY: 'hebdomadaire',
  BIWEEKLY: 'toutes les 2 semaines',
  MONTHLY: 'mensuel',
  CUSTOM: 'personnalisé',
};

const typeLabel: Record<string, string> = {
  TONTINE_ONLY: 'Tontine rotative',
  SOLIDARITY_ONLY: 'Caisse de solidarité',
  NATURE: 'Tontine en nature',
  AID_APPEAL: 'Appel à l\'aide',
};

/**
 * Regroupe TOUS les réglages du fondateur en un texte lisible
 * que le candidat lit et approuve avant de rejoindre.
 */
export function buildConditionsText(
  circle: Circle,
  cycle?: Cycle,
  rachat?: number,
  deposit?: number
): string {
  const phase = getCirclePhase(circle, cycle);
  const r = rachat ?? computeRachat(circle, cycle);
  const d = deposit ?? computeDeposit(circle, cycle);
  const total = r + d;
  const kyc = circle.rules?.kycRequirement;

  const lines: string[] = [];
  lines.push(`${circle.name}`);
  lines.push(`Type : ${typeLabel[circle.type] ?? circle.type} — Cotisation de ${fmt(circle.tontineAmount)}${circle.solidarityAmount ? ` + ${fmt(circle.solidarityAmount)} de solidarité` : ''} par tour (${frequencyLabel[circle.frequency] ?? circle.frequency}).`);

  lines.push(`Calendrier : ${describeSchedule(circle)}.`);
  if (isRotative(circle)) {
    const method = getTurnOrderMethod(circle);
    lines.push(
      method === TurnOrderMethod.RANDOM_DRAW
        ? `Ordre de passage tiré au sort une seule fois, au démarrage du premier tour, visible par tous.`
        : method === TurnOrderMethod.ARRIVAL_ORDER
          ? `Ordre de passage : ordre d'arrivée des membres.`
          : `Ordre de passage fixé par le fondateur.`,
    );
    if (circle.nextPaymentRequired) {
      lines.push(`Le bénéficiaire d'un tour doit avoir payé sa cotisation du tour suivant avant de recevoir la cagnotte.`);
    }
    lines.push(`La cagnotte n'est versée que lorsque toutes les cotisations du tour sont reçues. Aucune pénalité de retard.`);
  } else if (circle.type === CircleType.SOLIDARITY_ONLY) {
    lines.push(`Cotisation volontaire, sans pénalité. Chaque aide est débloquée selon la règle : ${describeApprovalRule(circle.rules?.approversRequired || 1, circle.rules?.unlockRule ?? UnlockRule.ALL_APPROVERS)}.`);
  }

  if (phase === 'ACTIVE' && isRotative(circle)) {
    const turns = pastTurns(circle, cycle);
    lines.push(`${turns > 0 ? `Ce cercle a déjà effectué ${turns} tour${turns > 1 ? 's' : ''}. Vous rejoignez en cours de rotation et serez placé en dernier dans l'ordre de passage.` : 'Cercle en cours de rotation.'}`);
  }

  if (r > 0) {
    lines.push(`Frais de rachat des tours passés : ${fmt(r)}.`);
  }
  if (d > 0) {
    lines.push(`Dépôt de garantie : ${fmt(d)} (remboursé à la fin du cercle, sauf impayés).`);
  }
  if (total > 0) {
    lines.push(`Total à payer pour adhérer : ${fmt(total)}.`);
  }


  if (kyc === KycRequirement.NONE) {
    lines.push(`Aucun document d'identité exigé.`);
  } else if (kyc === KycRequirement.CNIB) {
    lines.push(`Pièce d'identité exigée : CNIB (recto et verso).`);
  } else if (kyc === KycRequirement.CNIB_SELFIE) {
    lines.push(`Vérification d'identité : CNIB (recto et verso) + selfie facial.`);
  }

  if (circle.managementFee > 0) {
    lines.push(`Frais de gestion du fondateur : ${fmt(circle.managementFee)} par tour.`);
  }
  if (circle.depositRequired && phase === 'CONSTITUTION') {
    lines.push(`Le dépôt de garantie s'appliquera si vous rejoignez en cours de rotation.`);
  }

  if (circle.conditions && circle.conditions.trim()) {
    lines.push(`Règlement du cercle : ${circle.conditions.trim()}`);
  }

  return lines.join('\n');
}

// ── Départ d'un membre (sans cagnotte reçue) ──

/**
 * Ventilation du remboursement pour un membre qui veut partir sans avoir
 * reçu de cagnotte : chaque bénéficiaire des tours déjà cotisés lui doit
 * une cotisation (le membre a contribué à la cagnotte de ce tour-là).
 *
 * Ex : j'ai payé 2 tours (tours 1 et 2). Les bénéficiaires des tours 1 et
 * 2 m'ont reçu ma cotisation dans leur cagnotte → ils me remboursent
 * chacun une cotisation. Total = 2 × cotisation.
 */
export function computeDepartureBreakdown(
  circle: Circle,
  cycle: Cycle | undefined,
  member: { userId: string; turnOrder?: number }
): { pastTurns: number; reimbursements: DepartureReimbursement[]; totalRecover: number } {
  const turns = pastTurns(circle, cycle);
  const reimbursements: DepartureReimbursement[] = [];

  if (isRotative(circle)) {
    for (let t = 1; t <= turns; t++) {
      const beneficiary = mockMemberships.find((m) => m.circleId === circle.id && m.turnOrder === t);
      if (!beneficiary || beneficiary.userId === member.userId) continue;
      reimbursements.push({
        turnNumber: t,
        beneficiaryName: beneficiary.user.displayName,
        amount: circle.tontineAmount,
      });
    }
  }

  // Caisse de solidarité : le membre cotise au fonds commun pour les tours à
  // venir. Ce qu'il a déjà mis reste dans la caisse (transparent, non remboursé).
  const totalRecover = reimbursements.reduce((s, r) => s + r.amount, 0);
  return { pastTurns: turns, reimbursements, totalRecover };
}

/**
 * Nouvelle cotisation par membre restant après un départ approuvé SANS
 * remplaçant : on garde le pot entier (membreCount × cotisation) en le
 * répartissant sur les membres restants.
 */
export function computeRecalculatedContribution(circle: Circle): number {
  const remaining = Math.max(circle.memberCount - 1, 1);
  const pot = circle.memberCount * circle.tontineAmount;
  return Math.ceil(pot / remaining);
}

/** Crée une demande de départ (PENDING) pour le membre courant. */
export function requestDeparture(circleId: string, userId: string, memberName: string): DepartureRequest {
  const circle = getCircle(circleId);
  const cycle = circle ? getActiveCycle(circle) : undefined;
  const breakdown = computeDepartureBreakdown(circle!, cycle, { userId });
  const request: DepartureRequest = {
    id: `dr${Date.now()}`,
    circleId,
    userId,
    memberName,
    status: DepartureRequestStatus.PENDING,
    pastTurns: breakdown.pastTurns,
    totalRecover: breakdown.totalRecover,
    reimbursements: breakdown.reimbursements,
    createdAt: new Date().toISOString(),
  };
  departureRequests = [request, ...departureRequests];
  return request;
}

/**
 * Approuve le départ SANS ajouter de membre : les cagnottes se recalculent
 * automatiquement (nouvelle cotisation) et le cercle passe à memberCount - 1.
 */
export function approveDeparture(id: string): void {
  const request = departureRequests.find((r) => r.id === id);
  if (!request) return;
  const circle = getCircle(request.circleId);
  const recalculated = circle ? computeRecalculatedContribution(circle) : undefined;
  departureRequests = departureRequests.map((r) =>
    r.id === id
      ? { ...r, status: DepartureRequestStatus.APPROVED, decidedAt: new Date().toISOString(), recalculatedContribution: recalculated }
      : r
  );
  if (circle && recalculated) {
    updateCircle(circle.id, { memberCount: Math.max(circle.memberCount - 1, 0) });
  }
}

/** Refuse une demande de départ (le membre reste dans le cercle). */
export function rejectDeparture(id: string, reason?: string): void {
  departureRequests = departureRequests.map((r) =>
    r.id === id
      ? { ...r, status: DepartureRequestStatus.REJECTED, decidedAt: new Date().toISOString(), rejectionReason: reason }
      : r
  );
}

// ── Fonds de solidarité : le Président initie une demande pour un membre, les
// approbateurs désignés valident, puis le Trésorier décaisse ──

export function getSolidarityRequests(circleId: string): SolidarityRequest[] {
  return solidarityRequests
    .filter((r) => r.circleId === circleId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Le Président initie une demande pour le compte d'un membre (contacté par téléphone
 * ou en personne) : elle part directement en validation par les approbateurs désignés,
 * sans étape de vote intermédiaire.
 */
export function submitSolidarityRequest(params: {
  circleId: string;
  userId: string;
  requesterName: string;
  eventType: EventType;
  reason: string;
  amountRequested: number;
  proofUrl?: string;
}): SolidarityRequest {
  const circle = getCircle(params.circleId);
  const cycle = circle ? getActiveCycle(circle) : undefined;
  const request: SolidarityRequest = {
    id: `sr${Date.now()}`,
    circleId: params.circleId,
    cycleId: cycle?.id ?? '',
    userId: params.userId,
    requesterName: params.requesterName,
    eventType: params.eventType,
    reason: params.reason,
    amountRequested: params.amountRequested,
    amountApproved: 0,
    status: AidRequestStatus.APPROVED,
    proofUrl: params.proofUrl,
    votes: [],
    createdAt: new Date().toISOString(),
  };
  solidarityRequests = [request, ...solidarityRequests];
  return request;
}

/** Décisions des approbateurs pour une demande donnée (userId -> true = approuvé, false = désapprouvé). */
export function getBureauDecisions(requestId: string): Record<string, boolean> {
  return bureauDecisions[requestId] ?? {};
}

/**
 * Un approbateur approuve ou désapprouve le décaissement. Il peut changer d'avis
 * à volonté tant que la demande n'a pas encore été décaissée.
 */
export function setBureauDecision(requestId: string, userId: string, approved: boolean): void {
  const request = solidarityRequests.find((r) => r.id === requestId);
  if (!request || request.status !== AidRequestStatus.APPROVED) return;
  const current = getBureauDecisions(requestId);
  bureauDecisions = { ...bureauDecisions, [requestId]: { ...current, [userId]: approved } };
}

/**
 * Règle de validation d'un décaissement, choisie par le fondateur :
 * - `required` : nombre de validateurs prévus (0 dans d'anciennes données = « tous ceux désignés ») ;
 * - `rule` : ALL_APPROVERS (tous approuvent) ou MAJORITY (plus de la moitié) ;
 * - `missing` : validateurs encore à désigner avant tout versement ;
 * - `threshold` : nombre d'approbations nécessaires ; `approvals` : approbations reçues (si `requestId`).
 */
export function getApprovalProgress(circleId: string, requestId?: string) {
  const circle = getCircle(circleId);
  const validators = getSolidarityValidators(circleId);
  const designated = validators.length;
  const rule = circle?.rules?.unlockRule ?? UnlockRule.ALL_APPROVERS;
  const wanted = Math.max(circle?.rules?.approversRequired ?? 0, 0);
  const required = wanted > 0 ? wanted : designated;
  const missing = Math.max(required - designated, 0);
  const threshold = rule === UnlockRule.MAJORITY ? Math.floor(designated / 2) + 1 : designated;
  const decisions = requestId ? getBureauDecisions(requestId) : {};
  const approvals = validators.filter((v) => decisions[v] === true).length;
  return { validators, designated, required, missing, rule, threshold, approvals };
}

/** Texte court de la règle : « 3 validateurs · tous doivent approuver ». */
export function describeApprovalRule(approversRequired: number, rule: UnlockRule): string {
  const n = Math.max(approversRequired, 1);
  const who = `${n} validateur${n > 1 ? 's' : ''}`;
  if (n === 1) return `${who} · son accord suffit`;
  return rule === UnlockRule.MAJORITY
    ? `${who} · ${Math.floor(n / 2) + 1} accords sur ${n} suffisent`
    : `${who} · tous doivent approuver`;
}

/** Vrai quand assez de validateurs désignés ont approuvé, selon la règle du cercle (tous ou majorité). */
export function isBureauFullyApproved(circleId: string, requestId: string): boolean {
  const p = getApprovalProgress(circleId, requestId);
  if (p.designated === 0 || p.missing > 0) return false;
  return p.approvals >= p.threshold;
}

/** Une demande attend-elle la décision des validateurs ? (bloque les changements de règle) */
function hasRequestAwaitingApproval(circleId: string): boolean {
  return solidarityRequests.some((r) => r.circleId === circleId && r.status === AidRequestStatus.APPROVED);
}

/**
 * Le fondateur change le nombre de validateurs ou la règle (tous / majorité).
 * Refusé pendant qu'une demande attend la validation : on ne change pas les règles en cours de vote.
 */
export function setApprovalRule(
  circleId: string,
  approversRequired: number,
  unlockRule: UnlockRule,
): { ok: boolean; reason?: string } {
  const circle = getCircle(circleId);
  if (!circle) return { ok: false, reason: 'Cercle introuvable.' };
  if (!(approversRequired >= 1 && approversRequired <= 9)) {
    return { ok: false, reason: 'Choisissez entre 1 et 9 validateurs.' };
  }
  const same = circle.rules.approversRequired === approversRequired && circle.rules.unlockRule === unlockRule;
  if (!same && hasRequestAwaitingApproval(circleId)) {
    return { ok: false, reason: 'Une demande est en cours de validation — changez la règle une fois qu’elle est traitée.' };
  }
  updateCircle(circleId, { rules: { ...circle.rules, approversRequired, unlockRule } });
  return { ok: true };
}

/**
 * Vérifie qu'un décaissement peut être exécuté : demande en attente de versement, validateurs
 * d'accord selon la règle du cercle, solde suffisant, et exécuté par le Trésorier du cercle.
 */
export function canDisburse(requestId: string, userId: string): { ok: boolean; reason?: string } {
  const request = solidarityRequests.find((r) => r.id === requestId);
  if (!request) return { ok: false, reason: 'Cette demande n’existe plus.' };
  if (request.status === AidRequestStatus.DISBURSED) return { ok: false, reason: 'Ce secours a déjà été versé.' };
  if (request.status !== AidRequestStatus.APPROVED) return { ok: false, reason: 'Cette demande n’est pas en attente de versement.' };
  const isTreasurer = mockMemberships.some(
    (m) => m.circleId === request.circleId && m.userId === userId && m.role === Role.TREASURER,
  );
  if (!isTreasurer) return { ok: false, reason: 'Seul le Trésorier du cercle peut verser le secours.' };
  if (!isBureauFullyApproved(request.circleId, requestId)) {
    const p = getApprovalProgress(request.circleId, requestId);
    if (p.missing > 0) {
      return {
        ok: false,
        reason: `Désignez encore ${p.missing} validateur${p.missing > 1 ? 's' : ''} avant tout versement (règle du cercle : ${p.required}).`,
      };
    }
    return {
      ok: false,
      reason:
        p.rule === UnlockRule.MAJORITY
          ? `La majorité des validateurs (${p.threshold} sur ${p.designated}) doit approuver la demande avant le versement.`
          : 'Tous les validateurs doivent approuver la demande avant le versement.',
    };
  }
  if (getSolidarityTotals(request.circleId).balance < request.amountRequested) {
    return { ok: false, reason: 'Le solde de la caisse est insuffisant pour ce versement.' };
  }
  return { ok: true };
}

/**
 * Le Trésorier exécute le décaissement une fois le bureau au complet — l'argent part directement
 * vers le numéro Mobile Money enregistré par le demandeur, jamais entre les mains du Trésorier.
 */
export function disburseSolidarityRequest(requestId: string): void {
  const request = solidarityRequests.find((r) => r.id === requestId);
  if (!request || request.status !== AidRequestStatus.APPROVED) return;
  if (!isBureauFullyApproved(request.circleId, requestId)) return;

  const totals = getSolidarityTotals(request.circleId);
  if (totals.balance < request.amountRequested) return;
  const balanceAfter = totals.balance - request.amountRequested;

  addLedgerEntry({
    id: `le${Date.now()}`,
    circleId: request.circleId,
    type: 'DEBIT',
    amount: request.amountRequested,
    balanceAfter,
    description: `Aide versée — ${request.requesterName}`,
    reason: request.reason,
    userId: request.userId,
    memberName: request.requesterName,
    proofUrl: request.proofUrl,
    relatedTransactionId: request.id,
    createdAt: new Date().toISOString(),
  });

  solidarityRequests = solidarityRequests.map((r) =>
    r.id === requestId ? { ...r, status: AidRequestStatus.DISBURSED, amountApproved: r.amountRequested } : r
  );
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

// ── Cagnottes d'aide publiques (AID_APPEAL) ──

let aidAppeals: AidAppeal[] = [mockAidAppeal];

/** Adresse publique d'une cagnotte : ouverte dans le navigateur par ceux qui n'ont pas l'application. */
// TODO: domaine définitif à confirmer avec l'équipe web (page venega-web /c/[code]).
export const AID_PUBLIC_BASE_URL = 'https://venega.app/c/';

export function getAidShareLink(circle: Circle): string {
  return AID_PUBLIC_BASE_URL + circle.inviteCode;
}

export function getAidAppeal(circleId: string): AidAppeal | undefined {
  return aidAppeals.find((a) => a.circleId === circleId);
}

/** Chiffres d'un numéro burkinabè, sans indicatif : « +226 70 12 34 56 » → « 70123456 ». */
export function localDigits(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return d.length > 8 && d.startsWith('226') ? d.slice(3) : d;
}

/**
 * Numéro Mobile Money vérifié de l'organisateur : celui de son profil, sinon le numéro du compte
 * (confirmé par SMS à l'inscription). C'est le numéro qui reçoit l'argent d'une cagnotte par défaut.
 */
export function getOrganizerPayoutNumber(): string {
  return localDigits(getProfile().mobileMoneyNumber || currentUser.phoneNumber);
}

/** Le numéro saisi est-il le numéro vérifié de l'organisateur ? Sinon, la cagnotte part en vérification. */
export function isOrganizerPayoutNumber(phone: string): boolean {
  const own = getOrganizerPayoutNumber();
  return own.length === 8 && localDigits(phone) === own;
}

/** Les versements d'une cagnotte sont bloqués tant que son numéro de réception n'est pas vérifié. */
export function isAidPayoutNumberVerified(appeal: AidAppeal): boolean {
  return (
    appeal.payoutNumberStatus === PayoutNumberStatus.VERIFIED_OWNER ||
    appeal.payoutNumberStatus === PayoutNumberStatus.VERIFIED_BY_REVIEW
  );
}

/**
 * Lance une cagnotte d'aide : crée le cercle public (sans adhésion) et la fiche de l'appel.
 * Les fonds restent bloqués jusqu'à l'approbation des approbateurs (même règle que le mock c5).
 */
export function createAidAppeal(params: {
  title: string;
  beneficiaryName: string;
  beneficiaryNumber: string;
  reason: string;
  goalAmount: number;
  /** Date de fin facultative (ISO) : absente = collecte sans date de fin. */
  deadline?: string;
  beneficiaryPhoto?: string;
}): { circle: Circle; appeal: AidAppeal } {
  const payoutNumberStatus = isOrganizerPayoutNumber(params.beneficiaryNumber)
    ? PayoutNumberStatus.VERIFIED_OWNER
    : PayoutNumberStatus.PENDING_REVIEW;
  const now = new Date().toISOString();
  const id = 'c' + Date.now().toString(36);
  const code = 'AID-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const circle: Circle = {
    id,
    name: params.title,
    type: CircleType.AID_APPEAL,
    tontineAmount: 0,
    solidarityAmount: 0,
    frequency: Frequency.MONTHLY,
    contributionMode: ContributionMode.CASH,
    beneficiariesPerTurn: 0,
    inviteCode: code,
    memberCount: 0,
    createdAt: now,
    rules: {
      refundRule: RefundRule.IMMEDIATE,
      replacementRule: ReplacementRule.NONE,
      unlockRule: UnlockRule.ALL_APPROVERS,
      approversRequired: 3,
      reservePercent: 0,
      allowPublicContributions: true,
      // Aucun montant minimum de don (règle produit) : chacun donne ce qu'il peut.
      minContribution: undefined,
      goalAmount: params.goalAmount,
      kycRequirement: KycRequirement.NONE,
    },
    managementFee: 0,
    depositRequired: false,
    recalculateOnLeave: false,
    exclusionThreshold: 0,
    nextPaymentRequired: false,
    conditions:
      "Contribution libre et ouverte à tous, sans adhésion. L'argent est débloqué uniquement après approbation des approbateurs désignés.",
    isActive: true,
  };
  const appeal: AidAppeal = {
    id: 'aa' + Date.now().toString(36),
    circleId: id,
    beneficiaryName: params.beneficiaryName,
    beneficiaryPhoto: params.beneficiaryPhoto,
    beneficiaryNumber: params.beneficiaryNumber,
    reason: params.reason,
    goalAmount: params.goalAmount,
    collectedAmount: 0,
    contributorCount: 0,
    deadline: params.deadline,
    payoutNumberStatus,
    status: 'ACTIVE',
    createdAt: now,
  };
  addCircle(circle);
  aidAppeals = [appeal, ...aidAppeals];
  return { circle, appeal };
}

/** Contribution reçue (montant complet confirmé) sur une cagnotte d'aide. */
export function recordAidContribution(circleId: string, amount: number): void {
  if (!(amount > 0)) return;
  aidAppeals = aidAppeals.map((a) =>
    a.circleId === circleId
      ? { ...a, collectedAmount: a.collectedAmount + amount, contributorCount: a.contributorCount + 1 }
      : a,
  );
}

/// ── Calendrier des cotisations ──

const DAY_MS = 86400000;

export const WEEKDAY_NAMES = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
export const MONTH_NAMES = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;

/** Réglages de calendrier d'un cercle (sous-ensemble de `Circle`). */
export type ContributionSchedule = Pick<
  Circle,
  'frequency' | 'startDate' | 'contributionWeekday' | 'contributionMonthDay'
>;

/** « 2026-12-06 » ou ISO complet → date locale à minuit (le jour affiché ne dépend pas du fuseau). */
export function parseDay(value?: string): Date | undefined {
  const m = value ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Date locale → « 2026-12-06 ». */
export function toDayString(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Jour de la semaine ISO : 1 = lundi … 7 = dimanche. */
export const isoWeekday = (d: Date) => ((d.getDay() + 6) % 7) + 1;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Jour `day` du mois (année, mois), ramené au dernier jour pour les mois plus courts. */
function monthDayDate(year: number, month: number, day: number): Date {
  const last = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(Math.max(day, 1), last));
}

/** « 6 décembre », « 1er juin ». */
export function formatDayMonth(d: Date): string {
  const day = d.getDate();
  return `${day === 1 ? '1er' : day} ${MONTH_NAMES[d.getMonth()]}`;
}

/** « samedi 6 décembre ». */
export function formatLongDay(d: Date): string {
  return `${WEEKDAY_NAMES[isoWeekday(d) - 1]} ${formatDayMonth(d)}`;
}

/**
 * Première échéance : la date de début, avancée jusqu'au jour de cotisation choisi
 * (jour de la semaine pour l'hebdomadaire et la quinzaine, jour du mois pour le mensuel).
 */
export function firstDueDate(schedule: ContributionSchedule, fallbackStart: Date): Date {
  const start = parseDay(schedule.startDate) ?? startOfDay(fallbackStart);
  const f = schedule.frequency;
  if ((f === Frequency.WEEKLY || f === Frequency.BIWEEKLY) && schedule.contributionWeekday) {
    const delta = (schedule.contributionWeekday - isoWeekday(start) + 7) % 7;
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + delta);
  }
  if (f === Frequency.MONTHLY && schedule.contributionMonthDay) {
    const candidate = monthDayDate(start.getFullYear(), start.getMonth(), schedule.contributionMonthDay);
    return candidate < start
      ? monthDayDate(start.getFullYear(), start.getMonth() + 1, schedule.contributionMonthDay)
      : candidate;
  }
  return start;
}

/** Échéance n° `n` (0 = la première). Le mensuel garde le même jour du mois, sans dérive. */
export function dueDateAt(schedule: ContributionSchedule, first: Date, n: number): Date {
  const y = first.getFullYear();
  const mo = first.getMonth();
  const d = first.getDate();
  switch (schedule.frequency) {
    case Frequency.DAILY:
      return new Date(y, mo, d + n);
    case Frequency.WEEKLY:
      return new Date(y, mo, d + 7 * n);
    case Frequency.BIWEEKLY:
      return new Date(y, mo, d + 14 * n);
    default:
      return monthDayDate(y, mo + n, schedule.contributionMonthDay ?? d);
  }
}

/**
 * Situe aujourd'hui dans le calendrier : échéance précédente (passée), prochaine (aujourd'hui ou après),
 * et nombre de jours avant la prochaine. Indéfini pour une cagnotte d'aide.
 */
export function getContributionTimeline(
  circle: Circle,
  today: Date = new Date(),
): { first: Date; previous?: Date; next: Date; daysLeft: number; index: number } | undefined {
  if (circle.type === CircleType.AID_APPEAL) return undefined;
  const cycle = getActiveCycle(circle);
  const fallback = parseDay(cycle?.startDate) ?? parseDay(circle.activatedAt) ?? parseDay(circle.createdAt);
  if (!fallback && !circle.startDate) return undefined;
  const first = firstDueDate(circle, fallback ?? new Date());
  const day0 = startOfDay(today);
  let index = 0;
  let next = first;
  // Borne de sécurité : au plus quelques années d'échéances quotidiennes.
  while (next < day0 && index < 4000) {
    index += 1;
    next = dueDateAt(circle, first, index);
  }
  const previous = index > 0 ? dueDateAt(circle, first, index - 1) : undefined;
  return { first, previous, next, index, daysLeft: Math.round((next.getTime() - day0.getTime()) / DAY_MS) };
}

/**
 * Prochaine échéance de cotisation d'un cercle, déduite de la date de début et du jour de cotisation
 * choisis par le fondateur (sinon du début du cycle ou de l'activation). Les cagnottes d'aide n'en ont pas.
 * TODO: remplacer par la date d'échéance renvoyée par l'API quand elle existera.
 */
export function getNextContribution(circle: Circle, today: Date = new Date()): { date: Date; daysLeft: number } | undefined {
  const t = getContributionTimeline(circle, today);
  return t ? { date: t.next, daysLeft: t.daysLeft } : undefined;
}

/**
 * Calendrier en toutes lettres : « Chaque samedi à partir du 6 décembre »,
 * « Le 5 de chaque mois », « Un samedi sur deux ».
 */
export function describeSchedule(schedule: ContributionSchedule, today: Date = new Date()): string {
  const weekday = schedule.contributionWeekday ? WEEKDAY_NAMES[schedule.contributionWeekday - 1] : undefined;
  let rhythm: string;
  switch (schedule.frequency) {
    case Frequency.DAILY:
      rhythm = 'Chaque jour';
      break;
    case Frequency.WEEKLY:
      rhythm = weekday ? `Chaque ${weekday}` : 'Chaque semaine';
      break;
    case Frequency.BIWEEKLY:
      rhythm = weekday ? `Un ${weekday} sur deux` : 'Toutes les deux semaines';
      break;
    default: {
      const d = schedule.contributionMonthDay;
      rhythm = d ? `Le ${d === 1 ? '1er' : d} de chaque mois` : 'Chaque mois';
    }
  }
  const start = parseDay(schedule.startDate);
  if (!start) return rhythm;
  const first = firstDueDate(schedule, start);
  return `${rhythm} ${first < startOfDay(today) ? 'depuis le' : 'à partir du'} ${formatDayMonth(first)}`;
}

/** « aujourd'hui », « demain », « dans 3 jours ». */
export function formatDueIn(daysLeft: number): string {
  if (daysLeft <= 0) return 'aujourd’hui';
  if (daysLeft === 1) return 'demain';
  return `dans ${daysLeft} jours`;
}

// ── Sauvegarde locale (voir src/lib/persistence.ts) ──

/** État complet du store, sérialisable en JSON (les dates sont déjà des chaînes ISO). */
export type StoreSnapshot = {
  currentUser: User;
  circles: Circle[];
  memberships: typeof mockMemberships;
  membershipRequests: MembershipRequest[];
  departureRequests: DepartureRequest[];
  ledgerEntries: LedgerEntry[];
  solidarityRequests: SolidarityRequest[];
  bureauDecisions: Record<string, Record<string, boolean>>;
  founderCircleIds: string[];
  solidarityValidators: Record<string, string[]>;
  aidAppeals: AidAppeal[];
  /** Absent des sauvegardes plus anciennes. */
  cycles?: Cycle[];
};

export function snapshotStore(): StoreSnapshot {
  return {
    currentUser,
    circles,
    memberships: [...mockMemberships],
    membershipRequests,
    departureRequests,
    ledgerEntries,
    solidarityRequests,
    bureauDecisions,
    founderCircleIds,
    solidarityValidators,
    aidAppeals,
    cycles: [...mockCycles],
  };
}

export function restoreStore(s: StoreSnapshot): void {
  // Champ par champ, avec repli sur l'état courant : une sauvegarde incomplète (ancienne version de
  // l'app, écriture interrompue) ne doit pas laisser un tableau `undefined` qui ferait planter un écran.
  currentUser = s.currentUser ?? currentUser;
  circles = s.circles ?? circles;
  // Les membres vivent dans le tableau mock partagé : on le remplace en place.
  if (s.memberships) mockMemberships.splice(0, mockMemberships.length, ...s.memberships);
  membershipRequests = s.membershipRequests ?? membershipRequests;
  departureRequests = s.departureRequests ?? departureRequests;
  ledgerEntries = s.ledgerEntries ?? ledgerEntries;
  solidarityRequests = s.solidarityRequests ?? solidarityRequests;
  bureauDecisions = s.bureauDecisions ?? bureauDecisions;
  founderCircleIds = s.founderCircleIds ?? founderCircleIds;
  solidarityValidators = s.solidarityValidators ?? solidarityValidators;
  aidAppeals = s.aidAppeals ?? aidAppeals;
  if (s.cycles) mockCycles.splice(0, mockCycles.length, ...s.cycles);
  // Vérification d'identité interrompue par la fermeture de l'app : on relance la simulation.
  if (currentUser.kycStatus === KycStatus.PENDING) submitKycVerification();
}
