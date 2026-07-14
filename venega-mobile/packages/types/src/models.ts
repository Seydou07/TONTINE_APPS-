/**
 * VENEGA — Modèles de données (Interfaces TypeScript)
 * Miroir des tables PostgreSQL, utilisé côté frontend pour le typage.
 * Quand le backend sera prêt, ces types seront validés contre les réponses API.
 */

import {
  CircleType,
  Role,
  TransactionType,
  TransactionStatus,
  EventType,
  KycStatus,
  AidRequestStatus,
  Frequency,
  PaymentStatus,
  ContributionMode,
} from './enums';

/** Utilisateur de la plateforme */
export interface User {
  id: string;
  phoneNumber: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  kycStatus: KycStatus;
  /** Score de réputation basé sur l'historique de paiements (0-100) */
  reputationScore: number;
  createdAt: string;
}

/** Cercle (tontine, solidarité, ou hybride) */
export interface Circle {
  id: string;
  name: string;
  type: CircleType;
  /** Montant de la cotisation tontine en XOF (0 si SOLIDARITY_ONLY) */
  tontineAmount: number;
  /** Montant de la cotisation solidarité en XOF (0 si TONTINE_ONLY) */
  solidarityAmount: number;
  frequency: Frequency;
  /** Mode de contribution : espèces ou nature */
  contributionMode: ContributionMode;
  /** Nombre de bénéficiaires par tour (habituellement 1) */
  beneficiariesPerTurn: number;
  /** Code d'invitation unique */
  inviteCode: string;
  /** Nombre total de membres */
  memberCount: number;
  /** Cycle actif en cours */
  activeCycleId?: string;
  createdAt: string;
}

/** Cycle d'un cercle (une rotation complète ou un exercice comptable) */
export interface Cycle {
  id: string;
  circleId: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  /** Numéro du tour actuel dans la rotation */
  currentTurn: number;
  /** Nombre total de tours dans le cycle */
  totalTurns: number;
  createdAt: string;
}

/** Appartenance d'un utilisateur à un cercle */
export interface Membership {
  userId: string;
  circleId: string;
  role: Role;
  /** Position dans l'ordre de passage (null si SOLIDARITY_ONLY) */
  turnOrder?: number;
  /** Statut de paiement pour le cycle en cours */
  paymentStatus: PaymentStatus;
  joinedAt: string;
  /** Infos utilisateur dépliées */
  user: User;
}

/** Transaction financière */
export interface Transaction {
  id: string;
  userId: string;
  cycleId: string;
  circleId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  /** Référence de la transaction CinetPay */
  providerReference?: string;
  /** Nom d'affichage du membre pour les vues UI */
  memberName: string;
  createdAt: string;
}

/** Demande d'assistance (solidarité) */
export interface SolidarityRequest {
  id: string;
  userId: string;
  cycleId: string;
  circleId: string;
  eventType: EventType;
  reason: string;
  /** Montant demandé en XOF */
  amountRequested: number;
  /** Montant approuvé après validation */
  amountApproved: number;
  status: AidRequestStatus;
  /** Justificatif (URL du fichier uploadé) */
  proofUrl?: string;
  /** Votes des membres */
  votes: AidVote[];
  /** Nom du demandeur pour l'UI */
  requesterName: string;
  requesterAvatar?: string;
  createdAt: string;
}

/** Vote sur une demande d'aide */
export interface AidVote {
  userId: string;
  memberName: string;
  approved: boolean;
  votedAt: string;
}

/** Entrée du grand livre comptable de solidarité */
export interface LedgerEntry {
  id: string;
  circleId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  /** Solde après cette opération */
  balanceAfter: number;
  description: string;
  relatedTransactionId?: string;
  createdAt: string;
}

/** Message dans la messagerie d'un cercle */
export interface ChatMessage {
  id: string;
  circleId: string;
  userId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
}

/** Notification push / in-app */
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'PAYMENT_REMINDER' | 'PAYMENT_RECEIVED' | 'AID_REQUEST' | 'AID_APPROVED' | 'PAYOUT' | 'NEW_MEMBER' | 'CHAT';
  /** Lien de navigation dans l'app */
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

/** Statistiques d'un cercle pour le dashboard */
export interface CircleStats {
  circleId: string;
  totalCollected: number;
  totalPaidOut: number;
  solidarityFundBalance: number;
  memberCount: number;
  paidCount: number;
  lateCount: number;
  pendingCount: number;
  cycleProgress: number; // 0.0 - 1.0
}

/** Statistiques globales pour le backoffice */
export interface AdminStats {
  totalUsers: number;
  totalCircles: number;
  activeCircles: number;
  totalVolumeXOF: number;
  pendingKyc: number;
  pendingAidRequests: number;
  transactionsToday: number;
}
