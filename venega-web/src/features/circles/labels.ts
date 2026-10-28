import { CircleType, PaymentStatus, Role, type Circle } from '@venega/types';
import { HandHeart, Package, Coins, HeartHandshake } from 'lucide-react';
import type { BadgeTone } from '@/components/ui/Badge';

/**
 * Libellés des cercles. Deux familles seulement : Tontine (en espèces ou en
 * nature) et Caisse de solidarité. Le type hybride n'existe plus.
 */
export function circleTypeLabel(type: CircleType): string {
  switch (type) {
    case CircleType.TONTINE_ONLY:
      return 'Tontine';
    case CircleType.NATURE:
      return 'Tontine en nature';
    case CircleType.SOLIDARITY_ONLY:
      return 'Caisse de solidarité';
    case CircleType.AID_APPEAL:
      return "Cagnotte d'aide";
    default:
      return 'Cercle';
  }
}

export function circleTypeIcon(type: CircleType) {
  switch (type) {
    case CircleType.NATURE:
      return Package;
    case CircleType.SOLIDARITY_ONLY:
      return HandHeart;
    case CircleType.AID_APPEAL:
      return HeartHandshake;
    default:
      return Coins;
  }
}

export function circleTypeTone(type: CircleType): 'green' | 'amber' {
  return type === CircleType.SOLIDARITY_ONLY || type === CircleType.AID_APPEAL ? 'amber' : 'green';
}

export function isTontine(type: CircleType): boolean {
  return type === CircleType.TONTINE_ONLY || type === CircleType.NATURE;
}

/** Montant principal d'une cotisation du cercle. */
export function mainContribution(circle: Circle): number {
  return isTontine(circle.type) ? circle.tontineAmount : circle.solidarityAmount;
}

export const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: 'Chaque jour',
  WEEKLY: 'Chaque semaine',
  BIWEEKLY: 'Toutes les deux semaines',
  MONTHLY: 'Chaque mois',
  QUARTERLY: 'Chaque trimestre',
};

export function frequencyLabel(frequency: string): string {
  return FREQUENCY_LABELS[frequency] ?? frequency;
}

export const ROLE_LABELS: Partial<Record<Role, string>> = {
  [Role.PRESIDENT]: 'Président',
  [Role.TREASURER]: 'Trésorier',
  [Role.SECRETARY]: 'Secrétaire',
};

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: BadgeTone }> = {
  [PaymentStatus.PAID]: { label: 'Payé', tone: 'green' },
  [PaymentStatus.PENDING]: { label: 'En attente', tone: 'amber' },
  [PaymentStatus.LATE]: { label: 'En retard', tone: 'danger' },
};

/** Ton d'un score de fiabilité (sur 100). */
export function scoreTone(score: number): BadgeTone {
  if (score >= 80) return 'green';
  if (score >= 50) return 'amber';
  return 'danger';
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Bon';
  if (score >= 50) return 'Moyen';
  return 'Critique';
}
