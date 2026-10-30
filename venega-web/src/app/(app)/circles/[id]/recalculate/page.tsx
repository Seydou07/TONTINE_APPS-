import { RecalculateView } from '@/features/circles/components/actions/RecalculateView';

export default function Page({ params }: { params: { id: string } }) {
  return <RecalculateView circleId={params.id} />;
}
