'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, Clock, RefreshCw, Send } from 'lucide-react';
import { Button, Card, CardHeader, EmptyState, FormField, Notice, ReasonDialog, Table, Td, TextInput, Th, Tr } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDate, formatPhone, formatXOF, daysSince } from '@/lib/format';
import { toE164BF } from '@/lib/phone';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { useCan } from '@/features/auth/SessionContext';
import { payoutAction, type PayoutAction } from '../api';
import { CELL_STATUS_LABEL, type CellStatus, type CircleDetail, type ContributionCell, type Payout } from '../types';
import { PayoutStatusBadge } from './CircleBadges';

const CELL_STYLE: Record<CellStatus, string> = {
  PAID: 'bg-brand-tint text-brand border-brand-line',
  PAID_LATE: 'bg-accent-tint text-accent-ink border-accent-line',
  PENDING: 'bg-white text-accent-ink border-accent-line border-dashed',
  LATE: 'bg-danger-tint text-danger border-danger-line',
  UPCOMING: 'bg-canvas text-ink-muted border-line',
};

function CellIcon({ status }: { status: CellStatus }) {
  if (status === 'PAID' || status === 'PAID_LATE') return <Check size={14} strokeWidth={2.5} />;
  if (status === 'LATE') return <AlertCircle size={14} />;
  if (status === 'PENDING') return <Clock size={13} />;
  return null;
}

function cellTitle(c: ContributionCell, name: string): string {
  const parts = [`${name} · tour ${c.turn}`, CELL_STATUS_LABEL[c.status], `échéance ${formatDate(c.dueDate)}`];
  if (c.paidAt) parts.push(`payé le ${formatDate(c.paidAt)}`);
  return parts.join(' · ');
}

const DAY = 86_400_000;
export const isPayoutOverdue = (p: Payout) => p.status === 'FAILED' || (p.status === 'READY' && new Date(p.dueDate).getTime() < Date.now() - 2 * DAY);

/**
 * Grille membres × tours : qui a payé quoi à chaque tour, et versement de chaque tour.
 * Répond à « je n'ai pas reçu ma cagnotte », « un membre ne paie pas », « j'ai payé mais ça n'apparaît pas ».
 */
