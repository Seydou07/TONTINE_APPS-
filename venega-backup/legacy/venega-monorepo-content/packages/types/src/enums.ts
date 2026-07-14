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
  /** Tontine + Caisse de solidarité greffée */
  HYBRID = 'HYBRID',
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

/** Mode de contribution (espèces ou nature) */
export enum ContributionMode {
  CASH = 'CASH',
  NATURE = 'NATURE',
}
