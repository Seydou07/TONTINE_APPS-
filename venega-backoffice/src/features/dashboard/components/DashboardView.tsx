'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ChevronRight, CircleDot, HandHeart, UserCheck, Users } from 'lucide-react';
import { formatCompact, formatNumber, formatRelative, formatXOF, percent } from '@/lib/format';
import { Card, CardHeader, EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from '@/components/ui';
import { listAlerts } from '@/features/alerts/api';
import { SeverityBadge } from '@/features/alerts/components/SeverityBadge';
import { listKycSubmissions } from '@/features/kyc/api';
import { getDashboardStats } from '../api';
import { VolumeChart } from './VolumeChart';

function TodoLink({ href, label, count, tone }: { href: string; label: string; count: number; tone: 'amber' | 'red' | 'green' }) {
  const cls = tone === 'red' ? 'bg-danger text-white' : tone === 'amber' ? 'bg-accent text-ink' : 'bg-brand-tint text-brand';
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-tint/50">
      <span className={`inline-flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 text-sm font-semibold ${cls}`}>{count}</span>
      <span className="flex-1 text-base text-ink">{label}</span>
      <ChevronRight size={16} className="text-ink-muted" />
    </Link>
  );
}

export function DashboardView() {
  const stats = useQuery({ queryKey: ['dashboard'], queryFn: getDashboardStats });
  const alerts = useQuery({
    queryKey: ['alerts', 'list', 'dashboard'],
    queryFn: () => listAlerts({ status: 'OPEN', page: 1, pageSize: 5 }),
  });
  const kyc = useQuery({
    queryKey: ['kyc', 'submissions', 'dashboard'],
    queryFn: () => listKycSubmissions({ status: 'PENDING', page: 1, pageSize: 5 }),
  });

  if (stats.isError) return <ErrorState error={stats.error} />;
  if (!stats.data) return <LoadingState />;
  const s = stats.data;

  return (
    <>
      <PageHeader title="Tableau de bord" description="Vue d’ensemble de la plateforme et des dossiers à traiter." />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Utilisateurs"
          value={formatNumber(s.users.total)}
          hint={`${percent(s.users.verified, s.users.total)} % vérifiés · +${s.users.newLast30d} sur 30 j`}
          icon={<Users size={16} />}
        />
        <StatCard
          label="Cercles actifs"
          value={formatNumber(s.circles.active)}
          hint={`${s.circles.latePayments} cotisations en retard`}
          icon={<CircleDot size={16} />}
        />
        <StatCard
          label="Cagnottes actives"
          value={formatNumber(s.fundraisers.active)}
          hint={`${formatCompact(s.fundraisers.collectedActive)} F CFA collectés`}
          icon={<HandHeart size={16} />}
        />
        <StatCard
          label="Alertes ouvertes"
          value={formatNumber(s.alerts.open)}
          hint={s.alerts.critical > 0 ? `${s.alerts.critical} critique(s)` : 'Aucune critique'}
          icon={<AlertTriangle size={16} />}
          tone={s.alerts.critical > 0 ? 'red' : 'default'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader title="Volume des cotisations" subtitle="Montants encaissés par mois (Orange Money, Moov Money, Wave)" />
          <div className="p-4">
            <VolumeChart data={s.monthlyVolume} />
            <p className="mt-2 text-sm text-ink-muted">
              Dernier mois : <span className="font-medium text-ink">{formatXOF(s.monthlyVolume.at(-1)?.volume ?? 0)}</span>
            </p>
          </div>
        </Card>

        <Card className="h-fit">
          <CardHeader title="À traiter" />
          <div className="divide-y divide-line">
            <TodoLink href="/kyc" label="KYC à vérifier" count={s.kycPending} tone="amber" />
            <TodoLink href="/alertes" label="Alertes critiques" count={s.alerts.critical} tone={s.alerts.critical ? 'red' : 'green'} />
            <TodoLink href="/cagnottes" label="Cagnottes en attente" count={s.fundraisers.pending} tone="amber" />
            <TodoLink href="/cagnottes" label="Cagnottes signalées" count={s.fundraisers.reported} tone={s.fundraisers.reported ? 'red' : 'green'} />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
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
            title="Prochains dossiers KYC"
            actions={
              <Link href="/kyc" className="text-sm font-medium text-brand hover:underline">
                Ouvrir la file
              </Link>
            }
          />
          {kyc.isLoading ? (
            <LoadingState />
          ) : !kyc.data?.items.length ? (
            <EmptyState title="File d’attente vide" />
          ) : (
            <ul className="divide-y divide-line">
              {kyc.data.items.map((k) => (
                <li key={k.id} className="flex items-center gap-3 px-4 py-2.5">
                  <UserCheck size={16} className="shrink-0 text-ink-muted" />
                  <span className="min-w-0 flex-1 truncate text-base text-ink">{k.userName}</span>
                  {k.flags.length > 0 && <AlertTriangle size={14} className="text-accent-ink" aria-label="Points d’attention" />}
                  <span className="whitespace-nowrap text-sm text-ink-muted">{formatRelative(k.submittedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
