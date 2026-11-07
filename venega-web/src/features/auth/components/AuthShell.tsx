import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { card } from '@/components/ui/classes';

/**
 * Coquille des pages de connexion, d'inscription, de code SMS et de profil.
 * - Téléphone : bandeau vert foncé avec le logo d'origine sur carte blanche, puis le
 *   formulaire sur une carte claire (comme l'app mobile).
 * - Ordinateur (≥ 1024 px) : écran partagé, panneau vert à gauche, formulaire centré à droite.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-fill lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* ── Panneau vert (ordinateur) ── */}
      <aside className="hidden bg-primary-dark px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="self-start">
          <BrandLogo onDark size="md" />
        </div>
        <div className="max-w-md">
          <h2 className="text-[30px] font-bold leading-tight">La tontine et la caisse de solidarité sur votre téléphone.</h2>
          <p className="mt-3 text-[16px] text-white/75">
            Cotisez par Orange Money, Moov Money ou Wave et suivez chaque tour en toute transparence.
          </p>
        </div>
        <p className="text-[13px] text-white/60">Burkina Faso</p>
      </aside>

      {/* ── Bandeau vert (téléphone et tablette) ── */}
      <div className="rounded-b-[28px] bg-primary-dark px-4 pb-20 pt-6 lg:hidden">
        <div className="mx-auto max-w-md">
          <BrandLogo onDark />
        </div>
      </div>

      <main className="mx-auto -mt-14 w-full max-w-md px-4 pb-10 lg:mt-0 lg:flex lg:min-h-screen lg:max-w-[460px] lg:flex-col lg:justify-center lg:py-12">
        <div className={`${card} p-5 sm:p-6 lg:p-8`}>{children}</div>
      </main>
    </div>
  );
}
