import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';

const TONES = {
  neutral: 'bg-fill text-ink-soft',
  primary: 'bg-primary-tint text-primary',
  danger: 'bg-danger-tint text-danger',
} as const;

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Couleur de l'icône et de son fond teinté. */
  tone?: keyof typeof TONES;
  /** Texte affiché à droite (ex. « Vérifié »). */
  value?: string;
  valueTone?: 'muted' | 'success';
  /** Élément libre affiché à droite (badge, avatar…). */
  right?: ReactNode;
  href?: string;
  onClick?: () => void;
  chevron?: boolean;
  last?: boolean;
}

/** Ligne de liste standard (comme ListRow mobile) : icône, libellé, valeur et chevron. */
export function ListRow({
  title,
  subtitle,
  icon: Icon,
  tone = 'neutral',
  value,
  valueTone = 'muted',
  right,
  href,
  onClick,
  chevron = !!(href || onClick),
  last = false,
}: ListRowProps) {
  const inner = (
    <>
      {Icon && (
        <span aria-hidden className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${TONES[tone]}`}>
          <Icon size={20} strokeWidth={1.8} />
        </span>
      )}
      <span className={`flex min-h-[60px] min-w-0 flex-1 items-center gap-3 py-3 pr-4 ${last ? '' : 'border-b border-line'}`}>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[15px] font-semibold ${tone === 'danger' ? 'text-danger' : 'text-ink'}`}>
            {title}
          </span>
          {subtitle && <span className="mt-0.5 line-clamp-2 block text-[13px] text-muted">{subtitle}</span>}
        </span>
        {value && (
          <span className={`shrink-0 text-[14px] ${valueTone === 'success' ? 'font-semibold text-primary' : 'text-muted'}`}>
            {value}
          </span>
        )}
        {right}
        {chevron && <ChevronRight size={18} className="shrink-0 text-subtle" aria-hidden />}
      </span>
    </>
  );
  const rowClass = 'flex w-full items-center gap-3.5 pl-4 text-left';
  if (href) {
    return (
      <Link href={href} className={`${rowClass} transition-colors hover:bg-fill`}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${rowClass} transition-colors hover:bg-fill`}>
        {inner}
      </button>
    );
  }
  return <div className={rowClass}>{inner}</div>;
}

/** Groupe de lignes dans une carte blanche, avec titre de section facultatif. */
export function ListGroup({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      {title && <h2 className="mb-2 px-1 text-[13px] font-semibold text-muted">{title}</h2>}
      <div className="overflow-hidden rounded-[20px] border border-line bg-white">{children}</div>
    </section>
  );
}
