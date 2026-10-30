import { Suspense } from 'react';
import { OtpForm } from '@/features/auth/components/OtpForm';

export default function OtpPage() {
  return (
    <Suspense fallback={null}>
      <OtpForm />
    </Suspense>
  );
}
