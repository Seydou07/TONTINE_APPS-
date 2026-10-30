'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BellRing,
  Calculator,
  Check,
  CheckCircle2,
  Coins,
  LogOut,
  Send,
  Settings2,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserMinus,
  UserX,
  Users,
  Wallet,
} from 'lucide-react';
import {
  CircleType,
  DepartureRequestStatus,
  MembershipRequestStatus,
  PaymentStatus,
  RefundRule,
  ReplacementRule,
  UnlockRule,
} from '@venega/types';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { CenteredState, ScreenBody } from '@/components/ui/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import {
  getActiveCycle,
  getCircle,
  getCircleMembers,
  getCycles,
  getDepartureRequests,
  getMembershipRequests,
} from '../../store';
import { NotFoundScreen } from '../solidarity/NotFound';

/**
 * Gestion du cercle par le fondateur (copie de ManageScreen mobile) : versement du tour,
 * relances, demandes d'adhésion et de départ, remplacement, exclusion, gouvernance,
 * recalcul, modification et paramètres de gestion.
 */
export function ManageView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();

  const [showRemindModal, setShowRemindModal] = useState(false);
  const [selectedLate, setSelectedLate] = useState<Record<string, boolean>>({});
  const [remindSending, setRemindSending] = useState(false);
  const [remindSent, setRemindSent] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const circle = getCircle(circleId);
  if (!circle) return <NotFoundScreen header="Gérer le cercle" />;

  const cycle = getActiveCycle(circle) ?? getCycles(circle.id)[0];
  const orderedMembers = [...getCircleMembers(circle.id)].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const notReceived = orderedMembers.filter((m) => !m.hasReceivedPayout);
  const beneficiary = notReceived[0] ?? orderedMembers[0];

  const pendingRequests = getMembershipRequests(circle.id).filter((r) => r.status === MembershipRequestStatus.PENDING);
  const pendingDepartures = getDepartureRequests(circle.id).filter((r) => r.status === DepartureRequestStatus.PENDING);

  const paidCount = orderedMembers.filter((m) => m.paymentStatus === PaymentStatus.PAID).length;
  const unpaidCount = Math.max(orderedMembers.length - paidCount, 0);
  const lateMembers = orderedMembers.filter((m) => m.paymentStatus !== PaymentStatus.PAID);
  // Démo : nombre de jours de retard estimé comme sur le mobile, en attendant la date d'échéance de l'API.
  const delayDaysOf = (m: (typeof orderedMembers)[number], idx: number) =>
    m.paymentStatus === PaymentStatus.LATE ? 5 + idx : 2 + idx;

  const rules = circle.rules;
  const refundLabel =
    rules?.refundRule === RefundRule.IMMEDIATE
      ? 'Remboursement immédiat'
      : rules?.refundRule === RefundRule.AT_CYCLE_END
        ? 'Attente de la fin du cycle'
        : '—';
  const replacementLabel =
    rules?.replacementRule === ReplacementRule.PAY_PAST_TURNS
      ? 'Le nouveau paie les tours passés'
      : rules?.replacementRule === ReplacementRule.REDUCED_POT
        ? 'Prise réduite des tours manqués'
        : rules?.replacementRule === ReplacementRule.NONE
          ? 'Réajustement sans remplacement'
          : '—';
  const unlockLabel =
    rules?.unlockRule === UnlockRule.ALL_APPROVERS
      ? 'Tous les approbateurs doivent valider'
      : rules?.unlockRule === UnlockRule.MAJORITY
        ? 'Majorité des approbateurs'
        : '—';

  const isAidAppeal = circle.type === CircleType.AID_APPEAL;
  const isNature = circle.type === CircleType.NATURE;
  const turn = cycle?.currentTurn ?? 1;

  const openRemind = () => {
    const init: Record<string, boolean> = {};
    lateMembers.forEach((m) => {
      init[m.userId] = true;
    });
    setSelectedLate(init);
    setRemindSending(false);
    setRemindSent(false);
    setShowRemindModal(true);
  };

  const selectedRemindCount = lateMembers.filter((m) => selectedLate[m.userId]).length;

  // TODO API: envoi des rappels (notifications push) — endpoint à définir, voir docs/api-mobile.md §8.
  const handleSendReminders = () => {
    if (selectedRemindCount === 0) return;
    setRemindSending(true);
    timer.current = setTimeout(() => {
      setRemindSending(false);
      setRemindSent(true);
    }, 1500);
  };

  const pendingLabel = (n: number) => (n > 0 ? `${n} en attente` : undefined);
  const go = (path: string) => `/circles/${circle.id}/${path}`;

  const ruleRows: { label: string; value: string }[] = [
    { label: 'Remboursement au départ', value: refundLabel },
    { label: "Remplacement d'un membre", value: replacementLabel },
    { label: 'Déblocage caisse solidarité', value: unlockLabel },
    { label: 'Approbateurs requis', value: `${rules?.approversRequired ?? 0} approbateur(s)` },
    { label: 'Réserve de sécurité', value: `${rules?.reservePercent ?? 0} %` },
  ];
  if (isAidAppeal) {
    ruleRows.push({
      label: 'Contributions publiques',
      value: rules?.allowPublicContributions ? 'Ouvert sans adhésion' : 'Membres uniquement',
    });
    if (rules?.minContribution) ruleRows.push({ label: 'Montant minimum', value: formatFcfa(rules.minContribution) });
  }

  return (
    <>
      <PageHeader title="Gérer le cercle" onBack={() => router.back()} />
      <ScreenBody>
        <div className="flex items-center gap-3 rounded-[20px] border border-line bg-white p-4">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[17px] font-bold text-ink">{circle.name}</p>
            <p className="mt-0.5 text-[13px] text-muted">
              {isAidAppeal
                ? `Objectif ${formatFcfa(circle.rules?.goalAmount ?? 0)}`
                : isNature
                  ? `Objectif : ${circle.rules?.goalItem ?? '—'}`
                  : `Cotisation ${formatFcfa(circle.tontineAmount || circle.solidarityAmount)}`}
              {' · '}
              {orderedMembers.length} membre(s)
            </p>
          </div>
          {beneficiary?.user && (
            <Avatar
              name={`${beneficiary.user.firstName} ${beneficiary.user.lastName}`}
              uri={beneficiary.user.avatarUrl}
              size={40}
              highlighted
            />
          )}
        </div>

        <ListGroup title="Tour et versements">
          <ListRow
            icon={Wallet}
            tone="primary"
            title={isNature ? 'Remettre le bien' : 'Verser la cagnotte'}
            subtitle={`Bénéficiaire : ${beneficiary?.user?.firstName ?? '—'} ${beneficiary?.user?.lastName ?? ''} (tour ${turn})`}
            href={go('payout')}
          />
          <ListRow
            icon={BellRing}
            tone="primary"
            title="Relancer les cotisations"
            subtitle={unpaidCount > 0 ? `${unpaidCount} membre(s) n'ont pas encore cotisé` : 'Tous les membres ont cotisé'}
            onClick={openRemind}
            last
          />
        </ListGroup>

        <ListGroup title="Membres">
          <ListRow
            icon={UserCheck}
            title="Demandes d'adhésion"
            subtitle="Approuver ou refuser les entrées"
            value={pendingLabel(pendingRequests.length)}
            valueTone="success"
            href={go('requests')}
          />
          <ListRow
            icon={UserMinus}
            title="Demandes de départ"
            subtitle="Approuver un départ, recalculer les cagnottes"
            value={pendingLabel(pendingDepartures.length)}
            valueTone="success"
            href={go('departure-requests')}
          />
          <ListRow icon={Users} title="Remplacer un membre" subtitle="Rachat des tours passés ou prise réduite" href={go('replacement')} />
          <ListRow icon={UserX} title="Exclure un membre" subtitle="Retirer un membre du cercle" href={go('exclusion')} last />
        </ListGroup>

        <ListGroup title="Bureau et gouvernance">
          <ListRow
            icon={UserCog}
            title="Trésorier et validateurs"
            subtitle="Nommer le trésorier, désigner qui approuve un décaissement"
            href={go('governance')}
            last
          />
        </ListGroup>

        <ListGroup title="Calculs">
          <ListRow
            icon={Calculator}
            title="Recalcul des cotisations"
            subtitle="Réajuster les montants après un départ"
            href={go('recalculate')}
            last
          />
        </ListGroup>

        {circle.solidarityAmount > 0 && (
          <ListGroup title="Solidarité">
            <ListRow
              icon={Coins}
              title="Caisse de solidarité"
              subtitle="Contributions par membre, traces et justificatifs"
              href={go('solidarity')}
              last
            />
          </ListGroup>
        )}

        <ListGroup title="Règles du cercle">
          <ListRow
            icon={Settings2}
            title="Modifier le cercle"
            subtitle="Nom, conditions, règles de remplacement, adhésion"
            href={go('edit')}
            last
          />
        </ListGroup>

        <section className="rounded-[20px] border border-line bg-white px-4 pb-1 pt-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <ShieldCheck size={18} className="text-primary" aria-hidden />
            Paramètres de gestion
          </h2>
          <dl className="mt-2">
            {ruleRows.map((r, i) => (
              <div
                key={r.label}
                className={`flex items-start justify-between gap-4 py-3 ${i < ruleRows.length - 1 ? 'border-b border-line' : ''}`}
              >
                <dt className="text-[14px] text-muted">{r.label}</dt>
                <dd className="text-right text-[14px] font-semibold text-ink">{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <ListGroup>
          <ListRow
            icon={LogOut}
            tone="danger"
            title="Quitter ce cercle"
            subtitle="Règles de départ et remboursement"
            href={go('departure')}
            last
          />
        </ListGroup>
      </ScreenBody>

      <Sheet open={showRemindModal} onClose={() => setShowRemindModal(false)} title="Relancer les cotisations">
        {lateMembers.length === 0 ? (
          <>
            <CenteredState
              icon={UserCheck}
              title="Aucun membre en retard"
              text={`Tous les membres ont cotisé pour le tour ${turn}.`}
            />
            <Button variant="secondary" onClick={() => setShowRemindModal(false)}>
              Fermer
            </Button>
          </>
        ) : (
          <>
            <p className="text-[14px] text-muted">
              {lateMembers.length} membre(s) en retard pour le tour {turn}. Décochez ceux que vous ne voulez pas relancer.
            </p>
            <div className="mb-4 mt-3 max-h-[320px] overflow-y-auto">
              {lateMembers.map((m, idx) => {
                const isChecked = !!selectedLate[m.userId];
                const last = idx === lateMembers.length - 1;
                const name = `${m.user?.firstName ?? ''} ${m.user?.lastName ?? ''}`;
                return (
                  <button
                    key={m.userId}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => setSelectedLate((prev) => ({ ...prev, [m.userId]: !prev[m.userId] }))}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <Avatar name={name} uri={m.user?.avatarUrl} size={40} />
                    <span className={`flex min-w-0 flex-1 items-center gap-3 py-3 ${last ? '' : 'border-b border-line'}`}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-ink">{name}</span>
                        <span className="block text-[13px] text-muted">
                          {delayDaysOf(m, idx)} jour(s) de retard · {m.user?.phoneNumber}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border-2 ${
                          isChecked ? 'border-primary bg-primary' : 'border-line-strong bg-white'
                        }`}
                      >
                        {isChecked && <Check size={14} strokeWidth={3} className="text-white" />}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {!remindSent ? (
              <Button icon={Send} loading={remindSending} disabled={selectedRemindCount === 0} onClick={handleSendReminders}>
                {remindSending ? 'Envoi des rappels…' : `Envoyer (${selectedRemindCount})`}
              </Button>
            ) : (
              <div className="space-y-3">
                <p role="status" className="flex items-start gap-2 rounded-[14px] bg-primary-tint p-3 text-[14px] text-primary-dark">
                  <CheckCircle2 size={18} className="mt-px shrink-0 text-primary" aria-hidden />
                  Rappel envoyé à {selectedRemindCount} membre(s). Les notifications sont parties.
                </p>
                <Button variant="secondary" onClick={() => setShowRemindModal(false)}>
                  Fermer
                </Button>
              </div>
            )}
          </>
        )}
      </Sheet>
    </>
  );
}
