'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Bell, Check, CheckCircle2, History } from 'lucide-react';
import { CircleType, ContributionMode, mockPayoutRecords, type PayoutRecord } from '@venega/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody } from '@/components/ui/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa as formatXOF } from '@/lib/format';
import { MobileMoneyCheckout } from '@/features/payment/components/MobileMoneyCheckout';
import {
  PaymentAmountCard,
  PaymentHint,
  PaymentSummaryCard,
  PaymentSummaryRow as SummaryRow,
} from '@/features/payment/components/PaymentLayout';
import { getActiveCycle, getCircle, getCircleMembers, getCurrentUser, getCycles } from '../store';

/*
 * Versement de la cagnotte (ou remise du bien) par le fondateur — copie de
 * PayoutInitScreen.tsx mobile.
 * TODO API : `POST /transactions/payout` (cash-out CinetPay côté serveur, exiger que
 * toutes les cotisations du tour soient payées) — docs/api-mobile.md, section 4.
 */

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' à ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
};

export function PayoutView({ circleId }: { circleId: string }) {
  useDemoStore();
  const circle = getCircle(circleId);
  const me = getCurrentUser();
  const historyRef = useRef<HTMLElement>(null);

  const [history, setHistory] = useState<PayoutRecord[]>(() =>
    mockPayoutRecords
      .filter((p) => p.circleId === circleId && p.status === 'PAID')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
  const [showNotification, setShowNotification] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  // Chaque passage par le parcours de paiement repart de zéro (clé du composant).
  const [checkoutKey, setCheckoutKey] = useState(0);

  if (!circle) {
    return (
      <>
        <PageHeader title="Verser la cagnotte" backHref="/circles" />
        <p className="mx-auto max-w-2xl px-4 py-8 text-[15px] text-muted">Ce cercle n’existe pas ou plus.</p>
      </>
    );
  }

  const isNature = circle.contributionMode === ContributionMode.NATURE || circle.type === CircleType.NATURE;
  const cycle = getActiveCycle(circle) ?? getCycles(circle.id)[0];
  const orderedMembers = [...getCircleMembers(circle.id)].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const notReceived = orderedMembers.filter((m) => !m.hasReceivedPayout);
  const beneficiary = notReceived[0] ?? orderedMembers[0];

  // Modèle financier (défini à la création du cercle) — mêmes règles que l'app mobile.
  const baseTontineAmount = circle.tontineAmount || 10000;
  const founderManagementFeePerTurn = circle.managementFee || 500;
  const memberCount = orderedMembers.length;
  const totalGrossCollected = (baseTontineAmount + founderManagementFeePerTurn) * memberCount;
  const beneficiaryPotAmount = baseTontineAmount * memberCount;
  const totalFounderFeesCollected = founderManagementFeePerTurn * memberCount;
  const venegaCommission = Math.round(totalFounderFeesCollected * 0.1);
  const netFounderFees = totalFounderFeesCollected - venegaCommission;

  const beneficiaryName = `${beneficiary?.user?.firstName ?? ''} ${beneficiary?.user?.lastName ?? ''}`.trim();
  const turn = cycle?.currentTurn ?? 1;
  const title = isNature ? 'Remettre le bien' : 'Verser la cagnotte';

  const handlePaid = () => {
    setRefNumber(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
    const newRecord: PayoutRecord = {
      id: `p${Date.now()}`,
      circleId: circle.id,
      cycleId: cycle?.id ?? 'cy1',
      beneficiaryName,
      beneficiaryAvatar: beneficiary?.user?.avatarUrl,
      totalAmount: totalGrossCollected,
      beneficiaryAmount: beneficiaryPotAmount,
      founderFees: netFounderFees,
      venegaCommission,
      operator: 'Mobile Money',
      status: 'PAID',
      createdAt: new Date().toISOString(),
    };
    setHistory((h) => [newRecord, ...h]);
    setShowNotification(true);
  };

  const handleViewHistory = () => {
    setShowNotification(false);
    setCheckoutKey((k) => k + 1);
    setTimeout(() => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  };

  return (
    <>
      <PageHeader title={title} subtitle={circle.name} backHref={`/circles/${circle.id}/tontine`} />
      <ScreenBody>
        <PaymentAmountCard amount={beneficiaryPotAmount} sub={`Cagnotte du tour ${turn} · ${circle.name}`} />

        <PaymentSummaryCard>
          <SummaryRow
            label="Bénéficiaire"
            value={beneficiaryName || '—'}
            leading={<Avatar name={beneficiaryName || '?'} uri={beneficiary?.user?.avatarUrl} size={32} />}
          />
          <SummaryRow label="Numéro Mobile Money" value={beneficiary?.user?.phoneNumber ?? '—'} />
          <SummaryRow label="Tour" value={`Tour ${turn}`} />
          <SummaryRow label="Total collecté" value={formatXOF(totalGrossCollected)} />
          <SummaryRow label="Frais fondateur" value={formatXOF(netFounderFees)} />
          <SummaryRow label="Commission Venega" value={formatXOF(venegaCommission)} />
          <SummaryRow label="Somme à verser" value={formatXOF(beneficiaryPotAmount)} strong last />
        </PaymentSummaryCard>
        <PaymentHint>Le versement passe par le compte hub Venega (CityNet Pay).</PaymentHint>

        <MobileMoneyCheckout
          key={checkoutKey}
          title="Choisissez l'opérateur"
          amount={beneficiaryPotAmount}
          phone={me.phoneNumber}
          confirmDetail={`Versement à ${beneficiaryName || 'bénéficiaire'} · Compte hub Venega`}
          successText={`Vous avez versé ${formatXOF(beneficiaryPotAmount)} à ${beneficiaryName}.`}
          onSuccess={handlePaid}
        />

        <section ref={historyRef} className="scroll-mt-4">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">Historique des versements</h2>
          {history.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fill text-subtle">
                <History size={24} aria-hidden />
              </span>
              <p className="mt-3 text-[15px] font-semibold text-ink">Aucun versement</p>
              <p className="mt-1 text-[14px] text-muted">Les versements payés apparaîtront ici.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[20px] border border-line bg-white">
              {history.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3 ${idx < history.length - 1 ? 'border-b border-line' : ''}`}
                >
                  <Avatar name={p.beneficiaryName} uri={p.beneficiaryAvatar} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-ink">{p.beneficiaryName}</p>
                    <p className="text-[13px] text-muted">
                      {formatDate(p.createdAt)} · {p.operator}
                    </p>
                    <p className="text-[12px] text-subtle">Réf. TX-{p.id.toUpperCase().slice(1)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-bold text-ink">−{formatXOF(p.beneficiaryAmount)}</p>
                    <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-tint px-2 py-0.5 text-[12px] font-semibold text-primary">
                      <CheckCircle2 size={12} aria-hidden />
                      Payé
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </ScreenBody>

      {/* Notification Venega : versement effectué */}
      <Sheet open={showNotification} onClose={() => setShowNotification(false)}>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-tint text-amber-dark">
            <Bell size={24} aria-hidden />
          </span>
          <p className="mt-3 text-[12px] font-semibold text-amber-dark">Notification Venega</p>
          <h2 className="mt-1 text-[17px] font-bold text-ink">Versement effectué</h2>
        </div>
        <div className="mt-4 space-y-2 rounded-[14px] bg-primary-tint p-3.5">
          <CheckLine>
            Vous avez versé {formatXOF(beneficiaryPotAmount)} à {beneficiaryName}.
          </CheckLine>
          <CheckLine>Vous avez reçu {formatXOF(netFounderFees)} (frais fondateur) sur votre compte.</CheckLine>
        </div>
        <div className="mt-4">
          <PaymentSummaryCard>
            <SummaryRow label="Bénéficiaire" value={beneficiaryName} />
            <SummaryRow label="Somme versée" value={formatXOF(beneficiaryPotAmount)} strong />
            <SummaryRow label="Reçu (fondateur)" value={formatXOF(netFounderFees)} />
            <SummaryRow label="Commission Venega" value={formatXOF(venegaCommission)} />
            <SummaryRow label="Référence" value={refNumber} />
            <SummaryRow label="Date" value={formatDate(new Date().toISOString())} last />
          </PaymentSummaryCard>
        </div>
        <div className="mt-5 space-y-2.5">
          <Button icon={History} onClick={handleViewHistory}>
            Voir l&apos;historique complet
          </Button>
          <Button variant="secondary" onClick={() => setShowNotification(false)}>
            Fermer
          </Button>
        </div>
      </Sheet>
    </>
  );
}

/** Ligne de confirmation précédée d'une coche. */
function CheckLine({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 text-[14px] text-primary-dark">
      <span aria-hidden className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <Check size={12} strokeWidth={3} />
      </span>
      <span>{children}</span>
    </p>
  );
}
