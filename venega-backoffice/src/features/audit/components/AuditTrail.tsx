'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Badge, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import { listAuditEntries } from '../api';
import type { AuditEntry } from '../types';

export function BeforeAfter({ e }: { e: Pick<AuditEntry, 'before' | 'after'> }) {
  if (!e.before && !e.after) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-sm">
      <span className="text-ink-muted line-through decoration-ink-muted/40">{e.before ?? '—'}</span>
      <ArrowRight size={12} className="text-ink-muted" />
      <span className="font-medium text-ink">{e.after ?? '—'}</span>
    </span>
  );
}

/** Actions de l'équipe Venega sur un utilisateur ou un cercle (journal filtré). */
export function AuditTrail({ subjectId }: { subjectId: string }) {
  const query = useQuery({
    queryKey: ['audit', 'subject', subjectId],
    queryFn: () => listAuditEntries({ subjectId, page: 1, pageSize: 50 }),
  });
  if (query.isError) return <ErrorState error={query.error} />;
  if (query.isLoading) return <LoadingState />;
  const items = query.data?.items ?? [];
  if (items.length === 0) return <EmptyState title="Aucune action de l’équipe" description="Les actions admin sur cette fiche apparaîtront ici." />;
  return (
    <ul className="divide-y divide-line">
      {items.map((e) => (
        <li key={e.id} className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium text-ink">{e.action}</span>
            <BeforeAfter e={e} />
            {e.localOnly && <Badge tone="amber">Local</Badge>}
          </div>
          {e.reason && <p className="mt-0.5 text-sm text-ink-soft">Motif : {e.reason}</p>}
          {e.detail && <p className="mt-0.5 text-sm text-ink-soft">{e.detail}</p>}
          <p className="mt-0.5 text-xs text-ink-muted">
            {e.actor}
            {e.actorRole ? ` (${e.actorRole})` : ''} · {formatDateTime(e.at)}
          </p>
        </li>
      ))}
    </ul>
  );
}
