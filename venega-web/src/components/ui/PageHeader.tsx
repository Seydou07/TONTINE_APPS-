import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { WIDTHS } from './HeroBand';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Lien de retour (sinon `onBack`). */
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
  right?: ReactNode;
  width?: 'narrow' | 'default' | 'wide';
}

/** En-tête blanc des pages de formulaire et de détail : retour + titre. */
export function PageHeader({
  title,
  subtitle,
  backHref,
  onBack,
  backLabel = 'Retour',
  right,
  width = 'narrow',
}: PageHeaderProps) {
  const backClass =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink hover:bg-fill focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

  return (
    <header className="border-b border-line bg-white">
      <div className={`mx-auto flex min-h-[64px] ${WIDTHS[width]} items-center gap-2 px-2 py-2 sm:px-4`}>
        {backHref ? (
          <Link href={backHref} aria-label={backLabel} className={backClass}>
            <ChevronLeft size={22} aria-hidden />
          </Link>
        ) : onBack ? (
          <button type="button" onClick={onBack} aria-label={backLabel} className={backClass}>
            <ChevronLeft size={22} aria-hidden />
          </button>
        ) : (
          <span className="w-2" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-bold text-ink">{title}</h1>
          {subtitle && <p className="truncate text-[13px] text-muted">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0 pr-2">{right}</div>}
      </div>
    </header>
  );
}
