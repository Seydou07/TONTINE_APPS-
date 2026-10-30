import { AidRequestStatus, EventType, Role } from '@venega/types';

/** Libellés de la caisse de solidarité (identiques aux écrans mobiles). */
export const eventTypeLabel: Record<EventType, string> = {
  [EventType.MALADIE]: 'Maladie',
  [EventType.HOSPITALISATION]: 'Hospitalisation',
  [EventType.MARIAGE]: 'Mariage',
  [EventType.DECES]: 'Décès',
  [EventType.NAISSANCE]: 'Naissance',
  [EventType.AUTRE]: 'Autre',
};

/** Rôles affichés dans la liste des membres de la caisse. */
export const solidarityRoleLabel: Record<Role, string> = {
  [Role.PRESIDENT]: 'Présidente',
  [Role.TREASURER]: 'Trésorier',
  [Role.SECRETARY]: 'Secrétaire',
  [Role.MEMBER]: 'Membre',
};

export const rolePriority: Record<Role, number> = {
  [Role.PRESIDENT]: 0,
  [Role.TREASURER]: 1,
  [Role.SECRETARY]: 2,
  [Role.MEMBER]: 3,
};

export const monthLabels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

/** « 1 juil. 2026 à 10:00 » */
export function formatDateAt(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' à ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
}

export const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

/** Pastille de statut d'une demande d'aide (libellé + classes Tailwind). */
export const aidStatusMeta: Record<AidRequestStatus, { label: string; className: string }> = {
  [AidRequestStatus.PENDING]: { label: 'En attente', className: 'bg-amber-tint text-amber-dark' },
  [AidRequestStatus.VOTING]: { label: 'En attente', className: 'bg-amber-tint text-amber-dark' },
  [AidRequestStatus.APPROVED]: { label: 'À valider', className: 'bg-amber-tint text-amber-dark' },
  [AidRequestStatus.REJECTED]: { label: 'Rejetée', className: 'bg-danger-tint text-danger' },
  [AidRequestStatus.DISBURSED]: { label: 'Décaissée', className: 'bg-primary-tint text-primary' },
};
