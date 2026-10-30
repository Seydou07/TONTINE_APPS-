'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircleType } from '@venega/types';
import { getCircle } from '../store';

/**
 * Lien générique vers un cercle (comme app/circle/[id]/index.tsx mobile) : une tontine
 * (en argent ou en nature) s'ouvre sur l'écran Tontine, une caisse sur l'écran Solidarité,
 * une cagnotte sur sa page.
 */
export function circleHref(circle: { id: string; type: CircleType }): string {
  if (circle.type === CircleType.AID_APPEAL) return `/aid/${circle.id}`;
  if (circle.type === CircleType.SOLIDARITY_ONLY) return `/circles/${circle.id}/solidarity`;
  return `/circles/${circle.id}/tontine`;
}

export function CircleRedirect({ circleId }: { circleId: string }) {
  const router = useRouter();
  useEffect(() => {
    const circle = getCircle(circleId);
    router.replace(circle ? circleHref(circle) : '/circles');
  }, [circleId, router]);
  return null;
}
