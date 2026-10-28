'use client';

import { useSearchParams } from 'next/navigation';
import { mockCircles, mockCurrentUser } from '@venega/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatFcfa } from '@/lib/format';
import { MobileMoneyCheckout } from './MobileMoneyCheckout';

const TYPE_LABELS: Record<string, string> = {
  TONTINE: 'Cotisation tontine',
  SOLIDARITY: 'Cotisation solidarité',
};

/** Paiement d'une cotisation : /payment?circleId=c1&amount=10000&type=TONTINE */
export function PaymentView() {
  const params = useSearchParams();
  const circleId = params.get('circleId') ?? mockCircles[0]?.id ?? '';
  const circle = mockCircles.find((c) => c.id === circleId) ?? mockCircles[0];
  const amount = parseFloat(params.get('amount') || '0') || circle?.tontineAmount || 0;
  const type = params.get('type') === 'SOLIDARITY' ? 'SOLIDARITY' : 'TONTINE';
  const typeLabel = TYPE_LABELS[type]!;

  return (
    <>
      <PageHeader
        title="Payer ma cotisation"
        subtitle={circle?.name}
        backHref={circle ? `/circles/${circle.id}` : '/circles'}
      />
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6">
        <div className="rounded-[20px] bg-primary-dark px-5 py-6 text-center text-white">
          <p className="text-[14px] text-white/75">{typeLabel}</p>
          <p className="mt-1 text-[30px] font-bold leading-tight">{formatFcfa(amount)}</p>
          {circle && <p className="mt-1 text-[14px] text-amber">{circle.name}</p>}
        </div>

        <MobileMoneyCheckout
          amount={amount}
          phone={mockCurrentUser.phoneNumber}
          details={[
            { label: 'Cercle', value: circle?.name ?? '—' },
            { label: 'Type', value: typeLabel },
          ]}
          successText={`${formatFcfa(amount)} ont bien été reçus pour votre ${typeLabel.toLowerCase()}.`}
          done={{ href: '/activity', label: 'Voir mon historique' }}
        />

        <p className="px-1 text-[13px] text-muted">
          Le paiement part directement de votre numéro Mobile Money vers le compte de collecte du cercle. Il ne transite
          jamais par le compte d&apos;un membre.
        </p>
      </div>
    </>
  );
}
