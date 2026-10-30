export type AuditTargetType = 'kyc' | 'fundraiser' | 'alert' | 'user' | 'circle' | 'payment' | 'refund' | 'ticket';

/** Entrée du journal d'audit : qui, quand, quoi, sur quoi, pourquoi, avant / après. */
export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  actorRole?: string;
  action: string;
  targetType: AuditTargetType;
  targetId?: string;
  targetLabel: string;
  /** Motif saisi par l'admin */
  reason?: string;
  before?: string;
  after?: string;
  detail?: string;
  /** Autres objets concernés (ex. le cercle d'un paiement rattaché), pour l'historique des fiches */
  relatedIds?: string[];
  /** true : action faite dans ce navigateur, jamais envoyée au serveur */
  localOnly: boolean;
}

export interface SupportNote {
  id: string;
  userId?: string;
  circleId?: string;
  text: string;
  author: string;
  at: string;
}

export const AUDIT_TARGET_LABEL: Record<AuditTargetType, string> = {
  kyc: 'KYC',
  fundraiser: 'Cagnotte',
  alert: 'Alerte',
  user: 'Utilisateur',
  circle: 'Cercle',
  payment: 'Paiement',
  refund: 'Remboursement',
  ticket: 'Ticket',
};
