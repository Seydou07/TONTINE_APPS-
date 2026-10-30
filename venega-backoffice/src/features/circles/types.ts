/** Tontine (espèces ou en nature) ou caisse de solidarité. Pas de type hybride. */
export type CircleKind = 'TONTINE' | 'NATURE' | 'SOLIDARITY';
/** PAUSED : mis en pause par le fondateur. FROZEN : gelé par Venega (plus aucun mouvement d'argent). */
export type CircleStatus = 'ACTIVE' | 'PAUSED' | 'FROZEN' | 'COMPLETED';
export type Frequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type MemberRole = 'PRESIDENT' | 'TREASURER' | 'SECRETARY' | 'MEMBER';
export type MemberPaymentStatus = 'PAID' | 'PENDING' | 'LATE';
export type MemberStatus = 'ACTIVE' | 'EXCLUDED' | 'LEFT';

export interface CircleMember {
  userId: string;
  name: string;
  phoneNumber: string;
  role: MemberRole;
  status: MemberStatus;
  turnOrder?: number;
  /** Statut de la cotisation du tour (ou de la période) en cours */
  paymentStatus: MemberPaymentStatus;
  joinedAt: string;
  /** Cotisations actuellement impayées après l'échéance */
  lateCount: number;
  /** Cotisations payées en retard depuis le début du cycle */
  paidLateCount: number;
  remindersSent: number;
  lastReminderAt?: string;
}

/** Une case de la grille membres × tours. */
export type CellStatus = 'PAID' | 'PAID_LATE' | 'PENDING' | 'LATE' | 'UPCOMING';

export interface ContributionCell {
  circleId: string;
  userId: string;
  turn: number;
  status: CellStatus;
  amount: number;
  dueDate: string;
  paidAt?: string;
  paymentId?: string;
}

/**
 * WAITING : cotisations du tour incomplètes · READY : tout est payé, versement à faire par le fondateur ·
 * PROCESSING : envoyé à l'opérateur · PAID : reçu · FAILED : refusé par l'opérateur.
 */
export type PayoutStatus = 'WAITING' | 'READY' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface Payout {
  id: string;
  circleId: string;
  turn: number;
  beneficiaryId: string;
  beneficiaryName: string;
  /** Numéro Mobile Money de réception */
  destination: string;
  amount: number;
  status: PayoutStatus;
  /** Date à partir de laquelle le versement est attendu */
  dueDate: string;
  paidAt?: string;
  paymentId?: string;
  failureReason?: string;
}

export type CircleRequestType = 'JOIN' | 'LEAVE' | 'EXCLUSION' | 'REPLACEMENT';
export type CircleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface CircleRequest {
  id: string;
  circleId: string;
  circleName: string;
  type: CircleRequestType;
  userId: string;
  userName: string;
  status: CircleRequestStatus;
  /** Motif saisi par le membre ou par le fondateur */
  reason: string;
  createdAt: string;
  requestedBy: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNote?: string;
  /** Exclusion contestée par le membre */
  contested?: boolean;
  /** Remplacement : nouvelle personne proposée */
  replacementName?: string;
  replacementPhone?: string;
  /** Départ : somme à récupérer auprès des bénéficiaires des tours déjà cotisés */
  amountToRecover?: number;
}

export interface TurnOrderChange {
  id: string;
  circleId: string;
  at: string;
  by: string;
  byAdmin: boolean;
  userId: string;
  userName: string;
  fromOrder: number;
  toOrder: number;
  swappedWithName?: string;
  reason?: string;
}

export interface CircleEvent {
  id: string;
  circleId: string;
  at: string;
  label: string;
  actor: string;
  detail?: string;
  tone?: 'green' | 'amber' | 'red' | 'neutral';
}

export type SolidarityRequestStatus = 'VOTING' | 'APPROVED' | 'DISBURSED' | 'REJECTED';

export interface SolidarityRequest {
  id: string;
  circleId: string;
  userId: string;
  userName: string;
  eventLabel: string;
  reason: string;
  amount: number;
  status: SolidarityRequestStatus;
  createdAt: string;
  voteDeadline: string;
  votesFor: number;
  votesAgainst: number;
  eligibleVoters: number;
  validatorsApproved: number;
  validatorsTotal: number;
  approvedAt?: string;
  disbursedAt?: string;
  decisionNote?: string;
}

