export type Provider = 'ORANGE_MONEY' | 'MOOV_MONEY' | 'WAVE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type PaymentPurpose = 'CONTRIBUTION' | 'ADHESION' | 'CREATION_FEE' | 'DONATION' | 'PAYOUT' | 'SOLIDARITY_AID' | 'REFUND';

/**
 * Paiement Mobile Money (côté API : Transaction + données CinetPay).
 * `matched = false` sur un paiement entrant COMPLETED = argent reçu mais rattaché à aucune
 * cotisation : c'est la file « Paiements à rapprocher ».
 */
export interface Payment {
  id: string;
  /** Référence Venega, donnée à l'utilisateur dans l'app */
  reference: string;
  /** Référence opérateur (SMS de confirmation reçu par le payeur) */
  providerReference?: string;
  provider: Provider;
  direction: 'IN' | 'OUT';
  purpose: PaymentPurpose;
  /** Numéro qui a payé (entrant) ou qui reçoit (sortant) */
  payerPhone: string;
  userId?: string;
  userName?: string;
  circleId?: string;
  circleName?: string;
  turn?: number;
  amount: number;
  status: PaymentStatus;
  failureReason?: string;
  createdAt: string;
  confirmedAt?: string;
  matched: boolean;
  /** Pourquoi le rattachement automatique a échoué */
  unmatchedReason?: string;
  matchedBy?: string;
  matchedAt?: string;
  matchNote?: string;
}

export type RefundStatus = 'REQUESTED' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface RefundStep {
  at: string;
  by: string;
  status: RefundStatus;
  note: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  paymentReference: string;
  providerReference?: string;
  provider: Provider;
  userId?: string;
  userName: string;
  destination: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  history: RefundStep[];
}

export const PROVIDER_LABEL: Record<Provider, string> = {
  ORANGE_MONEY: 'Orange Money',
  MOOV_MONEY: 'Moov Money',
  WAVE: 'Wave',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'En attente',
  COMPLETED: 'Confirmé',
  FAILED: 'Échoué',
};

export const PURPOSE_LABEL: Record<PaymentPurpose, string> = {
  CONTRIBUTION: 'Cotisation',
  ADHESION: 'Adhésion',
  CREATION_FEE: 'Frais de création',
  DONATION: 'Don cagnotte',
  PAYOUT: 'Versement cagnotte',
  SOLIDARITY_AID: 'Aide solidarité',
  REFUND: 'Remboursement',
};

export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  REQUESTED: 'Demandé',
  APPROVED: 'Approuvé',
  PAID: 'Remboursé',
  REJECTED: 'Refusé',
};
