import { Fragment } from 'react';
import { formatFcfa } from '@/lib/format';
import { daysLeft, formatXof, progressPercent } from '../format';

/**
 * Bloc « collecte » d'une cagnotte (même contenu que l'écran mobile aid/[id]) :
 * montant collecté, objectif, barre de progression et trois chiffres
 * (contributeurs, jours restants, reste à collecter).
 */
export function AppealProgress({
  collected,
  goal,
  contributorCount,
  deadline,
  now,
}: {
  collected: number;
  goal: number;
  contributorCount: number;
  deadline?: string;
  /** Horodatage de référence (évite un écart d'hydratation). */
  now: number;
}) {
  const percent = progressPercent(collected, goal);
  const remaining = Math.max(goal - collected, 0);
  const days = deadline ? (daysLeft(deadline, now) ?? 0) : null;

  const stats = [
    { value: String(contributorCount), label: contributorCount > 1 ? 'contributeurs' : 'contributeur' },
    { value: days === null ? '—' : String(days), label: days === 1 ? 'jour restant' : 'jours restants' },
    { value: formatXof(remaining), label: 'reste à collecter' },
  ];

  return (
    <section aria-label="Progression de la collecte" className="rounded-[20px] border border-line bg-white p-5">
      <p className="text-[28px] font-bold leading-tight text-ink">{formatFcfa(collected)}</p>
      <p className="mt-0.5 text-[15px] text-muted">collectés sur {formatFcfa(goal)}</p>
      <div className="mt-4 flex items-center gap-3">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={`${percent} % de l'objectif atteint`}
          className="h-2 flex-1 overflow-hidden rounded-full bg-fill"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-[15px] font-bold text-primary">{percent} %</span>
      </div>
      <dl className="mt-[18px] flex border-t border-line pt-4">
        {stats.map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && <span aria-hidden className="w-px self-stretch bg-line" />}
            <div className="flex-1 px-1 text-center">
              <dd className="text-[17px] font-bold text-ink">{s.value}</dd>
              <dt className="mt-0.5 text-[12px] text-muted">{s.label}</dt>
            </div>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}
