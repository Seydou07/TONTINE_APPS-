'use client';

import { useEffect, useRef, useState } from 'react';
import { btnPrimary, card, sectionTitle } from '@/components/ui/classes';
import type { PublicAppeal, PublicContribution } from '../types';
import { daysLeft } from '../format';
import { AppealProgress } from './AppealProgress';
import { ContributeFlow, type ContributionDone } from './ContributeFlow';
import { ContributionList } from './ContributionList';
import { AcceptedPayments } from './OperatorMark';
import { ShareButton } from './ShareButton';

interface AppealClientProps {
  appeal: PublicAppeal;
  initialContributions: PublicContribution[];
  /** Horodatage du rendu serveur : évite un écart d'hydratation sur les jours restants. */
  renderedAt: number;
  shareUrl: string;
}

/**
 * Partie interactive de la page publique : progression (mise à jour après une
 * contribution), histoire, formulaire de contribution, liste des contributeurs.
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
  }, []);

  // Masque le bouton collant quand le formulaire est déjà à l'écran.
  useEffect(() => {
    const el = formAnchor.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([entry]) => setFormInView(!!entry?.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const ended =
    appeal.status !== 'ACTIVE' || (appeal.deadline !== undefined && daysLeft(appeal.deadline, now) === null);

  const share = {
    url: shareUrl,
    title: appeal.title,
    text: `${appeal.title}\nAidez en contribuant à cette cagnotte, avec votre nom ou anonymement :`,
  };

  function scrollToForm() {
    document.getElementById('contribuer')?.scrollIntoView({ block: 'start' });
  }

  function handleContributed(c: ContributionDone) {
    const id = `local-${Date.now()}`;
    setContributions((list) => [{ id, displayName: c.displayName, amount: c.amount, createdAt: new Date().toISOString() }, ...list]);
    setCollected((v) => v + c.amount);
    setCount((v) => v + 1);
    setLastId(id);
  }

  return (
    <>
      <AppealProgress
        collected={collected}
        goal={appeal.goalAmount}
        contributorCount={count}
        deadline={appeal.deadline}
        now={now}
      />

      <AcceptedPayments />

      <ShareButton {...share} />

      <hr className="border-line" />

      <section aria-labelledby="story-title">
        <h2 id="story-title" className={sectionTitle}>
          L’histoire
        </h2>
        <p className="mt-2 whitespace-pre-line break-words text-[15px] leading-relaxed text-ink-soft">{appeal.reason}</p>
      </section>

      <hr className="border-line" />

      <div ref={formAnchor} id="contribuer" className="scroll-mt-4">
        {ended ? (
          <section className={`${card} p-5 text-center`}>
            <h2 className={sectionTitle}>Cette cagnotte est terminée</h2>
            <p className="mt-1.5 text-[15px] text-muted">Elle n’accepte plus de contributions.</p>
          </section>
        ) : (
          <section className={`${card} p-5`}>
            <h2 className={`${sectionTitle} mb-1`}>Contribuer</h2>
            <ContributeFlow
              beneficiaryName={appeal.beneficiaryName}
              minContribution={appeal.minContribution}
              onContributed={handleContributed}
            />
          </section>
        )}
      </div>

      <ContributionList contributions={contributions} totalCount={count} highlightId={lastId} />

      {!ended && !formInView && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 pt-3 md:hidden"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <button type="button" onClick={scrollToForm} className={btnPrimary}>
            Contribuer
          </button>
        </div>
      )}
    </>
  );
}

