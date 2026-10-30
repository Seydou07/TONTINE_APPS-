import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { card } from '@/components/ui/classes';

/**
 * Coquille des pages de connexion, d'inscription, de code SMS et de profil :
 * bandeau vert foncé avec le logo d'origine sur carte blanche, puis le
 * formulaire sur une carte claire.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-fill">
      <div className="rounded-b-[28px] bg-primary-dark px-4 pb-20 pt-6">
        <div className="mx-auto max-w-md">
          <BrandLogo onDark />
        </div>
      </div>
      <main className="mx-auto -mt-14 max-w-md px-4 pb-10">
        <div className={`${card} p-5 sm:p-6`}>{children}</div>
      </main>
    </div>
  );
}
