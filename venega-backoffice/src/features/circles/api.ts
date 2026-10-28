/**
 * Cercles (tontines et caisses de solidarité), en lecture seule pour l'instant.
 * Données mock locales tant que l'API admin n'existe pas.
 */
import { db, clone, latency } from '@/mocks/db';
import { matchesQuery, paginate, type ListParams, type Paginated } from '@/lib/list';
import type { AdminCircle, CircleKind } from './types';

export type CircleListItem = Omit<AdminCircle, 'members'>;

// TODO API: GET /api/v1/admin/circles?type=&status=&q=&page=&pageSize=
export async function listCircles(params: ListParams<CircleKind>): Promise<Paginated<CircleListItem>> {
  await latency();
  const items = db.circles
    .filter((c) => !params.status || params.status === 'ALL' || c.kind === params.status)
    .filter((c) => matchesQuery(params.q, c.name, c.presidentName, c.inviteCode))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ members: _members, ...rest }) => rest);
  return clone(paginate(items, params.page, params.pageSize));
}

// TODO API: GET /api/v1/admin/circles/:id  (avec membres et statut de paiement du tour en cours)
export async function getCircle(id: string): Promise<AdminCircle | null> {
  await latency(120);
  const c = db.circles.find((x) => x.id === id);
  return c ? clone(c) : null;
}
