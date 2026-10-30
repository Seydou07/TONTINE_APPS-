'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchX } from 'lucide-react';
import { CircleType } from '@venega/types';
import { btnPrimary, card } from '@/components/ui/classes';
import { loadLocalData } from '@/lib/persistence';
import { getAidAppeal, getCircleByInvite } from '@/features/circles/store';
import { getProfile } from '@/features/profile/store';
import { normalizeInviteCode, toPublicAppealData } from '../api';
import type { PublicAppealData } from '../types';
import { PublicAppealView } from './PublicAppealView';
import { PublicHeader } from './PublicHeader';

/**
 * Démo sans API : une cagnotte lancée depuis ce navigateur (/aid/create) n'existe que
 * dans les données enregistrées localement. Avant d'afficher « introuvable », on la
 * cherche donc ici. TODO API : supprimer une fois `GET /public/appeals/:code` branché.
 */
export function LocalAppealFallback() {
  const pathname = usePathname() ?? '';
  const [state, setState] = useState<{ checked: boolean; data: PublicAppealData | null; at: number }>({
    checked: false,
    data: null,
    at: 0,
  });

  useEffect(() => {
    const raw = decodeURIComponent(pathname.split('/').filter(Boolean)[1] ?? '');
    const code = normalizeInviteCode(raw);
    let data: PublicAppealData | null = null;
    if (code) {
      loadLocalData();
      const circle = getCircleByInvite(code);
      const appeal = circle ? getAidAppeal(circle.id) : undefined;
      if (circle && circle.type === CircleType.AID_APPEAL && appeal) {
        data = toPublicAppealData(circle, appeal, getProfile().name);
      }
    }
    setState({ checked: true, data, at: Date.now() });
  }, [pathname]);

  if (!state.checked) return null;
  if (state.data) return <PublicAppealView data={state.data} renderedAt={state.at} />;

  return (
    <>
      <div className="border-b border-line">
        <PublicHeader />
      </div>
      <main className="mx-auto max-w-[560px] px-4 pb-10 pt-8">
        <section className={`${card} p-6 text-center`}>
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fill text-muted">
            <SearchX size={24} aria-hidden />
          </span>
          <h1 className="text-[22px] font-bold text-ink">Cagnotte introuvable</h1>
          <p className="mt-2 text-[15px] text-muted">
            Ce lien ne correspond à aucune cagnotte active. Vérifiez qu’il est complet ou demandez un nouveau lien à la
            personne qui vous l’a envoyé.
          </p>
          <Link href="/" className={`${btnPrimary} mt-5`}>
            Découvrir Venega
          </Link>
        </section>
      </main>
    </>
  );
}
