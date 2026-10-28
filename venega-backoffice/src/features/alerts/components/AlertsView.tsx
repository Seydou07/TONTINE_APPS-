'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CheckCircle2, CircleDot, HandHeart, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDateTime, formatRelative } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { useListState } from '@/lib/useListState';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  FilterTabs,
  ListToolbar,
  LoadingState,
  PageHeader,
  Pagination,
  ReasonDialog,
  SearchInput,
  StatCard,
} from '@/components/ui';
import { getOpenAlertCounts, listAlerts, resolveAlert } from '../api';
import { ALERT_TYPE_LABEL, type AlertSeverity, type AlertStatus, type AlertSubject, type FraudAlert } from '../types';
import { SeverityBadge } from './SeverityBadge';

const SUBJECT_ICON = { user: User, fundraiser: HandHeart, circle: CircleDot } as const;

function subjectHref(s: AlertSubject): string {
  if (s.kind === 'user') return `/users?q=${encodeURIComponent(s.label)}`;
  if (s.kind === 'fundraiser') return `/cagnottes?q=${encodeURIComponent(s.label)}`;
  return `/circles/${s.id}`;
}

const SEVERITY_BAR: Record<AlertSeverity, string> = {
  CRITICAL: 'bg-danger',
  HIGH: 'bg-danger/60',
  MEDIUM: 'bg-accent',
  LOW: 'bg-line',
};

export function AlertsView() {
  const list = useListState<AlertStatus>('OPEN');
  const [severity, setSeverity] = useState<AlertSeverity | 'ALL'>('ALL');
  const [resolving, setResolving] = useState<FraudAlert | null>(null);

  const counts = useQuery({ queryKey: ['alerts', 'counts'], queryFn: getOpenAlertCounts });
  const params = { ...list.params, severity };
  const query = useQuery({
    queryKey: ['alerts', 'list', params],
    queryFn: () => listAlerts(params),
    placeholderData: keepPreviousData,
  });

  const resolve = useAdminMutation({
    mutationFn: (v: { id: string; note: string }) => resolveAlert(v.id, v.note),
    invalidate: ['alerts', 'users'],
    successTitle: () => 'Alerte marquée comme traitée',
    onSuccess: () => setResolving(null),
  });

  const c = counts.data;

  return (
    <>
      <PageHeader
        title="Alertes fraude"
        description="Signaux automatiques à examiner : paiements échoués, CNIB en double, cagnottes signalées, retraits inhabituels."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setSeverity(severity === s ? 'ALL' : s);
              list.setStatus('OPEN');
            }}
            className={cn('rounded-lg text-left ring-brand', severity === s && 'ring-2')}
          >
            <StatCard
              label={`Ouvertes · ${s === 'CRITICAL' ? 'critiques' : s === 'HIGH' ? 'élevées' : s === 'MEDIUM' ? 'moyennes' : 'faibles'}`}
              value={c ? c[s] : '—'}
              tone={s === 'CRITICAL' || s === 'HIGH' ? 'red' : s === 'MEDIUM' ? 'amber' : 'default'}
            />
          </button>
        ))}
      </div>

      <Card>
        <ListToolbar>
          <div className="flex flex-wrap items-center gap-2">
            <FilterTabs
              value={list.status}
              onChange={list.setStatus}
              options={[
                { value: 'OPEN', label: 'À traiter', count: c?.total },
                { value: 'RESOLVED', label: 'Traitées' },
                { value: 'ALL', label: 'Toutes' },
              ]}
            />
            {severity !== 'ALL' && (
              <button type="button" onClick={() => setSeverity('ALL')} className="text-sm text-brand underline-offset-2 hover:underline">
                Retirer le filtre de gravité
              </button>
            )}
          </div>
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Titre, compte, cagnotte…" />
        </ListToolbar>

        {query.isError ? (
          <ErrorState error={query.error} />
        ) : query.isLoading ? (
          <LoadingState />
        ) : !query.data || query.data.items.length === 0 ? (
          <EmptyState title={list.status === 'OPEN' ? 'Aucune alerte à traiter' : 'Aucune alerte'} />
        ) : (
          <>
            <ul className="divide-y divide-line">
              {query.data.items.map((a) => (
                <li key={a.id} className="relative flex flex-col gap-3 py-3 pl-5 pr-4 md:flex-row md:items-start">
                  <span className={cn('absolute bottom-3 left-0 top-3 w-1 rounded-r', SEVERITY_BAR[a.severity])} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={a.severity} />
                      <Badge>{ALERT_TYPE_LABEL[a.type]}</Badge>
                      <span className="text-sm text-ink-muted" title={formatDateTime(a.createdAt)}>
                        {formatRelative(a.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-lg font-semibold text-ink">{a.title}</p>
                    <p className="mt-0.5 text-base text-ink-soft">{a.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {a.subjects.map((s) => {
                        const Icon = SUBJECT_ICON[s.kind];
                        return (
                          <Link
                            key={`${s.kind}-${s.id}`}
                            href={subjectHref(s)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2 py-1 text-sm text-ink-soft hover:border-brand-line hover:text-brand"
                          >
                            <Icon size={13} /> {s.label}
                          </Link>
                        );
                      })}
                    </div>
                    {a.status === 'RESOLVED' && (
                      <p className="mt-2 rounded-md bg-brand-tint px-3 py-2 text-sm text-ink-soft">
                        <CheckCircle2 size={14} className="mr-1 inline text-brand" />
                        Traitée par <strong className="text-ink">{a.resolvedBy}</strong>
                        {a.resolvedAt && <> le {formatDateTime(a.resolvedAt)}</>}
                        {a.resolutionNote && <> — {a.resolutionNote}</>}
                      </p>
                    )}
                  </div>
                  {a.status === 'OPEN' && (
                    <Button variant="secondary" size="sm" icon={<CheckCircle2 size={15} />} onClick={() => setResolving(a)}>
                      Marquer comme traité
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={list.setPage} />
          </>
        )}
      </Card>

      <ReasonDialog
        open={!!resolving}
        onClose={() => setResolving(null)}
        onConfirm={(note) => resolving && resolve.mutate({ id: resolving.id, note })}
        title="Marquer l’alerte comme traitée"
        description={resolving?.title}
        confirmLabel="Marquer comme traité"
        minLength={3}
        label="Ce qui a été fait"
        placeholder="Ex. : compte doublon suspendu, organisateur contacté, faux positif…"
        presets={['Faux positif', 'Compte suspendu', 'Cagnotte suspendue', 'Utilisateur contacté', 'Transmis à l’opérateur mobile money']}
        loading={resolve.isPending}
      />
    </>
  );
}
