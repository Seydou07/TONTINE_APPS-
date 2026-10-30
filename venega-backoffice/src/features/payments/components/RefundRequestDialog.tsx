'use client';

import React from 'react';
import { ReasonDialog } from '@/components/ui';
import { formatPhone, formatXOF } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { requestRefund } from '../api';
import type { Payment } from '../types';

/** Demande de remboursement (double paiement, mauvais montant). Validée ensuite par la Finance. */
export function RefundRequestDialog({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  const mutation = useAdminMutation({
    mutationFn: (reason: string) => requestRefund(payment!.id, reason),
    successTitle: (r) => `Remboursement de ${formatXOF(r.amount)} demandé — suivi dans Paiements › Remboursements`,
    onSuccess: onClose,
  });
  if (!payment) return null;
  return (
    <ReasonDialog
      open
      onClose={onClose}
      onConfirm={(reason) => mutation.mutate(reason)}
      title="Demander un remboursement"
      description={
        <>
          {payment.reference} · <strong className="text-ink">{formatXOF(payment.amount)}</strong> renvoyés au {formatPhone(payment.payerPhone)} après validation par la Finance.
        </>
      }
      confirmLabel="Demander le remboursement"
      minLength={10}
      presets={['Double paiement de la même cotisation', 'Mauvais montant envoyé', 'Paiement envoyé au mauvais cercle', 'Payeur sans compte Venega']}
      loading={mutation.isPending}
    />
  );
}
