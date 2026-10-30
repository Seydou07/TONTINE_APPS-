'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calculator, Check, Info, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Chip, ChipGroup } from '@/components/ui/choice';
import { Card, CenteredState, KeyValue, Notice, ScreenBody, ScreenFooter, SectionTitle } from '@/components/ui/blocks';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { getActiveCycle, getCircle, getCircleMembers } from '../../store';

const INCREASE_OPTIONS = ['0', '5', '10', '15', '20'];

/** Recalcul des cotisations après un départ sans remplaçant (copie de RecalculateScreen mobile). */
export function RecalculateView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const [increasePercent, setIncreasePercent] = useState('0');
  const [step, setStep] = useState<'idle' | 'confirm' | 'done'>('idle');
  const back = () => router.back();

  const circle = getCircle(circleId);
  if (!circle) {
    return (
      <>
        <PageHeader title="Recalcul des cotisations" onBack={back} />
        <ScreenBody>
          <CenteredState icon={Info} tone="neutral" title="Cercle introuvable" />
        </ScreenBody>
      </>
    );
  }

  const cycle = getActiveCycle(circle);
  const totalMembers = getCircleMembers(circle.id).length;
  const membersAfterDeparture = Math.max(totalMembers - 1, 1);
  const currentTontine = circle.tontineAmount;
  const currentSolidarity = circle.solidarityAmount;
  const currentTotal = currentTontine + currentSolidarity;
  const remainingTurns = cycle ? cycle.totalTurns - cycle.currentTurn + 1 : 0;
  const increase = parseFloat(increasePercent) || 0;
  const factor = 1 + increase / 100;
  const newTontine = Math.round((currentTontine * totalMembers * factor) / membersAfterDeparture);
  const newSolidarity =
    currentSolidarity > 0 ? Math.round((currentSolidarity * totalMembers * factor) / membersAfterDeparture) : 0;
  const newTotal = newTontine + newSolidarity;
  const diff = newTotal - currentTotal;
  const poolImpact = diff * membersAfterDeparture * remainingTurns;

  return (
    <>
      <PageHeader title="Recalcul des cotisations" subtitle={circle.name} onBack={back} />
      <ScreenBody>
        <Notice icon={Info} tone="info">
          Un membre est parti sans remplaçant. Les cotisations restantes sont recalculées pour {membersAfterDeparture}{' '}
          membres.
        </Notice>

        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1 rounded-[20px] border border-line bg-white p-4">
            <p className="text-[13px] text-muted">Avant</p>
            <p className="mt-1 text-[17px] font-bold text-ink">{formatFcfa(currentTotal)}</p>
            <p className="mt-0.5 text-[12px] text-muted">{totalMembers} membres</p>
          </div>
          <span className="flex items-center text-muted" aria-hidden>
            <ArrowRight size={16} />
          </span>
          <div className="min-w-0 flex-1 rounded-[20px] border border-primary bg-primary-tint p-4">
            <p className="text-[13px] font-semibold text-primary-dark">Après</p>
            <p className="mt-1 text-[17px] font-bold text-primary-dark">{formatFcfa(newTotal)}</p>
            <p className="mt-0.5 text-[12px] text-muted">{membersAfterDeparture} membres</p>
          </div>
        </div>

        <section className="space-y-2.5">
          <SectionTitle>Augmenter les cotisations (facultatif)</SectionTitle>
          <p className="text-[14px] text-muted">
            Une hausse compense le départ du membre et maintient les gains des bénéficiaires.
          </p>
          <ChipGroup label="Hausse des cotisations">
            {INCREASE_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                label={opt === '0' ? 'Aucune' : `+${opt} %`}
                selected={increasePercent === opt}
                onClick={() => setIncreasePercent(opt)}
              />
            ))}
          </ChipGroup>
          {increase > 0 && (
            <Notice icon={TrendingUp} tone="primary">
              Hausse de {increase} % : chaque membre paiera {formatFcfa(diff)} de plus par tour.
            </Notice>
          )}
        </section>

        <section className="space-y-2.5">
          <SectionTitle>Impact sur le cycle</SectionTitle>
          <Card className="px-4">
            <KeyValue label="Tours restants" value={String(remainingTurns)} />
            <KeyValue
              label="Gain bénéficiaire par tour"
              value={formatFcfa(newTontine * membersAfterDeparture)}
              valueClassName="!text-primary"
            />
            <KeyValue
              label="Impact total sur le cycle"
              value={`${increase > 0 ? '+' : ''}${formatFcfa(poolImpact)}`}
              valueClassName={increase > 0 ? '!text-primary' : '!text-danger'}
              last
            />
          </Card>
        </section>

        <ScreenFooter>
          <Button icon={Calculator} onClick={() => setStep('confirm')}>
            Appliquer le recalcul
          </Button>
        </ScreenFooter>
      </ScreenBody>

      <Sheet open={step === 'confirm'} onClose={() => setStep('idle')} title="Confirmer le recalcul">
        <p className="text-[15px] text-ink-soft">
          Les cotisations passeront de {formatFcfa(currentTotal)} à {formatFcfa(newTotal)} par tour pour{' '}
          {membersAfterDeparture} membres restants.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button variant="secondary" onClick={() => setStep('idle')}>
            Annuler
          </Button>
          {/* TODO API: recalcul non décrit dans docs/api-mobile.md (à prévoir avec PATCH /circles/departures/:id). */}
          <Button onClick={() => setStep('done')}>Confirmer</Button>
        </div>
      </Sheet>

      <Sheet open={step === 'done'} onClose={back}>
        <CenteredState icon={Check} tone="primary" title="Recalcul appliqué" text="Les nouvelles cotisations seront appliquées au prochain tour.">
          <Button onClick={back}>OK</Button>
        </CenteredState>
      </Sheet>
    </>
  );
}
