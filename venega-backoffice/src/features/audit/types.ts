export type AuditTargetType = 'kyc' | 'fundraiser' | 'alert' | 'user' | 'circle';

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  targetType: AuditTargetType;
  targetLabel: string;
  detail?: string;
  /** true : action faite dans ce navigateur, jamais envoyée au serveur */
  localOnly: boolean;
}

export const AUDIT_TARGET_LABEL: Record<AuditTargetType, string> = {
  kyc: 'KYC',
  fundraiser: 'Cagnotte',
  alert: 'Alerte',
  user: 'Utilisateur',
  circle: 'Cercle',
};
