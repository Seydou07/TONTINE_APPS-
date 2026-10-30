'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { formatXOF } from '@/lib/format';
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
import { getCircleCounts, listCircles, type CircleFilter } from '../api';
import { FREQUENCY_LABEL, roleLabel } from '../types';
import { CircleKindBadge, CircleStatusBadge } from './CircleBadges';

export function CirclesView() {
  const router = useRouter();
  const sp = useSearchParams();
  const list = useListState<CircleFilter>((sp.get('status') as CircleFilter) ?? 'ALL', 15, sp.get('q') ?? '');
  const counts = useQuery({ queryKey: ['circles', 'counts'], queryFn: getCircleCounts });
  const query = useQuery({
    queryKey: ['circles', 'list', list.params],
    queryFn: () => listCircles(list.params),
    placeholderData: keepPreviousData,
  });
  const c = counts.data;

  return (
    <>
      <PageHeader title="Cercles" description="Tontines (en espèces ou en nature) et caisses de solidarité. Les cercles qui demandent une action apparaissent en premier." />
      <Card>
        <ListToolbar>
          <FilterTabs
            value={list.status}
            onChange={list.setStatus}
            options={[
              { value: 'ALL', label: 'Tous' },
              { value: 'OVERDUE_PAYOUT', label: 'Versement en retard', count: c?.OVERDUE_PAYOUT },
              { value: 'LATE', label: 'Avec retards', count: c?.LATE },
              { value: 'OPEN_REQUESTS', label: 'Demandes en attente', count: c?.OPEN_REQUESTS },
              { value: 'SOLIDARITY_ACTION', label: 'Solidarité bloquée', count: c?.SOLIDARITY_ACTION },
              { value: 'FROZEN', label: 'Gelés', count: c?.FROZEN },
              { value: 'TONTINE', label: 'Tontines' },
              { value: 'NATURE', label: 'En nature' },
              { value: 'SOLIDARITY', label: 'Solidarité' },
            ]}
          />
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Nom, code d’invitation, membre…" />
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
                  <Th>À traiter</Th>
                  <Th>Statut</Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((x) => (
                  <Tr key={x.id} onClick={() => router.push(`/circles/${x.id}`)}>
                    <Td className="max-w-[300px]">
                      <p className="truncate font-medium">{x.name}</p>
                      <p className="text-xs text-ink-muted">
                        {roleLabel('PRESIDENT', x.kind)} : {x.founderName} · <span className="font-mono">{x.inviteCode}</span>
                      </p>
                    </Td>
                    <Td>
                      <CircleKindBadge kind={x.kind} />
                    </Td>
                    <Td className="whitespace-nowrap text-right text-sm">
                      {formatXOF(x.contribution)}
                      <span className="block text-xs text-ink-muted">{FREQUENCY_LABEL[x.frequency]}</span>
                    </Td>
                    <Td className="text-right text-sm">{x.memberCount}</Td>
                    <Td className="whitespace-nowrap text-sm">{x.totalTurns > 0 ? `${x.currentTurn} / ${x.totalTurns}` : `période ${x.currentTurn}`}</Td>
                    <Td className={`text-right text-sm ${x.latePayments > 0 ? 'font-semibold text-danger' : 'text-ink-muted'}`}>{x.latePayments}</Td>
                    <Td className="text-sm">
                      {x.overduePayouts > 0 && <span className="block whitespace-nowrap font-medium text-danger">Versement en retard</span>}
                      {x.openRequests > 0 && <span className="block whitespace-nowrap text-accent-ink">{x.openRequests} demande(s)</span>}
                      {x.overduePayouts === 0 && x.openRequests === 0 && <span className="text-ink-muted">—</span>}
                    </Td>
                    <Td>
                      <CircleStatusBadge status={x.status} />
                    </Td>
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
