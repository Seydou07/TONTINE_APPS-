import { AidAppealView } from '@/features/aid/components/AidAppealView';

export default function AidAppealPage({ params }: { params: { id: string } }) {
  return <AidAppealView circleId={params.id} />;
}
