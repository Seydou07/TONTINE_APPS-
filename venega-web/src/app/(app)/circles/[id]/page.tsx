import { CircleRedirect } from '@/features/circles/components/CircleRedirect';

export default function CirclePage({ params }: { params: { id: string } }) {
  return <CircleRedirect circleId={params.id} />;
}
