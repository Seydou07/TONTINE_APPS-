/**
 * VENEGA — Store local des cercles (démo du site, copie de venega-mobile/src/features/circles/circleStore.ts)
 *
 * Même logique métier et mêmes libellés que l'app mobile. Chaque écriture appelle
 * `emitChange()` : les vues qui utilisent `useDemoStore()` se ré-affichent.
 * TODO API : remplacer chaque fonction par l'endpoint indiqué dans docs/api-mobile.md
 * (GET /circles/my, POST /circles, GET /circles/join/:inviteCode, GET|PATCH requests,
 * POST /circles/:id/departures, /solidarity/..., POST /appeals…).
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
} from '@venega/types';
import { isDemoMode } from '@/lib/demo';
import { emitChange } from '@/lib/demoStore';

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
  emitChange();
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
      emitChange();
    }
  }, 12000);
  emitChange();
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
  emitChange();
}

// ── Écriture ──

export function addCircle(circle: Circle): void {
  circles = [circle, ...circles];
  founderCircleIds = [circle.id, ...founderCircleIds];
  emitChange();
}

export function updateCircle(id: string, patch: Partial<Circle>): void {
  circles = circles.map((c) => (c.id === id ? { ...c, ...patch } : c));
  emitChange();
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
  emitChange();
}

/**
 * Change la position d'un membre dans l'ordre de rotation d'une tontine.
 * Échange sa place avec celle du membre qui occupe déjà le tour visé, pour
 * que chaque tour reste attribué à une seule personne à la fois.
 */
export function setMemberTurnOrder(circleId: string, userId: string, newTurnOrder: number): void {
  const member = mockMemberships.find((m) => m.circleId === circleId && m.userId === userId);
  if (!member || member.turnOrder === undefined) return;
  const previousTurnOrder = member.turnOrder;
  mockMemberships.forEach((m, idx) => {
    if (m.circleId !== circleId) return;
    if (m.userId === userId) {
      mockMemberships[idx] = { ...m, turnOrder: newTurnOrder };
    } else if (m.turnOrder === newTurnOrder) {
      mockMemberships[idx] = { ...m, turnOrder: previousTurnOrder };
    }
  });
  emitChange();
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
  emitChange();
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

  if (isRemoving) {
    const hasPendingRequest = solidarityRequests.some(
      (r) => r.circleId === circleId && r.status === AidRequestStatus.APPROVED
    );
    if (hasPendingRequest) {
      return { success: false, reason: 'Une demande est en cours de validation — impossible de retirer un approbateur maintenant.' };
    }
  }

  const next = isRemoving ? current.filter((id) => id !== userId) : [...current, userId];
  solidarityValidators = { ...solidarityValidators, [circleId]: next };
  emitChange();
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
  emitChange();
}

export function addMembershipRequest(request: MembershipRequest): void {
  membershipRequests = [request, ...membershipRequests];
  emitChange();
}

export function updateMembershipRequest(
  id: string,
  patch: Partial<MembershipRequest>
): void {
  membershipRequests = membershipRequests.map((r) => (r.id === id ? { ...r, ...patch } : r));
  emitChange();
}

export function updateDepartureRequest(
  id: string,
  patch: Partial<DepartureRequest>
): void {
  departureRequests = departureRequests.map((r) => (r.id === id ? { ...r, ...patch } : r));
  emitChange();
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
  emitChange();
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
  emitChange();
}

/** Refuse une demande de départ (le membre reste dans le cercle). */
export function rejectDeparture(id: string, reason?: string): void {
  departureRequests = departureRequests.map((r) =>
    r.id === id
      ? { ...r, status: DepartureRequestStatus.REJECTED, decidedAt: new Date().toISOString(), rejectionReason: reason }
      : r
  );
  emitChange();
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
  emitChange();
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
  emitChange();
}

/** Vrai quand tous les validateurs désignés du cercle ont approuvé. */
export function isBureauFullyApproved(circleId: string, requestId: string): boolean {
  const validators = getSolidarityValidators(circleId);
  if (validators.length === 0) return false;
  const decisions = getBureauDecisions(requestId);
  return validators.every((v) => decisions[v] === true);
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
  emitChange();
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
  deadline?: string;
  beneficiaryPhoto?: string;
}): { circle: Circle; appeal: AidAppeal } {
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
      minContribution: 500,
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
    status: 'ACTIVE',
    createdAt: now,
  };
  addCircle(circle);
  aidAppeals = [appeal, ...aidAppeals];
  emitChange();
  return { circle, appeal };
}

// ── Prochaine cotisation ──

const DAY_MS = 86400000;

/**
 * Prochaine échéance de cotisation d'un cercle, déduite du début du cycle (ou de l'activation)
 * et de la fréquence. Les cagnottes d'aide n'ont pas d'échéance.
 * TODO: remplacer par la date d'échéance renvoyée par l'API quand elle existera.
 */
export function getNextContribution(circle: Circle): { date: Date; daysLeft: number } | undefined {
  if (circle.type === CircleType.AID_APPEAL) return undefined;
  const cycle = getActiveCycle(circle);
  const start = new Date(cycle?.startDate ?? circle.activatedAt ?? circle.createdAt);
  if (Number.isNaN(start.getTime())) return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(start);
  next.setHours(0, 0, 0, 0);

  const advance = () => {
    if (circle.frequency === Frequency.DAILY) next.setDate(next.getDate() + 1);
    else if (circle.frequency === Frequency.WEEKLY) next.setDate(next.getDate() + 7);
    else if (circle.frequency === Frequency.BIWEEKLY) next.setDate(next.getDate() + 14);
    else next.setMonth(next.getMonth() + 1);
  };
  // Borne de sécurité : au plus quelques années d'échéances quotidiennes.
  for (let i = 0; next < today && i < 2000; i++) advance();

  return { date: next, daysLeft: Math.round((next.getTime() - today.getTime()) / DAY_MS) };
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
  };
}

export function restoreStore(s: StoreSnapshot): void {
  currentUser = s.currentUser;
  circles = s.circles;
  // Les membres vivent dans le tableau mock partagé : on le remplace en place.
  mockMemberships.splice(0, mockMemberships.length, ...s.memberships);
  membershipRequests = s.membershipRequests;
  departureRequests = s.departureRequests;
  ledgerEntries = s.ledgerEntries;
  solidarityRequests = s.solidarityRequests;
  bureauDecisions = s.bureauDecisions;
  founderCircleIds = s.founderCircleIds;
  solidarityValidators = s.solidarityValidators;
  aidAppeals = s.aidAppeals;
  // Vérification d'identité interrompue par la fermeture de l'app : on relance la simulation.
  if (currentUser.kycStatus === KycStatus.PENDING) submitKycVerification();
  emitChange();
}
