'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartHandshake, ShieldCheck } from 'lucide-react';
import { mockAidAppeal } from '@venega/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Sheet } from '@/components/ui/Sheet';
import { ScreenBody, ScreenFooter } from '@/components/ui/blocks';
import { useDemoStore } from '@/lib/demoStore';
import { getAidAppeal, getAidShareLink, getCircle } from '@/features/circles/store';
import { getProfile } from '@/features/profile/store';
import { toPublicAppealData } from '../api';
import type { PublicContribution } from '../types';
import { AppealProgress } from './AppealProgress';
import { ContributeFlow, type ContributionDone } from './ContributeFlow';
import { ContributionList } from './ContributionList';
import { AcceptedPayments } from './OperatorMark';
import { ShareButton } from './ShareButton';

/**
 * Cagnotte d'aide dans l'espace connecté (écran mobile app/aid/[id].tsx) :
 * couverture, collecte, histoire, contributeurs, et contribution sans compte
 * par le parcours de paiement unique.
 * TODO API : `GET /appeals/my` / `GET /public/appeals/:code` (docs/api-mobile.md, section 7).
 */
export function AidAppealView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const circle = getCircle(circleId);
  const appeal = getAidAppeal(circleId) ?? mockAidAppeal;

  // Mêmes données que la page publique (dates de démo recalées, liste des contributions).
  // Cercle inconnu : comme le mobile, on affiche la cagnotte de démonstration.
  const sourceCircle = circle ?? getCircle(mockAidAppeal.circleId);
  const base = useMemo(
    () => (sourceCircle ? toPublicAppealData(sourceCircle, appeal, getProfile().name) : null),
    // Recalcul seulement si la cagnotte change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [circleId, appeal.id],
  );

  const [now] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<PublicContribution[]>([]);
  const [lastId, setLastId] = useState<string>();

  // Impossible avec les données de démonstration (le cercle c5 existe toujours).
  if (!base) return null;

  const isActive = appeal.status === 'ACTIVE';
  const collected = base.appeal.collectedAmount + local.reduce((s, c) => s + c.amount, 0);
  const totalContributors = base.appeal.contributorCount + local.length;
  const contributions = [...local, ...base.contributions];
  const title = circle?.name ?? 'Cagnotte d’aide';

  const onContributed = (c: ContributionDone) => {
    const id = `local-${Date.now()}`;
    setLocal((list) => [{ id, displayName: c.displayName, amount: c.amount, createdAt: new Date().toISOString() }, ...list]);
    setLastId(id);
  };

  const shareUrl = circle ? getAidShareLink(circle) : '';

  return (
    <>
      <PageHeader
        title={title}
        onBack={() => router.back()}
        right={
          circle ? (
            <ShareButton
              iconOnly
              url={shareUrl}
              title={circle.name}
              text={`${circle.name}\nAidez en contribuant à cette cagnotte, avec votre nom ou anonymement :`}
            />
          ) : undefined
        }
      />
      <ScreenBody>
        <div className="h-[220px] overflow-hidden rounded-[20px] bg-primary-tint">
          {appeal.beneficiaryPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={appeal.beneficiaryPhoto}
              alt={`Photo de ${appeal.beneficiaryName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary">
              <HeartHandshake size={64} strokeWidth={1.5} aria-hidden />
            </div>
          )}
        </div>

        <header>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
              isActive ? 'bg-primary-tint text-primary-dark' : 'bg-fill text-muted'
            }`}
          >
            <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'}`} />
            {isActive ? 'En cours' : 'Terminée'}
          </span>
          <h2 className="mt-2.5 break-words text-[22px] font-bold leading-tight text-ink">{title}</h2>
          <p className="mt-3 flex items-center gap-2.5 text-[15px] text-muted">
            <Avatar name={appeal.beneficiaryName} uri={appeal.beneficiaryPhoto} size={32} />
            <span>
              Pour <span className="font-semibold text-ink">{appeal.beneficiaryName}</span>
            </span>
          </p>
        </header>

        <AppealProgress
          collected={collected}
          goal={base.appeal.goalAmount}
          contributorCount={totalContributors}
          deadline={base.appeal.deadline}
          now={now}
        />

        <AcceptedPayments />

        <hr className="border-line" />

        <section>
          <h2 className="mb-2 text-[17px] font-bold text-ink">L’histoire</h2>
          <p className="whitespace-pre-line break-words text-[15px] leading-relaxed text-ink-soft">{appeal.reason}</p>
          <div className="mt-4 flex items-start gap-2.5 rounded-[14px] bg-primary-tint p-3.5">
            <ShieldCheck size={18} className="mt-px shrink-0 text-primary" aria-hidden />
            <p className="text-[13px] text-primary-dark">
              Les fonds sont conservés sur le compte sécurisé Venega et reversés à {appeal.beneficiaryName} uniquement
              après validation des approbateurs du cercle.
            </p>
          </div>
        </section>

        <hr className="border-line" />

        <ContributionList contributions={contributions} totalCount={totalContributors} highlightId={lastId} />

        <ScreenFooter>
          <Button icon={HeartHandshake} disabled={!isActive} onClick={() => setOpen(true)}>
            Contribuer
          </Button>
        </ScreenFooter>
      </ScreenBody>

      <Sheet open={open} onClose={() => setOpen(false)} title="Contribuer">
        <ContributeFlow
          beneficiaryName={appeal.beneficiaryName}
          minContribution={circle?.rules.minContribution ?? 0}
          onContributed={onContributed}
          onClose={() => setOpen(false)}
        />
      </Sheet>
    </>
  );
}
