'use client';

import React from 'react';
import Link from 'next/link';
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
  Notice,
  PageHeader,
  Pagination,
  SearchInput,
  Table,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { useCan } from '@/features/auth/SessionContext';
import { listAuditEntries } from '../api';
import { AUDIT_TARGET_LABEL, type AuditEntry, type AuditTargetType } from '../types';
import { BeforeAfter } from './AuditTrail';

function targetHref(e: AuditEntry): string | null {
  if (!e.targetId) return null;
  if (e.targetType === 'user' || e.targetType === 'kyc') return `/users/${e.targetId}`;
  if (e.targetType === 'circle') return `/circles/${e.targetId}`;
  if (e.targetType === 'ticket') return `/appels?ticket=${e.targetId}`;
  return null;
}

/**
 * Journal d'audit complet (fusion des anciennes pages « Journal » et « Audit »).
 * Réservé au super admin ; chaque fiche montre son propre historique à tous les rôles.
 */
export function AuditView() {
  const can = useCan();
  const allowed = can('audit.viewAll');
  const list = useListState<AuditTargetType>('ALL', 20);
  const query = useQuery({
    queryKey: ['audit', list.params],
    queryFn: () => listAuditEntries(list.params),
    placeholderData: keepPreviousData,
    enabled: allowed,
  });

  return (
    <>
      <PageHeader
        title="Journal d’audit"
        description="Qui a fait quoi, quand, sur quoi, avec quel motif, et l’état avant / après. Les lignes « Local » n’existent que dans ce navigateur."
      />
      {!allowed ? (
        <Notice tone="amber">Le journal complet est réservé au super admin. L’historique de chaque utilisateur et de chaque cercle reste visible dans sa fiche.</Notice>
      ) : (
        <Card>
          <ListToolbar>
            <FilterTabs
              value={list.status}
              onChange={list.setStatus}
              options={[
                { value: 'ALL', label: 'Tout' },
                { value: 'user', label: 'Comptes' },
                { value: 'circle', label: 'Cercles' },
                { value: 'payment', label: 'Paiements' },
                { value: 'refund', label: 'Remboursements' },
                { value: 'kyc', label: 'KYC' },
                { value: 'fundraiser', label: 'Cagnottes' },
                { value: 'alert', label: 'Alertes' },
                { value: 'ticket', label: 'Tickets' },
              ]}
            />
            <SearchInput value={list.search} onChange={list.setSearch} placeholder="Action, admin, cible, motif…" />
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
                    <Th>Avant → après</Th>
                    <Th>Motif / détail</Th>
                    <Th>Par</Th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((e) => {
                    const href = targetHref(e);
                    return (
                      <Tr key={e.id}>
                        <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(e.at)}</Td>
                        <Td className="font-medium">{e.action}</Td>
                        <Td className="max-w-[240px]">
                          <span className="mr-1.5 text-xs uppercase tracking-wide text-ink-muted">{AUDIT_TARGET_LABEL[e.targetType]}</span>
                          {href ? (
                            <Link href={href} className="text-sm text-brand hover:underline">
                              {e.targetLabel}
                            </Link>
                          ) : (
                            <span className="text-sm">{e.targetLabel}</span>
                          )}
                        </Td>
                        <Td className="max-w-[220px]">
                          <BeforeAfter e={e} />
                        </Td>
                        <Td className="max-w-xs text-sm text-ink-soft">
                          {e.reason ?? '—'}
                          {e.detail && <span className="block text-xs text-ink-muted">{e.detail}</span>}
                        </Td>
                        <Td className="whitespace-nowrap text-sm">
                          {e.actor}
                          {e.actorRole && <span className="block text-xs text-ink-muted">{e.actorRole}</span>}
                          {e.localOnly && (
                            <Badge tone="amber" className="mt-0.5">
                              Local
                            </Badge>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
              <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={list.setPage} />
            </>
          )}
        </Card>
      )}
    </>
  );
}
