/**
 * Modération des cagnottes d'aide publiques (Circle AID_APPEAL côté API).
 * Données mock locales tant que l'API admin n'existe pas.
 */
import { db, clone, latency } from '@/mocks/db';
import { matchesQuery, paginate, type ListParams, type Paginated } from '@/lib/list';
import { currentActorName } from '@/features/auth/api';
import { recordLocalAction } from '@/features/audit/api';
import type { Fundraiser, FundraiserAction, FundraiserStatus } from './types';

export type FundraiserFilter = FundraiserStatus | 'REPORTED';

// TODO API: GET /api/v1/admin/fundraisers?status=&reported=true&q=&page=&pageSize=
export async function listFundraisers(params: ListParams<FundraiserFilter>): Promise<Paginated<Fundraiser>> {
  await latency();
  const items = db.fundraisers
    .filter((f) => {
      if (!params.status || params.status === 'ALL') return true;
      if (params.status === 'REPORTED') return f.reports.length > 0;
      return f.status === params.status;
    })
    .filter((f) => matchesQuery(params.q, f.title, f.code, f.organizerName, f.organizerPhone))
    .sort((a, b) => b.reports.length - a.reports.length || b.createdAt.localeCompare(a.createdAt));
  return clone(paginate(items, params.page, params.pageSize));
}

// TODO API: GET /api/v1/admin/fundraisers/:id  (inclut les signalements)
export async function getFundraiser(id: string): Promise<Fundraiser | null> {
  await latency(120);
  const f = db.fundraisers.find((x) => x.id === id);
  return f ? clone(f) : null;
}

// TODO API: GET /api/v1/admin/fundraisers/counts
export async function getFundraiserCounts(): Promise<Record<FundraiserFilter, number>> {
  await latency(100);
  const count = (s: FundraiserStatus) => db.fundraisers.filter((f) => f.status === s).length;
  return {
    PENDING: count('PENDING'),
    ACTIVE: count('ACTIVE'),
    SUSPENDED: count('SUSPENDED'),
    CLOSED: count('CLOSED'),
    REPORTED: db.fundraisers.filter((f) => f.reports.length > 0 && f.status !== 'CLOSED').length,
  };
}

/** Transitions autorisées depuis chaque statut. */
export const ALLOWED_ACTIONS: Record<FundraiserStatus, FundraiserAction[]> = {
  PENDING: ['ACTIVATE', 'SUSPEND', 'CLOSE'],
  ACTIVE: ['SUSPEND', 'CLOSE'],
  SUSPENDED: ['REACTIVATE', 'CLOSE'],
  CLOSED: [],
};

const NEXT_STATUS: Record<FundraiserAction, FundraiserStatus> = {
  ACTIVATE: 'ACTIVE',
  REACTIVATE: 'ACTIVE',
  SUSPEND: 'SUSPENDED',
  CLOSE: 'CLOSED',
};

const ACTION_LOG: Record<FundraiserAction, string> = {
  ACTIVATE: 'Cagnotte activée',
  REACTIVATE: 'Cagnotte réactivée',
  SUSPEND: 'Cagnotte suspendue',
  CLOSE: 'Cagnotte clôturée',
};

/** Le motif est obligatoire pour suspendre ou clôturer. */
export function actionNeedsReason(action: FundraiserAction): boolean {
  return action === 'SUSPEND' || action === 'CLOSE';
}

// TODO API: POST /api/v1/admin/fundraisers/:id/activate
// TODO API: POST /api/v1/admin/fundraisers/:id/suspend     { reason }
// TODO API: POST /api/v1/admin/fundraisers/:id/reactivate  { note? }
// TODO API: POST /api/v1/admin/fundraisers/:id/close       { reason }
export async function moderateFundraiser(id: string, action: FundraiserAction, reason?: string): Promise<Fundraiser> {
  await latency();
  const f = db.fundraisers.find((x) => x.id === id);
  if (!f) throw new Error('Cagnotte introuvable.');
  if (!ALLOWED_ACTIONS[f.status].includes(action)) throw new Error('Action impossible pour ce statut.');
  const clean = reason?.trim();
  if (actionNeedsReason(action) && (!clean || clean.length < 5)) {
    throw new Error('Le motif est obligatoire (5 caractères minimum).');
  }
  f.status = NEXT_STATUS[action];
  f.moderatedAt = new Date().toISOString();
  f.moderatedBy = currentActorName();
  if (clean) f.moderationNote = clean;
  recordLocalAction({ action: ACTION_LOG[action], targetType: 'fundraiser', targetLabel: f.title, detail: clean });
  return clone(f);
}
