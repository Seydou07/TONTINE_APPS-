import { MembershipRequestsView } from '@/features/circles/components/MembershipRequestsView';

export default function RequestsPage({ params }: { params: { id: string } }) {
  return <MembershipRequestsView circleId={params.id} />;
}
