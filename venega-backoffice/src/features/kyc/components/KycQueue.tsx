'use client';

import React, { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPhone, formatRelative } from '@/lib/format';
import { useListState } from '@/lib/useListState';
import {
  Avatar,
  Card,
  EmptyState,
  ErrorState,
  FilterTabs,
  LoadingState,
  Pagination,
  SearchInput,
} from '@/components/ui';
import { listKycSubmissions } from '../api';
import type { KycReviewStatus, KycSubmission } from '../types';
import { KycReviewPanel } from './KycReviewPanel';
import { KycStatusBadge } from './KycStatusBadge';

export function KycQueue({ pendingCount }: { pendingCount?: number }) {
  const list = useListState<KycReviewStatus>('PENDING', 8);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['kyc', 'submissions', list.params],
    queryFn: () => listKycSubmissions(list.params),
    placeholderData: keepPreviousData,
  });

  const items = query.data?.items ?? [];
  const selected = items.find((s) => s.id === selectedId) ?? null;

  // Sur grand écran, ouvrir directement le premier dossier.
  useEffect(() => {
    if (!selectedId && items.length > 0 && window.matchMedia('(min-width: 1280px)').matches) {
      setSelectedId(items[0]!.id);
    }
  }, [items, selectedId]);

  const onDecided = (s: KycSubmission) => {
    // Passer au dossier suivant de la file.
    const idx = items.findIndex((x) => x.id === s.id);
    const next = items.filter((x) => x.id !== s.id && x.status === 'PENDING')[Math.max(0, idx)] ?? null;
    setSelectedId(list.status === 'PENDING' ? next?.id ?? null : s.id);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[400px_minmax(0,1fr)]">
      <Card className={cn('flex flex-col', selected && 'hidden xl:flex')}>
        <div className="space-y-3 border-b border-line p-3">
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Nom, téléphone, n° de CNIB…" className="sm:w-full" />
          <FilterTabs
            value={list.status}
            onChange={(v) => {
              list.setStatus(v);
              setSelectedId(null);
            }}
            options={[
              { value: 'PENDING', label: 'À vérifier', count: pendingCount },
              { value: 'VERIFIED', label: 'Validés' },
              { value: 'REJECTED', label: 'Refusés' },
            ]}
          />
        </div>

        {query.isError ? (
          <ErrorState error={query.error} />
        ) : query.isLoading ? (
          <LoadingState />
        ) : items.length === 0 ? (
          <EmptyState
            title={list.status === 'PENDING' ? 'File d’attente vide' : 'Aucun dossier'}
            description={list.params.q ? 'Aucun résultat pour cette recherche.' : undefined}
          />
        ) : (
          <ul className="divide-y divide-line">
            {items.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-brand-tint/50',
                    s.id === selectedId && 'bg-brand-tint',
                  )}
                >
                  <Avatar name={s.userName} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-base font-medium text-ink">{s.userName}</span>
                      {s.flags.length > 0 && <AlertTriangle size={14} className="shrink-0 text-accent-ink" aria-label="Points d’attention" />}
                    </span>
                    <span className="block truncate text-sm text-ink-muted">
                      {formatPhone(s.phoneNumber)} · {formatRelative(s.reviewedAt ?? s.submittedAt)}
                    </span>
                  </span>
                  <KycStatusBadge status={s.status} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.data && query.data.total > 0 && (
          <div className="mt-auto">
            <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={list.setPage} />
          </div>
        )}
      </Card>

      <Card className={cn('min-h-[480px]', !selected && 'hidden xl:block')}>
        {selected ? (
          <KycReviewPanel key={selected.id} submission={selected} onBack={() => setSelectedId(null)} onDecided={onDecided} />
        ) : (
          <EmptyState title="Sélectionnez un dossier" description="Choisissez un compte dans la file pour examiner ses pièces." />
        )}
      </Card>
    </div>
  );
}
