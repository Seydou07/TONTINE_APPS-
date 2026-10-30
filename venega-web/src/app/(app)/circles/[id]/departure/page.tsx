import { DepartureView } from '@/features/circles/components/actions/DepartureView';

export default function Page({ params }: { params: { id: string } }) {
  return <DepartureView circleId={params.id} />;
}
