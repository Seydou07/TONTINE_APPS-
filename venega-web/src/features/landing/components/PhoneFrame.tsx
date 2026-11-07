import type { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
  /** Description de la maquette pour les lecteurs d'écran. */
  label: string;
  className?: string;
}

/**
 * Cadre de téléphone dessiné en CSS (pas de capture d'écran) : contour
 * vert très foncé, écran gris clair comme l'app, encoche discrète.
 */
export function PhoneFrame({ children, label, className = '' }: PhoneFrameProps) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={`relative mx-auto w-[290px] max-w-full rounded-[44px] bg-ink p-[9px] shadow-[0_30px_60px_-20px_rgba(7,75,54,0.45)] ${className}`}
    >
      <div className="relative h-[592px] overflow-hidden rounded-[36px] bg-[#F4F5F7]">
        <span
          aria-hidden
          className="absolute left-1/2 top-2 z-30 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-ink"
        />
        <div aria-hidden className="h-full">
          {children}
        </div>
      </div>
    </figure>
  );
}

/** Bandeau vert d'un écran de l'app (HeroHeader), version miniature. */
export function MiniHero({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="rounded-b-[22px] bg-primary-dark px-4 pb-5 pt-11 text-white">
      {eyebrow && <p className="text-[11px] font-medium text-amber">{eyebrow}</p>}
      <p className="text-[17px] font-bold leading-tight">{title}</p>
      {subtitle && <p className="mt-0.5 text-[11.5px] text-white/70">{subtitle}</p>}
      {children}
    </div>
  );
}

/** Initiales sur pastille vert clair (Avatar du site). */
export function MiniAvatar({ name, size = 32, className = '' }: { name: string; size?: number; className?: string }) {
  const parts = name.split(' ');
  const ini = (parts[0]![0]! + (parts.length > 1 ? parts[parts.length - 1]![0]! : '')).toUpperCase();
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary-tint font-semibold text-primary-dark ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {ini}
    </span>
  );
}
