import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PaymentsView } from '@/features/payments/components/PaymentsView';

export const metadata: Metadata = { title: 'Paiements' };

export default function PaymentsPage() {
  return (
    <Suspense>
      <PaymentsView />
    </Suspense>
  );
}
