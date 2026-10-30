'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardHeader, EmptyState, ReasonDialog, StatCard, Table, Td, Th, Tr } from '@/components/ui';
import { formatDate, formatDateTime, formatXOF, daysSince } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { useCan } from '@/features/auth/SessionContext';
import { solidarityAction, type SolidarityAction } from '../api';
import type { CircleDetail, SolidarityRequest } from '../types';
import { SolidarityStatusBadge } from './CircleBadges';

const UI: Record<SolidarityAction, { title: string; confirm: string; help: string; tone: 'primary' | 'danger' }> = {
  CLOSE_VOTE_APPROVE: { title: 'Clôturer le vote : approuver l’aide', confirm: 'Approuver', tone: 'primary', help: 'Le vote est bloqué (échéance passée sans quorum). L’aide passe à la validation du décaissement.' },
  CLOSE_VOTE_REJECT: { title: 'Clôturer le vote : refuser l’aide', confirm: 'Refuser', tone: 'danger', help: 'Le demandeur sera informé du refus et du motif.' },
  DISBURSE: { title: 'Décaisser l’aide', confirm: 'Décaisser', tone: 'primary', help: 'L’argent part directement vers le numéro Mobile Money du bénéficiaire, jamais vers le trésorier.' },
};

const quorum = (r: SolidarityRequest) => Math.floor(r.eligibleVoters / 2) + 1;
const isBlocked = (r: SolidarityRequest) => r.status === 'VOTING' && new Date(r.voteDeadline).getTime() < Date.now();

