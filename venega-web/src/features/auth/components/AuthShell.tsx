import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { card } from '@/components/ui/classes';

/**
 * Coquille des pages de connexion / inscription : bandeau vert foncé avec le
 * logo d'origine sur carte blanche, puis le formulaire sur une carte claire.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="rounded-b-[28px] bg-primary-dark px-4 pb-24 pt-6 text-white">
        <div className="mx-auto flex max-w-md flex-col items-start">
          <BrandLogo onDark />
          <p className="mt-5 text-[22px] font-bold leading-tight">La tontine et la solidarité, en toute confiance.</p>
          <p className="mt-1 text-[14px] text-white/75">Cotisez par Orange Money, Moov Money ou Wave.</p>
        </div>
      </div>

      <main className="mx-auto -mt-16 max-w-md px-4 pb-10">
        <div className={`${card} p-5 sm:p-6`}>{children}</div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-muted">
          <ShieldCheck size={15} className="text-primary" aria-hidden />
          Connexion sécurisée
        </p>
      </main>
    </div>
  );
}
