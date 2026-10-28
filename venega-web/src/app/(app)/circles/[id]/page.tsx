import { CircleDetailView } from '@/features/circles/components/CircleDetailView';

export default function CircleDetailPage({ params }: { params: { id: string } }) {
  return <CircleDetailView circleId={params.id} />;
}