/** Caisse de solidarité : solde, demandes d'aide, votes, validations du bureau, grand livre. */
export function SolidarityPanel({ c }: { c: CircleDetail }) {
  const can = useCan();
  const [pending, setPending] = useState<{ r: SolidarityRequest; a: SolidarityAction } | null>(null);
  const mutation = useAdminMutation({
    mutationFn: (v: { id: string; a: SolidarityAction; reason: string }) => solidarityAction(v.id, v.a, v.reason),
    successTitle: (r) => `Demande d’aide de ${r.userName} : ${r.status === 'DISBURSED' ? 'décaissée' : r.status === 'APPROVED' ? 'approuvée' : 'refusée'}`,
    onSuccess: () => setPending(null),
  });
  const credits = c.ledger.filter((e) => e.type === 'CREDIT').reduce((n, e) => n + e.amount, 0);
  const debits = c.ledger.filter((e) => e.type === 'DEBIT').reduce((n, e) => n + e.amount, 0);
  const awaiting = c.solidarityRequests.filter((r) => r.status === 'APPROVED');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Solde de la caisse" value={formatXOF(c.solidarityBalance)} />
        <StatCard label="Total cotisé" value={formatXOF(credits)} />
        <StatCard label="Total décaissé" value={formatXOF(debits)} />
        <StatCard label="Aides à décaisser" value={awaiting.length} tone={awaiting.length ? 'amber' : 'default'} hint={awaiting.length ? formatXOF(awaiting.reduce((n, r) => n + r.amount, 0)) : undefined} />
      </div>

      <Card>
        <CardHeader title="Demandes d’aide" subtitle="Vote des membres (majorité des votants éligibles), puis validation du bureau, puis décaissement." />
        {c.solidarityRequests.length === 0 ? (
          <EmptyState title="Aucune demande d’aide" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Demande</Th>
                <Th>Bénéficiaire</Th>
                <Th className="text-right">Montant</Th>
                <Th>Vote</Th>
                <Th>Bureau</Th>
                <Th>Statut</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {c.solidarityRequests.map((r) => {
                const blocked = isBlocked(r);
                return (
                  <Tr key={r.id}>
                    <Td className="max-w-xs text-sm">
                      <p className="font-medium">{r.eventLabel}</p>
                      <p className="text-ink-soft">{r.reason}</p>
                      <p className="text-xs text-ink-muted">le {formatDate(r.createdAt)}</p>
                    </Td>
                    <Td className="text-sm">
                      <Link href={`/users/${r.userId}`} className="text-brand hover:underline">
                        {r.userName}
                      </Link>
                    </Td>
                    <Td className="whitespace-nowrap text-right text-sm font-medium">{formatXOF(r.amount)}</Td>
                    <Td className="whitespace-nowrap text-sm">
                      {r.votesFor} pour · {r.votesAgainst} contre
                      <span className="block text-xs text-ink-muted">
                        {r.votesFor + r.votesAgainst}/{r.eligibleVoters} votants · majorité {quorum(r)}
                      </span>
                      {r.status === 'VOTING' && (
                        <span className={`block text-xs ${blocked ? 'font-medium text-danger' : 'text-ink-muted'}`}>
                          {blocked ? `échéance dépassée de ${daysSince(r.voteDeadline)} j` : `fin le ${formatDate(r.voteDeadline)}`}
                        </span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-sm">
                      {r.validatorsApproved}/{r.validatorsTotal} validé(s)
                      {r.status === 'APPROVED' && r.approvedAt && <span className="block text-xs text-danger">non décaissée depuis {daysSince(r.approvedAt)} j</span>}
                    </Td>
                    <Td>
                      <SolidarityStatusBadge status={r.status} blocked={blocked} />
                      {r.decisionNote && <span className="block max-w-[200px] text-xs text-ink-muted">{r.decisionNote}</span>}
                    </Td>
                    <Td className="whitespace-nowrap text-right">
                      {can('solidarity.manage') && (
                        <span className="inline-flex gap-1.5">
                          {blocked && (
                            <>
                              <Button size="sm" onClick={() => setPending({ r, a: 'CLOSE_VOTE_APPROVE' })}>
                                Approuver
                              </Button>
                              <Button size="sm" variant="dangerOutline" onClick={() => setPending({ r, a: 'CLOSE_VOTE_REJECT' })}>
                                Refuser
                              </Button>
                            </>
                          )}
                          {r.status === 'APPROVED' && (
                            <Button size="sm" onClick={() => setPending({ r, a: 'DISBURSE' })}>
                              Décaisser
                            </Button>
                          )}
                        </span>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Grand livre" subtitle="Entrées (cotisations) et sorties (aides versées), avec le solde après chaque opération." />
        {c.ledger.length === 0 ? (
          <EmptyState title="Aucune opération" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Opération</Th>
                <Th className="text-right">Montant</Th>
                <Th className="text-right">Solde après</Th>
              </tr>
            </thead>
            <tbody>
              {c.ledger.slice(0, 15).map((e) => (
                <Tr key={e.id}>
                  <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(e.at)}</Td>
                  <Td className="text-sm">{e.label}</Td>
                  <Td className={`whitespace-nowrap text-right text-sm font-medium ${e.type === 'DEBIT' ? 'text-danger' : 'text-brand'}`}>
                    {e.type === 'DEBIT' ? '− ' : '+ '}
                    {formatXOF(e.amount)}
                  </Td>
                  <Td className="whitespace-nowrap text-right text-sm">{formatXOF(e.balanceAfter)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {pending && (
        <ReasonDialog
          open
          onClose={() => setPending(null)}
          onConfirm={(reason) => mutation.mutate({ id: pending.r.id, a: pending.a, reason })}
          title={UI[pending.a].title}
          description={
            <>
              <strong className="text-ink">{pending.r.userName}</strong> · {formatXOF(pending.r.amount)} — {UI[pending.a].help}
            </>
          }
          confirmLabel={UI[pending.a].confirm}
          tone={UI[pending.a].tone}
          minLength={10}
          presets={
            pending.a === 'DISBURSE'
              ? ['Bureau au complet mais trésorier injoignable', 'Validation confirmée par le président au téléphone']
              : ['Échéance dépassée, majorité des votants favorable', 'Échéance dépassée, quorum non atteint']
          }
          loading={mutation.isPending}
        />
      )}
    </div>
  );
}
