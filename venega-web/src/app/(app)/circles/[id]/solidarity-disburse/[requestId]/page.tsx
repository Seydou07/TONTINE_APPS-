import { SolidarityDisburseView } from '@/features/circles/components/solidarity/SolidarityDisburseView';

export default function SolidarityDisbursePage({ params }: { params: { id: string; requestId: string } }) {
  return <SolidarityDisburseView circleId={params.id} requestId={params.requestId} />;
}
