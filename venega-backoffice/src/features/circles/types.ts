/** Tontine (espèces ou en nature) ou caisse de solidarité. Pas de type hybride. */
export type CircleKind = 'TONTINE' | 'NATURE' | 'SOLIDARITY';
export type CircleStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED';
export type Frequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type MemberRole = 'PRESIDENT' | 'TREASURER' | 'SECRETARY' | 'MEMBER';
export type MemberPaymentStatus = 'PAID' | 'PENDING' | 'LATE';

export interface CircleMember {
  userId: string;
  name: string;
  role: MemberRole;
  turnOrder?: number;
  paymentStatus: MemberPaymentStatus;
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
  presidentName: string;
  memberCount: number;
  currentTurn: number;
  totalTurns: number;
  collectedThisPeriod: number;
  solidarityBalance: number;
  latePayments: number;
  inviteCode: string;
  createdAt: string;
  members: CircleMember[];
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
};

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  DAILY: 'Quotidienne',
  WEEKLY: 'Hebdomadaire',
  BIWEEKLY: 'Bimensuelle',
  MONTHLY: 'Mensuelle',
};

export const ROLE_LABEL: Record<MemberRole, string> = {
  PRESIDENT: 'Président(e)',
  TREASURER: 'Trésorier(e)',
  SECRETARY: 'Secrétaire',
  MEMBER: 'Membre',
};

export const PAYMENT_STATUS_LABEL: Record<MemberPaymentStatus, string> = {
  PAID: 'Payé',
  PENDING: 'En attente',
  LATE: 'En retard',
};
