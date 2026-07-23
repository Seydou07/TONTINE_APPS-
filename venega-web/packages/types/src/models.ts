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
  MembershipRequestStatus,
  ReliabilityEventType,
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

/**
 * Cercle (tontine, solidarité, ou hybride)
 *
 * Le président configure TOUTES ces options à la création du cercle.
 * L'argent circule toujours via CinetPay — le président ne touche jamais les fonds.
 */
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

  // ── Nouvelles options configurables par le président ──

  /**
   * Frais de gestion du président (marge) en XOF par tour.
   * Ex: 500 F de marge sur une cotisation de 10 000 F.
   * Le système verse cette commission automatiquement au président via Venega.
   * Le président ne RETIRE pas l'argent — il reçoit sa commission validée.
   */
  managementFee: number;

  /**
   * Dépôt de garantie obligatoire pour les nouveaux membres.
   * Si activé, le nouveau membre dépose 1 cotisation en garantie.
   * Rendu à la fin du cercle SAUF si impayés → compense.
   */
  depositRequired: boolean;

  /**
   * Si activé, les cotisations restantes sont recalculées
   * quand un membre part sans remplaçant.
   * Sinon, la cagnotte diminue pour les bénéficiaires suivants.
   */
  recalculateOnLeave: boolean;

  /**
   * Nombre de retards avant que le président puisse exclure un membre.
   * Configurable à la création du cercle.
   */
  exclusionThreshold: number;

  /**
   * Si activé, le bénéficiaire doit avoir payé la cotisation
   * du tour SUIVANT pour pouvoir recevoir la cagnotte.
   * Mesure anti-fraude : empêche de toucher et fuir.
   */
  nextPaymentRequired: boolean;

  /**
   * Conditions d'adhésion au cercle, rédigées par le président.
   * Le nouveau membre doit les lire et les approuver avant de rejoindre.
   * Exemple: "Cotisation le 1er de chaque mois avant 18h..."
   */
  conditions: string;

  /**
   * Statut d'activation du cercle.
   * Le président peut mettre en pause temporairement.
   */
  isActive: boolean;

  /** Cycle actif en cours */
  activeCycle?: Cycle;
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

/**
 * Appartenance d'un utilisateur à un cercle.
 *
 * Contient le score de fiabilité individuel du membre dans ce cercle.
 */
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

  // ── Nouvelles données de fiabilité ──

  /**
   * Score de fiabilité du membre dans ce cercle.
   * - À jour = score positif (max 100)
   * - Retard = -1 par retard
   * - Manqué = -3 par manquement
   * - Score < 0 → bénéficiaire bloqué
   */
  reliabilityScore: number;

  /**
   * Indique si ce membre a déjà reçu la cagnotte (bénéficiaire).
   * Si OUI → il ne peut PLUS quitter le cercle.
   */
  hasReceivedPayout: boolean;

  /**
   * Indique si le membre a un dépôt de garantie actif.
   */
  hasDeposit: boolean;
}

/**
 * Demande d'adhésion à un cercle.
 *
 * Le processus : invitation → le candidat lit les conditions →
 * fournit ses infos → le président valide ou rejette.
 */
export interface MembershipRequest {
  id: string;
  circleId: string;
  userId: string;
  status: MembershipRequestStatus;

  /** Informations fournies par le candidat */
  fullName: string;
  phoneNumber: string;
  /** Numéro de dépôt Mobile Money (pour recevoir la cagnotte) */
  depositNumber: string;
  /** URL de la copie CNIB recto */
  cnibFrontUrl: string;
  /** URL de la copie CNIB verso */
  cnibBackUrl: string;

  /** Les conditions du cercle ont été lues et approuvées */
  conditionsAccepted: boolean;

  /**
   * Montant du frais de rachat (cotisations des tours passés).
   * Calculé automatiquement par le système :
   * tours_passés × cotisation_par_tour.
   */
  joiningFee: number;

  /**
   * Montant du dépôt de garantie (si activé).
   * = 1 cotisation tontine.
   */
  depositAmount: number;

  /** Date de la demande */
  createdAt: string;
  /** Date de la décision du président (si validée ou rejetée) */
  decidedAt?: string;
  /** Motif du rejet (si rejetée) */
  rejectionReason?: string;

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
  type: 'PAYMENT_REMINDER' | 'PAYMENT_RECEIVED' | 'AID_REQUEST' | 'AID_APPROVED' | 'PAYOUT' | 'NEW_MEMBER' | 'CHAT' | 'MEMBERSHIP_REQUEST' | 'MEMBERSHIP_APPROVED' | 'MEMBERSHIP_REJECTED' | 'EXCLUSION_WARNING' | 'EXCLUDED';
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

/**
 * Événement de fiabilité d'un membre dans un cercle.
 * Utilisé pour calculer le score de fiabilité et détecter les irréguliers.
 */
export interface ReliabilityEvent {
  id: string;
  userId: string;
  circleId: string;
  cycleId: string;
  /** Type d'événement (ON_TIME, LATE, MISSED, EXCLUDED) */
  type: ReliabilityEventType;
  /** Impact sur le score de fiabilité (-1, -3, etc.) */
  scoreImpact: number;
  /** Description lisible de l'événement */
  description: string;
  createdAt: string;
}

/**
 * État de validation des cotisations pour un tour donné.
 *
 * Le système attend que TOUTES les cotisations soient réunies
 * avant de permettre au président de valider le virement.
 */
export interface TurnValidation {
  circleId: string;
  cycleId: string;
  turnNumber: number;
  /** Nombre total de membres qui doivent payer */
  totalRequired: number;
  /** Nombre de cotisations reçues et validées */
  totalValidated: number;
  /** Le bénéficiaire a-t-il payé le tour suivant ? (si option activée) */
  nextPaymentDone: boolean;
  /** Toutes les conditions sont réunies pour le virement */
  canRelease: boolean;
  /** Montant total dans le pool */
  poolAmount: number;
  /** Montant de la commission du président */
  managementFeeTotal: number;
  /** Montant qui sera versé au bénéficiaire */
  beneficiaryAmount: number;
}
