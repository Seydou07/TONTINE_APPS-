import { TontineView } from '@/features/circles/components/tontine/TontineView';

export default function TontinePage({ params }: { params: { id: string } }) {
  return <TontineView circleId={params.id} />;
}
