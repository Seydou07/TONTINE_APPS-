/** Cagnotte d'aide publique (côté API : Circle de type AID_APPEAL). */
export type FundraiserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

export type FundraiserCategory = 'SANTE' | 'FUNERAILLES' | 'SCOLARITE' | 'SINISTRE' | 'NAISSANCE' | 'AUTRE';

export interface FundraiserReport {
  id: string;
  reason: string;
  reporterLabel: string;
  reportedAt: string;
}

export interface Fundraiser {
  id: string;
  /** Code public : https://venega.app/c/<code> */
  code: string;
  title: string;
  description: string;
  category: FundraiserCategory;
  organizerId: string;
  organizerName: string;
  organizerPhone: string;
  organizerKycVerified: boolean;
  status: FundraiserStatus;
  collected: number;
  goal: number;
  contributorsCount: number;
  createdAt: string;
  endsAt?: string;
  reports: FundraiserReport[];
  /** Dernière note de modération (motif de suspension / clôture) */
  moderationNote?: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

export type FundraiserAction = 'ACTIVATE' | 'SUSPEND' | 'REACTIVATE' | 'CLOSE';

export const FUNDRAISER_STATUS_LABEL: Record<FundraiserStatus, string> = {
  PENDING: 'En attente',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspendue',
  CLOSED: 'Clôturée',
};

export const FUNDRAISER_CATEGORY_LABEL: Record<FundraiserCategory, string> = {
  SANTE: 'Santé',
  FUNERAILLES: 'Funérailles',
  SCOLARITE: 'Scolarité',
  SINISTRE: 'Sinistre',
  NAISSANCE: 'Naissance',
  AUTRE: 'Autre',
};

export const PUBLIC_FUNDRAISER_BASE_URL = 'https://venega.app/c/';
