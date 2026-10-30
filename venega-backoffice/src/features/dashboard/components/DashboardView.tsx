'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  BellRing,
  ChevronRight,
  CircleDot,
  Clock,
  HandCoins,
  HandHeart,
  Headphones,
  Link2,
  Lock,
  Undo2,
  UserCheck,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatAge, formatRelative, formatXOF } from '@/lib/format';
import { Card, CardHeader, EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { listAlerts } from '@/features/alerts/api';
import { SeverityBadge } from '@/features/alerts/components/SeverityBadge';
import { listKycSubmissions } from '@/features/kyc/api';
import { listTickets } from '@/features/tickets/api';
import { TICKET_CATEGORY_LABEL } from '@/features/tickets/types';
import { TicketPriorityBadge } from '@/features/tickets/components/TicketBadges';
import { getWorkQueue } from '../api';

type Tone = 'red' | 'amber' | 'ok';

/** Carte « à traiter » : un chiffre calculé, une explication, un lien vers la liste filtrée. */
function QueueCard({ href, icon, label, value, hint, tone }: { href: string; icon: React.ReactNode; label: string; value: number; hint?: string; tone: Tone }) {
  const t = value === 0 ? 'ok' : tone;
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-start gap-3 rounded-lg border bg-white p-4 transition-colors hover:border-brand-line hover:bg-brand-tint/40',
        t === 'red' ? 'border-danger-line' : t === 'amber' ? 'border-accent-line' : 'border-line',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
          t === 'red' ? 'bg-danger-tint text-danger' : t === 'amber' ? 'bg-accent-tint text-accent-ink' : 'bg-brand-tint text-brand',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink-muted">{label}</span>
        <span className={cn('block text-2xl font-semibold', t === 'red' ? 'text-danger' : 'text-ink')}>{value}</span>
        {hint && <span className="block text-sm text-ink-muted">{hint}</span>}
      </span>
      <ChevronRight size={16} className="mt-1 text-ink-muted group-hover:text-brand" />
    </Link>
  );
}

