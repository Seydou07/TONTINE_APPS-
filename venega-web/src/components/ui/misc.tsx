import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { initials } from '@/lib/format';
import { card } from './classes';

type IconType = LucideIcon;

/** Avatar à initiales (pas de photo distante : page plus légère). */
export function Avatar({ name, size = 40, tone = 'green' }: { name: string; size?: number; tone?: 'green' | 'neutral' }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${
        tone === 'green' ? 'bg-primary-tint text-primary-dark' : 'bg-fill text-muted'
      }`}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.34)) }}
    >
      {initials(name)}
    </span>
  );
}

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

/** Titre de section avec lien « Voir tout » optionnel. */
export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[17px] font-bold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[14px] text-muted">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="shrink-0 text-[14px] font-semibold text-primary hover:underline">
          {action.label}
        </Link>
      )}
    </div>
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

/** Ligne de liste cliquable (menu profil, raccourcis…). */
export function ListLink({
  href,
  icon,
  title,
  subtitle,
  tone = 'green',
  right,
}: {
  href: string;
  icon: IconType;
  title: string;
  subtitle?: string;
  tone?: 'green' | 'amber' | 'neutral' | 'danger';
  right?: ReactNode;
}) {
  return (
    <Link href={href} className="flex min-h-[64px] items-center gap-3 px-4 py-3 transition-colors hover:bg-fill">
      <IconTile icon={icon} tone={tone} size={38} />
      <div className="min-w-0 flex-1">
        <p className={`text-[15px] font-semibold ${tone === 'danger' ? 'text-danger' : 'text-ink'}`}>{title}</p>
        {subtitle && <p className="truncate text-[13px] text-muted">{subtitle}</p>}
      </div>
      {right}
      <ChevronRight size={18} className="shrink-0 text-subtle" aria-hidden />
    </Link>
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

/** Barre de progression plate. */
export function ProgressBar({ value, tone = 'green', label }: { value: number; tone?: 'green' | 'amber'; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-fill"
    >
      <div className={`h-full rounded-full ${tone === 'green' ? 'bg-primary' : 'bg-amber'}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
