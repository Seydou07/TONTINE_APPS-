'use client';

import { useEffect, useRef, useState } from 'react';
import type { PublicAppeal, PublicContribution } from '../types';
import { daysLeft, formatNumber, formatXof, progressPercent } from '../format';
import { btnPrimary, card, sectionTitle } from '../ui';
import { ContributionForm } from './ContributionForm';
import { ContributionList } from './ContributionList';
import { AcceptedPayments } from './OperatorMark';
import { ShareButton } from './ShareButton';

interface AppealClientProps {
  appeal: PublicAppeal;
  initialContributions: PublicContribution[];
  /** Horodatage du rendu serveur : évite un écart d'hydratation sur les dates relatives */
  renderedAt: number;
  shareUrl: string;
}

/**
 * Partie interactive de la page publique : progression (mise à jour après
 * une contribution), formulaire, liste des contributions et CTA collant.
 */
export function AppealClient({ appeal, initialContributions, renderedAt, shareUrl }: AppealClientProps) {
  const [now, setNow] = useState(renderedAt);
  const [contributions, setContributions] = useState(initialContributions);
  const [collected, setCollected] = useState(appeal.collectedAmount);
  const [count, setCount] = useState(appeal.contributorCount);
  const [lastId, setLastId] = useState<string>();
  const [formInView, setFormInView] = useState(false);
  const formAnchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Masque le bouton collant quand le formulaire est déjà à l'écran.
  useEffect(() => {
    const el = formAnchor.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([entry]) => setFormInView(!!entry?.isIntersecting), {
      threshold: 0.05,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const remaining = daysLeft(appeal.deadline, now);
  const ended = appeal.status !== 'ACTIVE' || (appeal.deadline !== undefined && remaining === null);
  const percent = progressPercent(collected, appeal.goalAmount);
  const toCollect = Math.max(appeal.goalAmount - collected, 0);

  const share = {
    url: shareUrl,
    title: appeal.title,
    text: `Aidons ${appeal.beneficiaryName} : ${formatXof(collected)} collectés sur ${formatXof(
      appeal.goalAmount,
    )}. Contribuez par Mobile Money :`,
  };

  function scrollToForm() {
    document.getElementById('contribuer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleContributed(c: PublicContribution) {
    setContributions((list) => [c, ...list]);
    setCollected((v) => v + c.amount);
    setCount((v) => v + 1);
    setLastId(c.id);
  }

  return (
    <>
      {/* Collecte : le bloc le plus visible de la page */}
      <section aria-label="Progression de la collecte" className={`${card} p-5`}>
        <p className="text-[30px] font-bold leading-[1.15] text-[#12261E]">{formatXof(collected)}</p>
        <p className="mt-1 text-[15px] text-[#5B6B65]">collectés sur {formatXof(appeal.goalAmount)}</p>

        <div className="mt-4 flex items-center gap-3">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label={`${percent} % de l'objectif atteint`}
            className="h-2 flex-1 overflow-hidden rounded-full bg-[#F4F5F7]"
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-[14px] font-bold text-primary">{percent} %</span>
        </div>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-[#E5E7EB] border-t border-[#E5E7EB] pt-4 text-center">
          <div className="px-1">
            <dt className="sr-only">Contributeurs</dt>
            <dd className="text-[17px] font-semibold text-[#12261E]">{formatNumber(count)}</dd>
            <dd className="text-[12px] text-[#5B6B65]">contributeur{count > 1 ? 's' : ''}</dd>
          </div>
          <div className="px-1">
            <dt className="sr-only">Temps restant</dt>
            <dd className="text-[17px] font-semibold text-[#12261E]">
              {ended ? 'Terminée' : remaining !== null ? formatNumber(remaining) : '—'}
            </dd>
            <dd className="text-[12px] text-[#5B6B65]">
              {ended
                ? 'collecte close'
                : remaining !== null
                  ? `jour${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`
                  : 'sans date limite'}
            </dd>
          </div>
          <div className="px-1">
            <dt className="sr-only">Reste à collecter</dt>
            <dd className="text-[17px] font-semibold text-[#12261E]">{formatXof(toCollect)}</dd>
            <dd className="text-[12px] text-[#5B6B65]">reste à collecter</dd>
          </div>
        </dl>

        <div className="mt-5 grid gap-2.5 md:grid-cols-2">
          {!ended && (
            <button type="button" onClick={scrollToForm} className={`${btnPrimary} hidden md:inline-flex`}>
              Contribuer
            </button>
          )}
          <ShareButton {...share} />
        </div>
      </section>

      <AcceptedPayments className="py-1" />

      <hr className="border-[#E5E7EB]" />

      {/* Histoire */}
      <section aria-labelledby="story-title">
        <h2 id="story-title" className={sectionTitle}>
          L&apos;histoire
        </h2>
        <p className="mt-2 whitespace-pre-line break-words text-[15px] leading-relaxed text-[#384A43]">
          {appeal.reason}
        </p>
      </section>

      <hr className="border-[#E5E7EB]" />

      {/* Contribution */}
      <div ref={formAnchor}>
        {ended ? (
          <section className={`${card} p-5 text-center`}>
            <h2 className={sectionTitle}>Cette cagnotte est terminée</h2>
            <p className="mt-1.5 text-[15px] text-[#5B6B65]">
              Elle n&apos;accepte plus de contributions. Merci à toutes les personnes qui ont aidé.
            </p>
          </section>
        ) : (
          <ContributionForm
            minContribution={appeal.minContribution}
            beneficiaryName={appeal.beneficiaryName}
            share={share}
            onContributed={handleContributed}
          />
        )}
      </div>

      <ContributionList contributions={contributions} totalCount={count} now={now} highlightId={lastId} />

      {/* CTA collant (mobile) */}
      {!ended && !formInView && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E7EB] bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 md:hidden">
          <button type="button" onClick={scrollToForm} className={btnPrimary}>
            Contribuer
          </button>
        </div>
      )}
    </>
  );
}
