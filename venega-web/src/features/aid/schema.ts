import { PaymentMethod } from '@venega/types';

/** Opérateurs Mobile Money proposés pour tout paiement (mêmes que l'app mobile). */
export const PAYABLE_OPERATORS = [PaymentMethod.ORANGE_MONEY, PaymentMethod.MOOV_MONEY, PaymentMethod.WAVE] as const;

export type PayableOperator = (typeof PAYABLE_OPERATORS)[number];
