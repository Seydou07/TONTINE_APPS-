export type KycReviewStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type KycDocumentType = 'CNIB' | 'PASSPORT';

export interface KycSubmission {
  id: string;
  userId: string;
  userName: string;
  phoneNumber: string;
  city: string;
  documentType: KycDocumentType;
  documentNumber: string;
  birthDate: string;
  submittedAt: string;
  status: KycReviewStatus;
  images: {
    front: string;
    back: string;
    selfie: string;
  };
  /** Signaux automatiques (doublon de CNIB, photo floue…) à vérifier */
  flags: string[];
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface KycDecision {
  id: string;
  submissionId: string;
  userId: string;
  userName: string;
  documentNumber: string;
  decision: 'VERIFIED' | 'REJECTED';
  reason?: string;
  decidedBy: string;
  decidedAt: string;
  /** true si la décision n'existe que dans l'état local du navigateur */
  localOnly: boolean;
}

export interface KycStats {
  pending: number;
  verifiedLast7d: number;
  rejectedLast7d: number;
  flagged: number;
}

export const KYC_REJECTION_REASONS = [
  'Photo floue ou illisible',
  'Document expiré',
  'Le selfie ne correspond pas au document',
  'Recto ou verso manquant',
  'Informations incohérentes avec le profil',
  'Document déjà utilisé par un autre compte',
] as const;
