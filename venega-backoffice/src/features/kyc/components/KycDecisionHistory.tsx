'use client';

import React from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { formatDateTime } from '@/lib/format';
import { useListState } from '@/lib/useListState';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  FilterTabs,
  ListToolbar,
  LoadingState,
  Pagination,
  SearchInput,
  Table,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { listKycDecisions } from '../api';

export function KycDecisionHistory() {
  const list = useListState<'VERIFIED' | 'REJECTED'>('ALL');
  const query = useQuery({
    queryKey: ['kyc', 'decisions', list.params],
    queryFn: () => listKycDecisions(list.params),
    placeholderData: keepPreviousData,
  });

  return (
    <Card>
      <ListToolbar>
        <FilterTabs
          value={list.status}
          onChange={list.setStatus}
          options={[
            { value: 'ALL', label: 'Toutes' },
            { value: 'VERIFIED', label: 'Validations' },
            { value: 'REJECTED', label: 'Refus' },
          ]}
        />
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Nom, n° de document, admin…" />
      </ListToolbar>
      {query.isError ? (
        <ErrorState error={query.error} />
      ) : query.isLoading ? (
        <LoadingState />
      ) : !query.data || query.data.items.length === 0 ? (
        <EmptyState title="Aucune décision" />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Compte</Th>
                <Th>Document</Th>
                <Th>Décision</Th>
                <Th>Motif</Th>
                <Th>Par</Th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((d) => (
                <Tr key={d.id}>
                  <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(d.decidedAt)}</Td>
                  <Td className="font-medium">{d.userName}</Td>
                  <Td className="whitespace-nowrap font-mono text-sm">{d.documentNumber}</Td>
                  <Td>
                    <Badge tone={d.decision === 'VERIFIED' ? 'green' : 'red'}>{d.decision === 'VERIFIED' ? 'Validé' : 'Refusé'}</Badge>
                  </Td>
                  <Td className="max-w-xs text-sm text-ink-soft">{d.reason ?? '—'}</Td>
                  <Td className="whitespace-nowrap text-sm">
                    {d.decidedBy}
                    {d.localOnly && (
                      <Badge tone="amber" className="ml-1.5">
                        Local
                      </Badge>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={list.setPage} />
        </>
      )}
    </Card>
  );
}
