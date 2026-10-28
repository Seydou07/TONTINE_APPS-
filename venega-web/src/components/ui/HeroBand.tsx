import type { ReactNode } from 'react';

interface HeroBandProps {
  children: ReactNode;
  /** Hauteur (px) dont le contenu suivant chevauche le bandeau (voir PageBody `overlap`). */
  overlap?: number;
  /** Largeur maximale du contenu. */
  width?: 'narrow' | 'default' | 'wide';
  className?: string;
}

export const WIDTHS = {
  narrow: 'max-w-2xl',
  default: 'max-w-5xl',
  wide: 'max-w-6xl',
} as const;

/**
 * Première section des pages principales : aplat vert foncé (#074B36),
 * coins bas arrondis, texte blanc. Aucun dégradé.
 */
export function HeroBand({ children, overlap = 0, width = 'default', className = '' }: HeroBandProps) {
  return (
    <section
      className={`rounded-b-[28px] bg-primary-dark px-4 pt-5 text-white sm:px-6 md:pt-8 ${className}`}
      style={{ paddingBottom: 24 + overlap }}
    >
      <div className={`mx-auto ${WIDTHS[width]}`}>{children}</div>
    </section>
  );
}

interface HeroTitleProps {
  title: string;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  right?: ReactNode;
}

/** Titre d'écran blanc + sous-titre, avec une action éventuelle à droite. */
export function HeroTitle({ title, subtitle, eyebrow, right }: HeroTitleProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-[13px] font-medium text-amber">{eyebrow}</div>}
        <h1 className="break-words text-[22px] font-bold leading-tight text-white md:text-[26px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-white/75">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

interface PageBodyProps {
  children: ReactNode;
  /** Remonte le contenu sur le bandeau (même valeur que HeroBand `overlap`). */
  overlap?: number;
  width?: 'narrow' | 'default' | 'wide';
  className?: string;
}

/** Deuxième section : contenu clair sur fond gris clair. */
export function PageBody({ children, overlap = 0, width = 'default', className = '' }: PageBodyProps) {
  return (
    <div
      className={`relative mx-auto ${WIDTHS[width]} space-y-6 px-4 pb-8 pt-5 sm:px-6 ${className}`}
      style={overlap ? { marginTop: -overlap, paddingTop: 0 } : undefined}
    >
      {children}
    </div>
  );
}