export function ContributionGrid({ c }: { c: CircleDetail }) {
  const can = useCan();
  const isSolidarity = c.kind === 'SOLIDARITY';
  const turns = [...new Set(c.contributions.map((x) => x.turn))].sort((a, b) => a - b);
  const members = [...c.members].sort((a, b) => (a.turnOrder ?? 99) - (b.turnOrder ?? 99) || a.name.localeCompare(b.name));
  const cellOf = (userId: string, turn: number) => c.contributions.find((x) => x.userId === userId && x.turn === turn);
  const payoutOf = (turn: number) => c.payouts.find((p) => p.turn === turn);
  const [pending, setPending] = useState<{ payout: Payout; action: PayoutAction } | null>(null);

  if (turns.length === 0) return <Card><EmptyState title="Aucune cotisation enregistrée" /></Card>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={isSolidarity ? 'Cotisations par période' : 'Cotisations par tour'}
          subtitle={isSolidarity ? `Six dernières périodes · période en cours : ${c.currentTurn}` : `Cycle ${c.cycleNumber} · tour en cours : ${c.currentTurn} / ${c.totalTurns}`}
        />
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 min-w-[200px] border-b border-line bg-canvas px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Membre
                </th>
                {turns.map((t) => (
                  <th
                    key={t}
                    className={cn(
                      'min-w-[44px] border-b border-line px-1 py-2 text-center text-xs font-semibold text-ink-muted',
                      t === c.currentTurn ? 'bg-accent-tint text-accent-ink' : 'bg-canvas',
                    )}
                  >
                    {isSolidarity ? 'P' : 'T'}
                    {t}
                  </th>
                ))}
                <th className="border-b border-line bg-canvas px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Retards</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.userId} className={cn(m.status !== 'ACTIVE' && 'opacity-60')}>
                  <td className="sticky left-0 z-10 border-b border-line bg-white px-3 py-1.5">
                    <Link href={`/users/${m.userId}`} className="block truncate font-medium text-ink hover:text-brand hover:underline">
                      {!isSolidarity && <span className="mr-1.5 inline-block w-5 text-right text-xs text-ink-muted">{m.turnOrder}</span>}
                      {m.name}
                    </Link>
                    {m.status !== 'ACTIVE' && <span className="text-xs text-danger">{m.status === 'EXCLUDED' ? 'exclu(e)' : 'parti(e)'}</span>}
                  </td>
                  {turns.map((t) => {
                    const cell = cellOf(m.userId, t);
                    const isBeneficiary = !isSolidarity && m.turnOrder === t;
                    return (
                      <td key={t} className={cn('border-b border-line px-1 py-1 text-center', t === c.currentTurn && 'bg-accent-tint/40')}>
                        {cell ? (
                          <span
                            title={cellTitle(cell, m.name) + (isBeneficiary ? ' · reçoit la cagnotte de ce tour' : '')}
                            className={cn(
                              'mx-auto flex h-7 w-8 items-center justify-center rounded border',
                              CELL_STYLE[cell.status],
                              isBeneficiary && 'ring-2 ring-brand ring-offset-1',
                            )}
                          >
                            <CellIcon status={cell.status} />
                          </span>
                        ) : (
                          <span className="text-ink-muted">·</span>
                        )}
                      </td>
                    );
                  })}
                  <td className={cn('border-b border-line px-3 py-1.5 text-right', m.lateCount > 0 ? 'font-semibold text-danger' : 'text-ink-muted')}>
                    {m.lateCount}
                    {m.paidLateCount > 0 && <span className="block text-xs font-normal text-accent-ink">{m.paidLateCount} payé(s) en retard</span>}
                  </td>
                </tr>
              ))}
              {!isSolidarity && (
                <tr>
                  <td className="sticky left-0 z-10 bg-canvas px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Versement du tour</td>
                  {turns.map((t) => {
                    const p = payoutOf(t);
                    const overdue = p ? isPayoutOverdue(p) : false;
                    const label = !p ? '' : p.status === 'PAID' ? 'OK' : p.status === 'FAILED' ? 'Échec' : p.status === 'READY' ? 'À verser' : p.status === 'PROCESSING' ? 'En cours' : '…';
                    return (
                      <td key={t} className="bg-canvas px-1 py-2 text-center">
                        {p && (
                          <span
                            title={`${p.beneficiaryName} · ${formatXOF(p.amount)} · ${label}`}
                            className={cn(
                              'text-[11px] font-semibold',
                              p.status === 'PAID' ? 'text-brand' : overdue || p.status === 'FAILED' ? 'text-danger' : 'text-accent-ink',
                            )}
                          >
                            {label}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="bg-canvas" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2 text-xs text-ink-muted">
          {(['PAID', 'PAID_LATE', 'PENDING', 'LATE', 'UPCOMING'] as CellStatus[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={cn('flex h-4 w-5 items-center justify-center rounded border', CELL_STYLE[s])} /> {CELL_STATUS_LABEL[s]}
            </span>
          ))}
          {!isSolidarity && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-4 w-5 rounded border border-line ring-2 ring-brand ring-offset-1" /> Bénéficiaire du tour
            </span>
          )}
        </div>
      </Card>

      {!isSolidarity && (
        <Card>
          <CardHeader title="Versements des cagnottes" subtitle="Un versement « À verser » depuis plus de 2 jours ou en échec est signalé en rouge." />
          {c.payouts.length === 0 ? (
            <EmptyState title="Aucun versement" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Tour</Th>
                  <Th>Bénéficiaire</Th>
                  <Th>Numéro de réception</Th>
                  <Th className="text-right">Montant</Th>
                  <Th>Statut</Th>
                  <Th>Date</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {[...c.payouts].reverse().map((p) => {
                  const overdue = isPayoutOverdue(p);
                  return (
                    <Tr key={p.id}>
                      <Td className="text-sm">{p.turn}</Td>
                      <Td>
                        <Link href={`/users/${p.beneficiaryId}`} className="text-sm font-medium text-brand hover:underline">
                          {p.beneficiaryName}
                        </Link>
                      </Td>
                      <Td className="whitespace-nowrap text-sm">{formatPhone(p.destination)}</Td>
                      <Td className="whitespace-nowrap text-right text-sm font-medium">{formatXOF(p.amount)}</Td>
                      <Td>
                        <PayoutStatusBadge status={p.status} overdue={overdue} />
                        {p.failureReason && <span className="block max-w-[260px] text-xs text-danger">{p.failureReason}</span>}
                      </Td>
                      <Td className="whitespace-nowrap text-sm text-ink-soft">
                        {p.paidAt ? `versé le ${formatDate(p.paidAt)}` : p.status === 'WAITING' ? `échéance ${formatDate(p.dueDate)}` : `attendu depuis ${daysSince(p.dueDate)} j`}
                      </Td>
                      <Td className="whitespace-nowrap text-right">
                        {can('payout.manage') && p.status === 'FAILED' && (
                          <Button size="sm" icon={<RefreshCw size={14} />} onClick={() => setPending({ payout: p, action: 'RETRY' })}>
                            Relancer
                          </Button>
                        )}
                        {can('payout.manage') && p.status === 'READY' && overdue && (
                          <Button size="sm" icon={<Send size={14} />} onClick={() => setPending({ payout: p, action: 'FORCE' })}>
                            Verser
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card>
      )}
      {pending && <PayoutDialog circle={c} payout={pending.payout} action={pending.action} onClose={() => setPending(null)} />}
    </div>
  );
}

function PayoutDialog({ circle, payout, action, onClose }: { circle: CircleDetail; payout: Payout; action: PayoutAction; onClose: () => void }) {
  const [destination, setDestination] = useState('');
  const dest = destination.trim() ? toE164BF(destination) : undefined;
  const mutation = useAdminMutation({
    mutationFn: (reason: string) => payoutAction(payout.id, action, reason, dest ?? undefined),
    successTitle: () => `Versement du tour ${payout.turn} envoyé à l’opérateur`,
    onSuccess: onClose,
  });
  return (
    <ReasonDialog
      open
      onClose={onClose}
      onConfirm={(reason) => {
        if (destination.trim() && !dest) return;
        mutation.mutate(reason);
      }}
      title={action === 'RETRY' ? 'Relancer le versement' : 'Verser la cagnotte à la place du fondateur'}
      description={
        <div className="space-y-2">
          <p>
            {payout.beneficiaryName} · <strong className="text-ink">{formatXOF(payout.amount)}</strong> · tour {payout.turn} de « {circle.name} »
          </p>
          {action === 'FORCE' && (
            <Notice tone="amber">Toutes les cotisations du tour sont payées et le fondateur n’a pas versé depuis {daysSince(payout.dueDate)} jours. Prévenez le fondateur.</Notice>
          )}
          {action === 'RETRY' && (
            <FormField label="Nouveau numéro de réception (facultatif)" hint={`Actuel : ${formatPhone(payout.destination)}. À confirmer avec le bénéficiaire.`} error={destination.trim() && !dest ? '8 chiffres après +226.' : null}>
              {(id) => <TextInput id={id} inputMode="tel" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="+226 70 00 00 00" />}
            </FormField>
          )}
        </div>
      }
      confirmLabel={action === 'RETRY' ? 'Relancer le versement' : 'Verser maintenant'}
      minLength={10}
      presets={action === 'RETRY' ? ['Numéro corrigé avec le bénéficiaire', 'Incident opérateur résolu'] : ['Fondateur injoignable depuis plus de 7 jours', 'Fondateur refuse de verser sans motif valable']}
      loading={mutation.isPending}
    />
  );
}
