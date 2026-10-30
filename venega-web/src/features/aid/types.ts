import type { PaymentMethod } from '@venega/types';

/**
 * Vue PUBLIQUE d'une cagnotte d'aide, telle qu'affichée sur /c/[code].
 *
 * Volontairement réduite : on n'y met jamais le numéro Mobile Money du
 * bénéficiaire, ni d'identifiant interne inutile côté navigateur.
 */
export interface PublicAppeal {
  /** Code d'invitation (normalisé en majuscules) */
  code: string;
  title: string;
  organizerName: string;
  beneficiaryName: string;
  beneficiaryPhoto?: string;
  reason: string;
  goalAmount: number;
  collectedAmount: number;
  contributorCount: number;
  /** ISO 8601 */
  deadline?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CLOSED';
  /** Montant minimum d'une contribution (XOF) */
  minContribution: number;
  /** Nombre d'approbateurs requis avant le versement */
  approversRequired: number;
}

/** Contribution affichée publiquement (jamais de numéro de téléphone). */
export interface PublicContribution {
  id: string;
  /** null = contributeur anonyme */
  displayName: string | null;
  amount: number;
  /** Absent pour une contribution qui vient d'être faite depuis cette page (démo). */
  paymentMethod?: PaymentMethod;
  /** ISO 8601 */
  createdAt: string;
}

export interface PublicAppealData {
  appeal: PublicAppeal;
  /** Triées de la plus récente à la plus ancienne */
  contributions: PublicContribution[];
}
