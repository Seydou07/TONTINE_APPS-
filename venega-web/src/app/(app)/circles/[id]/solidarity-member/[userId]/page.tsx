import { SolidarityMemberProfileView } from '@/features/circles/components/solidarity/SolidarityMemberProfileView';

export default function SolidarityMemberPage({ params }: { params: { id: string; userId: string } }) {
  return <SolidarityMemberProfileView circleId={params.id} userId={params.userId} />;
}
