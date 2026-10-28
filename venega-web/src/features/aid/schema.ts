import { z } from 'zod';
import { PaymentMethod } from '@venega/types';
import { formatXof } from './format';

/** Opérateurs proposés pour une contribution publique. */
export const PAYABLE_OPERATORS = [
  PaymentMethod.ORANGE_MONEY,
  PaymentMethod.MOOV_MONEY,
  PaymentMethod.WAVE,
] as const;
export type PayableOperator = (typeof PAYABLE_OPERATORS)[number];

export const AMOUNT_PRESETS = [1000, 2000, 5000, 10000] as const;

/** Plafond côté client (le backend reste seul juge des plafonds réels). */
export const MAX_CONTRIBUTION = 2_000_000;
export const NAME_MIN = 2;
export const NAME_MAX = 60;
export const MESSAGE_MAX = 140;

// Lettres (toutes langues), espaces, apostrophes, points et tirets.
const NAME_PATTERN = new RegExp("^[\\p{L}\\p{M}'\\u2019 .-]+$", 'u');
// Caractères de contrôle interdits dans le message.
const CONTROL_CHARS = new RegExp('[\\u0000-\\u001F\\u007F]', 'u');

export function isPayableOperator(value: string): value is PayableOperator {
  return (PAYABLE_OPERATORS as readonly string[]).includes(value);
}

/** Retire espaces et séparateurs d'un numéro local saisi ("70 12 34 56" -> "70123456"). */
export function normalizePhone(raw: string): string {
  return raw.replace(/[\s.-]/g, '');
}

export function buildContributionSchema(minContribution: number) {
  return z
    .object({
      amount: z
        .string()
        .trim()
        .regex(/^\d{1,7}$/, 'Saisissez un montant en chiffres.')
        .refine((v) => Number(v) >= minContribution, {
          message: `Le montant minimum est de ${formatXof(minContribution)}.`,
        })
        .refine((v) => Number(v) <= MAX_CONTRIBUTION, {
          message: `Le montant maximum est de ${formatXof(MAX_CONTRIBUTION)}.`,
        }),
      anonymous: z.boolean(),
      name: z.string().trim().max(NAME_MAX, `${NAME_MAX} caractères maximum.`),
      message: z
        .string()
        .trim()
        .max(MESSAGE_MAX, `${MESSAGE_MAX} caractères maximum.`)
        .refine((v) => !CONTROL_CHARS.test(v), { message: 'Caractères non autorisés.' }),
      // z.string + refine (plutôt que z.enum) : une valeur vide reste une
      // erreur « non bloquante » pour Zod, ce qui permet au superRefine du
      // nom de s'exécuter et d'afficher toutes les erreurs en une fois.
      operator: z
        .string()
        .refine((v): boolean => isPayableOperator(v), {
          message: 'Choisissez votre opérateur.',
        }),
      phone: z
        .string()
        .refine((v) => /^\d{8}$/.test(normalizePhone(v)), {
          message: 'Le numéro doit comporter 8 chiffres.',
        }),
    })
    .superRefine((values, ctx) => {
      if (values.anonymous) return;
      if (values.name.length < NAME_MIN) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['name'],
          message: 'Indiquez votre nom (2 caractères minimum).',
        });
      } else if (!NAME_PATTERN.test(values.name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['name'],
          message: 'Utilisez uniquement des lettres, espaces, apostrophes ou tirets.',
        });
      }
    });
}

export type ContributionSchema = ReturnType<typeof buildContributionSchema>;
export type ContributionValues = z.infer<ContributionSchema>;
