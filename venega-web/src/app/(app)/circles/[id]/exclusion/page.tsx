import { ExclusionView } from '@/features/circles/components/actions/ExclusionView';

export default function Page({ params }: { params: { id: string } }) {
  return <ExclusionView circleId={params.id} />;
}
