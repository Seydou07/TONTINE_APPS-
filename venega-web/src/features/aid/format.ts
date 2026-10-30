import { PaymentMethod } from '@venega/types';

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** 318500 -> "318 500" */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** 318500 -> "318 500 F" */
export function formatXof(value: number): string {
  return `${formatNumber(value)} F`;
}

const DAY = 24 * 60 * 60 * 1000;

/** Nombre de jours restants (arrondi au supérieur), ou null si la date est passée. */
export function daysLeft(deadline: string | undefined, now: number): number | null {
  if (!deadline) return null;
  const diff = Date.parse(deadline) - now;
  if (Number.isNaN(diff) || diff <= 0) return null;
  return Math.ceil(diff / DAY);
}

export function progressPercent(collected: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((collected / goal) * 100));
}

export interface OperatorInfo {
  label: string;
  /** Couleur de marque — à n'utiliser qu'en petit accent */
  color: string;
}

export const OPERATORS: Record<PaymentMethod, OperatorInfo> = {
  [PaymentMethod.ORANGE_MONEY]: { label: 'Orange Money', color: '#FF7900' },
  [PaymentMethod.MOOV_MONEY]: { label: 'Moov Money', color: '#005CA9' },
  [PaymentMethod.WAVE]: { label: 'Wave', color: '#1DC3F6' },
  [PaymentMethod.MTN_MOBILE_MONEY]: { label: 'MTN MoMo', color: '#FFCC00' },
  [PaymentMethod.CASH]: { label: 'Espèces', color: '#5B6B65' },
};
