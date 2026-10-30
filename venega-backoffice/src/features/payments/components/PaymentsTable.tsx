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
  return (
    <Table>
      <thead>
        <tr>
          <Th>Date et heure</Th>
          <Th>Références</Th>
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
              <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(p.createdAt)}</Td>
              <Td className="whitespace-nowrap">
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
                <Td className="whitespace-nowrap text-right">
                  <span className="inline-flex gap-1.5">
                    {unmatched && onReconcile && can('payment.reconcile') && (
                      <Button size="sm" icon={<Link2 size={14} />} onClick={() => onReconcile(p)}>
                        Rattacher
                      </Button>
                    )}
                    {p.direction === 'IN' && p.status === 'COMPLETED' && onRefund && can('refund.request') && (
                      <Button size="sm" variant="secondary" icon={<Undo2 size={14} />} onClick={() => onRefund(p)}>
                        Rembourser
                      </Button>
                    )}
                  </span>
                </Td>
              )}
            </Tr>
          );
        })}
      </tbody>
    </Table>
  );
}
