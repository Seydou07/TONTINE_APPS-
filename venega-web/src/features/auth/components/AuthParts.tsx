'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { linkText } from '@/components/ui/classes';

/** Bouton de retour en haut d'une carte d'authentification. */
export function AuthBack({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Retour"
      className="-ml-2 -mt-1 mb-2 flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-fill"
    >
      <ArrowLeft size={22} aria-hidden />
    </button>
  );
}

/** Titre + sous-titre facultatif. */
export function AuthTitle({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <>
      <h1 className="text-[22px] font-bold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
    </>
  );
}

/** Ligne de bas de carte : « Pas encore de compte ? Créer un compte ». */
export function AuthFooter({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <p className="mt-6 text-center text-[14px] text-muted">
      {text}{' '}
      <Link href={href} className={linkText}>
        {label}
      </Link>
    </p>
  );
}
