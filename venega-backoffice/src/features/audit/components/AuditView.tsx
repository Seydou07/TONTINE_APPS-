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
  PageHeader,
  Pagination,
  SearchInput,
  Table,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { listAuditEntries } from '../api';
import { AUDIT_TARGET_LABEL, type AuditTargetType } from '../types';

export function AuditView() {
  const list = useListState<AuditTargetType>('ALL', 15);
  const query = useQuery({
    queryKey: ['audit', list.params],
    queryFn: () => listAuditEntries(list.params),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader
        title="Journal des actions"
        description="Toutes les décisions de l’équipe (KYC, cagnottes, alertes, comptes). Les lignes « Local » n’existent que dans ce navigateur."
      />
      <Card>
        <ListToolbar>
          <FilterTabs
            value={list.status}
            onChange={list.setStatus}
            options={[
              { value: 'ALL', label: 'Tout' },
              { value: 'kyc', label: 'KYC' },
              { value: 'fundraiser', label: 'Cagnottes' },
              { value: 'alert', label: 'Alertes' },
              { value: 'user', label: 'Comptes' },
            ]}
          />
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Action, admin, cible…" />
        </ListToolbar>
        {query.isError ? (
          <ErrorState error={query.error} />
        ) : query.isLoading ? (
          <LoadingState />
        ) : !query.data || query.data.items.length === 0 ? (
          <EmptyState title="Aucune action" />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Action</Th>
                  <Th>Cible</Th>
                  <Th>Détail</Th>
                  <Th>Par</Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((e) => (
                  <Tr key={e.id}>
                    <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(e.at)}</Td>
                    <Td className="whitespace-nowrap font-medium">{e.action}</Td>
                    <Td className="max-w-[260px]">
                      <span className="mr-1.5 text-xs uppercase tracking-wide text-ink-muted">{AUDIT_TARGET_LABEL[e.targetType]}</span>
                      <span className="text-sm">{e.targetLabel}</span>
                    </Td>
                    <Td className="max-w-xs text-sm text-ink-soft">{e.detail ?? '—'}</Td>
                    <Td className="whitespace-nowrap text-sm">
                      {e.actor}
                      {e.localOnly && (
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
    </>
  );
}
