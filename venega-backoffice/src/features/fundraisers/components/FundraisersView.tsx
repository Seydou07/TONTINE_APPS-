'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Flag } from 'lucide-react';
import { formatDate, formatXOF, percent } from '@/lib/format';
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
  ProgressBar,
  SearchInput,
  Table,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { getFundraiserCounts, listFundraisers, type FundraiserFilter } from '../api';
import { PUBLIC_FUNDRAISER_BASE_URL, type Fundraiser } from '../types';
import { FundraiserDetailDialog } from './FundraiserDetailDialog';
import { FundraiserStatusBadge } from './FundraiserStatusBadge';

export function FundraisersView() {
  const searchParams = useSearchParams();
  const list = useListState<FundraiserFilter>('ALL', undefined, searchParams.get('q') ?? '');
  const [selected, setSelected] = useState<Fundraiser | null>(null);

  const counts = useQuery({ queryKey: ['fundraisers', 'counts'], queryFn: getFundraiserCounts });
  const query = useQuery({
    queryKey: ['fundraisers', 'list', list.params],
    queryFn: () => listFundraisers(list.params),
    placeholderData: keepPreviousData,
  });
  const c = counts.data;

  return (
    <>
      <PageHeader
        title="Cagnottes d’aide publiques"
        description={`Cagnottes partagées par lien public (${PUBLIC_FUNDRAISER_BASE_URL}<code>). Les plus signalées apparaissent en premier.`}
      />
      <Card>
        <ListToolbar>
          <FilterTabs
            value={list.status}
            onChange={list.setStatus}
            options={[
              { value: 'ALL', label: 'Toutes' },
              { value: 'REPORTED', label: 'Signalées', count: c?.REPORTED },
              { value: 'PENDING', label: 'En attente', count: c?.PENDING },
              { value: 'ACTIVE', label: 'Actives', count: c?.ACTIVE },
              { value: 'SUSPENDED', label: 'Suspendues', count: c?.SUSPENDED },
              { value: 'CLOSED', label: 'Clôturées', count: c?.CLOSED },
            ]}
          />
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Titre, code, organisateur…" />
        </ListToolbar>

        {query.isError ? (
          <ErrorState error={query.error} />
        ) : query.isLoading ? (
          <LoadingState />
        ) : !query.data || query.data.items.length === 0 ? (
          <EmptyState title="Aucune cagnotte" description={list.params.q ? 'Aucun résultat pour cette recherche.' : undefined} />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Cagnotte</Th>
                  <Th>Organisateur</Th>
                  <Th className="min-w-[200px]">Collecté / objectif</Th>
                  <Th>Signalements</Th>
                  <Th>Statut</Th>
                  <Th>Créée</Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((f) => {
                  const pct = percent(f.collected, f.goal);
                  return (
                    <Tr key={f.id} onClick={() => setSelected(f)}>
                      <Td className="max-w-[280px]">
                        <p className="truncate font-medium">{f.title}</p>
                        <p className="font-mono text-xs text-ink-muted">/c/{f.code}</p>
                      </Td>
                      <Td>
                        <p className="whitespace-nowrap">{f.organizerName}</p>
                        {!f.organizerKycVerified && <p className="text-xs text-accent-ink">KYC non vérifié</p>}
                      </Td>
                      <Td>
                        <p className="whitespace-nowrap text-sm">
                          <span className="font-medium text-ink">{formatXOF(f.collected)}</span>
                          <span className="text-ink-muted"> / {formatXOF(f.goal)}</span>
                        </p>
                        <ProgressBar value={pct} className="mt-1.5" />
                      </Td>
                      <Td>
                        {f.reports.length === 0 ? (
                          <span className="text-sm text-ink-muted">—</span>
                        ) : (
                          <Badge tone={f.reports.length >= 2 ? 'red' : 'amber'}>
                            <Flag size={12} /> {f.reports.length}
                          </Badge>
                        )}
                      </Td>
                      <Td>
                        <FundraiserStatusBadge status={f.status} />
                      </Td>
                      <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDate(f.createdAt)}</Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={list.setPage} />
          </>
        )}
      </Card>

      <FundraiserDetailDialog fundraiser={selected} onClose={() => setSelected(null)} />
    </>
  );
}
