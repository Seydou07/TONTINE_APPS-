/**
 * Rôles administrateurs et permissions (moindre privilège).
 *
 * IMPORTANT : ce contrôle est SIMULÉ côté navigateur. Il masque les actions et fait
 * échouer les appels mock, mais il ne protège rien : un utilisateur peut modifier le
 * JavaScript de la page. L'API devra imposer exactement ces règles CÔTÉ SERVEUR
 * (garde NestJS par rôle sur chaque route /api/v1/admin/*, refus 403, journalisation
 * des refus). TODO API : exposer le rôle dans le jeton admin et le vérifier par route.
 */

export type AdminRole = 'SUPER_ADMIN' | 'SUPPORT' | 'KYC_AGENT' | 'FINANCE';

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super admin',
  SUPPORT: 'Support',
  KYC_AGENT: 'Agent KYC',
  FINANCE: 'Finance',
};

export const ADMIN_ROLE_HELP: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Tous les droits, y compris le journal complet.',
  SUPPORT: 'Répond aux appels : comptes, cercles, demandes, tickets.',
  KYC_AGENT: 'Vérifie les pièces d’identité.',
  FINANCE: 'Paiements, rapprochements, remboursements, versements.',
};

export type Permission =
  | 'user.suspend'
  | 'user.security' // renvoyer le code, débloquer, réinitialiser, déconnecter
  | 'user.changePhone'
  | 'kyc.decide'
  | 'kyc.viewDocuments'
  | 'payment.reconcile'
  | 'refund.request'
  | 'refund.decide'
  | 'payout.manage'
  | 'circle.freeze'
  | 'circle.transferFounder'
  | 'circle.requests'
  | 'circle.turnOrder'
  | 'circle.remind'
  | 'solidarity.manage'
  | 'fundraiser.moderate'
  | 'fundraiser.freezeWithdrawals'
  | 'alert.resolve'
  | 'ticket.manage'
  | 'note.write'
  | 'audit.viewAll';

const ALL: AdminRole[] = ['SUPER_ADMIN', 'SUPPORT', 'KYC_AGENT', 'FINANCE'];

const MATRIX: Record<Permission, AdminRole[]> = {
  'user.suspend': ['SUPER_ADMIN', 'SUPPORT'],
  'user.security': ['SUPER_ADMIN', 'SUPPORT'],
  'user.changePhone': ['SUPER_ADMIN', 'SUPPORT'],
  'kyc.decide': ['SUPER_ADMIN', 'KYC_AGENT'],
  'kyc.viewDocuments': ['SUPER_ADMIN', 'KYC_AGENT'],
  'payment.reconcile': ['SUPER_ADMIN', 'FINANCE'],
  'refund.request': ['SUPER_ADMIN', 'SUPPORT', 'FINANCE'],
  'refund.decide': ['SUPER_ADMIN', 'FINANCE'],
  'payout.manage': ['SUPER_ADMIN', 'FINANCE'],
  'circle.freeze': ['SUPER_ADMIN', 'SUPPORT'],
  'circle.transferFounder': ['SUPER_ADMIN', 'SUPPORT'],
  'circle.requests': ['SUPER_ADMIN', 'SUPPORT'],
  'circle.turnOrder': ['SUPER_ADMIN', 'SUPPORT'],
  'circle.remind': ['SUPER_ADMIN', 'SUPPORT', 'FINANCE'],
  'solidarity.manage': ['SUPER_ADMIN', 'FINANCE'],
  'fundraiser.moderate': ['SUPER_ADMIN', 'SUPPORT'],
  'fundraiser.freezeWithdrawals': ['SUPER_ADMIN', 'SUPPORT', 'FINANCE'],
  'alert.resolve': ['SUPER_ADMIN', 'SUPPORT', 'FINANCE'],
  'ticket.manage': ALL,
  'note.write': ALL,
  'audit.viewAll': ['SUPER_ADMIN'],
};

export function roleCan(role: AdminRole | undefined, permission: Permission): boolean {
  return !!role && MATRIX[permission].includes(role);
}

export class ForbiddenError extends Error {
  constructor() {
    super('Votre rôle ne permet pas cette action.');
  }
}
