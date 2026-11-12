/**
 * Libellés partagés des réglages d'un cercle (création, paramètres, gestion) :
 * un même réglage porte le même nom partout.
 */
import {
  CircleType,
  Frequency,
  KycRequirement,
  ReplacementRule,
  TurnOrderMethod,
  UnlockRule,
} from '@venega/types';
import type { Circle } from '@venega/types';

export const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' F';
export const formatXOFLong = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' F CFA';
export const toNumber = (v: string) => parseInt(v.replace(/\D/g, ''), 10) || 0;

export const FREQUENCY_OPTIONS: { key: Frequency; label: string; short: string }[] = [
  { key: Frequency.DAILY, label: 'Chaque jour', short: 'Quotidienne' },
  { key: Frequency.WEEKLY, label: 'Chaque semaine', short: 'Hebdomadaire' },
  { key: Frequency.BIWEEKLY, label: 'Toutes les 2 semaines', short: 'Quinzaine' },
  { key: Frequency.MONTHLY, label: 'Chaque mois', short: 'Mensuelle' },
];

export const frequencyLabel = (f: Frequency | string) =>
  FREQUENCY_OPTIONS.find((o) => o.key === f)?.label ?? 'Chaque mois';

export const TURN_ORDER_OPTIONS: { key: TurnOrderMethod; label: string; desc: string }[] = [
  {
    key: TurnOrderMethod.FIXED_BY_FOUNDER,
    label: 'Fixé par le fondateur',
    desc: 'Vous placez chaque membre. Modifiable jusqu’au premier tour.',
  },
  {
    key: TurnOrderMethod.RANDOM_DRAW,
    label: 'Tirage au sort',
    desc: 'Tiré une seule fois au démarrage, visible par tous. Personne ne peut le changer.',
  },
  {
    key: TurnOrderMethod.ARRIVAL_ORDER,
    label: 'Ordre d’arrivée',
    desc: 'Le premier inscrit reçoit en premier.',
  },
];

export const turnOrderLabel = (m?: TurnOrderMethod) =>
  TURN_ORDER_OPTIONS.find((o) => o.key === (m ?? TurnOrderMethod.FIXED_BY_FOUNDER))!.label;

export const KYC_OPTIONS: { key: KycRequirement; label: string; desc: string; badge?: string }[] = [
  { key: KycRequirement.CNIB_SELFIE, label: 'CNIB + selfie', desc: 'Vérification complète de l’identité', badge: 'Recommandé' },
  { key: KycRequirement.CNIB, label: 'CNIB uniquement', desc: 'Pièce d’identité recto et verso' },
  { key: KycRequirement.NONE, label: 'Aucun document', desc: 'Pour un cercle entre proches de confiance' },
];

export const kycLabel = (k?: KycRequirement) => KYC_OPTIONS.find((o) => o.key === k)?.label ?? 'Aucun document';

export const LEAVING_OPTIONS: { key: ReplacementRule; label: string; desc: string }[] = [
  {
    key: ReplacementRule.PAY_PAST_TURNS,
    label: 'Rachat des tours passés',
    desc: 'Le remplaçant rachète les cotisations déjà versées',
  },
  {
    key: ReplacementRule.REDUCED_POT,
    label: 'Cagnotte ajustée',
    desc: 'La cagnotte s’adapte au nombre de membres restants',
  },
];

export const leavingLabel = (r?: ReplacementRule) =>
  r === ReplacementRule.NONE ? 'Sans remplacement' : LEAVING_OPTIONS.find((o) => o.key === r)?.label ?? '—';

export const UNLOCK_OPTIONS: { key: UnlockRule; label: string }[] = [
  { key: UnlockRule.ALL_APPROVERS, label: 'Tous' },
  { key: UnlockRule.MAJORITY, label: 'La majorité' },
];

export const EXCLUSION_OPTIONS = [2, 3, 4, 5];

export function circleTypeLabel(circle: Pick<Circle, 'type'>): string {
  switch (circle.type) {
    case CircleType.SOLIDARITY_ONLY:
      return 'Caisse de solidarité';
    case CircleType.NATURE:
      return 'Tontine en nature';
    case CircleType.AID_APPEAL:
      return 'Cagnotte d’aide';
    default:
      return 'Tontine en argent';
  }
}
