import { Suspense } from 'react';
import type { Metadata } from 'next';
import { KycView } from '@/features/kyc/components/KycView';

export const metadata: Metadata = { title: 'Validation KYC' };

export default function KycPage() {
  return (
    <Suspense>
      <KycView />
    </Suspense>
  );
}
