import { SolidarityView } from '@/features/circles/components/solidarity/SolidarityView';

export default function SolidarityPage({ params }: { params: { id: string } }) {
  return <SolidarityView circleId={params.id} />;
}