export interface LedgerEntry {
  id: string;
  circleId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceAfter: number;
  label: string;
  at: string;
}

export interface AdminCircle {
  id: string;
  name: string;
  kind: CircleKind;
  /** Cotisation par période en F CFA (valeur estimée pour la nature) */
  contribution: number;
  natureItem?: string;
  frequency: Frequency;
  status: CircleStatus;
  founderId: string;
  founderName: string;
  memberCount: number;
  /** Tour en cours (tontine) ou numéro de période (solidarité) */
  currentTurn: number;
  /** 0 pour une caisse de solidarité (pas de rotation) */
  totalTurns: number;
  cycleNumber: number;
  cycleStartedAt: string;
  collectedThisPeriod: number;
  solidarityBalance: number;
  latePayments: number;
  /** Versements prêts depuis plus de 2 jours ou refusés par l'opérateur */
  overduePayouts: number;
  exclusionThreshold: number;
  inviteCode: string;
  createdAt: string;
  frozenReason?: string;
  frozenAt?: string;
  members: CircleMember[];
}

export interface CircleDetail extends AdminCircle {
  contributions: ContributionCell[];
  payouts: Payout[];
  requests: CircleRequest[];
  orderChanges: TurnOrderChange[];
  events: CircleEvent[];
  solidarityRequests: SolidarityRequest[];
  ledger: LedgerEntry[];
}

export const CIRCLE_KIND_LABEL: Record<CircleKind, string> = {
  TONTINE: 'Tontine',
  NATURE: 'Tontine en nature',
  SOLIDARITY: 'Caisse de solidarité',
};

export const CIRCLE_STATUS_LABEL: Record<CircleStatus, string> = {
  ACTIVE: 'Actif',
  COMPLETED: 'Terminé',
  PAUSED: 'En pause',
  FROZEN: 'Gelé',
};

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  DAILY: 'Quotidienne',
  WEEKLY: 'Hebdomadaire',
  BIWEEKLY: 'Bimensuelle',
  MONTHLY: 'Mensuelle',
};

export const FREQUENCY_DAYS: Record<Frequency, number> = { DAILY: 1, WEEKLY: 7, BIWEEKLY: 14, MONTHLY: 30 };

/** Tontine : fondateur et membres. Caisse de solidarité : président, trésorier, secrétaire, membres. */
export function roleLabel(role: MemberRole, kind: CircleKind): string {
  if (role === 'PRESIDENT') return kind === 'SOLIDARITY' ? 'Président(e)' : 'Fondateur(rice)';
  return ROLE_LABEL[role];
}

export const ROLE_LABEL: Record<MemberRole, string> = {
  PRESIDENT: 'Président(e)',
  TREASURER: 'Trésorier(e)',
  SECRETARY: 'Secrétaire',
  MEMBER: 'Membre',
};

export const PAYMENT_STATUS_LABEL: Record<MemberPaymentStatus, string> = {
  PAID: 'Payé',
  PENDING: 'À payer',
  LATE: 'En retard',
};

export const CELL_STATUS_LABEL: Record<CellStatus, string> = {
  PAID: 'Payé',
  PAID_LATE: 'Payé en retard',
  PENDING: 'À payer',
  LATE: 'En retard',
  UPCOMING: 'À venir',
};

export const PAYOUT_STATUS_LABEL: Record<PayoutStatus, string> = {
  WAITING: 'Cotisations incomplètes',
  READY: 'À verser',
  PROCESSING: 'En cours',
  PAID: 'Versé',
  FAILED: 'Échec',
};

export const REQUEST_TYPE_LABEL: Record<CircleRequestType, string> = {
  JOIN: 'Adhésion',
  LEAVE: 'Départ',
  EXCLUSION: 'Exclusion',
  REPLACEMENT: 'Remplacement',
};

export const REQUEST_STATUS_LABEL: Record<CircleRequestStatus, string> = {
  PENDING: 'En attente',
  APPROVED: 'Acceptée',
  REJECTED: 'Refusée',
  CANCELLED: 'Annulée',
};

export const SOLIDARITY_STATUS_LABEL: Record<SolidarityRequestStatus, string> = {
  VOTING: 'Vote en cours',
  APPROVED: 'Approuvée, à décaisser',
  DISBURSED: 'Décaissée',
  REJECTED: 'Refusée',
};
