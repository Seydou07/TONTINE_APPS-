'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, Link2, Undo2 } from 'lucide-react';
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
  StatCard,
  Tabs,
} from '@/components/ui';
import { getPaymentCounts, listPayments, listRefunds, type PaymentFilter } from '../api';
import type { Payment, RefundStatus } from '../types';
import { PaymentsTable } from './PaymentsTable';
import { ReconcileDialog } from './ReconcileDialog';
import { RefundRequestDialog } from './RefundRequestDialog';
import { RefundsTable } from './RefundsTable';

type Tab = 'payments' | 'refunds';

export function PaymentsView() {
  const router = useRouter();
  const sp = useSearchParams();
  const tab: Tab = sp.get('tab') === 'refunds' ? 'refunds' : 'payments';
  const counts = useQuery({ queryKey: ['payments', 'counts'], queryFn: getPaymentCounts });
  const c = counts.data;

  return (
    <>
      <PageHeader
        title="Paiements"
        description="Tous les paiements Mobile Money, la file des paiements reçus mais non rattachés, et les remboursements."
      />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="À rapprocher" value={c?.UNMATCHED ?? '—'} hint={c ? formatXOF(c.unmatchedAmount) : undefined} tone={c?.UNMATCHED ? 'amber' : 'default'} icon={<Link2 size={16} />} />
        <StatCard label="En attente opérateur" value={c?.PENDING ?? '—'} icon={<Clock size={16} />} />
        <StatCard label="Échoués (24 h)" value={c?.failedLast24h ?? '—'} tone={c?.failedLast24h ? 'red' : 'default'} icon={<AlertTriangle size={16} />} />
        <StatCard label="Remboursements ouverts" value={c?.refundsOpen ?? '—'} tone={c?.refundsOpen ? 'amber' : 'default'} icon={<Undo2 size={16} />} />
      </div>
      <Tabs
        value={tab}
        onChange={(t) => router.replace(t === 'refunds' ? '/paiements?tab=refunds' : '/paiements', { scroll: false })}
        items={[
          { value: 'payments', label: 'Paiements', count: c?.UNMATCHED, alert: !!c?.UNMATCHED },
          { value: 'refunds', label: 'Remboursements', count: c?.refundsOpen },
        ]}
      />
      {tab === 'payments' ? <PaymentsList key={`${sp.get('q') ?? ''}|${sp.get('status') ?? ''}`} initialStatus={(sp.get('status') as PaymentFilter) ?? (sp.get('q') ? 'ALL' : 'UNMATCHED')} initialQ={sp.get('q') ?? ''} unmatchedCount={c?.UNMATCHED} /> : <RefundsList />}
    </>
  );
}

function PaymentsList({ initialStatus, initialQ, unmatchedCount }: { initialStatus: PaymentFilter | 'ALL'; initialQ: string; unmatchedCount?: number }) {
  const list = useListState<PaymentFilter>(initialStatus, 15, initialQ);
  const [reconciling, setReconciling] = useState<Payment | null>(null);
  const [refunding, setRefunding] = useState<Payment | null>(null);
  const query = useQuery({ queryKey: ['payments', 'list', list.params], queryFn: () => listPayments(list.params), placeholderData: keepPreviousData });

  return (
    <Card>
      <ListToolbar>
        <FilterTabs
          value={list.status}
          onChange={list.setStatus}
          options={[
            { value: 'UNMATCHED', label: 'À rapprocher', count: unmatchedCount },
            { value: 'PENDING', label: 'En attente' },
            { value: 'FAILED', label: 'Échoués' },
            { value: 'COMPLETED', label: 'Confirmés' },
            { value: 'OUT', label: 'Sortants' },
            { value: 'ALL', label: 'Tous' },
          ]}
        />
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Réf. VP-…, réf. opérateur, numéro, nom…" className="sm:w-80" />
      </ListToolbar>
      {list.status === 'UNMATCHED' && (
        <p className="border-b border-line bg-canvas px-4 py-2 text-sm text-ink-soft">
          Argent reçu par l’opérateur mais rattaché à aucune cotisation. Rattachez-le avec la référence opérateur dictée par l’utilisateur, ou remboursez-le.
        </p>
      )}
      {query.isError ? (
        <ErrorState error={query.error} />
      ) : query.isLoading ? (
        <LoadingState />
      ) : !query.data || query.data.items.length === 0 ? (
        <EmptyState title={list.status === 'UNMATCHED' ? 'Aucun paiement à rapprocher' : 'Aucun paiement'} description={list.params.q ? 'Aucun résultat pour cette recherche.' : undefined} />
      ) : (
        <>
          <PaymentsTable items={query.data.items} onReconcile={setReconciling} onRefund={setRefunding} />
          <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={list.setPage} />
        </>
      )}
      <ReconcileDialog payment={reconciling} onClose={() => setReconciling(null)} />
      <RefundRequestDialog payment={refunding} onClose={() => setRefunding(null)} />
    </Card>
  );
}

function RefundsList() {
  const list = useListState<RefundStatus>('ALL', 15);
  const query = useQuery({ queryKey: ['refunds', 'list', list.params], queryFn: () => listRefunds(list.params), placeholderData: keepPreviousData });
  return (
    <Card>
      <ListToolbar>
        <FilterTabs
          value={list.status}
          onChange={list.setStatus}
          options={[
            { value: 'ALL', label: 'Tous' },
            { value: 'REQUESTED', label: 'Demandés' },
            { value: 'APPROVED', label: 'Approuvés' },
            { value: 'PAID', label: 'Remboursés' },
            { value: 'REJECTED', label: 'Refusés' },
          ]}
        />
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Nom, référence, numéro…" />
      </ListToolbar>
      {query.isError ? (
        <ErrorState error={query.error} />
      ) : query.isLoading ? (
        <LoadingState />
      ) : !query.data || query.data.items.length === 0 ? (
        <EmptyState title="Aucun remboursement" />
      ) : (
        <>
          <RefundsTable items={query.data.items} />
          <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={list.setPage} />
        </>
      )}
    </Card>
  );
}
