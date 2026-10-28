import { Suspense } from 'react';
import { PaymentView } from '@/features/payment/components/PaymentView';

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentView />
    </Suspense>
  );
}
