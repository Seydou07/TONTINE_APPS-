import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CircleDetailView } from '@/features/circles/components/CircleDetailView';

export const metadata: Metadata = { title: 'Fiche cercle' };

export default function CirclePage({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <CircleDetailView id={params.id} />
    </Suspense>
  );
}
