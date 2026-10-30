import { EditCircleView } from '@/features/circles/components/EditCircleView';

export default function Page({ params }: { params: { id: string } }) {
  return <EditCircleView circleId={params.id} />;
}
