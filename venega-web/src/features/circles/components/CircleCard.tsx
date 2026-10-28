import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import { mockCycles, type Circle } from '@venega/types';
import { Badge } from '@/components/ui/Badge';
import { card } from '@/components/ui/classes';
import { IconTile, ProgressBar } from '@/components/ui/misc';
import { formatFcfa } from '@/lib/format';
import {
  circleTypeIcon,
  circleTypeLabel,
  circleTypeTone,
  frequencyLabel,
  isTontine,
  mainContribution,
} from '../labels';

/** Carte d'un cercle (liste « Mes cercles »). */
export function CircleCard({ circle }: { circle: Circle }) {
  const cycle = mockCycles.find((c) => c.circleId === circle.id && c.isActive);
  const tontine = isTontine(circle.type);
  const amount = mainContribution(circle);

  return (
    <Link
      href={`/circles/${circle.id}`}
      className={`${card} block p-4 transition-colors hover:border-line-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`}
    >
      <div className="flex items-start gap-3">
        <IconTile icon={circleTypeIcon(circle.type)} tone={circleTypeTone(circle.type)} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-ink">{circle.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge tone={circleTypeTone(circle.type)}>{circleTypeLabel(circle.type)}</Badge>
            {!circle.activatedAt && <Badge tone="neutral">En attente d&apos;activation</Badge>}
          </div>
        </div>
        <ChevronRight size={18} className="mt-1 shrink-0 text-subtle" aria-hidden />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[13px] text-muted">Cotisation</p>
          <p className="text-[17px] font-bold text-ink">{amount > 0 ? formatFcfa(amount) : 'Libre'}</p>
          <p className="text-[13px] text-muted">{frequencyLabel(circle.frequency)}</p>
        </div>
        <p className="flex items-center gap-1.5 text-[13px] text-muted">
          <Users size={15} aria-hidden />
          {circle.memberCount} membres
        </p>
      </div>

      {tontine && cycle && (
        <div className="mt-3">
          <div className="mb-1.5 flex justify-between text-[12px] text-muted">
            <span>
              Tour {cycle.currentTurn} sur {cycle.totalTurns}
            </span>
            {circle.rules.goalItem && <span className="truncate pl-2">{circle.rules.goalItem}</span>}
          </div>
          <ProgressBar value={(cycle.currentTurn / cycle.totalTurns) * 100} label="Avancement du cycle" />
        </div>
      )}
    </Link>
  );
}
