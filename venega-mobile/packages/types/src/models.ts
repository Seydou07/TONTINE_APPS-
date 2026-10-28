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
  PaymentMethod,
  RefundRule,
  ReplacementRule,
  UnlockRule,
  ContributorVisibility,
  KycRequirement,
  AdhesionPaymentStatus,
  DepartureRequestStatus,
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
 * Cercle (tontine ou solidarité)
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
  activeCycle?: Cycle;
}

/**
 * Règles paramétrables du cercle.
 *
 * Toutes ces règles sont configurées par le fondateur à la création
 * (et modifiables) puis EXÉCUTÉES automatiquement par le backend/hub
 * à chaque transaction. Aucune somme ne reste "en l'air".
 */
export interface CircleRules {
  /**
   * Règle de remboursement d'un membre qui quitte :
   * IMMEDIATE = on lui rembourse les tours cotisés aussitôt ;
   * AT_CYCLE_END = il attend la fin et est remboursé sur la prise du remplaçant.
   */
  refundRule: RefundRule;

  /**
   * Règle de remplacement d'un membre partant :
   * PAY_PAST_TURNS = le nouveau paie les tours passés (frais de rachat) ;
   * REDUCED_POT = le nouveau prend sa cagnotte moins les tours manqués ;
   * NONE = pas de remplacement, la cagnotte est réajustée.
   */
  replacementRule: ReplacementRule;

  /**
   * Règle de déblocage des fonds de solidarité :
   * ALL_APPROVERS = tous les approbateurs doivent valider ;
   * MAJORITY = la majorité suffit.
   */
  unlockRule: UnlockRule;

  /**
   * Nombre d'approbateurs désignés par le fondateur (solidarité).
   * Tant que le seuil n'est pas atteint, l'argent reste bloqué chez CityNet Pay.
   */
  approversRequired: number;

  /**
   * Pourcentage de réserve prélevé sur chaque tour (0 à 20).
   * Ex: 5% => coussin de sécurité pour les départs imprévus.
   */
  reservePercent: number;

  /**
   * Appel à l'aide : accepte-t-on des contributions SANS adhésion
   * (lien public, nom + numéro ou anonyme) ?
   */
  allowPublicContributions: boolean;

  /**
   * Appel à l'aide : montant minimum de contribution (XOF).
   */
  minContribution?: number;

  /**
   * Objectif cible de la collecte (nature / appel à l'aide) en XOF.
   */
  goalAmount?: number;

  /**
   * Le bien visé pour une tontine nature (ex: "Moto Bajaj Boxer",
   * "Kit alimentaire (riz, spaghetti, huile)", "1 tonne de ciment").
   */
  goalItem?: string;

  /** Tontine nature : composition détaillée du bien (marque, quantités…). */
  goalDetails?: string;

  /** Tontine nature : photo du bien remis à chaque tour. */
  goalImageUrl?: string;

  /**
   * Exigences de documents pour les nouveaux membres :
   * REQUIRE_NONE = aucun document ;
   * REQUIRE_CNIB = CNIB (recto + verso) ;
   * REQUIRE_CNIB_SELFIE = CNIB (recto + verso) + selfie facial.
   * Le formulaire d'adhésion s'adapte automatiquement à ce réglage.
   */
  kycRequirement: KycRequirement;
}

/**
 * Cercle (tontine en espèces ou en nature, solidarité, ou appel à l'aide)
 *
 * Le fondateur configure TOUTES ces options à la création du cercle.
 * L'argent circule toujours via CityNet Pay — le fondateur ne touche jamais
 * les fonds : il valide, initie et exécute l'USSD depuis le compte Venega.
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
  /** Nombre maximum de membres autorisés (paramétré à la création) */
  maxMembers?: number;
  /** Cycle actif en cours */
  activeCycleId?: string;
  createdAt: string;

  /**
   * Date d'activation du cercle.
   * Un cercle créé n'est PAS actif tant que le fondateur n'a pas payé
   * les frais de création (2 000 F). L'activation se fait à la réception
   * du paiement (webhook USSD). Tant que `activatedAt` est absent,
   * le cercle n'apparaît pas dans la liste des cercles actifs.
   */
  activatedAt?: string;

  /** Règles paramétrables exécutées par le backend/hub */
  rules: CircleRules;

  // ── Autres options configurables par le président ──

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
  /** URL du selfie facial du candidat (si exigé par le cercle) */
  selfieUrl?: string;

  /** Les conditions du cercle ont été lues et approuvées */
  conditionsAccepted: boolean;

  /**
   * Statut de paiement des frais d'adhésion (rachat + dépôt).
   * Renseigné après le paiement USSD du candidat. Le président
   * le consulte avant d'approuver : tant que ce n'est pas PAYÉ,
   * l'approbation est bloquée.
   */
  paymentStatus?: AdhesionPaymentStatus;
  /** Référence de la transaction de paiement (ex: CP-2026-0017) */
  paymentReference?: string;
  /** Date du paiement */
  paidAt?: string;

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
  /** Référence de la transaction CityNet Pay */
  providerReference?: string;
  /** Nom d'affichage du membre pour les vues UI */
  memberName: string;
  /** Mode de paiement utilisé (Orange, Moov, Wave…) */
  paymentMethod?: PaymentMethod;
  /** Visibilité du contributeur (appel à l'aide) */
  visibility?: ContributorVisibility;
  createdAt: string;
}

