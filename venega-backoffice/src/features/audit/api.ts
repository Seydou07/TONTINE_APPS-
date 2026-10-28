import { db, clone, latency, newId } from '@/mocks/db';
import { matchesQuery, paginate, type ListParams, type Paginated } from '@/lib/list';
import { currentActorName } from '@/features/auth/api';
import type { AuditEntry, AuditTargetType } from './types';

// TODO API: GET /api/v1/admin/audit-logs?q=&targetType=&page=&pageSize=
export async function listAuditEntries(params: ListParams<AuditTargetType>): Promise<Paginated<AuditEntry>> {
  await latency();
  const items = db.audit
    .filter((e) => params.status === undefined || params.status === 'ALL' || e.targetType === params.status)
    .filter((e) => matchesQuery(params.q, e.action, e.actor, e.targetLabel, e.detail))
    .sort((a, b) => b.at.localeCompare(a.at));
  return clone(paginate(items, params.page, params.pageSize));
}

/**
 * Journalise une action admin faite en mode local.
 * Avec l'API réelle, c'est le serveur qui écrira le journal : cette fonction disparaîtra.
 */
export function recordLocalAction(entry: Pick<AuditEntry, 'action' | 'targetType' | 'targetLabel' | 'detail'>): void {
  db.audit.unshift({
    ...entry,
    id: newId('aud'),
    at: new Date().toISOString(),
    actor: currentActorName(),
    localOnly: true,
  });
}
