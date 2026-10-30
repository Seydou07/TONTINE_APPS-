import {
  CircleType,
  ContributorVisibility,
  mockAidAppeal,
  mockAidContributions,
  mockCircles,
  mockUsers,
  type AidAppeal,
  type Circle,
} from '@venega/types';
import type { PublicAppeal, PublicAppealData, PublicContribution } from './types';
import { formatXof } from './format';

/** Format accepté pour un code d'invitation (évite toute recherche sur une entrée arbitraire). */
const INVITE_CODE_PATTERN = /^[A-Za-z0-9-]{3,32}$/;

export function normalizeInviteCode(raw: string): string | null {
  const code = raw.trim();
  return INVITE_CODE_PATTERN.test(code) ? code.toUpperCase() : null;
}

/**
 * Données de démonstration : les dates de `mockAidAppeal` / `mockAidContributions` sont
 * passées. On les recale sur « maintenant » (dernière contribution il y a environ 2 h)
 * pour que la page reste utilisable. À supprimer avec le branchement de l'API.
 */
function demoRebase(): (iso: string) => string {
  const latest = Math.max(...mockAidContributions.map((c) => Date.parse(c.createdAt)));
  const shift = Date.now() - 2 * 60 * 60 * 1000 - latest;
  return (iso: string) => new Date(Date.parse(iso) + shift).toISOString();
}

/**
 * Vue publique d'une cagnotte à partir du cercle AID_APPEAL et de sa fiche.
 * Les contributions de démonstration n'existent que pour la cagnotte mockée
 * (même règle que l'écran mobile aid/[id]). Jamais de numéro de téléphone.
 */
export function toPublicAppealData(circle: Circle, source: AidAppeal, organizerName: string): PublicAppealData {
  const isMock = source.id === mockAidAppeal.id;
  const rebase = isMock ? demoRebase() : (iso: string) => iso;

  const contributions: PublicContribution[] = isMock
    ? mockAidContributions
        .map((c) => ({
          id: c.id,
          displayName: c.visibility === ContributorVisibility.ANONYMOUS ? null : (c.contributorName ?? null),
          amount: c.amount,
          paymentMethod: c.paymentMethod,
          createdAt: rebase(c.createdAt),
        }))
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    : [];

  return {
    appeal: {
      code: circle.inviteCode.toUpperCase(),
      title: circle.name,
      organizerName,
      beneficiaryName: source.beneficiaryName,
      beneficiaryPhoto: source.beneficiaryPhoto,
      reason: source.reason,
      goalAmount: circle.rules.goalAmount ?? source.goalAmount,
      collectedAmount: source.collectedAmount,
      contributorCount: source.contributorCount,
      deadline: source.deadline ? rebase(source.deadline) : undefined,
      status: source.status,
      minContribution: circle.rules.minContribution ?? 500,
      approversRequired: circle.rules.approversRequired,
    },
    contributions,
  };
}

/**
 * Récupère la cagnotte publique associée à un code d'invitation (rendu serveur).
 * Retourne `null` si le code est invalide ou inconnu des données de démonstration ;
 * la page tente alors de la retrouver dans les données enregistrées par ce navigateur.
 *
 * TODO API : `GET /public/appeals/:code` (sans authentification) → uniquement les champs
 * de `PublicAppeal` et la première page de contributions (docs/api-mobile.md, section 7).
 * Le numéro du bénéficiaire ne doit jamais faire partie de la réponse publique.
 */
export async function getPublicAppeal(rawCode: string): Promise<PublicAppealData | null> {
  const code = normalizeInviteCode(rawCode);
  if (!code) return null;

  const circle = mockCircles.find((c) => c.type === CircleType.AID_APPEAL && c.inviteCode.toUpperCase() === code);
  if (!circle || mockAidAppeal.circleId !== circle.id) return null;

  const organizer = mockUsers[0];
  return toPublicAppealData(
    circle,
    mockAidAppeal,
    organizer ? `${organizer.firstName} ${organizer.lastName}` : 'un membre Venega',
  );
}

/** URL publique (canonique) d'une cagnotte, utilisée pour le partage et l'Open Graph. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://venega.app').replace(/\/+$/, '');

export function publicAppealUrl(code: string): string {
  return `${SITE_URL}/c/${encodeURIComponent(code)}`;
}

/** Adresse de signalement. TODO API : `POST /public/appeals/:code/reports` (en attendant, adresse à confirmer). */
export const REPORT_EMAIL = 'signalement@venega.app';

/** Description de la cagnotte pour l'aperçu de partage (métadonnées). */
export function appealDescription(appeal: PublicAppeal): string {
  return `Pour ${appeal.beneficiaryName} : ${formatXof(appeal.collectedAmount)} collectés sur ${formatXof(
    appeal.goalAmount,
  )}. Contribution par Orange Money, Moov Money ou Wave, avec votre nom ou anonymement.`;
}
