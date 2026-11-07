'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody } from '@/components/ui/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { MobileMoneyCheckout } from '@/features/payment/components/MobileMoneyCheckout';
import { PaymentColumns } from '@/features/payment/components/PaymentLayout';
import {
  canDisburse,
  disburseSolidarityRequest,
  getCircle,
  getCircleMembers,
  getCurrentUser,
  getSolidarityRequests,
  getSolidarityTotals,
} from '../../store';
import { NotFoundScreen } from './NotFound';

/**
 * Versement d'un secours par le Trésorier (copie de SolidarityDisburseScreen mobile),
 * une fois la demande approuvée par tous les validateurs. Parcours de paiement unique.
 * TODO API : PATCH /solidarity/requests/:id/disburse avec double validation, cash-out
 * CinetPay côté serveur (docs/api-mobile.md §4 et §5).
 */
export function SolidarityDisburseView({ circleId, requestId }: { circleId: string; requestId: string }) {
  useDemoStore();
  const router = useRouter();
  // Une fois payé, la demande passe « décaissée » : on garde l'écran de confirmation affiché.
  const [paid, setPaid] = useState(false);
  const circle = getCircle(circleId);
  if (!circle) return <NotFoundScreen header="Verser le secours" />;

  const request = getSolidarityRequests(circle.id).find((r) => r.id === requestId);
  if (!request) {
    return (
      <NotFoundScreen
        header="Verser le secours"
        title="Demande introuvable"
        text="Cette demande n'existe plus ou a été retirée."
      />
    );
  }

  const totals = getSolidarityTotals(circle.id);
  const beneficiary = getCircleMembers(circle.id).find((m) => m.userId === request.userId);
  const me = getCurrentUser();
  const amount = request.amountRequested;
  const beneficiaryPhone = beneficiary?.user.phoneNumber;
  // Mêmes conditions que le mobile : Trésorier, tous les validateurs d'accord, solde suffisant.
  const check = canDisburse(request.id, me.id);

  return (
    <>
      <PageHeader title="Verser le secours" onBack={() => router.back()} width="page" />
      <ScreenBody width="wide">
        <PaymentColumns
          summary={
            <>
        <div className="rounded-[20px] bg-primary-dark px-5 py-6 text-center text-white">
          <p className="text-[14px] text-white/75">Montant à payer</p>
          <p className="mt-1 text-[30px] font-bold leading-tight">{formatFcfa(amount)}</p>
          <p className="mt-1 text-[14px] text-amber">
            Secours pour {request.requesterName} · {circle.name}
          </p>
        </div>

        <div className="rounded-[20px] border border-line bg-white px-4">
          <div className="flex items-center justify-between gap-3 border-b border-line py-3">
            <span className="text-[14px] text-muted">Bénéficiaire</span>
            <span className="flex min-w-0 items-center gap-2">
              <Avatar name={request.requesterName} uri={beneficiary?.user.avatarUrl} size={32} />
              <span className="truncate text-[15px] font-semibold text-ink">{request.requesterName}</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-line py-3">
            <span className="text-[14px] text-muted">Numéro Mobile Money</span>
            <span className="text-[15px] font-semibold text-ink">{beneficiaryPhone ?? '—'}</span>
          </div>
          <div className="border-b border-line py-3">
            <p className="text-[14px] text-muted">Motif</p>
            <p className="mt-1 text-[15px] text-ink">{request.reason}</p>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-line py-3">
            <span className="text-[14px] text-muted">Solde de la caisse</span>
            <span className="text-[15px] font-semibold text-ink">{formatFcfa(totals.balance)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="text-[14px] font-semibold text-ink">Montant à verser</span>
            <span className="text-[15px] font-bold text-ink">{formatFcfa(amount)}</span>
          </div>
        </div>
        <p className="px-1 text-[13px] text-muted">Ce motif sera visible par tous les membres, avec le montant.</p>
            </>
          }
        >

        {check.ok || paid ? (
        <MobileMoneyCheckout
          title="Choisissez l'opérateur"
          summary={false}
          amount={amount}
          phone={me.phoneNumber}
          confirmDetail={`Versement à ${request.requesterName}${beneficiaryPhone ? ` (${beneficiaryPhone})` : ''} · Caisse de solidarité`}
          successText={`${formatFcfa(amount)} ont été versés à ${request.requesterName}.`}
          onSuccess={() => {
            setPaid(true);
            disburseSolidarityRequest(request.id);
          }}
          done={{ href: `/circles/${circle.id}/solidarity`, label: 'Retour à la caisse' }}
        />
        ) : (
          <p className="rounded-[14px] bg-amber-tint p-3.5 text-[14px] text-ink-soft">{check.reason}</p>
        )}
        </PaymentColumns>
      </ScreenBody>
    </>
  );
}
