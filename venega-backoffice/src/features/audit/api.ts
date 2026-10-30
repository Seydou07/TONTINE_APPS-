/**
 * Journal d'audit et notes du support.
 * Avec l'API réelle, c'est le SERVEUR qui écrit le journal à chaque action admin
 * (qui, rôle, quand, quoi, cible, motif, avant / après) ; il doit être en ajout seul
 * (aucune modification ni suppression possible, même par un super admin).
 */
import { db, clone, latency, newId } from '@/mocks/db';
import { matchesQuery, paginate, type ListParams, type Paginated } from '@/lib/list';
import { assertCan, currentActorName, currentRole } from '@/features/auth/api';
import { ADMIN_ROLE_LABEL } from '@/features/auth/permissions';
import type { AuditEntry, AuditTargetType, SupportNote } from './types';

export interface AuditListParams extends ListParams<AuditTargetType> {
  /** Toutes les entrées qui concernent cet objet (cible ou objet lié) */
  subjectId?: string;
}

/**
 * Journal complet : réservé au super admin. L'historique d'une fiche (subjectId) est
 * visible par tous les rôles qui peuvent ouvrir la fiche.
 */
// TODO API: GET /api/v1/admin/audit-logs?q=&targetType=&subjectId=&page=&pageSize=
export async function listAuditEntries(params: AuditListParams): Promise<Paginated<AuditEntry>> {
  await latency();
  if (!params.subjectId) assertCan('audit.viewAll');
  const items = db.audit
    .filter((e) => !params.subjectId || e.targetId === params.subjectId || e.relatedIds?.includes(params.subjectId))
    .filter((e) => params.status === undefined || params.status === 'ALL' || e.targetType === params.status)
    .filter((e) => matchesQuery(params.q, e.action, e.actor, e.targetLabel, e.detail, e.reason, e.before, e.after))
    .sort((a, b) => b.at.localeCompare(a.at));
  return clone(paginate(items, params.page, params.pageSize));
}

/**
 * Journalise une action admin faite en mode local.
 * Avec l'API réelle, c'est le serveur qui écrira le journal : cette fonction disparaîtra.
 */
export function recordLocalAction(
  entry: Pick<AuditEntry, 'action' | 'targetType' | 'targetLabel'> &
    Partial<Pick<AuditEntry, 'targetId' | 'detail' | 'reason' | 'before' | 'after' | 'relatedIds'>>,
): void {
  const role = currentRole();
  db.audit.unshift({
    ...entry,
    id: newId('aud'),
    at: new Date().toISOString(),
    actor: currentActorName(),
    actorRole: role ? ADMIN_ROLE_LABEL[role] : undefined,
    localOnly: true,
  });
}

// TODO API: GET /api/v1/admin/notes?userId=|circleId=
export async function listNotes(subject: { userId?: string; circleId?: string }): Promise<SupportNote[]> {
  await latency(100);
  return clone(
    db.notes
      .filter((n) => (subject.userId && n.userId === subject.userId) || (subject.circleId && n.circleId === subject.circleId))
      .sort((a, b) => b.at.localeCompare(a.at)),
  );
}

// TODO API: POST /api/v1/admin/notes  { userId?, circleId?, text }
export async function addNote(subject: { userId?: string; circleId?: string }, text: string): Promise<SupportNote> {
  await latency();
  assertCan('note.write');
  const clean = text.trim();
  if (clean.length < 3) throw new Error('La note est vide.');
  const note: SupportNote = { id: newId('note'), ...subject, text: clean, author: currentActorName(), at: new Date().toISOString() };
  db.notes.unshift(note);
  return clone(note);
}
