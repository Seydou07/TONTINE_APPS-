'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { formatDate, formatPhone, formatRelative } from '@/lib/format';
import { useListState } from '@/lib/useListState';
import {
  Avatar,
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
import { KycStatusBadge } from '@/features/kyc/components/KycStatusBadge';
import { listUsers, type UserFilter } from '../api';
import { UserDetailDialog } from './UserDetailDialog';

export function UsersView() {
  const searchParams = useSearchParams();
  const list = useListState<UserFilter>('ALL', undefined, searchParams.get('q') ?? '');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['users', 'list', list.params],
    queryFn: () => listUsers(list.params),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title="Utilisateurs" description="Comptes inscrits, statut KYC et état du compte." />
      <Card>
        <ListToolbar>
          <FilterTabs
            value={list.status}
            onChange={list.setStatus}
            options={[
              { value: 'ALL', label: 'Tous' },
              { value: 'PENDING', label: 'KYC en attente' },
              { value: 'VERIFIED', label: 'Vérifiés' },
              { value: 'REJECTED', label: 'Refusés' },
              { value: 'NOT_SUBMITTED', label: 'Sans KYC' },
              { value: 'SUSPENDED', label: 'Suspendus' },
            ]}
          />
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Nom, téléphone, ville…" />
        </ListToolbar>

        {query.isError ? (
          <ErrorState error={query.error} />
        ) : query.isLoading ? (
          <LoadingState />
        ) : !query.data || query.data.items.length === 0 ? (
          <EmptyState title="Aucun utilisateur" description={list.params.q ? 'Aucun résultat pour cette recherche.' : undefined} />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Utilisateur</Th>
                  <Th>Téléphone</Th>
                  <Th>KYC</Th>
                  <Th>Compte</Th>
                  <Th className="text-right">Fiabilité</Th>
                  <Th className="text-right">Cercles</Th>
                  <Th>Inscrit</Th>
                  <Th>Activité</Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((u) => (
                  <Tr key={u.id} onClick={() => setSelectedId(u.id)}>
                    <Td>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={u.displayName} size={32} />
                        <span className="min-w-0">
                          <span className="block whitespace-nowrap font-medium">{u.displayName}</span>
                          <span className="block text-xs text-ink-muted">{u.city}</span>
                        </span>
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap text-sm">{formatPhone(u.phoneNumber)}</Td>
                    <Td>
                      <KycStatusBadge status={u.kycStatus} />
                    </Td>
                    <Td>{u.accountStatus === 'SUSPENDED' ? <Badge tone="red">Suspendu</Badge> : <Badge tone="green">Actif</Badge>}</Td>
                    <Td className={`text-right text-sm ${u.reputationScore < 50 ? 'font-semibold text-danger' : ''}`}>{u.reputationScore}</Td>
                    <Td className="text-right text-sm">{u.circlesCount}</Td>
                    <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDate(u.createdAt)}</Td>
                    <Td className="whitespace-nowrap text-sm text-ink-soft">{formatRelative(u.lastActiveAt)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={list.setPage} />
          </>
        )}
      </Card>
      <UserDetailDialog userId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
