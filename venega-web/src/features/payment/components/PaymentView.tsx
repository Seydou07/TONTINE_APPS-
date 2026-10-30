'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Info } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Notice, ScreenBody } from '@/components/ui/blocks';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { CIRCLE_CREATION_FEE, activateCircle, getCircle, getCircles, getCurrentUser } from '@/features/circles/store';
import { circleHref } from '@/features/circles/components/CircleRedirect';
import { MobileMoneyCheckout } from './MobileMoneyCheckout';
import { PaymentAmountCard, PaymentHint, PaymentSummaryCard, PaymentSummaryRow } from './PaymentLayout';

/*
 * Paiement d'une cotisation ou des frais d'activation — copie de PaymentScreen.tsx mobile.
 * /payment?circleId=c1&amount=10000&type=TONTINE|SOLIDARITY|ACTIVATION
 * TODO API : `POST /payments` { purpose: CONTRIBUTION | CREATION_FEE, circleId, amount, provider,
 * phoneNumber } puis `GET /payments/:paymentId` ; activation : `POST /circles/:id/activate`
 * après paiement confirmé (docs/api-mobile.md, sections 3 et 4).
 */
export function PaymentView() {
  useDemoStore();
  const router = useRouter();
  const params = useSearchParams();
  const circle = getCircle(params.get('circleId') ?? '') ?? getCircles()[0];
  const rawType = params.get('type');
  const paymentType = rawType === 'SOLIDARITY' ? 'SOLIDARITY' : rawType === 'ACTIVATION' ? 'ACTIVATION' : 'TONTINE';
  const amount =
    paymentType === 'ACTIVATION'
      ? CIRCLE_CREATION_FEE
      : parseFloat(params.get('amount') || '0') || circle?.tontineAmount || 0;
  const me = getCurrentUser();

  if (!circle) {
    return (
      <>
        <PageHeader title="Payer ma cotisation" backHref="/circles" />
        <p className="mx-auto max-w-2xl px-4 py-8 text-[15px] text-muted">Ce cercle n’existe pas ou plus.</p>
      </>
    );
  }

  const typeLabel =
    paymentType === 'SOLIDARITY'
      ? 'Cotisation solidarité'
      : paymentType === 'ACTIVATION'
        ? "Frais d'activation"
        : 'Cotisation tontine';
  const backHref = circleHref(circle);

  const onSuccess = () => {
    if (paymentType === 'ACTIVATION') activateCircle(circle.id);
  };

  return (
    <>
      <PageHeader
        title={paymentType === 'ACTIVATION' ? 'Activer le cercle' : 'Payer ma cotisation'}
        subtitle={circle.name}
        backHref={backHref}
      />
      <ScreenBody>
        <PaymentAmountCard amount={amount} sub={`${typeLabel} · ${circle.name}`} />

        {paymentType === 'ACTIVATION' && (
          <Notice icon={Info} tone="warning">
            Votre cercle est créé mais pas encore actif. Réglez les frais d&apos;activation pour le mettre en service.
          </Notice>
        )}

        <PaymentSummaryCard>
          <PaymentSummaryRow label="Cercle" value={circle.name} />
          <PaymentSummaryRow
            label={paymentType === 'ACTIVATION' ? 'Type de frais' : 'Type de cotisation'}
            value={typeLabel}
          />
          <PaymentSummaryRow label="Numéro Mobile Money" value={me.phoneNumber} />
          <PaymentSummaryRow label="Montant" value={formatFcfa(amount)} strong last />
        </PaymentSummaryCard>
        <PaymentHint>Le paiement est envoyé directement depuis votre numéro Mobile Money.</PaymentHint>

        <MobileMoneyCheckout
          title="Choisissez l'opérateur"
          amount={amount}
          phone={me.phoneNumber}
          confirmDetail={`${typeLabel} · ${circle.name}`}
          successText={
            paymentType === 'ACTIVATION'
              ? `${formatFcfa(amount)} ont bien été reçus. Votre cercle est maintenant actif.`
              : `${formatFcfa(amount)} ont bien été reçus pour votre ${typeLabel.toLowerCase()}.`
          }
          onSuccess={onSuccess}
          done={{ onClick: () => router.push(backHref), label: 'Retour au cercle' }}
        />
      </ScreenBody>
    </>
  );
}
