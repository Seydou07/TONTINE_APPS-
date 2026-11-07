'use client';

import React from 'react';
import Link from 'next/link';
import { Link2, Undo2 } from 'lucide-react';
import { Button, Table, Td, Th, Tr } from '@/components/ui';
import { formatDateTime, formatPhone, formatXOF } from '@/lib/format';
import { useCan } from '@/features/auth/SessionContext';
import { PROVIDER_LABEL, PURPOSE_LABEL, type Payment } from '../types';
import { isUnmatched } from '../api';
import { PaymentStatusBadge } from './PaymentBadges';

/**
 * Tableau des paiements : heure, références (Venega + opérateur), payeur, objet, montant, statut.
 * Les actions de rattachement / remboursement n'apparaissent que si le rôle les permet.
 */
export function PaymentsTable({
  items,
  showUser = true,
  onReconcile,
  onRefund,
}: {
  items: Payment[];
  showUser?: boolean;
  onReconcile?: (p: Payment) => void;
  onRefund?: (p: Payment) => void;
}) {
  const can = useCan();
  const actions = (p: Payment, mobile = false) => {
    const unmatched = isUnmatched(p);
    const reconcile = unmatched && onReconcile && can('payment.reconcile');
    const refund = p.direction === 'IN' && p.status === 'COMPLETED' && onRefund && can('refund.request');
    if (!reconcile && !refund) return null;
    return (
      <span className={mobile ? 'mt-2 flex gap-2' : 'inline-flex flex-col items-stretch gap-1.5'}>
        {reconcile && (
          <Button size="sm" icon={<Link2 size={14} />} onClick={() => onReconcile!(p)} className={mobile ? 'flex-1' : undefined}>
            Rattacher
          </Button>
        )}
        {refund && (
          <Button size="sm" variant="secondary" icon={<Undo2 size={14} />} onClick={() => onRefund!(p)} className={mobile ? 'flex-1' : undefined}>
            Rembourser
          </Button>
        )}
      </span>
    );
  };
  return (
    <>
      {/* Téléphone : une carte par paiement, actions visibles sans défilement horizontal. */}
      <ul className="divide-y divide-line sm:hidden">
        {items.map((p) => {
          const unmatched = isUnmatched(p);
          return (
            <li key={p.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm">{p.reference}</p>
                  <p className="font-mono text-xs text-ink-muted">{p.providerReference ?? 'sans réf. opérateur'}</p>
                </div>
                <p className={`whitespace-nowrap text-right text-base font-semibold ${p.direction === 'OUT' ? 'text-ink-soft' : 'text-ink'}`}>
                  {p.direction === 'OUT' ? '− ' : '+ '}
                  {formatXOF(p.amount)}
                </p>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {formatDateTime(p.createdAt)} · {formatPhone(p.payerPhone)} · {PROVIDER_LABEL[p.provider]}
              </p>
              <p className="text-sm">
                {PURPOSE_LABEL[p.purpose]}
                {p.turn ? ` · tour ${p.turn}` : ''}
                {showUser &&
                  (p.userId ? (
                    <>
                      {' · '}
                      <Link href={`/users/${p.userId}`} className="text-brand hover:underline">
                        {p.userName}
                      </Link>
                    </>
                  ) : (
                    <span className="text-accent-ink"> · aucun compte</span>
                  ))}
              </p>
              {unmatched && p.unmatchedReason && <p className="text-xs text-accent-ink">{p.unmatchedReason}</p>}
              {p.status === 'FAILED' && p.failureReason && <p className="text-xs text-danger">{p.failureReason}</p>}
              <div className="mt-1.5">
                <PaymentStatusBadge payment={p} />
              </div>
              {actions(p, true)}
            </li>
          );
        })}
      </ul>
      <div className="hidden sm:block">
    <Table>
      <thead>
        <tr>
          <Th>Date · références</Th>
          <Th>Payeur / destinataire</Th>
          {showUser && <Th>Compte</Th>}
          <Th>Objet</Th>
          <Th className="text-right">Montant</Th>
          <Th>Statut</Th>
          {(onReconcile || onRefund) && <Th />}
        </tr>
      </thead>
      <tbody>
        {items.map((p) => {
          const unmatched = isUnmatched(p);
          return (
            <Tr key={p.id}>
              <Td className="whitespace-nowrap">
                <p className="text-sm text-ink-soft">{formatDateTime(p.createdAt)}</p>
                <p className="font-mono text-sm">{p.reference}</p>
                <p className="font-mono text-xs text-ink-muted">{p.providerReference ?? 'sans réf. opérateur'}</p>
              </Td>
              <Td className="whitespace-nowrap text-sm">
                {formatPhone(p.payerPhone)}
                <span className="block text-xs text-ink-muted">{PROVIDER_LABEL[p.provider]}</span>
              </Td>
              {showUser && (
                <Td className="max-w-[180px] text-sm">
                  {p.userId ? (
                    <Link href={`/users/${p.userId}`} className="truncate text-brand hover:underline">
                      {p.userName}
                    </Link>
                  ) : (
                    <span className="text-accent-ink">Aucun compte</span>
                  )}
                </Td>
              )}
              <Td className="max-w-[260px] text-sm">
                <p>{PURPOSE_LABEL[p.purpose]}{p.turn ? ` · tour ${p.turn}` : ''}</p>
                {p.circleId && (
                  <Link href={`/circles/${p.circleId}`} className="block truncate text-xs text-brand hover:underline">
                    {p.circleName}
                  </Link>
                )}
                {unmatched && p.unmatchedReason && <p className="text-xs text-accent-ink">{p.unmatchedReason}</p>}
                {p.status === 'FAILED' && p.failureReason && <p className="text-xs text-danger">{p.failureReason}</p>}
                {p.matchNote && <p className="text-xs text-ink-muted">Manuel : {p.matchNote}{p.matchedBy ? ` (${p.matchedBy})` : ''}</p>}
              </Td>
              <Td className={`whitespace-nowrap text-right text-sm font-medium ${p.direction === 'OUT' ? 'text-ink-soft' : 'text-ink'}`}>
                {p.direction === 'OUT' ? '− ' : '+ '}
                {formatXOF(p.amount)}
              </Td>
              <Td>
                <PaymentStatusBadge payment={p} />
              </Td>
              {(onReconcile || onRefund) && (
                <Td className="whitespace-nowrap text-right">{actions(p)}</Td>
              )}
            </Tr>
          );
        })}
      </tbody>
    </Table>
      </div>
    </>
  );
}
