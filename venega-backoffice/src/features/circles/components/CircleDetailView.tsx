'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { formatDate, formatXOF, percent } from '@/lib/format';
import { matchesQuery } from '@/lib/list';
import {
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  ProgressBar,
  SearchInput,
  StatCard,
  Table,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { getCircle } from '../api';
import { FREQUENCY_LABEL, ROLE_LABEL } from '../types';
import { CircleKindBadge, CircleStatusBadge, PaymentStatusBadge } from './CircleBadges';

export function CircleDetailView({ id }: { id: string }) {
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: ['circles', 'detail', id], queryFn: () => getCircle(id) });
  const c = query.data;

  const members = useMemo(() => (c ? c.members.filter((m) => matchesQuery(search, m.name)) : []), [c, search]);

  const back = (
    <Link href="/circles" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand">
      <ArrowLeft size={16} /> Tous les cercles
    </Link>
  );

  if (query.isError) return <>{back}<Card><ErrorState error={query.error} /></Card></>;
  if (query.isLoading) return <>{back}<Card><LoadingState /></Card></>;
  if (!c) return <>{back}<Card><EmptyState title="Cercle introuvable" /></Card></>;

  const paid = c.members.filter((m) => m.paymentStatus === 'PAID').length;
  const isSolidarity = c.kind === 'SOLIDARITY';

  return (
    <>
      {back}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-1 text-2xl font-semibold text-ink">{c.name}</h1>
        <CircleKindBadge kind={c.kind} />
        <CircleStatusBadge status={c.status} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Cotisation" value={formatXOF(c.contribution)} hint={FREQUENCY_LABEL[c.frequency]} />
        <StatCard
          label={isSolidarity ? 'Solde de la caisse' : 'Collecté ce tour'}
          value={formatXOF(isSolidarity ? c.solidarityBalance : c.collectedThisPeriod)}
        />
        <StatCard label="Cotisations payées" value={`${paid} / ${c.members.length}`} hint={<ProgressBar value={percent(paid, c.members.length)} className="mt-1" />} />
        <StatCard label="Retards" value={c.latePayments} tone={c.latePayments > 0 ? 'red' : 'default'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardHeader
            title="Membres"
            subtitle={c.members.length < c.memberCount ? `${c.members.length} affichés sur ${c.memberCount}` : `${c.memberCount} membres`}
            actions={<SearchInput value={search} onChange={setSearch} placeholder="Rechercher un membre…" className="sm:w-60" />}
          />
          {members.length === 0 ? (
            <EmptyState title="Aucun membre trouvé" />
          ) : (
            <Table>
              <thead>
                <tr>
                  {!isSolidarity && <Th>Ordre</Th>}
                  <Th>Membre</Th>
                  <Th>Rôle</Th>
                  <Th>Cotisation du tour</Th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <Tr key={m.userId}>
                    {!isSolidarity && <Td className="text-sm text-ink-muted">{m.turnOrder ?? '—'}</Td>}
                    <Td className="font-medium">{m.name}</Td>
                    <Td className="text-sm text-ink-soft">{ROLE_LABEL[m.role]}</Td>
                    <Td>
                      <PaymentStatusBadge status={m.paymentStatus} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader title="Informations" />
          <dl className="space-y-3 p-4">
            <Field label="Président(e)">{c.presidentName}</Field>
            {!isSolidarity && <Field label="Tour en cours">{`${c.currentTurn} / ${c.totalTurns}`}</Field>}
            {c.natureItem && <Field label="Bien remis">{c.natureItem}</Field>}
            <Field label="Code d’invitation">
              <span className="font-mono text-sm">{c.inviteCode}</span>
            </Field>
            <Field label="Créé le">{formatDate(c.createdAt)}</Field>
          </dl>
        </Card>
      </div>
    </>
  );
}
