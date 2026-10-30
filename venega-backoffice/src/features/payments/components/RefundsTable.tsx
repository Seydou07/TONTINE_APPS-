'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, ReasonDialog, Table, Td, Th, Tr } from '@/components/ui';
import { formatDateTime, formatPhone, formatXOF } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { useCan } from '@/features/auth/SessionContext';
import { decideRefund, type RefundDecision } from '../api';
import { PROVIDER_LABEL, REFUND_STATUS_LABEL, type Refund } from '../types';
import { RefundStatusBadge } from './PaymentBadges';

const UI: Record<RefundDecision, { label: string; title: string; tone: 'primary' | 'danger'; help: string }> = {
  APPROVE: { label: 'Approuver', title: 'Approuver le remboursement', tone: 'primary', help: 'Vérifiez le relevé opérateur avant d’approuver.' },
  MARK_PAID: { label: 'Rembourser', title: 'Lancer le remboursement', tone: 'primary', help: 'Le montant est renvoyé au numéro du payeur via l’opérateur.' },
  REJECT: { label: 'Refuser', title: 'Refuser le remboursement', tone: 'danger', help: 'L’utilisateur sera informé du refus et du motif.' },
};

/** Suivi des remboursements : statut, historique des étapes, actions Finance. */
export function RefundsTable({ items }: { items: Refund[] }) {
  const can = useCan();
  const [pending, setPending] = useState<{ refund: Refund; decision: RefundDecision } | null>(null);
  const mutation = useAdminMutation({
    mutationFn: (v: { id: string; decision: RefundDecision; note: string }) => decideRefund(v.id, v.decision, v.note),
    successTitle: (r) => `Remboursement de ${r.userName} : ${REFUND_STATUS_LABEL[r.status].toLowerCase()}`,
    onSuccess: () => setPending(null),
  });

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>Demandé le</Th>
            <Th>Bénéficiaire</Th>
            <Th>Paiement d’origine</Th>
            <Th className="text-right">Montant</Th>
            <Th>Motif et étapes</Th>
            <Th>Statut</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <Tr key={r.id}>
              <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(r.createdAt)}</Td>
              <Td className="whitespace-nowrap text-sm">
                {r.userId ? (
                  <Link href={`/users/${r.userId}`} className="text-brand hover:underline">
                    {r.userName}
                  </Link>
                ) : (
                  r.userName
                )}
                <span className="block text-xs text-ink-muted">
                  vers {formatPhone(r.destination)} · {PROVIDER_LABEL[r.provider]}
                </span>
              </Td>
              <Td className="whitespace-nowrap font-mono text-sm">
                {r.paymentReference}
                <span className="block text-xs text-ink-muted">{r.providerReference ?? '—'}</span>
              </Td>
              <Td className="whitespace-nowrap text-right text-sm font-medium">{formatXOF(r.amount)}</Td>
              <Td className="max-w-sm text-sm">
                <p className="text-ink">{r.reason}</p>
                <ol className="mt-1 space-y-0.5 text-xs text-ink-muted">
                  {r.history.map((h, i) => (
                    <li key={i}>
                      {REFUND_STATUS_LABEL[h.status]} · {h.by} · {formatDateTime(h.at)} — {h.note}
                    </li>
                  ))}
                </ol>
              </Td>
              <Td>
                <RefundStatusBadge status={r.status} />
              </Td>
              <Td className="whitespace-nowrap text-right">
                {can('refund.decide') && (
                  <span className="inline-flex gap-1.5">
                    {r.status === 'REQUESTED' && (
                      <Button size="sm" onClick={() => setPending({ refund: r, decision: 'APPROVE' })}>
                        Approuver
                      </Button>
                    )}
                    {r.status === 'APPROVED' && (
                      <Button size="sm" onClick={() => setPending({ refund: r, decision: 'MARK_PAID' })}>
                        Rembourser
                      </Button>
                    )}
                    {(r.status === 'REQUESTED' || r.status === 'APPROVED') && (
                      <Button size="sm" variant="dangerOutline" onClick={() => setPending({ refund: r, decision: 'REJECT' })}>
                        Refuser
                      </Button>
                    )}
                  </span>
                )}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {pending && (
        <ReasonDialog
          open
          onClose={() => setPending(null)}
          onConfirm={(note) => mutation.mutate({ id: pending.refund.id, decision: pending.decision, note })}
          title={UI[pending.decision].title}
          description={
            <>
              <strong className="text-ink">{pending.refund.userName}</strong> · {formatXOF(pending.refund.amount)} — {UI[pending.decision].help}
            </>
          }
          confirmLabel={UI[pending.decision].label}
          tone={UI[pending.decision].tone}
          loading={mutation.isPending}
        />
      )}
    </>
  );
}
