'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Headphones, Snowflake, Sun, UserCog } from 'lucide-react';
import { formatDate, formatDateTime, formatRelative, formatXOF, percent } from '@/lib/format';
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Field,
  FormField,
  LoadingState,
  Notice,
  PhoneLinks,
  ProgressBar,
  ReasonDialog,
  Select,
  StatCard,
  Tabs,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { useCan } from '@/features/auth/SessionContext';
import { AuditTrail } from '@/features/audit/components/AuditTrail';
import { NotesPanel } from '@/features/audit/components/NotesPanel';
import { listTickets } from '@/features/tickets/api';
import { CreateTicketDialog } from '@/features/tickets/components/CreateTicketDialog';
import { TicketDetailDialog } from '@/features/tickets/components/TicketDetailDialog';
import { TicketsTable } from '@/features/tickets/components/TicketsTable';
import { getCircle, setCircleFrozen, transferFounder } from '../api';
import { FREQUENCY_LABEL, roleLabel, type CircleDetail } from '../types';
import { CircleKindBadge, CircleStatusBadge } from './CircleBadges';
import { CircleMembersPanel } from './CircleMembersPanel';
import { CircleRequestsPanel } from './CircleRequestsPanel';
import { ContributionGrid, isPayoutOverdue } from './ContributionGrid';
import { SolidarityPanel } from './SolidarityPanel';

type Tab = 'turns' | 'solidarity' | 'members' | 'requests' | 'timeline' | 'support';

