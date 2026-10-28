/**
 * VENEGA — Enums métier
 * Source unique pour tous les enums utilisés dans l'application.
 * Ces valeurs doivent correspondre exactement aux ENUM PostgreSQL côté backend.
 */

/** Type de cercle — définit le comportement de l'application pour ce groupe */
export enum CircleType {
  /** Tontine rotative pure (cotisation + cagnotte par tour) */
  TONTINE_ONLY = 'TONTINE_ONLY',
  /** Caisse de solidarité pure (fonds d'entraide sans rotation) */
  SOLIDARITY_ONLY = 'SOLIDARITY_ONLY',
  /** Tontine en nature — l'objectif est un bien (moto, kit alimentaire, ciment…) remis à tour de rôle */
  NATURE = 'NATURE',
  /** Appel à l'aide public — contribution possible sans être membre via un lien partagé */
  AID_APPEAL = 'AID_APPEAL',
}

/** Mode de paiement utilisé pour une transaction */
export enum PaymentMethod {
  ORANGE_MONEY = 'ORANGE_MONEY',
  MOOV_MONEY = 'MOOV_MONEY',
  WAVE = 'WAVE',
  MTN_MOBILE_MONEY = 'MTN_MOBILE_MONEY',
  CASH = 'CASH',
}

/** Règle de remboursement d'un membre qui quitte un cercle */
export enum RefundRule {
  /** Remboursement immédiat des tours cotisés */
  IMMEDIATE = 'IMMEDIATE',
  /** Le partant attend la fin du cycle (remboursé sur la prise du remplaçant) */
  AT_CYCLE_END = 'AT_CYCLE_END',
}

/** Règle de remplacement d'un membre partant */
export enum ReplacementRule {
  /** Le nouveau paie les tours passés (frais de rachat) et prend la place complète */
  PAY_PAST_TURNS = 'PAY_PAST_TURNS',
  /** Le nouveau ne paie pas les tours passés, sa prise est réduite des tours manqués */
  REDUCED_POT = 'REDUCED_POT',
  /** Pas de remplacement, la cagnotte est réajustée à la baisse */
  NONE = 'NONE',
}

/** Règle de déblocage des fonds (solidarité) */
export enum UnlockRule {
  /** Tous les approbateurs désignés doivent approuver */
  ALL_APPROVERS = 'ALL_APPROVERS',
  /** La majorité des approbateurs suffit */
  MAJORITY = 'MAJORITY',
}

/** Visibilité d'un contributeur (appel à l'aide) */
export enum ContributorVisibility {
  PUBLIC = 'PUBLIC',
  ANONYMOUS = 'ANONYMOUS',
}

/** Rôle d'un membre dans un cercle */
export enum Role {
  PRESIDENT = 'PRESIDENT',
  TREASURER = 'TREASURER',
  SECRETARY = 'SECRETARY',
  MEMBER = 'MEMBER',
}

/** Type de transaction financière */
export enum TransactionType {
  /** Cotisation pour la tontine rotative */
  TONTINE_CONTRIBUTION = 'TONTINE_CONTRIBUTION',
  /** Cotisation pour la caisse de solidarité */
  SOLIDARITY_CONTRIBUTION = 'SOLIDARITY_CONTRIBUTION',
  /** Reversement de la cagnotte au bénéficiaire du tour */
  PAYOUT = 'PAYOUT',
  /** Décaissement d'aide depuis le fonds de solidarité */
  ASSISTANCE_DISBURSEMENT = 'ASSISTANCE_DISBURSEMENT',
  /** Frais de rachat d'un nouveau membre (cotisations passées) */
  JOINING_FEE = 'JOINING_FEE',
  /** Dépôt de garantie */
  DEPOSIT = 'DEPOSIT',
}

/** Statut d'une transaction */
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/** Type d'événement de vie pour les demandes d'assistance */
export enum EventType {
  MALADIE = 'MALADIE',
  HOSPITALISATION = 'HOSPITALISATION',
  MARIAGE = 'MARIAGE',
  DECES = 'DECES',
  NAISSANCE = 'NAISSANCE',
  AUTRE = 'AUTRE',
}

/** Statut de vérification KYC */
export enum KycStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

/** Statut d'une demande d'assistance */
export enum AidRequestStatus {
  PENDING = 'PENDING',
  VOTING = 'VOTING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
}

/** Fréquence du cycle */
export enum Frequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

/** Statut de paiement d'un membre pour un cycle donné */
export enum PaymentStatus {
  PAID = 'PAID',
  LATE = 'LATE',
  PENDING = 'PENDING',
}

/** Exigences de documents (KYC) pour les nouveaux membres d'un cercle */
export enum KycRequirement {
  /** Aucun document demandé */
  NONE = 'REQUIRE_NONE',
  /** CNIB (recto + verso) obligatoire */
  CNIB = 'REQUIRE_CNIB',
  /** CNIB (recto + verso) + selfie facial */
  CNIB_SELFIE = 'REQUIRE_CNIB_SELFIE',
}

/** Statut de paiement d'une demande d'adhésion (frais de rachat / dépôt de garantie) */
export enum AdhesionPaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
}

/** Mode de contribution (espèces ou nature) */
export enum ContributionMode {
  CASH = 'CASH',
  NATURE = 'NATURE',
}

/** Statut d'une demande d'adhésion à un cercle */
export enum MembershipRequestStatus {
  /** En attente de validation du président */
  PENDING = 'PENDING',
  /** Validée par le président — le membre peut payer et rejoindre */
  APPROVED = 'APPROVED',
  /** Rejetée par le président */
  REJECTED = 'REJECTED',
  /** Le membre a payé et est officiellement intégré */
  COMPLETED = 'COMPLETED',
}

/** Type d'événement de fiabilité pour le suivi des retards */
export enum ReliabilityEventType {
  /** Cotisation payée à temps */
  ON_TIME = 'ON_TIME',
  /** Cotisation payée en retard */
  LATE = 'LATE',
  /** Cotisation non payée (manquée) */
  MISSED = 'MISSED',
  /** Membre exclu pour impayés */
  EXCLUDED = 'EXCLUDED',
  /** Remboursement partiel après exclusion */
  PARTIAL_REFUND = 'PARTIAL_REFUND',
}

/** Statut d'une demande de départ d'un membre qui n'a pas encore reçu sa cagnotte */
export enum DepartureRequestStatus {
  /** En attente de validation du fondateur */
  PENDING = 'PENDING',
  /** Approuvé — le membre part, les cagnottes sont recalculées */
  APPROVED = 'APPROVED',
  /** Refusé par le fondateur */
  REJECTED = 'REJECTED',
}
