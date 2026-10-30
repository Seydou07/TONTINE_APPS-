import { GovernanceView } from '@/features/circles/components/manage/GovernanceView';

export default function GovernancePage({ params }: { params: { id: string } }) {
  return <GovernanceView circleId={params.id} />;
}
