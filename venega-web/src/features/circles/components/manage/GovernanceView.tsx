'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Info, Wallet } from 'lucide-react';
import { Role } from '@venega/types';
import { useDemoStore } from '@/lib/demoStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Notice, ScreenBody, SectionTitle } from '@/components/ui/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { getCircle, getCircleMembers, getSolidarityValidators, setTreasurer, toggleSolidarityValidator } from '../../store';
import { NotFoundScreen } from '../solidarity/NotFound';

/**
 * Bureau du cercle (copie de GovernanceScreen mobile) : nommer le Trésorier et choisir
 * les validateurs de la caisse de solidarité.
 * TODO API : PATCH /circles/:id/members/:userId { role } et validateurs (docs/api-mobile.md §3 et §5).
 */
export function GovernanceView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const [candidate, setCandidate] = useState<{ userId: string; name: string } | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const circle = getCircle(circleId);
  if (!circle) return <NotFoundScreen header="Gouvernance" />;

  const members = getCircleMembers(circleId);
  const treasurer = members.find((m) => m.role === Role.TREASURER);
  const president = members.find((m) => m.role === Role.PRESIDENT);
  const eligibleForTreasurer = members.filter((m) => m.role !== Role.PRESIDENT);
  const validators = getSolidarityValidators(circleId);
  const hasSolidarity = circle.solidarityAmount > 0;

  const rowClass = 'flex w-full items-center gap-3 px-4 py-3 text-left';

  return (
    <>
      <PageHeader title="Gouvernance" subtitle={circle.name} onBack={() => router.back()} />
      <ScreenBody>
        {members.length <= 1 ? (
          <Notice icon={Info} tone="info">
            Ce cercle vient d&apos;être créé et n&apos;a pas encore de membres à désigner. Vous pourrez nommer un Trésorier
            et choisir les validateurs dès que des membres l&apos;auront rejoint.
          </Notice>
        ) : (
          <>
            <section>
              <SectionTitle className="mb-2.5 px-1">Bureau du cercle</SectionTitle>
              <div className="overflow-hidden rounded-[20px] border border-line bg-white">
                {president && (
                  <div className={`${rowClass} ${eligibleForTreasurer.length > 0 ? 'border-b border-line' : ''}`}>
                    <Avatar
                      name={`${president.user.firstName} ${president.user.lastName}`}
                      uri={president.user.avatarUrl}
                      size={40}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {president.user.firstName} {president.user.lastName}
                      </p>
                      <p className="text-[13px] text-muted">Président · Fondateur</p>
                    </div>
                    <Crown size={18} className="text-amber-dark" aria-hidden />
                  </div>
                )}
                {eligibleForTreasurer.map((m, idx) => {
                  const isTreasurer = m.role === Role.TREASURER;
                  const isLast = idx === eligibleForTreasurer.length - 1;
                  const name = `${m.user.firstName} ${m.user.lastName}`;
                  const content = (
                    <>
                      <Avatar name={name} uri={m.user.avatarUrl} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-ink">{name}</span>
                        <span className="block text-[13px] text-muted">{isTreasurer ? 'Trésorier' : 'Membre'}</span>
                      </span>
                      {isTreasurer ? (
                        <Wallet size={18} className="text-primary" aria-hidden />
                      ) : (
                        <span className="shrink-0 text-[14px] font-semibold text-primary">Nommer Trésorier</span>
                      )}
                    </>
                  );
                  const border = isLast ? '' : 'border-b border-line';
                  return isTreasurer ? (
                    <div key={m.userId} className={`${rowClass} ${border}`}>
                      {content}
                    </div>
                  ) : (
                    <button
                      key={m.userId}
                      type="button"
                      onClick={() => setCandidate({ userId: m.userId, name })}
                      className={`${rowClass} ${border} hover:bg-fill`}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
              {!treasurer && <p className="mt-2 px-1 text-[13px] text-muted">Aucun Trésorier nommé pour le moment.</p>}
            </section>

            {hasSolidarity && (
              <section>
                <SectionTitle className="px-1">Validateurs de la caisse de solidarité</SectionTitle>
                <p className="mb-2.5 mt-1 px-1 text-[13px] text-muted">
                  Ces membres doivent tous approuver avant qu&apos;un décaissement de la caisse de solidarité puisse être
                  exécuté.
                </p>
                <div className="overflow-hidden rounded-[20px] border border-line bg-white">
                  {members.map((m, idx) => {
                    const checked = validators.includes(m.userId);
                    const name = `${m.user.firstName} ${m.user.lastName}`;
                    return (
                      <button
                        key={m.userId}
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => {
                          const result = toggleSolidarityValidator(circleId, m.userId);
                          if (!result.success) setBlockedReason(result.reason ?? '');
                        }}
                        className={`${rowClass} hover:bg-fill ${idx < members.length - 1 ? 'border-b border-line' : ''}`}
                      >
                        <Avatar name={name} uri={m.user.avatarUrl} size={40} />
                        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">{name}</span>
                        <span
                          aria-hidden
                          className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border-2 ${
                            checked ? 'border-primary bg-primary' : 'border-line-strong bg-white'
                          }`}
                        >
                          {checked && <Check size={14} strokeWidth={3} className="text-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </ScreenBody>

      <Sheet open={candidate !== null} onClose={() => setCandidate(null)} title="Nommer ce membre Trésorier ?">
        <p className="text-[15px] text-ink-soft">
          {candidate?.name} pourra exécuter les décaissements de la caisse de solidarité une fois approuvés par les
          validateurs.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <Button variant="secondary" onClick={() => setCandidate(null)}>
            Annuler
          </Button>
          <Button
            onClick={() => {
              if (candidate) setTreasurer(circleId, candidate.userId);
              setCandidate(null);
            }}
          >
            Nommer
          </Button>
        </div>
      </Sheet>

      <Sheet open={blockedReason !== null} onClose={() => setBlockedReason(null)} title="Impossible pour le moment">
        <p className="text-[15px] text-ink-soft">{blockedReason}</p>
        <Button variant="secondary" onClick={() => setBlockedReason(null)} className="mt-6">
          Fermer
        </Button>
      </Sheet>
    </>
  );
}
