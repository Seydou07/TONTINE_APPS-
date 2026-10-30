import { Suspense } from 'react';
import { RequestsView } from '@/features/circles/components/RequestsView';

export default function RequestsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={null}>
      <RequestsView circleId={params.id} />
    </Suspense>
  );
}
