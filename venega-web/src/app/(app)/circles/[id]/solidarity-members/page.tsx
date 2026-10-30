import { SolidarityMembersView } from '@/features/circles/components/solidarity/SolidarityMembersView';

export default function SolidarityMembersPage({ params }: { params: { id: string } }) {
  return <SolidarityMembersView circleId={params.id} />;
}