export function DashboardView() {
  const q = useQuery({ queryKey: ['dashboard', 'work-queue'], queryFn: getWorkQueue });
  const alerts = useQuery({ queryKey: ['alerts', 'list', 'dashboard'], queryFn: () => listAlerts({ status: 'OPEN', page: 1, pageSize: 5 }) });
  const kyc = useQuery({ queryKey: ['kyc', 'submissions', 'dashboard-oldest'], queryFn: () => listKycSubmissions({ status: 'PENDING', page: 1, pageSize: 50 }) });
  const tickets = useQuery({ queryKey: ['tickets', 'dashboard'], queryFn: () => listTickets({ status: 'ACTIVE', page: 1, pageSize: 6 }) });

  if (q.isError) return <ErrorState error={q.error} />;
  if (!q.data) return <LoadingState />;
  const w = q.data;
  const oldestKyc = [...(kyc.data?.items ?? [])].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)).slice(0, 5);

  return (
    <>
      <PageHeader title="À traiter" description="Ce qui attend une action de l’équipe. Chaque carte ouvre la liste correspondante. Tapez Ctrl+K pour retrouver un appelant." />

      <section className="mb-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Argent</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QueueCard
            href="/paiements?status=UNMATCHED"
            icon={<Link2 size={18} />}
            label="Paiements à rapprocher"
            value={w.payments.unmatched}
            hint={w.payments.unmatched ? `${formatXOF(w.payments.unmatchedAmount)} reçus, non rattachés` : 'Tout est rattaché'}
            tone="red"
          />
          <QueueCard
            href="/circles?status=OVERDUE_PAYOUT"
            icon={<HandCoins size={18} />}
            label="Versements en retard"
            value={w.payouts.overdue}
            hint={w.payouts.overdue ? `${w.payouts.failed} refusé(s) par l’opérateur · ${formatXOF(w.payouts.amount)}` : undefined}
            tone="red"
          />
          <QueueCard
            href="/paiements?tab=refunds"
            icon={<Undo2 size={18} />}
            label="Remboursements en cours"
            value={w.refunds.open}
            hint={w.refunds.open ? formatXOF(w.refunds.amount) : undefined}
            tone="amber"
          />
          <QueueCard
            href="/circles?status=SOLIDARITY_ACTION"
            icon={<HandHeart size={18} />}
            label="Solidarité bloquée"
            value={w.solidarity.approvedNotDisbursed + w.solidarity.blockedVotes}
            hint={`${w.solidarity.approvedNotDisbursed} aide(s) à décaisser · ${w.solidarity.blockedVotes} vote(s) bloqué(s)`}
            tone="amber"
          />
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Membres et cercles</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QueueCard
            href="/appels"
            icon={<Headphones size={18} />}
            label="Tickets d’appel ouverts"
            value={w.tickets.active}
            hint={`${w.tickets.high} priorité haute · ${w.tickets.unassigned} non assigné(s)`}
            tone={w.tickets.high ? 'red' : 'amber'}
          />
          <QueueCard
            href="/circles?status=LATE"
            icon={<BellRing size={18} />}
            label="Cotisations en retard"
            value={w.contributions.late}
            hint={`dans ${w.contributions.circles} cercle(s)`}
            tone="amber"
          />
          <QueueCard
            href="/circles?status=OPEN_REQUESTS"
            icon={<CircleDot size={18} />}
            label="Demandes en attente"
            value={w.requests.pending + w.requests.contestedExclusions}
            hint={`${w.requests.contestedExclusions} exclusion(s) contestée(s)`}
            tone={w.requests.contestedExclusions ? 'red' : 'amber'}
          />
          <QueueCard
            href="/users?status=LOCKED"
            icon={<Lock size={18} />}
            label="Comptes bloqués"
            value={w.accounts.locked + w.accounts.otpFailing}
            hint={`${w.accounts.locked} verrouillé(s) · ${w.accounts.otpFailing} code SMS non délivré`}
            tone="amber"
          />
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Contrôle</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QueueCard
            href="/kyc"
            icon={<UserCheck size={18} />}
            label="KYC en attente"
            value={w.kyc.pending}
            hint={w.kyc.oldestSubmittedAt ? `le plus ancien attend depuis ${formatAge(w.kyc.oldestSubmittedAt)} · ${w.kyc.olderThan48h} > 48 h` : undefined}
            tone={w.kyc.olderThan48h ? 'red' : 'amber'}
          />
          <QueueCard
            href="/alertes"
            icon={<AlertTriangle size={18} />}
            label="Alertes de fraude"
            value={w.alerts.open}
            hint={`${w.alerts.critical} critique(s)`}
            tone={w.alerts.critical ? 'red' : 'amber'}
          />
          <QueueCard
            href="/cagnottes?status=REPORTED"
            icon={<HandHeart size={18} />}
            label="Cagnottes signalées"
            value={w.fundraisers.reported}
            hint={`${w.fundraisers.unfrozenReported} sans gel des retraits · ${w.fundraisers.pending} en attente de validation`}
            tone="red"
          />
          <QueueCard href="/users?status=SUSPENDED" icon={<Users size={18} />} label="Comptes suspendus" value={w.accounts.suspended} tone="amber" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader
            title="Tickets prioritaires"
            actions={
              <Link href="/appels" className="text-sm font-medium text-brand hover:underline">
                Tout voir
              </Link>
            }
          />
          {tickets.isLoading ? (
            <LoadingState />
          ) : !tickets.data?.items.length ? (
            <EmptyState title="Aucun ticket ouvert" />
          ) : (
            <ul className="divide-y divide-line">
              {tickets.data.items.map((t) => (
                <li key={t.id}>
                  <Link href={`/appels?ticket=${t.id}`} className="flex items-center gap-2 px-4 py-2.5 hover:bg-brand-tint/50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base text-ink">{TICKET_CATEGORY_LABEL[t.category]}</span>
                      <span className="block truncate text-sm text-ink-muted">
                        {t.number} · {t.userName ?? t.circleName ?? '—'}
                      </span>
                    </span>
                    <TicketPriorityBadge priority={t.priority} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Alertes prioritaires"
            actions={
              <Link href="/alertes" className="text-sm font-medium text-brand hover:underline">
                Tout voir
              </Link>
            }
          />
          {alerts.isLoading ? (
            <LoadingState />
          ) : !alerts.data?.items.length ? (
            <EmptyState title="Aucune alerte ouverte" />
          ) : (
            <ul className="divide-y divide-line">
              {alerts.data.items.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                  <SeverityBadge severity={a.severity} />
                  <span className="min-w-0 flex-1 truncate text-base text-ink">{a.title}</span>
                  <span className="whitespace-nowrap text-sm text-ink-muted">{formatRelative(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="KYC les plus anciens"
            actions={
              <Link href="/kyc" className="text-sm font-medium text-brand hover:underline">
                Ouvrir la file
              </Link>
            }
          />
          {kyc.isLoading ? (
            <LoadingState />
          ) : oldestKyc.length === 0 ? (
            <EmptyState title="File d’attente vide" />
          ) : (
            <ul className="divide-y divide-line">
              {oldestKyc.map((k) => (
                <li key={k.id}>
                  <Link href={`/users/${k.userId}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-tint/50">
                    <Clock size={16} className="shrink-0 text-ink-muted" />
                    <span className="min-w-0 flex-1 truncate text-base text-ink">{k.userName}</span>
                    {k.flags.length > 0 && <AlertTriangle size={14} className="text-accent-ink" aria-label="Points d’attention" />}
                    <span className={cn('whitespace-nowrap text-sm', Date.now() - new Date(k.submittedAt).getTime() > 2 * 86_400_000 ? 'font-medium text-danger' : 'text-ink-muted')}>
                      {formatAge(k.submittedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
