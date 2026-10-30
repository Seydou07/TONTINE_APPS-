'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Ban, Check, Clock } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { CenteredState, Notice, ScreenBody, ScreenFooter, SectionTitle } from '@/components/ui/blocks';
import { useDemoStore } from '@/lib/demoStore';
import { getCircle, getCircleMembers, getCurrentUser, getLateCount } from '../../store';

/** Exclusion d'un membre après trop de retards (copie de ExclusionScreen mobile). */
export function ExclusionView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'confirm' | 'done'>('idle');

  const circle = getCircle(circleId);
  const me = getCurrentUser();
  const back = () => router.back();

  if (!circle) {
    return (
      <>
        <PageHeader title="Exclure un membre" onBack={back} />
        <ScreenBody>
          <CenteredState icon={Clock} tone="neutral" title="Cercle introuvable" />
        </ScreenBody>
      </>
    );
  }

  const threshold = circle.exclusionThreshold;
  const members = getCircleMembers(circle.id).filter((m) => m.userId !== me.id);
  const canExclude = (userId: string) => getLateCount(circle.id, userId) >= threshold;
  const anyEligible = members.some((m) => canExclude(m.userId));
  const target = members.find((m) => m.userId === selected);
  const targetName = target ? `${target.user.firstName} ${target.user.lastName}` : '';

  return (
    <>
      <PageHeader title="Exclure un membre" subtitle={circle.name} onBack={back} />
      <ScreenBody>
        <Notice icon={AlertTriangle} tone="warning" title="Règle du cercle">
          Un membre peut être exclu à partir de {threshold} retards.
        </Notice>

        <section className="space-y-2.5">
          <SectionTitle>Membres avec retards</SectionTitle>
          <div role="radiogroup" aria-label="Membres avec retards" className="space-y-2.5">
            {members.map((m) => {
              const lateCount = getLateCount(circle.id, m.userId);
              const eligible = lateCount >= threshold;
              const isSelected = selected === m.userId;
              const name = `${m.user.firstName} ${m.user.lastName}`;
              return (
                <button
                  key={m.userId}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={!eligible}
                  onClick={() => eligible && setSelected(m.userId)}
                  className={`w-full rounded-[20px] border bg-white p-4 text-left ${
                    isSelected ? 'border-danger ring-1 ring-danger' : 'border-line'
                  } ${eligible ? 'hover:bg-fill' : 'cursor-default'}`}
                >
                  <span className="flex items-center gap-3">
                    <Avatar name={name} uri={m.user.avatarUrl} size={40} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-ink">{name}</span>
                      <span className="block text-[13px] text-muted">Fiabilité {m.reliabilityScore}/100</span>
                    </span>
                    {eligible && (
                      <span
                        aria-hidden
                        className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
                          isSelected ? 'border-danger' : 'border-line-strong'
                        }`}
                      >
                        {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-danger" />}
                      </span>
                    )}
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-3">
                    <span className="flex gap-1" aria-hidden>
                      {Array.from({ length: threshold }).map((_, i) => (
                        <span key={i} className={`h-2 w-6 rounded-full ${i < lateCount ? 'bg-danger' : 'bg-fill'}`} />
                      ))}
                    </span>
                    <span className={`text-[13px] font-semibold ${eligible ? 'text-danger' : 'text-amber-dark'}`}>
                      {lateCount}/{threshold} retards
                    </span>
                  </span>
                  {!eligible ? (
                    <span className="mt-2 block text-[13px] text-muted">
                      Encore {threshold - lateCount} retard(s) avant qu&apos;une exclusion soit possible
                    </span>
                  ) : (
                    <span className="mt-3 block rounded-[12px] bg-danger-tint p-3">
                      <span className="block text-[13px] font-semibold text-danger">Conséquences de l&apos;exclusion</span>
                      <span className="mt-1 block text-[13px] text-ink-soft">• Bloqué sur tous les cercles Venega</span>
                      <span className="block text-[13px] text-ink-soft">• Ne peut plus rejoindre de nouveau cercle</span>
                      <span className="block text-[13px] text-ink-soft">• Risque de poursuites judiciaires pour impayés</span>
                      <span className="block text-[13px] text-ink-soft">• Dépôt de garantie non remboursé</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {!anyEligible && (
          <CenteredState
            icon={Clock}
            tone="neutral"
            title="Aucun membre éligible"
            text={`Aucun membre n'a atteint le seuil de ${threshold} retards. Vous ne pouvez exclure personne pour le moment.`}
          />
        )}

        {anyEligible && (
          <ScreenFooter>
            <Button variant="danger" icon={Ban} onClick={() => setStep('confirm')} disabled={!selected}>
              Exclure le membre
            </Button>
          </ScreenFooter>
        )}
      </ScreenBody>

      <Sheet open={step === 'confirm'} onClose={() => setStep('idle')} title="Exclure ce membre ?">
        <p className="text-[15px] text-ink-soft">
          {targetName} sera marqué(e) comme exclu(e). Cette information sera visible par tous les autres cercles de la
          plateforme.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button variant="secondary" onClick={() => setStep('idle')}>
            Annuler
          </Button>
          {/* TODO API: exclusion non décrite dans docs/api-mobile.md (proche de DELETE /circles/:id/members/:userId). */}
          <Button variant="danger" onClick={() => setStep('done')}>
            Exclure
          </Button>
        </div>
      </Sheet>

      <Sheet open={step === 'done'} onClose={back}>
        <CenteredState icon={Check} tone="primary" title="Exclusion confirmée" text="Le membre a été exclu du cercle et bloqué sur la plateforme.">
          <Button onClick={back}>OK</Button>
        </CenteredState>
      </Sheet>
    </>
  );
}
