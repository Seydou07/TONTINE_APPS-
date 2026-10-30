import { CircleChatView } from '@/features/circles/components/CircleChatView';

export default function Page({ params }: { params: { id: string } }) {
  return <CircleChatView circleId={params.id} />;
}