/**
 * Appel à l'aide public.
 *
 * Créé par un fondateur puis partagé par lien : n'importe qui peut
 * contribuer SANS être membre (nom + numéro ou anonyme).
 * Les fonds restent bloqués chez CityNet Pay jusqu'à l'approbation
 * des approbateurs désignés, puis partent au bénéficiaire.
 */
export interface AidAppeal {
  id: string;
  circleId: string;
  /** Nom de la personne aidée */
  beneficiaryName: string;
  /** Photo de la personne aidée */
  beneficiaryPhoto?: string;
  /** Numéro Mobile Money du bénéficiaire */
  beneficiaryNumber: string;
  /** Raison de l'appel */
  reason: string;
  /** Montant objectif en XOF */
  goalAmount: number;
  /** Montant déjà collecté en XOF */
  collectedAmount: number;
  /** Nombre total de contributeurs (y compris anonymes) */
  contributorCount: number;
  /** Date limite de collecte (optionnelle) */
  deadline?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CLOSED';
  createdAt: string;
}

/**
 * Contribution publique à un appel à l'aide.
 *
 * La liste est paginée côté serveur : même avec des milliers de
 * contributeurs, on charge page par page (nom ou anonyme, montant,
 * date, mode de paiement).
 */
export interface AidContribution {
  id: string;
  appealId: string;
  /** Nom du contributeur (absent si anonyme) */
  contributorName?: string;
  visibility: ContributorVisibility;
  amount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

/**
 * Versement initié par le fondateur depuis le compte hub (CityNet Pay).
 *
 * Le fondateur initie le paiement : le système s'arme pour recevoir le
 * paiement USSD d'un montant donné. Quand l'USSD est exécuté et le paiement
 * envoyé, le système le détecte et valide la transaction automatiquement.
 * Le bénéficiaire reçoit sa cagnotte, le fondateur sa commission nette.
 * Rien n'apparaît dans l'historique tant que le versement n'est PAS payé.
 */
export interface PayoutRecord {
  id: string;
  circleId: string;
  cycleId: string;
  /** Nom du bénéficiaire de la cagnotte */
  beneficiaryName: string;
  beneficiaryAvatar?: string;
  /** Montant total débité du compte hub (cagnotte + frais + commission) */
  totalAmount: number;
  /** Cagnotte nette reçue par le bénéficiaire */
  beneficiaryAmount: number;
  /** Frais de gestion nets crédités au fondateur */
  founderFees: number;
  /** Commission Venega (sur les frais de gestion) */
  venegaCommission: number;
  /** Opérateur Mobile Money utilisé pour l'exécution */
  operator: string;
  /** Seuls les versements PAYÉS apparaissent dans l'historique */
  status: 'PAID' | 'PENDING';
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

/**
 * Entrée du grand livre comptable de solidarité.
 *
 * CREDIT = cotisation d'un membre dans la caisse ; DEBIT = déboursement
 * (aide validée). Chaque entrée est tracée et publique pour les membres :
 * la caisse est transparente.
 */
export interface LedgerEntry {
  id: string;
  circleId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  /** Solde après cette opération */
  balanceAfter: number;
  description: string;
  /** Membre à l'origine du crédit (cotisation) ou bénéficiaire du débit (aide) */
  userId?: string;
  /** Nom d'affichage du membre (CREDIT) ou du bénéficiaire (DEBIT) */
  memberName?: string;
  /** Motif détaillé du déboursement, visible de tous — la caisse doit toujours justifier son usage */
  reason?: string;
  /** Justificatif du déboursement (facture, reçu, photo…) — exigé pour les DEBIT */
  proofUrl?: string;
  /** Référence de la transaction liée (CityNet Pay) */
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

/**
 * Demande de départ d'un membre qui n'a PAS encore reçu sa cagnotte.
 *
 * Logique : je paie N tours, je n'ai jamais reçu de cagnotte, je veux
 * quitter. Le fondateur approuve SANS ajouter de membre → les cagnottes
 * des tours restants sont recalculées automatiquement (les membres
 * restants cotisent un peu plus pour garder le pot entier).
 *
 * Le remboursement se fait main à main : ceux qui ont BÉNÉFICIÉ de mes
 * tours (les bénéficiaires des tours que j'ai payés) me remettent mon
 * argent. L'app affiche la ventilation (qui me doit quoi), sans tracer
 * le paiement pour l'instant.
 */
export interface DepartureRequest {
  id: string;
  circleId: string;
  userId: string;
  /** Nom du membre qui veut partir (pour l'affichage fondateur) */
  memberName: string;
  status: DepartureRequestStatus;
  /** Nombre de tours déjà cotisés (jamais reçus) */
  pastTurns: number;
  /** Montant total cotisé à récupérer = pastTurns × cotisation */
  totalRecover: number;
  /** Ventilation du remboursement : chaque bénéficiaire d'un tour cotisé rembourse sa part */
  reimbursements: DepartureReimbursement[];
  /** Nouvelle cotisation par membre après recalcul des cagnottes (si approuvé) */
  recalculatedContribution?: number;
  /** Date de la demande */
  createdAt: string;
  decidedAt?: string;
  rejectionReason?: string;
}

/** Une part à rembourser : le bénéficiaire du tour N doit rembourser une cotisation. */
export interface DepartureReimbursement {
  /** Numéro du tour dont le bénéficiaire doit rembourser */
  turnNumber: number;
  /** Nom du bénéficiaire de ce tour (celui qui doit rembourser) */
  beneficiaryName: string;
  /** Montant à rembourser (une cotisation tontine) */
  amount: number;
}
