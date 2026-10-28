import {
  CircleType,
  ContributorVisibility,
  mockAidAppeal,
  mockAidContributions,
  mockCircles,
  mockUsers,
} from '@venega/types';
import type { PublicAppealData, PublicContribution } from './types';

/** Format accepté pour un code d'invitation (évite toute recherche sur une entrée arbitraire). */
const INVITE_CODE_PATTERN = /^[A-Za-z0-9-]{3,32}$/;

export function normalizeInviteCode(raw: string): string | null {
  const code = raw.trim();
  return INVITE_CODE_PATTERN.test(code) ? code.toUpperCase() : null;
}

/**
 * Récupère la cagnotte publique associée à un code d'invitation.
 * Retourne `null` si le code est invalide ou inconnu.
 *
 * TODO: remplacer par l'API — par ex. `GET /public/appeals/:code` (sans
 * authentification) qui renvoie uniquement les champs de `PublicAppeal`
 * et la première page de contributions. Le numéro du bénéficiaire ne doit
 * jamais faire partie de la réponse publique.
 */
export async function getPublicAppeal(rawCode: string): Promise<PublicAppealData | null> {
  const code = normalizeInviteCode(rawCode);
  if (!code) return null;

  const circle = mockCircles.find(
    (c) => c.type === CircleType.AID_APPEAL && c.inviteCode.toUpperCase() === code,
  );
  if (!circle) return null;

  // Mock : tout cercle AID_APPEAL correspond à `mockAidAppeal`.
  const source = mockAidAppeal;
  const organizer = mockUsers[0];

  // Mock : les dates des données de démo sont passées. On les recale sur
  // « maintenant » (dernière contribution il y a ~2 h) pour que la page
  // soit utilisable en démonstration. À supprimer avec le branchement API.
  const latest = Math.max(...mockAidContributions.map((c) => Date.parse(c.createdAt)));
  const shift = Date.now() - 2 * 60 * 60 * 1000 - latest;
  const rebase = (iso: string) => new Date(Date.parse(iso) + shift).toISOString();

  const contributions: PublicContribution[] = mockAidContributions
    .map((c) => ({
      id: c.id,
      displayName:
        c.visibility === ContributorVisibility.ANONYMOUS ? null : c.contributorName ?? null,
      amount: c.amount,
      paymentMethod: c.paymentMethod,
      createdAt: rebase(c.createdAt),
    }))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return {
    appeal: {
      code,
      title: circle.name,
      organizerName: organizer ? `${organizer.firstName} ${organizer.lastName}` : 'un membre Venega',
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

/** URL publique (canonique) d'une cagnotte, utilisée pour le partage et l'Open Graph. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://venega.app').replace(/\/+$/, '');

export function publicAppealUrl(code: string): string {
  return `${SITE_URL}/c/${encodeURIComponent(code)}`;
}

/** Adresse de signalement. TODO: confirmer l'adresse avec l'équipe (ou remplacer par un formulaire). */
export const REPORT_EMAIL = 'signalement@venega.app';
