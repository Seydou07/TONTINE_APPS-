import { Suspense } from 'react';
import type { Metadata } from 'next';
import { FundraisersView } from '@/features/fundraisers/components/FundraisersView';

export const metadata: Metadata = { title: 'Cagnottes publiques' };

export default function FundraisersPage() {
  return (
    <Suspense>
      <FundraisersView />
    </Suspense>
  );
}