/** Fiche cercle 360° : « quand on m'appelle, je retrouve le cercle rapidement et je gère ». */
export function CircleDetailView({ id }: { id: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const can = useCan();
  const query = useQuery({ queryKey: ['circles', 'detail', id], queryFn: () => getCircle(id) });
  const c = query.data;
  const [dialog, setDialog] = useState<'freeze' | 'transfer' | 'ticket' | null>(null);

  const back = (
    <Link href="/circles" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand">
      <ArrowLeft size={16} /> Tous les cercles
    </Link>
  );

  if (query.isError) return <>{back}<Card><ErrorState error={query.error} /></Card></>;
  if (query.isLoading) return <>{back}<Card><LoadingState /></Card></>;
  if (!c) return <>{back}<Card><EmptyState title="Cercle introuvable" /></Card></>;

  const isSolidarity = c.kind === 'SOLIDARITY';
  const tab = (sp.get('tab') as Tab) ?? (isSolidarity ? 'solidarity' : 'turns');
  const setTab = (t: Tab) => router.replace(`/circles/${id}?tab=${t}`, { scroll: false });
  const active = c.members.filter((m) => m.status === 'ACTIVE');
  const paid = active.filter((m) => m.paymentStatus === 'PAID').length;
  const founder = c.members.find((m) => m.userId === c.founderId);
  const overdue = c.payouts.filter(isPayoutOverdue);
  const openRequests = c.requests.filter((r) => r.status === 'PENDING' || (r.type === 'EXCLUSION' && r.contested && r.status === 'APPROVED')).length;
  const blockedVotes = c.solidarityRequests.filter((r) => r.status === 'VOTING' && new Date(r.voteDeadline).getTime() < Date.now()).length;
  const toDisburse = c.solidarityRequests.filter((r) => r.status === 'APPROVED').length;
  const founderLabel = roleLabel('PRESIDENT', c.kind);

  return (
    <>
      {back}
      <div className="mb-4 flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="mr-1 text-2xl font-semibold text-ink">{c.name}</h1>
            <CircleKindBadge kind={c.kind} />
            <CircleStatusBadge status={c.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
            <span>
              {founderLabel} :{' '}
              <Link href={`/users/${c.founderId}`} className="font-medium text-brand hover:underline">
                {c.founderName}
              </Link>
            </span>
            {founder && <PhoneLinks phone={founder.phoneNumber} compact />}
            <span>
              Code <span className="font-mono">{c.inviteCode}</span>
            </span>
            <span>Créé le {formatDate(c.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={<Headphones size={16} />} onClick={() => setDialog('ticket')}>
            Créer un ticket
          </Button>
          {can('circle.transferFounder') && c.status !== 'COMPLETED' && (
            <Button variant="secondary" icon={<UserCog size={16} />} onClick={() => setDialog('transfer')}>
              Transférer le rôle
            </Button>
          )}
          {can('circle.freeze') &&
            c.status !== 'COMPLETED' &&
            (c.status === 'FROZEN' ? (
              <Button variant="secondary" icon={<Sun size={16} />} onClick={() => setDialog('freeze')}>
                Dégeler
              </Button>
            ) : (
              <Button variant="dangerOutline" icon={<Snowflake size={16} />} onClick={() => setDialog('freeze')}>
                Geler le cercle
              </Button>
            ))}
        </div>
      </div>

      {c.status === 'FROZEN' && (
        <Notice tone="red" className="mb-4">
          Cercle gelé par Venega {c.frozenAt ? formatRelative(c.frozenAt) : ''} : aucune cotisation, aucun versement, aucun décaissement possible. Motif : {c.frozenReason}
        </Notice>
      )}
      {overdue.length > 0 && (
        <Notice tone="red" className="mb-4">
          {overdue.map((p) => (
            <span key={p.id} className="block">
              Cagnotte du tour {p.turn} pour {p.beneficiaryName} ({formatXOF(p.amount)}) : {p.status === 'FAILED' ? `versement refusé par l’opérateur — ${p.failureReason}` : `prête depuis le ${formatDate(p.dueDate)}, non versée par le fondateur`}.
            </span>
          ))}
        </Notice>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Cotisation" value={formatXOF(c.contribution)} hint={`${FREQUENCY_LABEL[c.frequency]}${c.natureItem ? ` · ${c.natureItem}` : ''}`} />
        {isSolidarity ? (
          <StatCard label="Solde de la caisse" value={formatXOF(c.solidarityBalance)} hint={`Période ${c.currentTurn}`} />
        ) : (
          <StatCard label="Tour en cours" value={`${c.currentTurn} / ${c.totalTurns}`} hint={`Cycle ${c.cycleNumber} commencé le ${formatDate(c.cycleStartedAt)}`} />
        )}
        <StatCard label={isSolidarity ? 'Payé cette période' : 'Payé ce tour'} value={`${paid} / ${active.length}`} hint={<ProgressBar value={percent(paid, active.length)} className="mt-1" />} />
        <StatCard label="Cotisations en retard" value={c.latePayments} tone={c.latePayments > 0 ? 'red' : 'default'} hint={`Exclusion possible après ${c.exclusionThreshold} retards`} />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          ...(isSolidarity
            ? [{ value: 'solidarity' as const, label: 'Solidarité', count: blockedVotes + toDisburse, alert: blockedVotes + toDisburse > 0 }]
            : []),
          { value: 'turns' as const, label: isSolidarity ? 'Cotisations' : 'Tours et versements', count: overdue.length, alert: overdue.length > 0 },
          { value: 'members' as const, label: 'Membres et ordre', count: c.latePayments, alert: c.latePayments > 0 },
          { value: 'requests' as const, label: 'Demandes', count: openRequests, alert: openRequests > 0 },
          { value: 'timeline' as const, label: 'Chronologie' },
          { value: 'support' as const, label: 'Tickets et notes' },
        ]}
      />

      {tab === 'turns' && <ContributionGrid c={c} />}
      {tab === 'solidarity' && isSolidarity && <SolidarityPanel c={c} />}
      {tab === 'members' && <CircleMembersPanel c={c} />}
      {tab === 'requests' && <CircleRequestsPanel c={c} />}
      {tab === 'timeline' && <Timeline c={c} />}
      {tab === 'support' && <CircleSupport c={c} />}

      {dialog === 'freeze' && <FreezeDialog c={c} onClose={() => setDialog(null)} />}
      {dialog === 'transfer' && <TransferFounderDialog c={c} onClose={() => setDialog(null)} />}
      <CreateTicketDialog open={dialog === 'ticket'} onClose={() => setDialog(null)} subject={{ circleId: c.id, circleName: c.name }} />
    </>
  );
}

function FreezeDialog({ c, onClose }: { c: CircleDetail; onClose: () => void }) {
  const frozen = c.status === 'FROZEN';
  const mutation = useAdminMutation({
    mutationFn: (reason: string) => setCircleFrozen(c.id, !frozen, reason),
    successTitle: () => (frozen ? `« ${c.name} » dégelé` : `« ${c.name} » gelé`),
    onSuccess: onClose,
  });
  return (
    <ReasonDialog
      open
      onClose={onClose}
      onConfirm={(reason) => mutation.mutate(reason)}
      title={frozen ? 'Dégeler le cercle' : 'Geler le cercle'}
      description={
        frozen
          ? 'Les cotisations, versements et décaissements redeviennent possibles. Tous les membres sont prévenus.'
          : 'Plus aucun mouvement d’argent (cotisations, versements, décaissements) jusqu’au dégel. Tous les membres sont prévenus. À utiliser en cas de fondateur disparu, d’abus ou de fraude.'
      }
      confirmLabel={frozen ? 'Dégeler' : 'Geler le cercle'}
      tone={frozen ? 'primary' : 'danger'}
      presets={frozen ? ['Nouveau responsable désigné', 'Vérification terminée'] : ['Fondateur injoignable, cagnotte non versée', 'Plaintes de plusieurs membres pour abus', 'Suspicion de fraude']}
      loading={mutation.isPending}
    />
  );
}

function TransferFounderDialog({ c, onClose }: { c: CircleDetail; onClose: () => void }) {
  const candidates = c.members.filter((m) => m.status === 'ACTIVE' && m.userId !== c.founderId);
  const [to, setTo] = useState(candidates[0]?.userId ?? '');
  const label = roleLabel('PRESIDENT', c.kind).toLowerCase();
  const mutation = useAdminMutation({
    mutationFn: (reason: string) => transferFounder(c.id, to, reason),
    successTitle: (r) => `${r.founderName} est désormais ${label}`,
    onSuccess: onClose,
  });
  return (
    <ReasonDialog
      open
      onClose={onClose}
      onConfirm={(reason) => to && mutation.mutate(reason)}
      title={`Transférer le rôle de ${label}`}
      description={
        <div className="space-y-2">
          <p>
            {c.founderName} perd ses droits de gestion (versements, demandes, ordre de passage). Tous les membres sont prévenus. Choisissez de préférence un membre au KYC vérifié, avec
            l’accord du groupe.
          </p>
          <FormField label={`Nouveau ou nouvelle ${label}`}>
            {(id) => (
              <Select id={id} value={to} onChange={(e) => setTo(e.target.value)}>
                {candidates.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                    {m.lateCount > 0 ? ` (${m.lateCount} retard)` : ''}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>
      }
      confirmLabel="Transférer"
      tone="danger"
      minLength={10}
      presets={['Fondateur injoignable depuis plus de 7 jours', 'Fondateur démissionnaire, accord des membres', 'Abus constatés par Venega']}
      loading={mutation.isPending}
    />
  );
}

function Timeline({ c }: { c: CircleDetail }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <CardHeader title="Chronologie du cercle" subtitle="Tout ce qui s’est passé, du plus récent au plus ancien." />
        {c.events.length === 0 ? (
          <EmptyState title="Aucun évènement" />
        ) : (
          <ol className="relative px-4 py-3">
            {c.events.map((e) => (
              <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
                <span
                  className={cn(
                    'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                    e.tone === 'green' ? 'bg-brand' : e.tone === 'red' ? 'bg-danger' : e.tone === 'amber' ? 'bg-accent' : 'bg-line',
                  )}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-base font-medium text-ink">{e.label}</p>
                  {e.detail && <p className="text-sm text-ink-soft">{e.detail}</p>}
                  <p className="text-xs text-ink-muted">
                    {e.actor} · {formatDateTime(e.at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
      <Card className="h-fit">
        <CardHeader title="Actions de l’équipe Venega" subtitle="Journal d’audit de ce cercle." />
        <AuditTrail subjectId={c.id} />
      </Card>
    </div>
  );
}

function CircleSupport({ c }: { c: CircleDetail }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['tickets', 'circle', c.id], queryFn: () => listTickets({ circleId: c.id, status: 'ALL', page: 1, pageSize: 50 }) });
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <Card>
          <CardHeader title="Tickets liés à ce cercle" />
          {query.isLoading ? <LoadingState /> : !query.data?.items.length ? <EmptyState title="Aucun ticket" /> : <TicketsTable items={query.data.items} onOpen={setOpenId} compact />}
        </Card>
        <Card>
          <CardHeader title="Informations" />
          <dl className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3">
            <Field label="Fréquence">{FREQUENCY_LABEL[c.frequency]}</Field>
            <Field label="Membres actifs">{c.memberCount}</Field>
            <Field label="Code d’invitation">
              <span className="font-mono text-sm">{c.inviteCode}</span>
            </Field>
            {c.natureItem && <Field label="Bien remis">{c.natureItem}</Field>}
            <Field label="Seuil d’exclusion">{c.exclusionThreshold} retards</Field>
            <Field label="Identifiant">
              <span className="font-mono text-sm">{c.id}</span>
            </Field>
          </dl>
        </Card>
      </div>
      <NotesPanel subject={{ circleId: c.id }} />
      <TicketDetailDialog ticketId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
