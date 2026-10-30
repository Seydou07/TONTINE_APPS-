import { MemberProfileView } from '@/features/circles/components/MemberProfileView';

export default function MemberPage({ params }: { params: { id: string; userId: string } }) {
  return <MemberProfileView circleId={params.id} userId={params.userId} />;
}
