import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { card } from './classes';

export { Avatar } from './Avatar';

type IconType = LucideIcon;

/** Carré d'icône (fond teinté). */
export function IconTile({
  icon: Icon,
  tone = 'green',
  size = 40,
}: {
  icon: IconType;
  tone?: 'green' | 'amber' | 'neutral' | 'danger';
  size?: number;
}) {
  const tones = {
    green: 'bg-primary-tint text-primary-dark',
    amber: 'bg-amber-tint text-amber-dark',
    neutral: 'bg-fill text-ink-soft',
    danger: 'bg-danger-tint text-danger',
  };
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-[12px] ${tones[tone]}`}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.5)} />
    </span>
  );
}

/** État vide sobre. */
export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: IconType;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className={`${card} p-6 text-center`}>
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fill text-muted">
        <Icon size={22} aria-hidden />
      </span>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-sm text-[14px] text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Ligne libellé / valeur d'un récapitulatif. */
export function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-[14px] text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-[15px] font-semibold text-ink">{children}</dd>
    </div>
  );
}
