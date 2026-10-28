'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { formatDate, formatXOF } from '@/lib/format';
import { useListState } from '@/lib/useListState';
import {
  Card,
  EmptyState,
  ErrorState,
  FilterTabs,
  ListToolbar,
  LoadingState,
  PageHeader,
  Pagination,
  SearchInput,
  Table,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { listCircles } from '../api';
import { FREQUENCY_LABEL, type CircleKind } from '../types';
import { CircleKindBadge, CircleStatusBadge } from './CircleBadges';

export function CirclesView() {
  const router = useRouter();
  const list = useListState<CircleKind>('ALL');
  const query = useQuery({
    queryKey: ['circles', 'list', list.params],
    queryFn: () => listCircles(list.params),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title="Cercles" description="Tontines (en espèces ou en nature) et caisses de solidarité." />
      <Card>
        <ListToolbar>
          <FilterTabs
            value={list.status}
            onChange={list.setStatus}
            options={[
              { value: 'ALL', label: 'Tous' },
              { value: 'TONTINE', label: 'Tontines' },
              { value: 'NATURE', label: 'En nature' },
              { value: 'SOLIDARITY', label: 'Solidarité' },
            ]}
          />
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Nom, président(e), code…" />
        </ListToolbar>

        {query.isError ? (
          <ErrorState error={query.error} />
        ) : query.isLoading ? (
          <LoadingState />
        ) : !query.data || query.data.items.length === 0 ? (
          <EmptyState title="Aucun cercle" />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Cercle</Th>
                  <Th>Type</Th>
                  <Th className="text-right">Cotisation</Th>
                  <Th className="text-right">Membres</Th>
                  <Th>Tour</Th>
                  <Th className="text-right">Retards</Th>
                  <Th>Statut</Th>
                  <Th>Créé</Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((c) => (
                  <Tr key={c.id} onClick={() => router.push(`/circles/${c.id}`)}>
                    <Td className="max-w-[280px]">
                      <p className="truncate font-medium">{c.name}</p>
                      <p className="text-xs text-ink-muted">Président(e) : {c.presidentName}</p>
                    </Td>
                    <Td>
                      <CircleKindBadge kind={c.kind} />
                    </Td>
                    <Td className="whitespace-nowrap text-right text-sm">
                      {formatXOF(c.contribution)}
                      <span className="block text-xs text-ink-muted">{FREQUENCY_LABEL[c.frequency]}</span>
                    </Td>
                    <Td className="text-right text-sm">{c.memberCount}</Td>
                    <Td className="whitespace-nowrap text-sm">{c.totalTurns > 0 ? `${c.currentTurn} / ${c.totalTurns}` : '—'}</Td>
                    <Td className={`text-right text-sm ${c.latePayments > 0 ? 'font-semibold text-danger' : 'text-ink-muted'}`}>
                      {c.latePayments}
                    </Td>
                    <Td>
                      <CircleStatusBadge status={c.status} />
                    </Td>
                    <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDate(c.createdAt)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={list.setPage} />
          </>
        )}
      </Card>
    </>
  );
}
