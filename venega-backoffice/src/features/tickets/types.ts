/** Suivi des appels : un ticket par problème signalé au téléphone. */

export type TicketCategory =
  | 'PAYMENT_MISSING'
  | 'LOGIN_OTP'
  | 'PHONE_CHANGE'
  | 'ACCOUNT_SUSPENDED'
  | 'KYC'
  | 'PAYOUT_MISSING'
  | 'FOUNDER_ISSUE'
  | 'MEMBERSHIP'
  | 'LATE_MEMBER'
  | 'TURN_ORDER'
  | 'REFUND'
  | 'SOLIDARITY'
  | 'FUNDRAISER_FRAUD'
  | 'NOTIFICATIONS'
  | 'OTHER';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type TicketPriority = 'HIGH' | 'NORMAL' | 'LOW';

export interface TicketNote {
  id: string;
  at: string;
  author: string;
  text: string;
}

export interface Ticket {
  id: string;
  /** Numéro lisible donné à l'appelant : T-1042 */
  number: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  callerPhone?: string;
  userId?: string;
  userName?: string;
  circleId?: string;
  circleName?: string;
  fundraiserId?: string;
  fundraiserTitle?: string;
  assignee?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notes: TicketNote[];
}

export interface NewTicket {
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  callerPhone?: string;
  userId?: string;
  circleId?: string;
  fundraiserId?: string;
  assignee?: string;
}

export const TICKET_CATEGORY_LABEL: Record<TicketCategory, string> = {
  PAYMENT_MISSING: 'Cotisation payée mais non visible',
  LOGIN_OTP: 'Connexion / code SMS',
  PHONE_CHANGE: 'SIM perdue / changement de numéro',
  ACCOUNT_SUSPENDED: 'Compte suspendu',
  KYC: 'KYC refusé ou en attente',
  PAYOUT_MISSING: 'Cagnotte / tour non reçu',
  FOUNDER_ISSUE: 'Fondateur absent ou abusif',
  MEMBERSHIP: 'Départ, exclusion, remplacement',
  LATE_MEMBER: 'Membre qui ne paie pas',
  TURN_ORDER: 'Ordre de passage modifié',
  REFUND: 'Double paiement / mauvais montant',
  SOLIDARITY: 'Caisse de solidarité',
  FUNDRAISER_FRAUD: 'Cagnotte signalée',
  NOTIFICATIONS: 'Notifications non reçues',
  OTHER: 'Autre',
};

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: 'Ouvert',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
};

export const TICKET_PRIORITY_LABEL: Record<TicketPriority, string> = {
  HIGH: 'Haute',
  NORMAL: 'Normale',
  LOW: 'Basse',
};
