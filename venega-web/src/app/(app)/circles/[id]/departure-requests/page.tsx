import { DepartureRequestsView } from '@/features/circles/components/actions/DepartureRequestsView';

export default function Page({ params }: { params: { id: string } }) {
  return <DepartureRequestsView circleId={params.id} />;
}
