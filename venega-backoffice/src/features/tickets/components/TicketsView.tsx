'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useListState } from '@/lib/useListState';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  FilterTabs,
  ListToolbar,
  LoadingState,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
} from '@/components/ui';
import { getTicketCounts, listTickets, type TicketFilter } from '../api';
import { TICKET_CATEGORY_LABEL, type TicketCategory } from '../types';
import { CreateTicketDialog } from './CreateTicketDialog';
import { TicketDetailDialog } from './TicketDetailDialog';
import { TicketsTable } from './TicketsTable';

type AssigneeFilter = 'ALL' | 'ME' | 'NONE';

export function TicketsView() {
  const router = useRouter();
  const sp = useSearchParams();
  const list = useListState<TicketFilter>((sp.get('status') as TicketFilter) ?? 'ACTIVE', 15, sp.get('q') ?? '');
  const [category, setCategory] = useState<TicketCategory | 'ALL'>('ALL');
  const [assignee, setAssignee] = useState<AssigneeFilter>((sp.get('assignee') as AssigneeFilter) ?? 'ALL');
  const [creating, setCreating] = useState(false);
  const openId = sp.get('ticket');

  const counts = useQuery({ queryKey: ['tickets', 'counts'], queryFn: getTicketCounts });
  const params = { ...list.params, category, assignee };
  const query = useQuery({ queryKey: ['tickets', 'list', params], queryFn: () => listTickets(params), placeholderData: keepPreviousData });
  const c = counts.data;

  const open = (id: string | null) => router.replace(id ? `/appels?ticket=${id}` : '/appels', { scroll: false });

  return (
    <>
      <PageHeader
        title="Suivi des appels"
        description="Chaque appel d’un utilisateur devient un ticket : motif, personne en charge, notes, résolution."
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setCreating(true)}>
            Nouveau ticket
          </Button>
        }
      />
      <Card>
        <ListToolbar>
          <div className="flex flex-wrap items-center gap-2">
            <FilterTabs
              value={list.status}
              onChange={list.setStatus}
              options={[
                { value: 'ACTIVE', label: 'À traiter', count: c?.active },
                { value: 'OPEN', label: 'Ouverts', count: c?.OPEN },
                { value: 'IN_PROGRESS', label: 'En cours', count: c?.IN_PROGRESS },
                { value: 'RESOLVED', label: 'Résolus' },
                { value: 'ALL', label: 'Tous' },
              ]}
            />
            <FilterTabs
              value={assignee}
              onChange={setAssignee}
              options={[
                { value: 'ALL', label: 'Toute l’équipe' },
                { value: 'ME', label: 'Les miens', count: c?.mine },
                { value: 'NONE', label: 'Non assignés', count: c?.unassigned },
              ]}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={category} onChange={(e) => setCategory(e.target.value as TicketCategory | 'ALL')} className="sm:w-56" aria-label="Motif">
              <option value="ALL">Tous les motifs</option>
              {(Object.keys(TICKET_CATEGORY_LABEL) as TicketCategory[]).map((k) => (
                <option key={k} value={k}>
                  {TICKET_CATEGORY_LABEL[k]}
                </option>
              ))}
            </Select>
            <SearchInput value={list.search} onChange={list.setSearch} placeholder="N° de ticket, nom, téléphone…" />
          </div>
        </ListToolbar>
        {query.isError ? (
          <ErrorState error={query.error} />
        ) : query.isLoading ? (
          <LoadingState />
        ) : !query.data || query.data.items.length === 0 ? (
          <EmptyState title="Aucun ticket" description={list.params.q ? 'Aucun résultat pour cette recherche.' : undefined} />
        ) : (
          <>
            <TicketsTable items={query.data.items} onOpen={open} />
            <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={list.setPage} />
          </>
        )}
      </Card>
      <CreateTicketDialog open={creating} onClose={() => setCreating(false)} onCreated={(t) => open(t.id)} />
      <TicketDetailDialog ticketId={openId} onClose={() => open(null)} />
    </>
  );
}
