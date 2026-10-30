'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Check, HandCoins, LogOut, ShieldAlert } from 'lucide-react';
import type { DepartureRequest } from '@venega/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CenteredState, CheckRow, KeyValue, Notice, ScreenBody, ScreenFooter, SectionTitle } from '@/components/ui/blocks';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import {
  computeDepartureBreakdown,
  computeRecalculatedContribution,
  getActiveCycle,
  getCircle,
  getCircleMembers,
  getCurrentUser,
  requestDeparture,
} from '../../store';

/** Demande de départ d'un membre (copie de DepartureScreen mobile). */
export function DepartureView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<DepartureRequest | null>(null);

  const circle = getCircle(circleId);
  const me = getCurrentUser();
  const membership = circle ? getCircleMembers(circle.id).find((m) => m.userId === me.id) : undefined;
  const back = () => router.back();

  if (!circle || !membership) {
    return (
      <>
        <PageHeader title="Quitter le cercle" onBack={back} />
        <ScreenBody>
          <CenteredState icon={ShieldAlert} tone="neutral" title="Cercle introuvable" text="Vous n’êtes pas membre de ce cercle." />
        </ScreenBody>
      </>
    );
  }

  const cycle = getActiveCycle(circle);
  const breakdown = computeDepartureBreakdown(circle, cycle, membership);
  const recalculated = computeRecalculatedContribution(circle);

  /** Déjà reçu la cagnotte → départ bloqué (anti-fuite). */
  if (membership.hasReceivedPayout) {
    return (
      <>
        <PageHeader title="Quitter le cercle" subtitle={circle.name} onBack={back} />
        <ScreenBody>
          <CenteredState
            icon={ShieldAlert}
            tone="danger"
            title="Départ impossible"
            text="Vous avez déjà reçu la cagnotte de ce cercle. Un membre qui a touché son gain ne peut pas quitter le cercle avant la fin du cycle : cette règle protège les autres membres."
          />
          <ScreenFooter>
            <Button variant="secondary" onClick={back}>
              Retour
            </Button>
          </ScreenFooter>
        </ScreenBody>
      </>
    );
  }

  /** Demande déjà envoyée → écran de statut. */
  if (request) {
    return (
      <>
        <PageHeader title="Demande envoyée" subtitle={circle.name} onBack={back} />
        <ScreenBody>
          <CenteredState
            icon={Check}
            tone="primary"
            title="Demande de départ transmise"
            text="Le fondateur doit approuver votre départ. Aucun nouveau membre ne sera ajouté : les cagnottes seront recalculées automatiquement."
          />
          <div className="rounded-[20px] bg-primary-dark p-5 text-center text-white">
            <p className="text-[13px] text-white/75">À récupérer, main à main</p>
            <p className="mt-1 text-[28px] font-bold">{formatFcfa(request.totalRecover)}</p>
            <p className="mt-1 text-[13px] text-amber">
              {request.reimbursements.length} tour(s) cotisé(s) sans cagnotte reçue
            </p>
          </div>
          <p className="text-center text-[14px] text-muted">
            Vous avez cotisé {request.pastTurns} tour(s). Ceux qui ont bénéficié de votre cotisation vous rembourseront
            directement.
          </p>
          <ScreenFooter>
            <Button onClick={back}>Retour au cercle</Button>
          </ScreenFooter>
        </ScreenBody>
      </>
    );
  }

  const handleSubmit = () => {
    setSubmitting(true);
    // TODO API: POST /circles/:id/departures (docs/api-mobile.md, section 3).
    setTimeout(() => {
      setRequest(requestDeparture(circle.id, me.id, me.displayName));
      setSubmitting(false);
    }, 900);
  };

  return (
    <>
      <PageHeader title="Quitter le cercle" subtitle={circle.name} onBack={back} />
      <ScreenBody>
        <Card className="p-4">
          <div className="mb-1 flex items-center gap-2.5">
            <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-danger-tint text-danger">
              <HandCoins size={18} strokeWidth={1.8} />
            </span>
            <p className="text-[15px] font-semibold text-ink">Sans remboursement, vous perdez</p>
          </div>
          <KeyValue
            label={`Cotisations versées (${breakdown.pastTurns} tour(s))`}
            value={formatFcfa(breakdown.totalRecover)}
            valueClassName="!text-danger"
            last
          />
        </Card>

        <section className="space-y-2.5">
          <SectionTitle>Remboursement par les bénéficiaires</SectionTitle>
          <Card className="p-4">
            <p className="text-[14px] text-muted">
              Vous avez cotisé sans recevoir de cagnotte. Chaque bénéficiaire de vos tours vous remet une cotisation, main
              à main.
            </p>
            {breakdown.reimbursements.length > 0 ? (
              <ul className="mt-3">
                {breakdown.reimbursements.map((r) => (
                  <ReimbursementRow key={r.turnNumber} turn={r.turnNumber} name={r.beneficiaryName} amount={r.amount} />
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[14px] text-muted">Aucun tour passé à rembourser : vous n&apos;avez pas encore cotisé.</p>
            )}
            <KeyValue label="Total à récupérer" value={formatFcfa(breakdown.totalRecover)} strong last />
            <p className="mt-1 text-[12px] text-muted">
              Le remboursement se fait directement avec chaque bénéficiaire, sans passer par l&apos;application.
            </p>
          </Card>
        </section>

        <Notice icon={Calculator} tone="info" title="Cagnottes recalculées, sans remplaçant">
          À votre départ, le cercle continue sans nouveau membre. Pour que le pot reste entier, la cotisation passe de{' '}
          {formatFcfa(circle.tontineAmount)} à {formatFcfa(recalculated)} par membre restant.
        </Notice>

        <CheckRow
          checked={confirmed}
          onChange={setConfirmed}
          label={`Je comprends : je quitte le cercle, les autres membres me remboursent mes ${breakdown.pastTurns} tour(s) cotisé(s) et les cagnottes seront recalculées.`}
        />

        <ScreenFooter>
          <Button variant="danger" icon={LogOut} onClick={handleSubmit} loading={submitting} disabled={!confirmed}>
            Demander à quitter le cercle
          </Button>
        </ScreenFooter>
      </ScreenBody>
    </>
  );
}

/** Ligne « Tour N · bénéficiaire · montant » de la ventilation du remboursement. */
export function ReimbursementRow({ turn, name, amount }: { turn: number; name: string; amount: number }) {
  return (
    <li className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
      <span className="shrink-0 rounded-full bg-fill px-2 py-0.5 text-[12px] font-semibold text-ink-soft">Tour {turn}</span>
      <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{name}</span>
      <span className="shrink-0 text-[15px] font-semibold text-ink">{formatFcfa(amount)}</span>
    </li>
  );
}
