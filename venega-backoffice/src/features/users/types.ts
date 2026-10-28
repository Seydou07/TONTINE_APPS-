export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export interface AdminUser {
  id: string;
  displayName: string;
  phoneNumber: string;
  city: string;
  kycStatus: KycStatus;
  accountStatus: AccountStatus;
  /** Score de fiabilité (0-100) calculé côté API */
  reputationScore: number;
  circlesCount: number;
  createdAt: string;
  lastActiveAt: string;
  suspensionReason?: string;
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
