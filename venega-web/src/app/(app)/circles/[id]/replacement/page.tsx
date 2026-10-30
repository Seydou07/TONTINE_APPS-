import { ReplacementView } from '@/features/circles/components/actions/ReplacementView';

export default function Page({ params }: { params: { id: string } }) {
  return <ReplacementView circleId={params.id} />;
}
