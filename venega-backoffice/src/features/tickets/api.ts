/**
 * Suivi des appels (tickets support). Données mock locales tant que l'API admin n'existe pas.
 */
import { db, clone, latency, newId, ADMIN_TEAM } from '@/mocks/db';
import { matchesQuery, paginate, type ListParams, type Paginated } from '@/lib/list';
import { phoneMatches, toE164BF } from '@/lib/phone';
import { assertCan, currentActorName } from '@/features/auth/api';
import { recordLocalAction } from '@/features/audit/api';
import {
  TICKET_CATEGORY_LABEL,
  TICKET_STATUS_LABEL,
  type NewTicket,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from './types';

export type TicketFilter = TicketStatus | 'ACTIVE';

export interface TicketListParams extends ListParams<TicketFilter> {
  category?: TicketCategory | 'ALL';
  priority?: TicketPriority | 'ALL';
  assignee?: string | 'ALL' | 'ME' | 'NONE';
  userId?: string;
  circleId?: string;
}

const PRIORITY_ORDER: Record<TicketPriority, number> = { HIGH: 0, NORMAL: 1, LOW: 2 };

// TODO API: GET /api/v1/admin/tickets?status=&category=&priority=&assignee=&userId=&circleId=&q=&page=&pageSize=
export async function listTickets(params: TicketListParams): Promise<Paginated<Ticket>> {
  await latency();
  const me = currentActorName();
  const items = db.tickets
    .filter((t) => !params.userId || t.userId === params.userId)
    .filter((t) => !params.circleId || t.circleId === params.circleId)
    .filter((t) => {
      const s = params.status;
      if (!s || s === 'ALL') return true;
      if (s === 'ACTIVE') return t.status !== 'RESOLVED';
      return t.status === s;
    })
    .filter((t) => !params.category || params.category === 'ALL' || t.category === params.category)
    .filter((t) => !params.priority || params.priority === 'ALL' || t.priority === params.priority)
    .filter((t) => {
      const a = params.assignee;
      if (!a || a === 'ALL') return true;
      if (a === 'ME') return t.assignee === me;
      if (a === 'NONE') return !t.assignee;
      return t.assignee === a;
    })
    .filter(
      (t) =>
        (params.q && t.callerPhone && phoneMatches(params.q, t.callerPhone)) ||
        matchesQuery(params.q, t.number, t.description, t.userName, t.circleName, t.fundraiserTitle, TICKET_CATEGORY_LABEL[t.category]),
    )
    .sort(
      (a, b) =>
        Number(a.status === 'RESOLVED') - Number(b.status === 'RESOLVED') ||
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        b.createdAt.localeCompare(a.createdAt),
    );
  return clone(paginate(items, params.page, params.pageSize));
}

// TODO API: GET /api/v1/admin/tickets/counts
export async function getTicketCounts() {
  await latency(80);
  const active = db.tickets.filter((t) => t.status !== 'RESOLVED');
  return {
    OPEN: db.tickets.filter((t) => t.status === 'OPEN').length,
    IN_PROGRESS: db.tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    active: active.length,
    highActive: active.filter((t) => t.priority === 'HIGH').length,
    unassigned: active.filter((t) => !t.assignee).length,
    mine: active.filter((t) => t.assignee === currentActorName()).length,
  };
}

// TODO API: GET /api/v1/admin/tickets/:id
export async function getTicket(id: string): Promise<Ticket | null> {
  await latency(100);
  const t = db.tickets.find((x) => x.id === id);
  return t ? clone(t) : null;
}

/** Membres de l'équipe pour l'assignation (+ l'admin connecté). */
// TODO API: GET /api/v1/admin/team  (id, nom, rôle — jamais d'e-mail ni de mot de passe)
export async function listTeam(): Promise<string[]> {
  await latency(50);
  const me = currentActorName();
  return [me, ...ADMIN_TEAM.filter((n) => n !== me)];
}

// TODO API: POST /api/v1/admin/tickets  { category, priority, description, callerPhone?, userId?, circleId?, fundraiserId?, assignee? }
export async function createTicket(input: NewTicket): Promise<Ticket> {
  await latency();
  assertCan('ticket.manage');
  const description = input.description.trim();
  if (description.length < 10) throw new Error('Décrivez le problème (10 caractères minimum).');
  let callerPhone: string | undefined;
  if (input.callerPhone?.trim()) {
    callerPhone = toE164BF(input.callerPhone) ?? undefined;
    if (!callerPhone) throw new Error('Numéro de l’appelant invalide (8 chiffres après +226).');
  }
  const user = input.userId ? db.users.find((u) => u.id === input.userId) : undefined;
  const circle = input.circleId ? db.circles.find((c) => c.id === input.circleId) : undefined;
  const fundraiser = input.fundraiserId ? db.fundraisers.find((f) => f.id === input.fundraiserId) : undefined;
  const now = new Date().toISOString();
  const n = db.nextTicketNumber();
  const t: Ticket = {
    id: `tk${n}`,
    number: `T-${n}`,
    category: input.category,
    priority: input.priority,
    status: 'OPEN',
    description,
    callerPhone: callerPhone ?? user?.phoneNumber,
    userId: user?.id,
    userName: user?.displayName,
    circleId: circle?.id,
    circleName: circle?.name,
    fundraiserId: fundraiser?.id,
    fundraiserTitle: fundraiser?.title,
    assignee: input.assignee || undefined,
    createdBy: currentActorName(),
    createdAt: now,
    updatedAt: now,
    notes: [],
  };
  db.tickets.unshift(t);
  recordLocalAction({
    action: 'Ticket créé', targetType: 'ticket', targetId: t.id, targetLabel: `${t.number} · ${TICKET_CATEGORY_LABEL[t.category]}`,
    detail: description, relatedIds: [t.userId ?? '', t.circleId ?? '', t.fundraiserId ?? ''],
  });
  return clone(t);
}

export interface TicketPatch {
  status?: TicketStatus;
  assignee?: string | null;
  priority?: TicketPriority;
  note?: string;
}

// TODO API: PATCH /api/v1/admin/tickets/:id  { status?, assignee?, priority? }  +  POST /api/v1/admin/tickets/:id/notes { text }
export async function updateTicket(id: string, patch: TicketPatch): Promise<Ticket> {
  await latency();
  assertCan('ticket.manage');
  const t = db.tickets.find((x) => x.id === id);
  if (!t) throw new Error('Ticket introuvable.');
  const now = new Date().toISOString();
  const changes: string[] = [];
  let before = '';
  let after = '';
  if (patch.status && patch.status !== t.status) {
    if (patch.status === 'RESOLVED' && !patch.note?.trim() && t.notes.length === 0) {
      throw new Error('Ajoutez une note expliquant la solution avant de résoudre le ticket.');
    }
    before = TICKET_STATUS_LABEL[t.status];
    after = TICKET_STATUS_LABEL[patch.status];
    changes.push(`statut : ${before} → ${after}`);
    t.status = patch.status;
    t.resolvedAt = patch.status === 'RESOLVED' ? now : undefined;
  }
  if (patch.assignee !== undefined && (patch.assignee ?? undefined) !== t.assignee) {
    changes.push(`assigné à : ${patch.assignee ?? 'personne'}`);
    t.assignee = patch.assignee ?? undefined;
  }
  if (patch.priority && patch.priority !== t.priority) {
    changes.push(`priorité : ${patch.priority}`);
    t.priority = patch.priority;
  }
  if (patch.note?.trim()) {
    t.notes.push({ id: newId('tn'), at: now, author: currentActorName(), text: patch.note.trim() });
    changes.push('note ajoutée');
  }
  if (changes.length === 0) throw new Error('Aucune modification.');
  t.updatedAt = now;
  recordLocalAction({
    action: 'Ticket mis à jour', targetType: 'ticket', targetId: t.id, targetLabel: `${t.number} · ${TICKET_CATEGORY_LABEL[t.category]}`,
    detail: changes.join(' · '), before: before || undefined, after: after || undefined, reason: patch.note?.trim() || undefined,
    relatedIds: [t.userId ?? '', t.circleId ?? ''],
  });
  return clone(t);
}
