/**
 * Recherche globale (Ctrl+K) : retrouver en quelques touches la personne ou le cercle
 * dont parle l'appelant.
 *
 * Numéro : avec ou sans +226 / 00226, avec ou sans espaces, même partiel (4 chiffres min.).
 * Texte : nom, nom de cercle, code d'invitation, référence Venega (VP-…), référence opérateur,
 * code de cagnotte, numéro de ticket (T-…).
 */
import { db, clone, latency } from '@/mocks/db';
import { matchesQuery, normalize } from '@/lib/list';
import { formatPhone, formatXOF } from '@/lib/format';
import { looksLikePhone, phoneMatches } from '@/lib/phone';
import { CIRCLE_KIND_LABEL } from '@/features/circles/types';
import { PAYMENT_STATUS_LABEL, PURPOSE_LABEL } from '@/features/payments/types';
import { TICKET_STATUS_LABEL } from '@/features/tickets/types';

export type SearchKind = 'user' | 'circle' | 'payment' | 'fundraiser' | 'ticket';

export interface SearchResult {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const LIMIT = 6;

// TODO API: GET /api/v1/admin/search?q=  -> { users, circles, payments, fundraisers, tickets } (6 max. par groupe)
export async function globalSearch(q: string): Promise<SearchResult[]> {
  await latency(90);
  const query = q.trim();
  if (query.length < 2) return [];
  const phone = looksLikePhone(query);
  const exact = (s?: string) => !!s && normalize(s).replace(/\s/g, '') === normalize(query).replace(/\s/g, '');

  const users = db.users
    .filter((u) => (phone ? phoneMatches(query, u.phoneNumber) || (!!u.mobileMoneyNumber && phoneMatches(query, u.mobileMoneyNumber)) : matchesQuery(query, u.displayName, u.id)))
    .slice(0, LIMIT)
    .map((u): SearchResult => ({
      kind: 'user', id: u.id, title: u.displayName,
      subtitle: `${formatPhone(u.phoneNumber)} · ${u.city}${u.accountStatus === 'SUSPENDED' ? ' · suspendu' : ''}`,
      href: `/users/${u.id}`,
    }));

  const circles = db.circles
    .filter((c) => (phone ? c.members.some((m) => phoneMatches(query, m.phoneNumber)) : matchesQuery(query, c.name, c.inviteCode)))
    .slice(0, LIMIT)
    .map((c): SearchResult => ({
      kind: 'circle', id: c.id, title: c.name,
      subtitle: `${CIRCLE_KIND_LABEL[c.kind]} · ${c.inviteCode} · ${c.memberCount} membres`,
      href: `/circles/${c.id}`,
    }));

  const payments = db.payments
    .filter((p) =>
      phone
        ? query.replace(/\D/g, '').length >= 8 && phoneMatches(query, p.payerPhone)
        : exact(p.reference) || exact(p.providerReference) || (query.length >= 4 && matchesQuery(query, p.reference, p.providerReference)),
    )
    .slice(0, LIMIT)
    .map((p): SearchResult => ({
      kind: 'payment', id: p.id, title: `${p.reference} · ${formatXOF(p.amount)}`,
      subtitle: `${PURPOSE_LABEL[p.purpose]} · ${PAYMENT_STATUS_LABEL[p.status]}${p.providerReference ? ` · ${p.providerReference}` : ''}${p.userName ? ` · ${p.userName}` : ''}`,
      href: `/paiements?q=${encodeURIComponent(p.reference)}`,
    }));

  const fundraisers = phone
    ? []
    : db.fundraisers
        .filter((f) => matchesQuery(query, f.code, f.title))
        .slice(0, LIMIT)
        .map((f): SearchResult => ({ kind: 'fundraiser', id: f.id, title: f.title, subtitle: `Cagnotte ${f.code} · ${f.organizerName}`, href: `/cagnottes?q=${encodeURIComponent(f.code)}` }));

  const tickets = db.tickets
    .filter((t) => (phone ? !!t.callerPhone && phoneMatches(query, t.callerPhone) : exact(t.number) || (/^t-?\d+$/i.test(query) && matchesQuery(query, t.number))))
    .slice(0, LIMIT)
    .map((t): SearchResult => ({
      kind: 'ticket', id: t.id, title: `${t.number} · ${t.userName ?? t.circleName ?? 'Appel'}`,
      subtitle: `${TICKET_STATUS_LABEL[t.status]} · ${t.description.slice(0, 60)}`,
      href: `/appels?ticket=${t.id}`,
    }));

  return clone([...users, ...circles, ...payments, ...tickets, ...fundraisers]);
}
