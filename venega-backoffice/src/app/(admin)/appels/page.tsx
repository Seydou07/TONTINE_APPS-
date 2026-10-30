import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TicketsView } from '@/features/tickets/components/TicketsView';

export const metadata: Metadata = { title: 'Suivi des appels' };

export default function TicketsPage() {
  return (
    <Suspense>
      <TicketsView />
    </Suspense>
  );
}
