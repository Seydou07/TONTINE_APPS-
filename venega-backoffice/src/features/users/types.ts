export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';
export type OtpDelivery = 'DELIVERED' | 'PENDING' | 'FAILED';

/** État de connexion du compte : ce qu'il faut regarder quand « je n'arrive pas à me connecter ». */
export interface UserSecurity {
  phoneVerified: boolean;
  /** Échecs de mot de passe consécutifs (verrouillage à 5) */
  failedLoginAttempts: number;
  /** Compte verrouillé jusqu'à cette date (trop d'échecs) */
  lockedUntil?: string;
  otpSentLast24h: number;
  lastOtpSentAt?: string;
  lastOtpDelivery?: OtpDelivery;
  /** Raison de l'échec SMS remontée par l'agrégateur */
  lastOtpError?: string;
  /** Un jeton Expo Push est-il enregistré ? (sinon : aucune notification push) */
  pushTokenRegistered: boolean;
  /** Un code de réinitialisation a été envoyé et pas encore utilisé */
  passwordResetSentAt?: string;
}

export interface PhoneChange {
  from: string;
  to: string;
  at: string;
  by: string;
  reason: string;
}

export interface AdminUser {
  id: string;
  displayName: string;
  phoneNumber: string;
  /** Numéro Mobile Money utilisé pour recevoir les cagnottes (peut différer du téléphone) */
  mobileMoneyNumber?: string;
  city: string;
  kycStatus: KycStatus;
  accountStatus: AccountStatus;
  /** Score de fiabilité (0-100) calculé côté API */
  reputationScore: number;
  circlesCount: number;
  createdAt: string;
  lastActiveAt: string;
  suspensionReason?: string;
  security: UserSecurity;
  phoneHistory: PhoneChange[];
}

export interface UserSession {
  id: string;
  userId: string;
  device: string;
  platform: 'ANDROID' | 'IOS';
  appVersion: string;
  city: string;
  createdAt: string;
  lastSeenAt: string;
}

export const KYC_STATUS_LABEL: Record<KycStatus, string> = {
  NOT_SUBMITTED: 'Non soumis',
  PENDING: 'En attente',
  VERIFIED: 'Vérifié',
  REJECTED: 'Refusé',
};

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
};

export const SUSPEND_PRESETS = [
  'Suspicion de fraude',
  'Plusieurs comptes avec la même CNIB',
  'Usurpation d’identité signalée',
  'Demande de l’utilisateur (téléphone perdu ou volé)',
] as const;
